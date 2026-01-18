import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';
import { SolicitudService } from '../../../services/solicitud.service';
import jsPDF from 'jspdf';

interface Parte {
  id?: number;
  nombres: string;
  apellidos: string;
  domicilio?: string;
  numeroDocumento?: string; // Added for completeness
  razonSocial?: string; // In case of companies
}

interface Expediente {
  id?: number;
  numeroExpediente?: string;
  materiaConciliable?: string;
  modalidad?: string; // Ensure this is captured
  solicitante?: Parte;
  invitado?: Parte;
  fechaCreacion?: string;
  estado?: string;
}

interface Notificador {
  id: number;
  nombreCompleto: string;
  estado?: string;
}

@Component({
  selector: 'app-programar-audiencia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './programar-audiencia.html',
  styleUrls: ['./programar-audiencia.css']
})
export class ProgramarAudiencia implements OnInit {
  solicitudId: string | null = null;
  expediente: Expediente = {};
  conciliadorNombre: string = '';

  notificadores: Notificador[] = [];
  selectedNotificador: Notificador | null = null;
  showNotificadoresList: boolean = false;

  form = {
    fechaAudiencia: '',
    horaAudiencia: '',
    lugar: 'Av. Sol 450 - Cusco (Sede Principal)'
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private usuarioService: UsuarioService,
    private solicitudService: SolicitudService
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
    if (!this.solicitudId) return;

    // Use shared service for consistent data
    this.solicitudService.obtenerPorId(Number(this.solicitudId)).subscribe({
      next: (res) => {
        console.log("Expediente Data:", res); // Debug log
        this.expediente = res;
      },
      error: (err) => console.error("Error al cargar expediente:", err)
    });
  }

  cargarNotificadores() {
    this.usuarioService.listarPorRol('NOTIFICADOR').subscribe({
      next: (res: any[]) => {
        // Map response to proper interface and set default status
        this.notificadores = res.map(n => ({
          id: n.id,
          nombreCompleto: n.nombreCompleto,
          estado: 'Disponible' // Default to Available until backend supports real status
        }));
      },
      error: (err) => console.error("Error al cargar notificadores:", err)
    });
  }

  toggleNotificadores() {
    this.showNotificadoresList = !this.showNotificadoresList;
  }

  seleccionarNotificador(notif: Notificador) {
    this.selectedNotificador = notif;
    this.showNotificadoresList = false;
  }

  validarFormulario(): boolean {
    if (!this.form.fechaAudiencia || !this.form.horaAudiencia) {
      alert("⚠️ Fecha y Hora Requerida\nPor favor, seleccione cuándo se realizará la audiencia.");
      return false;
    }

    const fechaSeleccionada = new Date(`${this.form.fechaAudiencia}T${this.form.horaAudiencia}`);
    if (fechaSeleccionada < new Date()) {
      alert("⚠️ Fecha Inválida\nNo se puede programar una audiencia en el pasado.");
      return false;
    }

    if (!this.selectedNotificador) {
      alert("⚠️ Notificador Requerido\nDebe asignar un notificador para entregar la invitación.");
      return false;
    }
    return true;
  }

