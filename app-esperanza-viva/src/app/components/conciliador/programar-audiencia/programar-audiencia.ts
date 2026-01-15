import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';
import jsPDF from 'jspdf';


@Component({
  selector: 'app-programar-audiencia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './programar-audiencia.html',
  styleUrls: ['./programar-audiencia.css']
})
export class ProgramarAudiencia implements OnInit {
  solicitudId: any;
  expediente: any = {};
  conciliadorNombre: string = '';

  notificadores: any[] = [];
  selectedNotificador: any = null;

  form = {
    fechaAudiencia: '',
    horaAudiencia: '',
    lugar: 'Av. Sol 450 - Cusco (Sede Principal)'
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
      this.router.navigate(['/login-admin']);
      return;
    }
    const user = JSON.parse(userJson);
    this.conciliadorNombre = user.nombreCompleto;

    this.solicitudId = this.route.snapshot.paramMap.get('id');
    if (this.solicitudId) {
      this.cargarDatosExpediente();
    }
    this.cargarNotificadores();
  }

  cargarDatosExpediente() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(`http://localhost:8080/api/solicitudes/${this.solicitudId}`, { headers }).subscribe({
      next: (res) => this.expediente = res,
      error: (err) => console.error("Error al cargar datos de MariaDB", err)
    });
  }

  cargarNotificadores() {
    // Mock logic for status until backend supports it per user
    this.usuarioService.listarPorRol('NOTIFICADOR').subscribe({
      next: (res) => {
        this.notificadores = res.map(n => ({
          ...n,
          estado: Math.random() > 0.3 ? 'Disponible' : 'Ocupado' // Mock status
        }));
      },
      error: (err) => console.error("Error al cargar notificadores", err)
    });
  }

  seleccionarNotificador(notif: any) {
    this.selectedNotificador = notif;
  }

  validarFormulario(): boolean {
    if (!this.form.fechaAudiencia || !this.form.horaAudiencia) {
      alert("Por favor, seleccione una fecha y hora mediante el desplegable.");
      return false;
    }
    const fechaSeleccionada = new Date(this.form.fechaAudiencia + 'T' + this.form.horaAudiencia);
    if (fechaSeleccionada < new Date()) {
      alert("⚠️ Error: No se puede programar una audiencia para una fecha u hora que ya pasó.");
      return false;
    }
    if (!this.selectedNotificador) {
      alert("⚠️ Por favor, seleccione un notificador para diligenciar la invitación.");
      return false;
    }
    return true;
  }

  getFechaActualTexto(): string {
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const hoy = new Date();
    return `Lima, ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
  }

  generarInvitacion() {
    if (!this.validarFormulario()) return;

    const doc = new jsPDF();
    const fechaFooter = this.getFechaActualTexto();

    // FORMATO C STYLING
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("FORMATO TIPO DE INVITACIÓN PARA CONCILIAR", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"`, 105, 30, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Autorizado su funcionamiento por Resolución N° ......................", 105, 36, { align: "center" });
    doc.text("Dirección y teléfono: Av. Sol 450 - Cusco | Tlf: 987654321                         EXP. N° " + (this.expediente.numeroExpediente || 'S/N'), 105, 42, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("INVITACIÓN PARA CONCILIAR", 105, 55, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Señor (es) (as):", 20, 65);

    // TABLE MOCKUP
    let startY = 70;
    doc.rect(20, startY, 170, 20); // Border
    doc.line(20, startY + 8, 190, startY + 8); // Header Separator
    doc.line(100, startY, 100, startY + 20); // Vertical Separator

    doc.setFont("helvetica", "bold");
    doc.text("Nombre o Razón Social:", 25, startY + 6);
    doc.text("Dirección", 105, startY + 6);

    doc.setFont("helvetica", "normal");
    // Solicitante
    doc.text(`Solicitante(s): ${this.expediente.solicitante?.nombres} ${this.expediente.solicitante?.apellidos}`, 25, startY + 14);
    doc.text(`${this.expediente.solicitante?.domicilio || '-'}`, 105, startY + 14);

    // Invitado
    startY += 20;
    doc.rect(20, startY, 170, 10);
    doc.line(100, startY, 100, startY + 10);
    doc.text(`Invitado(s): ${this.expediente.invitado?.nombres} ${this.expediente.invitado?.apellidos}`, 25, startY + 7);
    doc.text(`${this.expediente.invitado?.domicilio || '-'}`, 105, startY + 7);

    let bodyY = startY + 20;
    doc.text("De mi especial estima:", 20, bodyY);
    bodyY += 10;

    const textoCuerpo = `Por medio de la presente, le invito a participar en una audiencia de conciliación que se realizará en ${this.form.lugar}, el día ${this.form.fechaAudiencia}, a horas ${this.form.horaAudiencia} (10 minutos de tolerancia), en la cual me permitiré asistirle en la búsqueda de una solución común al problema que tienen respecto de ${this.expediente.materiaConciliable || '__________________'} de acuerdo con la copia simple de la solicitud de Conciliación y anexos que se le adjunta en la presente invitación.`;

    const splitText = doc.splitTextToSize(textoCuerpo, 170);
    doc.text(splitText, 20, bodyY);

    bodyY += (splitText.length * 5) + 5;

    // Disclaimer Block
    doc.setFont("helvetica", "bolditalic");
    const disclaimer = "La Conciliación Extrajudicial es una institución consensual, es decir prima la voluntad de las partes para solucionar conflictos o divergencias, a través de un procedimiento ágil, flexible y económico, ahorrando el tiempo que les demandaría un proceso, y los mayores costos del mismo. Asimismo, no es necesaria la presencia de un abogado y de arribarse a acuerdos el acta con acuerdo conciliatorio constituye título de ejecución de conformidad con el artículo 18° de la Ley de Conciliación N° 26872, modificado por el artículo 1° del D.L 1070.";
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
    doc.text(splitDisclaimer, 20, bodyY);

    bodyY += (splitDisclaimer.length * 5) + 10;

    doc.setFont("helvetica", "normal");
    const footerText = "Las partes deberán asistir a la reunión conciliatoria identificándose con documento de identidad y/o documento que acredite la representación... (Texto legal completo omitido por brevedad)...";
    const splitFooter = doc.splitTextToSize(footerText, 170);
    doc.text(splitFooter, 20, bodyY);

    bodyY += 30;
    doc.text(fechaFooter, 20, bodyY);

    bodyY += 20;
    doc.line(20, bodyY, 80, bodyY);
    doc.text("Firma y sello del Conciliador designado", 20, bodyY + 5);

    doc.save("Formato_C_Invitacion.pdf");
  }

  generarWord() {
    if (!this.validarFormulario()) return;

    const fechaFooter = this.getFechaActualTexto();

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Formato C</title></head><body>";

    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <p style="text-align: right; font-weight: bold;">FORMATO C</p>
            <h3 style="text-align: center; text-decoration: underline;">FORMATO TIPO DE INVITACIÓN PARA CONCILIAR</h3>
            <p style="text-align: center;"><strong>CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"</strong><br>
            Autorizado su funcionamiento por Resolución ............... N° ______ - _______<br>
            Dirección y teléfono: Av. Sol 450 - Cusco | Tlf: 987654321 &nbsp;&nbsp;&nbsp; <strong>EXP. N° ${this.expediente.numeroExpediente || 'S/N'}</strong></p>
            
            <h3 style="text-align: center; text-decoration: underline; margin-top: 30px;">INVITACIÓN PARA CONCILIAR</h3>
            
            <p>Señor (es) (as):</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;" border="1">
                <tr>
                    <td style="padding: 5px; background: #f0f0f0;"><strong>Nombre o Razón Social:</strong></td>
                    <td style="padding: 5px; background: #f0f0f0;"><strong>Dirección</strong></td>
                </tr>
                <tr>
                    <td style="padding: 5px;">Solicitante(s): ${this.expediente.solicitante?.nombres} ${this.expediente.solicitante?.apellidos}</td>
                    <td style="padding: 5px;">${this.expediente.solicitante?.domicilio || '-'}</td>
                </tr>
                <tr>
                    <td style="padding: 5px;">Invitado(s): ${this.expediente.invitado?.nombres} ${this.expediente.invitado?.apellidos}</td>
                    <td style="padding: 5px;">${this.expediente.invitado?.domicilio || '-'}</td>
                </tr>
            </table>

            <p>De mi especial estima:</p>
            
            <p>Por medio de la presente, le invito a participar en una audiencia de conciliación que se realizará en <strong>${this.form.lugar}</strong>, el día <strong>${this.form.fechaAudiencia}</strong>, a horas <strong>${this.form.horaAudiencia}</strong> (10 minutos de tolerancia), en la cual me permitiré asistirle en la búsqueda de una solución común al problema que tienen respecto de <strong>${this.expediente.materiaConciliable || '__________________'}</strong> de acuerdo con la copia simple de la solicitud de Conciliación y anexos que se le adjunta en la presente invitación.</p>
            
            <p><em>La Conciliación Extrajudicial es una institución consensual, es decir prima la voluntad de las partes para solucionar conflictos o divergencias, a través de un procedimiento ágil, flexible y económico, ahorrando el tiempo que les demandaría un proceso... (etc)</em></p>
            
            <br><br>
            <p>${fechaFooter}</p>
            
            <br><br><br><br>
            <p style="border-top: 1px solid black; width: 300px;">Firma y sello del Conciliador designado</p>
        </div>
    `;

    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'Formato_C_Invitacion.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }

  guardarYSalir() {
    if (!this.validarFormulario()) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const payload = {
      solicitud: {
        id: this.solicitudId,
        notificador: this.selectedNotificador // 🔹 Assign Notificador to Solicitud
      },
      ...this.form
    };

    this.http.post('http://localhost:8080/api/audiencias/programar', payload, { headers }).subscribe({
      next: () => {
        alert(`¡Audiencia Guardada! Notificador ${this.selectedNotificador.nombreCompleto} asignado.`);
        this.router.navigate(['/conciliador/mis-casos']);
      },
      error: (err) => alert("Error al guardar: " + err.message)
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/consulta']); // Redirect consistency
  }
}