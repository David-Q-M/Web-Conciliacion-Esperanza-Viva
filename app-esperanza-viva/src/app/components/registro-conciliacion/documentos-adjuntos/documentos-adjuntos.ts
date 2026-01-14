import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { SolicitudService } from '../../../services/solicitud.service';
import { DatosSolicitudService } from '../../../services/datos-solicitud.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-documentos-adjuntos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './documentos-adjuntos.html',
  styleUrls: ['./documentos-adjuntos.css']
})
export class DocumentosAdjuntos {
  fileDni: File | null = null;
  filePruebas: File | null = null;
  fileFirma: File | null = null;

  // Variables para mostrar nombre en el input customizado
  nombreDni: string = 'Ningún archivo seleccionado';
  nombrePruebas: string = 'Ningún archivo seleccionado';
  nombreFirma: string = 'Ningún archivo seleccionado';

  // 🛡️ NUEVO: Control de Modalidad
  menuModalidadAbierto = false;
  modalidadSeleccionada = 'Presencial';

  constructor(
    private router: Router,
    private solicitudService: SolicitudService,
    private datosService: DatosSolicitudService
  ) { }

  seleccionarModalidad(opcion: string) {
    this.modalidadSeleccionada = opcion;
    this.menuModalidadAbierto = false;
  }