  getFechaActualTexto(): string {
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const hoy = new Date();
    return `Lima, ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
  }

  guardarYSalir() {
    if (!this.validarFormulario()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/conciliador/mis-casos']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Construct simplified payload
    const payload = {
      solicitud: {
        id: Number(this.solicitudId), // Ensure it is a number for backend
        notificador: { id: this.selectedNotificador?.id }
      },
      fechaAudiencia: this.form.fechaAudiencia,
      horaAudiencia: this.form.horaAudiencia.length === 5 ? this.form.horaAudiencia + ':00' : this.form.horaAudiencia,
      lugar: this.form.lugar
    };

    this.http.post('https://web-conciliacion-esperanza-viva-production.up.railway.app/api/audiencias/programar', payload, { headers }).subscribe({
      next: () => {
        alert(`✅ Audiencia Programada\nSe asignó al notificador: ${this.selectedNotificador?.nombreCompleto}`);
        this.router.navigate(['/conciliador/mis-casos']);
      },
      error: (err) => {
        console.error(err);
        alert("❌ Error al guardar\n" + (err.error?.message || err.message));
      }
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['consultar-expediente']);
  }

  // --- DOCUMENT GENERATION HELPERS ---

  generarInvitacion() {
    if (!this.validarFormulario()) return;

    const doc = new jsPDF();
    const fechaFooter = this.getFechaActualTexto();
    const expNum = this.expediente.numeroExpediente || 'S/N';
    const matCon = this.expediente.materiaConciliable || '__________________';

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("FORMATO TIPO DE INVITACIÓN PARA CONCILIAR", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"`, 105, 30, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Autorizado su funcionamiento por Resolución N° ......................", 105, 36, { align: "center" });
    doc.text(`Dirección y teléfono: Av. Sol 450 - Cusco | Tlf: 987654321                         EXP. N° ${expNum}`, 105, 42, { align: "center" });

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("INVITACIÓN PARA CONCILIAR", 105, 55, { align: "center" });

    // Table
    let startY = 70;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Señor (es) (as):", 20, 65);

    // Dynamic Row Helper
    const drawRow = (y: number, label: string, name: string, address: string) => {
      doc.rect(20, y, 170, 10);
      doc.line(100, y, 100, y + 10); // Vertical split
      doc.text(`${label}: ${name}`, 25, y + 7);
      doc.text(address, 105, y + 7);
    };

    // Header Row
    doc.rect(20, startY, 170, 8);
    doc.line(100, startY, 100, startY + 8);
    doc.setFont("helvetica", "bold");
    doc.text("Nombre o Razón Social:", 25, startY + 6);
    doc.text("Dirección", 105, startY + 6);

    // Data Rows
    doc.setFont("helvetica", "normal");
    const solName = `${this.expediente.solicitante?.nombres || ''} ${this.expediente.solicitante?.apellidos || ''}`;
    const solAddr = this.expediente.solicitante?.domicilio || '-';
    drawRow(startY + 8, "Solicitante(s)", solName, solAddr);

    const invName = `${this.expediente.invitado?.nombres || ''} ${this.expediente.invitado?.apellidos || ''}`;
    const invAddr = this.expediente.invitado?.domicilio || '-';
    drawRow(startY + 18, "Invitado(s)", invName, invAddr);

    // Body
    let bodyY = startY + 40;
    doc.text("De mi especial estima:", 20, bodyY);
    bodyY += 10;

    const textoCuerpo = `Por medio de la presente, le invito a participar en una audiencia de conciliación que se realizará en ${this.form.lugar}, el día ${this.form.fechaAudiencia}, a horas ${this.form.horaAudiencia} (10 minutos de tolerancia), en la cual me permitiré asistirle en la búsqueda de una solución común al problema que tienen respecto de ${matCon} de acuerdo con la copia simple de la solicitud de Conciliación y anexos que se le adjunta en la presente invitación.`;

    const splitText = doc.splitTextToSize(textoCuerpo, 170);
    doc.text(splitText, 20, bodyY);
    bodyY += (splitText.length * 5) + 5;

    // Disclaimer
    doc.setFont("helvetica", "bolditalic");
    const disclaimer = "La Conciliación Extrajudicial es una institución consensual, es decir prima la voluntad de las partes para solucionar conflictos o divergencias, a través de un procedimiento ágil, flexible y económico, ahorrando el tiempo que les demandaría un proceso, y los mayores costos del mismo. Asimismo, no es necesaria la presencia de un abogado y de arribarse a acuerdos el acta con acuerdo conciliatorio constituye título de ejecución de conformidad con el artículo 18° de la Ley de Conciliación N° 26872, modificado por el artículo 1° del D.L 1070.";
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
    doc.text(splitDisclaimer, 20, bodyY);
    bodyY += (splitDisclaimer.length * 5) + 10;

    // Footer
    doc.setFont("helvetica", "normal");
    const footerText = "Las partes deberán asistir a la reunión conciliatoria identificándose con documento de identidad y/o documento que acredite la representación. Copia de la solicitud del Centro de Conciliación se encuentra a su disposición.";
    const splitFooter = doc.splitTextToSize(footerText, 170);
    doc.text(splitFooter, 20, bodyY);

    bodyY += 30;
    doc.text(fechaFooter, 20, bodyY);

    bodyY += 25;
    doc.line(20, bodyY, 80, bodyY);
    doc.text("Firma y sello del Conciliador designado", 20, bodyY + 5);

    doc.save("Formato_C_Invitacion.pdf");
  }

  generarWord() {
    if (!this.validarFormulario()) return;

    const fechaFooter = this.getFechaActualTexto();
    const expNum = this.expediente.numeroExpediente || 'S/N';
    const matCon = this.expediente.materiaConciliable || '__________________';
    const solName = `${this.expediente.solicitante?.nombres || ''} ${this.expediente.solicitante?.apellidos || ''}`;
    const invName = `${this.expediente.invitado?.nombres || ''} ${this.expediente.invitado?.apellidos || ''}`;

    // Cleaner HTML Template construction
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Formato C</title></head><body>";

    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <p style="text-align: right; font-weight: bold;">FORMATO C</p>
            <h3 style="text-align: center; text-decoration: underline;">FORMATO TIPO DE INVITACIÓN PARA CONCILIAR</h3>
            <p style="text-align: center;"><strong>CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"</strong><br>
            Autorizado su funcionamiento por Resolución ............... N° ______ - _______<br>
            Dirección y teléfono: Av. Sol 450 - Cusco | Tlf: 987654321 &nbsp;&nbsp;&nbsp; <strong>EXP. N° ${expNum}</strong></p>
            
            <h3 style="text-align: center; text-decoration: underline; margin-top: 30px;">INVITACIÓN PARA CONCILIAR</h3>
            
            <p>Señor (es) (as):</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;" border="1">
                <tr>
                    <td style="padding: 5px; background: #f0f0f0;"><strong>Nombre o Razón Social:</strong></td>
                    <td style="padding: 5px; background: #f0f0f0;"><strong>Dirección</strong></td>
                </tr>
                <tr>
                    <td style="padding: 5px;">Solicitante(s): ${solName}</td>
                    <td style="padding: 5px;">${this.expediente.solicitante?.domicilio || '-'}</td>
                </tr>
                <tr>
                    <td style="padding: 5px;">Invitado(s): ${invName}</td>
                    <td style="padding: 5px;">${this.expediente.invitado?.domicilio || '-'}</td>
                </tr>
            </table>

            <p>De mi especial estima:</p>
            
            <p>Por medio de la presente, le invito a participar en una audiencia de conciliación que se realizará en <strong>${this.form.lugar}</strong>, el día <strong>${this.form.fechaAudiencia}</strong>, a horas <strong>${this.form.horaAudiencia}</strong> (10 minutos de tolerancia), en la cual me permitiré asistirle en la búsqueda de una solución común al problema que tienen respecto de <strong>${matCon}</strong> de acuerdo con la copia simple de la solicitud de Conciliación y anexos que se le adjunta en la presente invitación.</p>
            
            <p><em>La Conciliación Extrajudicial es una institución consensual... (Texto legal abreviado para Word) ...</em></p>
            
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
}
