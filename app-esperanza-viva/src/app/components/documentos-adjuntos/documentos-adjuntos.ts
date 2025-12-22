import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { DatosSolicitudService } from '../../services/datos-solicitud.service';
import jsPDF from 'jspdf'; // Importamos para generar el Formato A [cite: 16]

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

  constructor(
    private router: Router,
    private solicitudService: SolicitudService,
    private datosService: DatosSolicitudService
  ) {}

  // MÉTODO PARA GENERAR EL FORMATO A OFICIAL [cite: 72, 96]
  descargarFormatoA() {
    const datos = this.datosService.obtenerDatos();
    const doc = new jsPDF();
    const s = datos.solicitante || {};
    const a = datos.apoderado || {};
    const i = datos.invitado || {};

    // --- ENCABEZADO OFICIAL ---
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('FORMATO A', 180, 10);

    doc.setFontSize(10);
    doc.text('FORMATO TIPO DE SOLICITUD DE CONCILIACIÓN', 105, 20, { align: 'center' });
    
    doc.setFontSize(11);
    doc.text('CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"', 105, 30, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Autorizado su funcionamiento por Resolución Ministerial N° 0235-2009-JUS', 105, 35, { align: 'center' });
    doc.text('Dirección: Av. Principal 123 - Teléfono: 999 888 777', 105, 40, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SOLICITUD PARA CONCILIAR', 105, 55, { align: 'center' });
    doc.line(75, 57, 135, 57); // Subrayado del título

    // --- I. DATOS GENERALES ---
    doc.setFontSize(10);
    doc.text('I.   DATOS GENERALES:', 20, 70);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`1.  Fecha: ${new Date().toLocaleDateString()}`, 20, 80);
    doc.text(`2.  Nombre o razón social del (los) solicitante(s): ${s.nombres || ''} ${s.apellidos || ''}`, 20, 88);
    doc.text(`3.  Documento de identidad o RUC del (los) solicitante(s): ${s.dni || ''}`, 20, 96);
    doc.text(`4.  Domicilio de los solicitantes: ${s.domicilio || ''}`, 20, 104);

    doc.text(`5. Nombre del apoderado: ${datos.apoderado.nombres || ''} ${datos.apoderado.apellidos || ''}`, 20, 112);
    doc.text(`6. Domicilio del apoderado: ${datos.apoderado.domicilio || ''}`, 20, 120);

    doc.text(`7.  Nombre o razón social del (los) invitado(s): ${i.nombres || ''} ${i.apellidos || ''}`, 20, 128);
    doc.text(`8.  Domicilio(s) del (los) invitado(s): ${i.domicilio || ''}`, 20, 136);

    // --- II. HECHOS ---
    doc.setFont('helvetica', 'bold');
    doc.text('II.  HECHOS QUE DIERON LUGAR AL CONFLICTO:', 20, 150);
    doc.setFont('helvetica', 'normal');
    const hechos = doc.splitTextToSize(datos.hechos || 'Sin descripción de hechos.', 170);
    doc.text(hechos, 20, 158);

    // --- III. OTRAS PERSONAS (Opcional en formato) ---
    doc.setFont('helvetica', 'bold');
    doc.text('III. OTRAS PERSONAS CON DERECHO ALIMENTARIO:', 20, 190);
    doc.setFont('helvetica', 'normal');
    doc.text('__________________________________________________________________________', 20, 198);

    // --- IV. PRETENSIÓN ---
    doc.setFont('helvetica', 'bold');
    doc.text('IV. PRETENSIÓN:', 20, 210);
    doc.setFont('helvetica', 'normal');
    const pretension = doc.splitTextToSize(datos.pretension || 'Sin pretensión especificada.', 170);
    doc.text(pretension, 20, 218);

    // --- V. FIRMA Y HUELLA ---
    doc.setFont('helvetica', 'bold');
    doc.text('V.  FIRMA DEL SOLICITANTE o HUELLA DIGITAL SEGÚN EL CASO', 20, 245);
    
    doc.line(70, 270, 140, 270); // Línea de firma
    doc.setFontSize(9);
    doc.text(`Nombre: ${s.nombres || ''} ${s.apellidos || ''}`, 105, 275, { align: 'center' });
    doc.text(`DNI: ${s.dni || ''}`, 105, 280, { align: 'center' });

    // Descarga del archivo
    doc.save(`Formato_A_${s.dni || 'Tramite'}.pdf`);
  }

  onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      if (type === 'dni') this.fileDni = file;
      if (type === 'pruebas') this.filePruebas = file;
      if (type === 'firma') this.fileFirma = file;
    }
  }

  finalizarRegistro() {
    const solicitudDatos = this.datosService.obtenerDatos();
    const formData = new FormData();
    
    // Esto envía el JSON completo (incluyendo hechos y pretensión) al backend
    formData.append('solicitud', JSON.stringify(solicitudDatos));

    if (this.fileDni) formData.append('dniArchivo', this.fileDni);
    if (this.filePruebas) formData.append('pruebasArchivo', this.filePruebas);
    if (this.fileFirma) formData.append('firmaArchivo', this.fileFirma);

    this.solicitudService.registrarSolicitud(formData).subscribe({
      next: (res) => this.router.navigate(['/resumen-registro', res.numeroExpediente]),
      error: (err) => console.error("Error al subir", err)
    });
  }
}