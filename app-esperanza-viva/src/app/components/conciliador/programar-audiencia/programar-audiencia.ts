import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
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
  numeroDocumento?: string;
  razonSocial?: string;
}

interface Expediente {
  id?: number;
  numeroExpediente?: string;
  materiaConciliable?: string;
  modalidad?: string;
  solicitante?: Parte;
  invitado?: Parte;
  fechaCreacion?: string;
  estado?: string;
  audiencias?: any[];
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
  expediente: any = {};
  conciliadorNombre: string = '';
  isYaProgramado: boolean = false;
  isLoading: boolean = false;

  notificadores: any[] = [];
  selectedNotificador: any = null;
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
    this.solicitudService.obtenerPorId(Number(this.solicitudId)).subscribe({
      next: (res) => {
        this.expediente = res;
        // BLOQUEO LÓGICO: Si el estado ya es PROGRAMADO o superior, bloqueamos la edición
        if (res.estado === 'PROGRAMADO' || res.estado === 'NOTIFICADO') {
          this.isYaProgramado = true;
          // Si ya existe audiencia, intentamos cargar sus datos para visualización
          if (res.audiencias && res.audiencias.length > 0) {
            const aud = res.audiencias[0];
            this.form.fechaAudiencia = aud.fechaAudiencia;
            this.form.horaAudiencia = aud.horaAudiencia;
            this.form.lugar = aud.lugar;
          }
        }
      },
      error: (err) => console.error("Error al cargar expediente:", err)
    });
  }

  cargarNotificadores() {
    this.usuarioService.listarPorRol('NOTIFICADOR').subscribe({
      next: (res: any[]) => {
        this.notificadores = res.map(n => ({
          id: n.id,
          nombreCompleto: n.nombreCompleto,
          estado: 'Disponible'
        }));
      },
      error: (err) => console.error("Error al cargar notificadores:", err)
    });
  }

  toggleNotificadores() {
    this.showNotificadoresList = !this.showNotificadoresList;
  }

  seleccionarNotificador(notif: any) {
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
    if (this.isYaProgramado) return;
    if (this.isLoading) return; // Prevent double clicks
    if (!this.validarFormulario()) return;

    this.isLoading = true; // Lock
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const payload = {
      solicitud: {
        id: Number(this.solicitudId),
        notificador: { id: this.selectedNotificador?.id }
      },
      fechaAudiencia: this.form.fechaAudiencia,
      horaAudiencia: this.form.horaAudiencia.length === 5 ? this.form.horaAudiencia + ':00' : this.form.horaAudiencia,
      lugar: this.form.lugar
    };

    this.http.post(`${environment.apiUrl}/audiencias/programar`, payload, { headers }).subscribe({
      next: () => {
        this.isYaProgramado = true;
        alert(`✅ ÉXITO: Audiencia registrada y expediente actualizado.`);
        this.router.navigate(['/conciliador/mis-casos']);
      },
      error: (err) => {
        this.isLoading = false; // Unlock on error
        const msg = err.error?.message || err.message || "Posible duplicidad o problema de conexión.";
        alert("❌ Error: " + msg);
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

    // HEADER
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text("FORMATO C", 195, 15, { align: "right" });

    doc.setFontSize(12);
    doc.text("FORMATO TIPO DE INVITACIÓN PARA CONCILIAR", 105, 25, { align: "center" });
    doc.line(65, 26, 145, 26); // Underline

    doc.setFontSize(11);
    doc.text(`CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"`, 85, 35, { align: "center" });

    doc.setFont("times", "normal");
    doc.setFontSize(10);
    // Autorizado su funcionamiento... aligned with Centro title
    doc.text("Autorizado su funcionamiento por Resolución ............... N° ______ - _______", 105, 40, { align: "center" });
    doc.text(`Dirección y teléfono: Av. Sol 450 - Cusco | Tlf: 987654321           EXP. N° ${expNum}`, 105, 45, { align: "center" });

    // INVITACION TITLE
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text("INVITACIÓN PARA CONCILIAR", 105, 55, { align: "center" });
    doc.line(75, 56, 135, 56); // Underline

    let y = 65;
    doc.setFont("times", "normal");
    doc.setFontSize(11); // Standard font size for body
    doc.text("Señor (es) (as):", 20, y);

    y += 5;
    // TABLE HEADER
    doc.setFont("times", "bold");
    doc.rect(20, y, 90, 8); // Col 1
    doc.rect(110, y, 80, 8); // Col 2
    doc.text("Nombre o Razón Social:", 25, y + 6);
    doc.text("Dirección", 115, y + 6);

    y += 8;
    // ROW 1: Solicitante
    doc.rect(20, y, 90, 8);
    doc.rect(110, y, 80, 8);

    doc.setFont("times", "normal");
    doc.text("Solicitante(s):", 22, y + 6);
    const solName = `${this.expediente.solicitante?.nombres || ''} ${this.expediente.solicitante?.apellidos || ''}`;
    doc.text(solName, 50, y + 6);
    doc.text(this.expediente.solicitante?.domicilio || '-', 115, y + 6);

    y += 8;
    // ROW 2: Invitado
    doc.rect(20, y, 90, 8);
    doc.rect(110, y, 80, 8);
    doc.text("Invitado(s):", 22, y + 6);
    const invName = `${this.expediente.invitado?.nombres || ''} ${this.expediente.invitado?.apellidos || ''}`;
    doc.text(invName, 50, y + 6);
    doc.text(this.expediente.invitado?.domicilio || '-', 115, y + 6);

    y += 15;
    doc.text("De mi especial estima:", 20, y);

    y += 10;
    const direccionCentro = this.form.lugar; // "Av. Sol 450 - Cusco (Sede Principal)" usually
    const textoCuerpo = `Por medio de la presente, le invito a participar en una audiencia de conciliación que se realizará en ${direccionCentro}, el día ${this.form.fechaAudiencia}, a horas ${this.form.horaAudiencia} (10 minutos de tolerancia), en la cual me permitiré asistirle en la búsqueda de una solución común al problema que tienen respecto de ${matCon} de acuerdo con la copia simple de la solicitud de Conciliación y anexos que se le adjunta en la presente invitación.`;

    const splitText = doc.splitTextToSize(textoCuerpo, 170);
    doc.text(splitText, 20, y, { align: "justify", maxWidth: 170 });
    y += (splitText.length * 6) + 5;

    // Disclaimer Paragraph
    doc.setFont("times", "italic"); // Italic as per image "prima la voluntad..." seems italic or distinctive? Image shows bold italic maybe? The image says "La Conciliación Extrajudicial es una institución consensual... (bold italic)"
    doc.setFont("times", "bolditalic");
    const disclaimer = "La Conciliación Extrajudicial es una institución consensual, es decir prima la voluntad de las partes para solucionar conflictos o divergencias, a través de un procedimiento ágil, flexible y económico, ahorrando el tiempo que les demandaría un proceso, y los mayores costos del mismo. Asimismo, no es necesaria la presencia de un abogado y de arribarse a acuerdos el acta con acuerdo conciliatorio constituye título de ejecución de conformidad con el artículo 18° de la Ley de Conciliación N° 26872, modificado por el artículo 1° del D.L 1070.";
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
    doc.text(splitDisclaimer, 20, y, { align: "justify", maxWidth: 170 });
    y += (splitDisclaimer.length * 6) + 10;

    // Footer Text
    doc.setFont("times", "normal"); // Reset to normal
    const footerText = "Las partes deberán asistir a la reunión conciliatoria identificándose con documento de identidad y/o documento que acredite la representación, en el que se consigne literalmente la facultad de conciliar extrajudicialmente y de disponer del derecho materia de Conciliación, entregando fotocopia del documento de identidad, copia notarialmente legalizada o certificada según sea el caso, al Centro de Conciliación. Las personas iletradas o que no puedan firmar deberán acercarse al Centro de Conciliación con un testigo a ruego.";
    // "Sin otro particular, quedo de usted"
    const splitFooter = doc.splitTextToSize(footerText, 170);
    doc.text(splitFooter, 20, y, { align: "justify", maxWidth: 170 });
    y += (splitFooter.length * 6) + 5;

    doc.text("Sin otro particular, quedo de usted", 20, y);
    y += 15;

    doc.text(fechaFooter, 20, y);

    y += 30;
    doc.line(20, y, 90, y);
    doc.text("Firma y sello del Conciliador designado", 20, y + 5);

    doc.save(`Formato_C_${expNum}.pdf`);
  }

  generarWord() {
    if (!this.validarFormulario()) return;

    const fechaFooter = this.getFechaActualTexto();
    const expNum = this.expediente.numeroExpediente || 'S/N';
    const matCon = this.expediente.materiaConciliable || '__________________';
    const solName = `${this.expediente.solicitante?.nombres || ''} ${this.expediente.solicitante?.apellidos || ''}`;
    const invName = `${this.expediente.invitado?.nombres || ''} ${this.expediente.invitado?.apellidos || ''}`;

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Formato C</title><style>body { font-family: 'Times New Roman', serif; font-size: 11pt; } .bold { font-weight: bold; } .center { text-align: center; } .justify { text-align: justify; } .italic { font-style: italic; } .bold-italic { font-weight: bold; font-style: italic; }</style></head><body>";

    const content = `
        <div style="padding: 40px;">
            <p style="text-align: right; font-weight: bold;">FORMATO C</p>
            
            <div class="center bold" style="text-decoration: underline; margin-bottom: 10px;">FORMATO TIPO DE INVITACIÓN PARA CONCILIAR</div>
            
            <div class="center bold" style="margin-bottom: 10px;">CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"</div>
            <div class="center">Autorizado su funcionamiento por Resolución ............... N° ______ - _______</div>
            <div class="center">Dirección y teléfono: Av. Sol 450 - Cusco | Tlf: 987654321 &nbsp;&nbsp;&nbsp;&nbsp; <strong>EXP. N° ${expNum}</strong></div>
            
            <div class="center bold" style="text-decoration: underline; margin-top: 30px; margin-bottom: 20px;">INVITACIÓN PARA CONCILIAR</div>
            
            <p>Señor (es) (as):</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid black;">
                <tr>
                    <td style="border: 1px solid black; padding: 5px; width: 50%;" class="bold">Nombre o Razón Social:</td>
                    <td style="border: 1px solid black; padding: 5px; width: 50%;" class="bold">Dirección</td>
                </tr>
                <tr>
                    <td style="border: 1px solid black; padding: 5px;">Solicitante(s): ${solName}</td>
                    <td style="border: 1px solid black; padding: 5px;">${this.expediente.solicitante?.domicilio || '-'}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid black; padding: 5px;">Invitado(s): ${invName}</td>
                    <td style="border: 1px solid black; padding: 5px;">${this.expediente.invitado?.domicilio || '-'}</td>
                </tr>
            </table>

            <p>De mi especial estima:</p>
            
            <p class="justify">Por medio de la presente, le invito a participar en una audiencia de conciliación que se realizará en <strong>${this.form.lugar}</strong>, el día <strong>${this.form.fechaAudiencia}</strong>, a horas <strong>${this.form.horaAudiencia}</strong> (10 minutos de tolerancia), en la cual me permitiré asistirle en la búsqueda de una solución común al problema que tienen respecto de <strong>${matCon}</strong> de acuerdo con la copia simple de la solicitud de Conciliación y anexos que se le adjunta en la presente invitación.</p>
            
            <p class="justify bold-italic">
                La Conciliación Extrajudicial es una institución consensual, es decir prima la voluntad de las partes para solucionar conflictos o divergencias, a través de un procedimiento ágil, flexible y económico, ahorrando el tiempo que les demandaría un proceso, y los mayores costos del mismo. Asimismo, no es necesaria la presencia de un abogado y de arribarse a acuerdos el acta con acuerdo conciliatorio constituye título de ejecución de conformidad con el artículo 18° de la Ley de Conciliación N° 26872, modificado por el artículo 1° del D.L 1070.
            </p>
            
            <p class="justify">
                Las partes deberán asistir a la reunión conciliatoria identificándose con documento de identidad y/o documento que acredite la representación, en el que se consigne literalmente la facultad de conciliar extrajudicialmente y de disponer del derecho materia de Conciliación, entregando fotocopia del documento de identidad, copia notarialmente legalizada o certificada según sea el caso, al Centro de Conciliación. Las personas iletradas o que no puedan firmar deberán acercarse al Centro de Conciliación con un testigo a ruego.
            </p>
            
            <p>Sin otro particular, quedo de usted</p>
            
            <p>${fechaFooter}</p>
            
            <br><br><br>
            <div style="border-top: 1px solid black; width: 250px; padding-top: 5px;">
                Firma y sello del Conciliador designado
            </div>
        </div>
    `;

    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Formato_C_${expNum}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }
}