  descargarFormatoA() {
    const datos = this.datosService.obtenerDatos();
    const doc = new jsPDF();
    const s = datos.solicitante || {};
    const i = datos.invitado || {};
    const a = datos.apoderado || {};

    // --- TÍTULO DEL DOCUMENTO ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('FORMATO A', 180, 55);

    doc.setFontSize(11);
    doc.text('FORMATO TIPO DE SOLICITUD DE CONCILIACIÓN', 105, 65, { align: 'center' });
    doc.line(65, 66, 145, 66); // Underline title

    // Centro info body
    doc.setFontSize(9);
    doc.text('CENTRO DE CONCILIACIÓN EXTRAJUDICIAL  "ESPERANZA VIVA"', 105, 70, { align: 'center' });
    doc.text('Autorizado por el Ministerio de Justicia R. D. N° 1476-2018-JUS/DGPAJ-DCMA', 105, 80, { align: 'center' });
    doc.text('Dirección y teléfono: Av. Prado Bajo N° 131, 1ra cuadra - Abancay-Apurimac - Cel: 923017144   EXP. Nº ${datos.numeroExpediente}', 105, 85, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SOLICITUD PARA CONCILIAR', 105, 95, { align: 'center' });
    doc.line(75, 96, 135, 96); // Underline subtitle

    // --- I. DATOS GENERALES ---
    let y = 110;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('I.   DATOS GENERALES:', 20, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    // Using numbered list format from image
    const lineHeight = 7;
    doc.text(`1.   Fecha: ${new Date().toLocaleDateString()}`, 20, y); y += lineHeight;
    doc.text(`2.   Nombre o razón social del (los) solicitante(s)[3]: ${s.nombres || '---'} ${s.apellidos || ''}`, 20, y); y += lineHeight;
    doc.text(`3.   Documento de identidad o RUC del (los) solicitante (s): ${s.dni || '---'}`, 20, y); y += lineHeight;
    doc.text(`4.   Domicilio de l (los) solicitantes: ${s.domicilio || '---'}`, 20, y); y += lineHeight;
    doc.text(`5.   Nombre del apoderado o representante: ${a.nombres ? a.nombres + ' ' + a.apellidos : '----------------'}`, 20, y); y += lineHeight;
    doc.text(`6.   Domicilio del apoderado o representante: ${a.domicilio || '----------------'}`, 20, y); y += lineHeight;
    doc.text(`7.   Nombre o razón social del (los) invitado(s): ${i.nombres || '---'} ${i.apellidos || ''}`, 20, y); y += lineHeight;
    doc.text(`8.   Domicilio (s) del (los) invitado (s): ${i.domicilio || '---'}`, 20, y);

    // --- II. HECHOS ---
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('II.  HECHOS QUE DIERON LUGAR AL CONFLICTO[4]:', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    const hechos = doc.splitTextToSize(datos.hechos || 'Sin hechos descritos.', 170);
    doc.text(hechos, 20, y);
    y += (hechos.length * 5) + 5;

    // --- III. OTRAS PERSONAS ---
    doc.setFont('helvetica', 'bold');
    doc.text('III. OTRAS PERSONAS CON DERECHO ALIMENTARIO[5]:', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    const alimentos = doc.splitTextToSize(datos.otrasPersonasAlimentario || '----------------', 170);
    doc.text(alimentos, 20, y);
    y += (alimentos.length * 5) + 5;

    // --- IV. PRETENSIÓN ---
    doc.setFont('helvetica', 'bold');
    doc.text('IV.  PRETENSIÓN[6]:', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    const pretension = doc.splitTextToSize(datos.pretension || '----------------', 170);
    doc.text(pretension, 20, y);
    y += (pretension.length * 5) + 15;

    // --- V. FIRMA ---
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('V.   FIRMA DEL SOLICITANTE o HUELLA DIGITAL SEGÚN EL CASO[7]', 20, y);

    y += 25; // Space for signature
    doc.line(20, y, 90, y); // Signature line
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text('Nombre y documento de Identidad', 20, y);

    // --- VI. DOCUMENTOS QUE ADJUNTO ---
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('VI.  DOCUMENTOS QUE ADJUNTO[8]:', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text('1.       Copia de D.N.I.', 20, y); y += 6;
    doc.text('2.       __________________________________________________', 20, y); y += 6;
    doc.text('3        __________________________________________________', 20, y);

    doc.save(`Formato_A_${s.dni || 'solicitud'}.pdf`);
  }

  descargarFormatoAWord() {
    const datos = this.datosService.obtenerDatos();
    const s = datos.solicitante || {};
    const i = datos.invitado || {};
    const a = datos.apoderado || {};

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Formato A</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 11pt; }
        .header { text-align: center; font-weight: bold; margin-bottom: 20px; }
        .strong { font-weight: bold; }
        .center { text-align: center; }
        .blue { color: #1e3a8a; }
        .red { color: #dc3545; }
        ul { list-style-type: none; padding: 0; }
        li { margin-bottom: 5px; }
        .section-title { font-weight: bold; margin-top: 15px; margin-bottom: 5px; }
      </style>
      </head>
      <body

        <div style="text-align: right; font-weight: bold; font-family: Arial, sans-serif; font-size: 10pt;">FORMATO A</div>
        
        <div class="center strong" style="font-family: Arial, sans-serif; font-size: 11pt; text-decoration: underline;">FORMATO TIPO DE SOLICITUD DE CONCILIACIÓN</div>
        
        <div class="center" style="font-size: 10pt; margin-top: 10px;">
          CENTRO DE CONCILIACIÓN EXTRAJUDICIAL "ESPERANZA VIVA"<br>
          Autorizado Ministerio de Justicia R. D. N° 1476-2018-JUS/DGPAJ-DCMA<br>
          Dirección y teléfono:Av. Prado Bajo N° 131, 1ra cuadra - Abancay-Apurimac - Cel: 923017144       EXP. Nº ${datos.numeroExpediente}
        </div>

        <div class="center strong" style="font-size: 12pt; margin-top: 15px;">SOLICITUD PARA CONCILIAR</div>
        <div class="center">______________________________</div>

        <div class="section-title">I. DATOS GENERALES:</div>
        <ul>
          <li>1. Fecha: ${new Date().toLocaleDateString()}</li>
          <li>2. Nombre o razón social del (los) solicitante(s)[3]: ${s.nombres || '---'} ${s.apellidos || ''}</li>
          <li>3. Documento de identidad o RUC del (los) solicitante (s): ${s.dni || '---'}</li>
          <li>4. Domicilio de l (los) solicitantes: ${s.domicilio || '---'}</li>
          <li>5. Nombre del apoderado o representante: ${a.nombres ? a.nombres + ' ' + a.apellidos : '----------------'}</li>
          <li>6. Domicilio del apoderado o representante: ${a.domicilio || '----------------'}</li>
          <li>7. Nombre o razón social del (los) invitado(s): ${i.nombres || '---'} ${i.apellidos || ''}</li>
          <li>8. Domicilio (s) del (los) invitado (s): ${i.domicilio || '---'}</li>
        </ul>

        <div class="section-title">II. HECHOS QUE DIERON LUGAR AL CONFLICTO:</div>
        <p>${datos.hechos || 'Sin hechos descritos.'}</p>

        <div class="section-title">III. OTRAS PERSONAS CON DERECHO ALIMENTARIO:</div>
        <p>${datos.otrasPersonasAlimentario || '----------------'}</p>

        <div class="section-title">IV. PRETENSIÓN:</div>
        <p>${datos.pretension || '----------------'}</p>

        <br><br><br>
        <div class="section-title">V. FIRMA DEL SOLICITANTE o HUELLA DIGITAL SEGÚN EL CASO</div>
        <br><br>
        <div class="center">__________________________________________________</div>
        <div class="center"> Nombre: ${s.nombres || '---'} ${s.apellidos || '---'}</div>
        <div class="center"> DNi: ${s.dni || '---'}</div>

        <div class="section-title">VI. DOCUMENTOS QUE ADJUNTO[8]:</div>
        <ol>
          <li>Copia de D.N.I.</li>
          <li>__________________________________________________</li>
          <li>__________________________________________________</li>
        </ol>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });

    // Crear link de descarga
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Formato_A_${s.dni || 'solicitud'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      if (type === 'dni') {
        this.fileDni = file;
        this.nombreDni = file.name;
      }
      if (type === 'pruebas') {
        this.filePruebas = file;
        this.nombrePruebas = file.name;
      }
      if (type === 'firma') {
        this.fileFirma = file;
        this.nombreFirma = file.name;
      }
    }
  }

  finalizarRegistro() {
    const solicitudDatos = this.datosService.obtenerDatos();
    solicitudDatos.modalidad = this.modalidadSeleccionada;
    const formData = new FormData();

    // Sincronización con el Backend (MariaDB)
    formData.append('solicitud', JSON.stringify(solicitudDatos));

    if (this.fileDni) formData.append('dniArchivo', this.fileDni);
    if (this.filePruebas) formData.append('pruebasArchivo', this.filePruebas);
    if (this.fileFirma) formData.append('firmaArchivo', this.fileFirma);

    this.solicitudService.registrarSolicitud(formData).subscribe({
      next: (res) => this.router.navigate(['/resumen-registro', res.numeroExpediente]),
      error: (err) => alert("Error al procesar la solicitud. Verifique los archivos.")
    });
  }
}