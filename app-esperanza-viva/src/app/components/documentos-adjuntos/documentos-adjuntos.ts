import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { DatosSolicitudService } from '../../services/datos-solicitud.service';
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

  constructor(
    private router: Router,
    private solicitudService: SolicitudService,
    private datosService: DatosSolicitudService
  ) {}

  descargarFormatoA() {
    const datos = this.datosService.obtenerDatos();
    const doc = new jsPDF();
    const s = datos.solicitante || {};
    const i = datos.invitado || {};
    const a = datos.apoderado || {};

    // --- ENCABEZADO OFICIAL [cite: 2] ---
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
    doc.text('Dirección: Av. Principal 123 Teléfono: 999 888 777', 105, 40, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SOLICITUD PARA CONCILIAR', 105, 55, { align: 'center' });
    doc.line(75, 57, 135, 57);

    // --- I. DATOS GENERALES [cite: 5] ---
    doc.setFontSize(10);
    doc.text('I. DATOS GENERALES:', 20, 70);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`1. Fecha: ${new Date().toLocaleDateString()}`, 20, 80);
    doc.text(`2. Nombre o razón social del (los) solicitante(s): ${s.nombres} ${s.apellidos}`, 20, 88);
    doc.text(`3. Documento de identidad o RUC del (los) solicitante(s): ${s.dni}`, 20, 96);
    doc.text(`4. Domicilio de los solicitantes: ${s.domicilio}`, 20, 104);
    doc.text(`5. Nombre del apoderado: ${a.nombres || '---'} ${a.apellidos || ''}`, 20, 112);
    doc.text(`6. Domicilio del apoderado: ${a.domicilio || '---'}`, 20, 120);
    doc.text(`7. Nombre o razón social del (los) invitado(s): ${i.nombres} ${i.apellidos}`, 20, 128);
    doc.text(`8. Domicilio(s) del (los) invitado(s): ${i.domicilio}`, 20, 136);

    // --- II. HECHOS [cite: 14] ---
    doc.setFont('helvetica', 'bold');
    doc.text('II. HECHOS QUE DIERON LUGAR AL CONFLICTO:', 20, 150);
    doc.setFont('helvetica', 'normal');
    const hechos = doc.splitTextToSize(datos.hechos || '', 170);
    doc.text(hechos, 20, 158);

    // --- III. OTRAS PERSONAS CON DERECHO ALIMENTARIO [cite: 16] ---
    // Calculamos la posición Y dinámica para que no se encime con los hechos
    const yPosAlimentos = 165 + (hechos.length * 5); 
    doc.setFont('helvetica', 'bold');
    doc.text('III. OTRAS PERSONAS CON DERECHO ALIMENTARIO:', 20, yPosAlimentos);
    doc.setFont('helvetica', 'normal');
    doc.text(datos.otrasPersonasAlimentario || 'Ninguna', 20, yPosAlimentos + 8);

    // --- IV. PRETENSIÓN [cite: 17] ---
    const yPosPretension = yPosAlimentos + 25;
    doc.setFont('helvetica', 'bold');
    doc.text('IV. PRETENSIÓN:', 20, yPosPretension);
    doc.setFont('helvetica', 'normal');
    const pretension = doc.splitTextToSize(datos.pretension || '', 170);
    doc.text(pretension, 20, yPosPretension + 8);

    // --- V. FIRMA [cite: 19] ---
    doc.setFont('helvetica', 'bold');
    doc.text('V. FIRMA DEL SOLICITANTE HUELLA DIGITAL SEGÚN EL CASO', 20, 260);
    doc.line(70, 280, 140, 280);
    doc.setFontSize(9);
    doc.text(`Nombre: ${s.nombres} ${s.apellidos}`, 105, 285, { align: 'center' });
    doc.text(`DNI: ${s.dni}`, 105, 290, { align: 'center' });

    doc.save(`Formato_A_${s.dni}.pdf`);
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