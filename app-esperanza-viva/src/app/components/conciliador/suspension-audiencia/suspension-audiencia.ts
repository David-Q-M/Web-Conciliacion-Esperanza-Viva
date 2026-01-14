import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-suspension-audiencia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './suspension-audiencia.html',
  styleUrls: ['./suspension-audiencia.css']
})
export class SuspensionAudiencia implements OnInit {
  audienciaId: any;
  conciliadorNombre: string = '';
  mostrarVistaPrevia: boolean = false;

  expediente: any = {
    numeroExpediente: '',
    solicitante: { nombre: '', dni: '', estado: 'Asistio' },
    invitado: { nombre: '', dni: '', estado: 'Asistio' },
    hechos: '',
    pretension: ''
  };

  acta = {
    antecedentes: '',
    controversias: '',
    declaracion: 'No habiendo asistido NINGUNA de las partes...', // Will be updated dynamically or by user
    resultadoDetalle: 'Suspensión por mutuo acuerdo',
    lugar: 'Sede Central Esperanza Viva',
    dia: new Date().getDate(),
    mes: new Date().toLocaleString('es-ES', { month: 'long' }),
    anio: new Date().getFullYear(),
    hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  formE = {
    motivo: '',
    nuevaFecha: '',
    nuevaHora: '',
    lugar: 'Sede Central Esperanza Viva'
  };

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) this.conciliadorNombre = JSON.parse(userJson).nombreCompleto;
    this.audienciaId = this.route.snapshot.paramMap.get('id');
    if (this.audienciaId) this.cargarDatosAudiencia();
  }

  cargarDatosAudiencia() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any>(`http://localhost:8080/api/audiencias/${this.audienciaId}`, { headers }).subscribe({
      next: (data) => {
        const sol = data.solicitud || {};
        this.expediente = {
          numeroExpediente: sol.numeroExpediente || 'EXP-2026-001',
          solicitante: { nombre: `${sol.solicitante?.nombres} ${sol.solicitante?.apellidos}`, dni: sol.solicitante?.dni, estado: data.asistenciaSolicitante || 'Asistio' },
          invitado: { nombre: `${sol.invitado?.nombres} ${sol.invitado?.apellidos}`, dni: sol.invitado?.dni, estado: data.asistenciaInvitado || 'Falto' }
        };
        this.acta.antecedentes = sol.hechos || '';
        this.acta.controversias = sol.pretension || '';
      }
    });
  }

  toggleVistaPrevia() { this.mostrarVistaPrevia = !this.mostrarVistaPrevia; }

  // 🛡️ DESCARGA SEGÚN FORMATO E (CONSTANCIA DE SUSPENSIÓN)
  descargarPDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth(); // ~210mm

    // Helper for centered text
    const centerText = (text: string, y: number) => {
      const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };

    // Header
    doc.setFont("times", "bold"); doc.setFontSize(10);
    doc.text("FORMATO E", pageWidth - 30, 15);

    doc.setFontSize(11);
    centerText("FORMATO TIPO DE CONSTANCIA DE SUSPENSIÓN DE AUDIENCIA DE CONCILIACIÓN", 25);

    doc.setFontSize(10);
    doc.text("CENTRO DE CONCILIACIÓN ESPERANZA VIVA", 60, 35);
    doc.setFont("times", "normal");
    doc.text("Autorizado su funcionamiento por Resolución ................ N° _______-_______", 40, 42);
    doc.text(`Dirección y teléfono: ${this.acta.lugar}   |   EXP. N° ${this.expediente.numeroExpediente}`, 40, 49);

    // Title
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    centerText("CONSTANCIA DE SUSPENSIÓN DE AUDIENCIA DE CONCILIACIÓN", 65);

    // Body
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    const solicitante = this.expediente.solicitante.nombre.toUpperCase();
    const dniSol = this.expediente.solicitante.dni || '...........';
    const invitado = this.expediente.invitado.nombre.toUpperCase();
    const dniInv = this.expediente.invitado.dni || '...........';
    const fechaActual = `${this.acta.dia} del mes de ${this.acta.mes} del año ${this.acta.anio}`;
    const horaActual = this.acta.hora;
    const nuevaFecha = this.formE.nuevaFecha || '...........';
    const nuevaHora = this.formE.nuevaHora || '...........';

    const cuerpo = `A horas ${horaActual} del día ${fechaActual}, las partes asistentes el (la) señor (a) ${solicitante}, identificado(a) con DNI N° ${dniSol} y el (la) señor (a) ${invitado}, identificado con DNI N° ${dniInv}, luego de realizada la sesión (que corresponde a la realización de la sesión suspendida) de la Audiencia de Conciliación, las partes acordaron suspenderla de acuerdo al artículo 11° de la Ley de Conciliación N° 26872, modificado por el artículo 1° del Decreto Legislativo N° 1070, fijando como una nueva fecha para la continuación de la Audiencia el día ${nuevaFecha} a horas ${nuevaHora}, en la sede de este Centro de Conciliación sito en ${this.formE.lugar} (dirección del centro de conciliación), dándose las partes por invitadas con la suscripción de la presente por triplicado.`;

    // Split text to fit width (margin left 20, width 170)
    const splitText = doc.splitTextToSize(cuerpo, 170);
    doc.text(splitText, 20, 80);

    // Signatures Area
    doc.text("_________________________", 25, 150);
    doc.text("Firma y huella del Conciliador", 25, 155);

    doc.text("_________________________", 120, 150);
    doc.text("Nombre, firma y huella del solicitante", 120, 155);

    doc.text("_________________________", 120, 185);
    doc.text("Nombre, firma y huella del invitado", 120, 190);

    doc.save(`CONSTANCIA_SUSPENSION_${this.expediente.numeroExpediente}.pdf`);
  }

  finalizarYDescargar() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const payload = { resultadoTipo: 'Inasistencia/Suspensión', resultadoDetalle: this.acta.declaracion };
    this.http.put(`http://localhost:8080/api/audiencias/${this.audienciaId}/resultado`, payload, { headers }).subscribe({
      next: () => {
        this.descargarPDF();
        alert("Acta guardada y descargada con éxito.");
        this.router.navigate(['/conciliador/mis-casos']);
      }
    });
  }
}