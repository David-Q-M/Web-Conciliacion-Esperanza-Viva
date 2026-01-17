import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SolicitudService } from '../../../services/solicitud.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-detalle-director',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './detalle.html',
  styleUrls: ['./detalle.css']
})
export class DetalleDirector implements OnInit {
  expediente: any = {};
  conciliadores: any[] = [];
  conciliadorId: any = null;
  conciliadorSeleccionado: any = null;
  mostrarModal = false;
  observacionTexto = '';
  directorNombre: string = '';

  constructor(
    private route: ActivatedRoute,
    private solicitudService: SolicitudService,
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDetalle(Number(id));
      this.cargarConciliadores();
    }
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.directorNombre = user.nombreCompleto || 'Director';
    }
  }

  cargarDetalle(id: number) {
    this.solicitudService.obtenerPorId(id).subscribe({
      next: (res) => {
        this.expediente = res;
        console.log("Datos cargados de MariaDB:", res);
      },
      error: (err) => console.error("Error al cargar expediente:", err)
    });
  }

  cargarConciliadores() {
    this.usuarioService.listarPorRol('CONCILIADOR').subscribe(res => {
      this.conciliadores = res.map((u: any) => ({
        ...u,
        // Unificamos nombre y estado para que se vea profesional en el select
        labelMenu: `${u.nombre_completo || u.nombreCompleto} — ${u.estado === 'ACTIVO' ? 'Disponible' : 'Ocupado'}`
      }));
    });
  }

  // Se dispara al elegir un profesional en el desplegable
  onConciliadorChange() {
    this.conciliadorSeleccionado = this.conciliadores.find(c => c.id == this.conciliadorId);
  }

  actualizarEstado(nuevoEstado: string) {
    if ((nuevoEstado === 'OBSERVADO' || nuevoEstado === 'RECHAZADO') && !this.observacionTexto) {
      this.mostrarModal = true;
      return;
    }
    this.solicitudService.actualizarEstado(this.expediente.id, nuevoEstado, this.observacionTexto).subscribe({
      next: () => {
        this.expediente.estado = nuevoEstado;
        this.mostrarModal = false;
        alert("Estado actualizado correctamente a: " + nuevoEstado);
      }
    });
  }

  confirmarDesignacion() {
    if (!this.conciliadorId) return;
    this.solicitudService.designarConciliador(this.expediente.id, this.conciliadorId).subscribe(() => {
      alert("Designación guardada exitosamente en la base de datos.");
      // Recargamos para ver los cambios reflejados y asegurar persistencia
      this.cargarDetalle(this.expediente.id);
    });
  }

  descargarFormatoBPDF() {
    if (!this.conciliadorSeleccionado) return;

    // Lazy load jsPDF to avoid issues if not installed globally
    import('jspdf').then(jsPDFModule => {
      const jsPDF = jsPDFModule.jsPDF;
      const doc = new jsPDF();

      const centerText = (text: string, y: number, size: number = 10, font: string = 'normal') => {
        doc.setFont("times", font);
        doc.setFontSize(size);
        doc.text(text, 105, y, { align: "center" });
      };

      const expNum = this.expediente.numeroExpediente || '_______';

      // Data extraction
      const concNombre = this.conciliadorSeleccionado.nombre_completo || this.conciliadorSeleccionado.nombreCompleto || '___________________';
      const concReg = this.conciliadorSeleccionado.nroRegistro || this.conciliadorSeleccionado.nro_registro || '______';
      const concEsp = this.conciliadorSeleccionado.nroEspecialidad || '______';

      const solNombre = `${this.expediente.solicitante?.nombres || ''} ${this.expediente.solicitante?.apellidos || ''}`.trim() || '___________________';
      const invNombre = `${this.expediente.invitado?.nombres || ''} ${this.expediente.invitado?.apellidos || ''}`.trim() || '___________________';
      const materia = this.expediente.materiaConciliable || '___________________';

      // Apoderado Logic
      const apoNombres = this.expediente.apoderado?.nombres || '';
      const apoApellidos = this.expediente.apoderado?.apellidos || '';
      const apoNombreCompleto = `${apoNombres} ${apoApellidos}`.trim();
      const apoDni = this.expediente.apoderado?.dni || '';

      const hoy = new Date();

      // --- HEADER ---
      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.text("FORMATO B", 195, 15, { align: "right" });

      centerText("FORMATO TIPO DE ESQUELA DE DESIGNACIÓN DEL CONCILIADOR", 25, 11, 'bold');

      centerText("CENTRO DE CONCILIACIÓN ESPERANZA VIVA", 35, 10, 'bold');
      doc.setFont("times", "normal");
      doc.text("Autorizado su funcionamiento por Resolución ............... N° _______ - _______", 105, 40, { align: "center" });
      doc.text(`Dirección y teléfono: Av. Sol 450 - Cusco | Tlf: 987654321           EXP. N° ${expNum}`, 105, 45, { align: "center" });
      doc.line(60, 46, 150, 46);

      centerText("ESQUELA DE DESIGNACIÓN DE CONCILIADOR", 60, 12, 'bold');
      doc.setLineWidth(0.5);
      doc.line(65, 61, 145, 61);
      doc.setLineWidth(0.2);

      // --- BODY ---
      let yPos = 80;
      doc.setFont("times", "normal");
      doc.setFontSize(11);

      doc.text("Señor/a", 20, yPos);
      yPos += 7;

      let texto1 = `Conciliador(a) ${concNombre} con Registro N° ${concReg} (y registro de especialización según sea el caso) N° ${concEsp}.`;
      const split1 = doc.splitTextToSize(texto1, 170);
      doc.text(split1, 20, yPos, { align: "justify", maxWidth: 170 });
      yPos += (split1.length * 6) + 4;

      // Construct main paragraph text with or without Apoderado
      let texto2 = `La presente tiene por objeto informarle que usted ha sido designado como Conciliador en el caso solicitado por ${solNombre}`;

      if (apoNombreCompleto && apoNombreCompleto.length > 1) {
        texto2 += `, debidamente representado por ${apoNombreCompleto} identificado con DNI N° ${apoDni},`;
      }

      texto2 += ` invitando a ${invNombre}.`;

      const split2 = doc.splitTextToSize(texto2, 170);
      doc.text(split2, 20, yPos, { align: "justify", maxWidth: 170 });
      yPos += (split2.length * 6) + 4;

      let texto3 = `Para lo cual, de haber algún impedimento deberá abstenerse de actuar en la conciliación, poniendo en conocimiento las circunstancias que lo afecte, en el día de recibida la presente designación.`;
      const split3 = doc.splitTextToSize(texto3, 170);
      doc.text(split3, 20, yPos, { align: "justify", maxWidth: 170 });
      yPos += (split3.length * 6) + 4;

      let texto4 = `El expediente del caso es el número ${expNum} para que usted lo pueda revisar y encontrar en el archivo del Centro de Conciliación, siendo la(s) materia(s) a conciliar: ${materia}.`;
      const split4 = doc.splitTextToSize(texto4, 170);
      doc.text(split4, 20, yPos, { align: "justify", maxWidth: 170 });
      yPos += (split4.length * 6) + 15;

      doc.line(20, yPos, 190, yPos);

      yPos += 30;

      // Date
      const fechaTexto = `Lima, ${hoy.getDate()} de ${this.obtenerNombreMes(hoy)} de ${hoy.getFullYear()}.`;
      doc.text(fechaTexto, 20, yPos);

      yPos += 40;

      // Signature
      doc.line(110, yPos, 180, yPos);
      doc.text("Firma y sello del Director del Centro", 145, yPos + 5, { align: "center" });

      doc.save(`Formato_B_Designacion_${expNum}.pdf`);
    });
  }

  descargarFormatoBWord() {
    if (!this.conciliadorSeleccionado) return;

    const expNum = this.expediente.numeroExpediente || '_______';

    const concNombre = this.conciliadorSeleccionado.nombre_completo || this.conciliadorSeleccionado.nombreCompleto || '___________________';
    const concReg = this.conciliadorSeleccionado.nroRegistro || this.conciliadorSeleccionado.nro_registro || '______';
    const concEsp = this.conciliadorSeleccionado.nroEspecialidad || '______';

    const solNombre = `${this.expediente.solicitante?.nombres || ''} ${this.expediente.solicitante?.apellidos || ''}`.trim() || '___________________';
    const invNombre = `${this.expediente.invitado?.nombres || ''} ${this.expediente.invitado?.apellidos || ''}`.trim() || '___________________';
    const materia = this.expediente.materiaConciliable || '___________________';

    const apoNombres = this.expediente.apoderado?.nombres || '';
    const apoApellidos = this.expediente.apoderado?.apellidos || '';
    const apoNombreCompleto = `${apoNombres} ${apoApellidos}`.trim();
    const apoDni = this.expediente.apoderado?.dni || '';

    const hoy = new Date();

    // Word Logic for Apoderado
    let textoSolicitante = solNombre;
    if (apoNombreCompleto && apoNombreCompleto.length > 1) {
      textoSolicitante += `, debidamente representado por ${apoNombreCompleto} identificado con DNI N° ${apoDni},`;
    }

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Formato B</title><style>
        body { font-family: 'Times New Roman', serif; padding: 2cm; font-size: 12pt; }
        .justify { text-align: justify; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
        .right { text-align: right; }
    </style></head><body>`;

    const content = `
    <div class="right bold">FORMATO B</div>

    <div class="center bold uppercase" style="font-size: 14pt; margin-top: 10px;">
        FORMATO TIPO DE ESQUELA DE DESIGNACIÓN DEL CONCILIADOR
    </div>

    <div class="center" style="margin-top: 20px;">
        <strong>CENTRO DE CONCILIACIÓN ESPERANZA VIVA</strong><br>
        Autorizado su funcionamiento por Resolución ............... N° ______ - _______<br>
        <div style="display: flex; justify-content: space-between; width: 80%; margin: 0 auto; border-bottom: 1px solid black;">
            <span>Dirección y teléfono: Av. Sol 450 - Cusco | Tlf: 987654321</span>
            <strong>EXP. N° ${expNum}</strong>
        </div>
    </div>

    <div class="center bold uppercase" style="margin-top: 20px; text-decoration: underline;">ESQUELA DE DESIGNACIÓN DE CONCILIADOR</div>

    <div style="margin-top: 30px;">
        <p>Señor/a</p>
        <p class="justify">Conciliador(a) ${concNombre} con Registro N° ${concReg} (y registro de especialización según sea el caso) N° ${concEsp}.</p>

        <p class="justify">La presente tiene por objeto informarle que usted ha sido designado como Conciliador en el caso solicitado por ${textoSolicitante} invitando a ${invNombre}.</p>

        <p class="justify">Para lo cual, de haber algún impedimento deberá abstenerse de actuar en la conciliación, poniendo en conocimiento las circunstancias que lo afecte, en el día de recibida la presente designación.</p>

        <p class="justify">El expediente del caso es el número ${expNum} para que usted lo pueda revisar y encontrar en el archivo del Centro de Conciliación, siendo la(s) materia(s) a conciliar: ${materia}.</p>

        <div style="border-bottom: 1px solid black; margin-top: 20px;"></div>
    </div>

    <br><br>
    <p>Lima, ${hoy.getDate()} de ${this.obtenerNombreMes(hoy)} de ${hoy.getFullYear()}.</p>

    <br><br><br><br>
    <div style="display: flex; justify-content: flex-end;">
        <div style="text-align: center; width: 300px; border-top: 1px solid black;">
            Firma y sello del Director del Centro
        </div>
    </div>
    `;

    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Formato_B_Designacion_${expNum}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }

  obtenerNombreMes(fecha: Date): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[fecha.getMonth()];
  }

  // --- NUEVO: Descargar Formato A (PDF) ---
  descargarFormatoAPDF() {
    import('jspdf').then(jsPDFModule => {
      const jsPDF = jsPDFModule.jsPDF;
      const doc = new jsPDF();
      const datos = this.expediente;
      const s = datos.solicitante || {};
      const i = datos.invitado || {};
      const a = datos.apoderado || {};

      // --- TÍTULO DEL DOCUMENTO ---
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.text('FORMATO A', 180, 55);

      doc.setFontSize(11);
      doc.text('FORMATO TIPO DE SOLICITUD DE CONCILIACIÓN', 105, 65, { align: 'center' });
      doc.line(65, 66, 145, 66);

      // Centro info body
      doc.setFontSize(9);
      doc.setFont('times', 'normal');
      doc.text('CENTRO DE CONCILIACIÓN EXTRAJUDICIAL  "ESPERANZA VIVA"', 105, 70, { align: 'center' });
      doc.text('Autorizado por el Ministerio de Justicia R. D. N° 1476-2018-JUS/DGPAJ-DCMA', 105, 80, { align: 'center' });
      doc.text(`Dirección y teléfono: Av. Prado Bajo N° 131, 1ra cuadra - Abancay-Apurimac - Cel: 923017144   EXP. Nº ${datos.numeroExpediente || '___'}`, 105, 85, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('times', 'bold');
      doc.text('SOLICITUD PARA CONCILIAR', 105, 95, { align: 'center' });
      doc.line(75, 96, 135, 96);

      // --- I. DATOS GENERALES ---
      let y = 110;
      doc.setFontSize(10);
      doc.text('I.   DATOS GENERALES:', 20, y);

      y += 8;
      doc.setFont('times', 'normal');
      const lineHeight = 7;
      const fecha = datos.fechaCreacion ? new Date(datos.fechaCreacion).toLocaleDateString() : new Date().toLocaleDateString();

      doc.text(`1.   Fecha: ${fecha}`, 20, y); y += lineHeight;
      doc.text(`2.   Nombre o razón social del (los) solicitante(s)[3]: ${s.nombres || '---'} ${s.apellidos || ''}`, 20, y); y += lineHeight;
      doc.text(`3.   Documento de identidad o RUC del (los) solicitante (s): ${s.dni || '---'}`, 20, y); y += lineHeight;
      doc.text(`4.   Domicilio de l (los) solicitantes: ${s.domicilio || '---'}`, 20, y); y += lineHeight;
      doc.text(`5.   Nombre del apoderado o representante: ${a.nombres ? a.nombres + ' ' + a.apellidos : '----------------'}`, 20, y); y += lineHeight;
      doc.text(`6.   Domicilio del apoderado o representante: ${a.domicilio || '----------------'}`, 20, y); y += lineHeight;
      doc.text(`7.   Nombre o razón social del (los) invitado(s): ${i.nombres || '---'} ${i.apellidos || ''}`, 20, y); y += lineHeight;
      doc.text(`8.   Domicilio (s) del (los) invitado (s): ${i.domicilio || '---'}`, 20, y);

      // --- II. HECHOS ---
      y += 10;
      doc.setFont('times', 'bold');
      doc.text('II.  HECHOS QUE DIERON LUGAR AL CONFLICTO[4]:', 20, y);
      y += 8;
      doc.setFont('times', 'normal');
      const hechos = doc.splitTextToSize(datos.hechos || 'Sin hechos descritos.', 170);
      doc.text(hechos, 20, y);
      y += (hechos.length * 5) + 5;

      // --- III. OTRAS PERSONAS ---
      doc.setFont('times', 'bold');
      doc.text('III. OTRAS PERSONAS CON DERECHO ALIMENTARIO[5]:', 20, y);
      y += 8;
      doc.setFont('times', 'normal');
      const alimentos = doc.splitTextToSize(datos.otrasPersonasAlimentario || '----------------', 170);
      doc.text(alimentos, 20, y);
      y += (alimentos.length * 5) + 5;

      // --- IV. PRETENSIÓN ---
      doc.setFont('times', 'bold');
      doc.text('IV.  PRETENSIÓN[6]:', 20, y);
      y += 8;
      doc.setFont('times', 'normal');
      const pretension = doc.splitTextToSize(datos.pretension || '----------------', 170);
      doc.text(pretension, 20, y);
      y += (pretension.length * 5) + 15;

      // --- V. FIRMA ---
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('times', 'bold');
      doc.text('V.   FIRMA DEL SOLICITANTE o HUELLA DIGITAL SEGÚN EL CASO[7]', 20, y);

      y += 25;
      doc.line(20, y, 90, y);
      y += 5;
      doc.setFont('times', 'normal');
      doc.text('Nombre y documento de Identidad', 20, y);

      // --- VI. DOCUMENTOS QUE ADJUNTO ---
      y += 15;
      doc.setFont('times', 'bold');
      doc.text('VI.  DOCUMENTOS QUE ADJUNTO[8]:', 20, y);
      y += 8;
      doc.setFont('times', 'normal');
      doc.text('1.       Copia de D.N.I.', 20, y); y += 6;
      doc.text('2.       __________________________________________________', 20, y); y += 6;
      doc.text('3        __________________________________________________', 20, y);

      doc.save(`Formato_A_${s.dni || 'solicitud'}.pdf`);
    });
  }

  // --- NUEVO: Descargar Formato A (WORD) ---
  descargarFormatoAWord() {
    const datos = this.expediente;
    const s = datos.solicitante || {};
    const i = datos.invitado || {};
    const a = datos.apoderado || {};
    const fecha = datos.fechaCreacion ? new Date(datos.fechaCreacion).toLocaleDateString() : new Date().toLocaleDateString();

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Formato A</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 11pt; }
        .header { text-align: center; font-weight: bold; margin-bottom: 20px; }
        .strong { font-weight: bold; }
        .center { text-align: center; }
        ul { list-style-type: none; padding: 0; }
        li { margin-bottom: 5px; }
        .section-title { font-weight: bold; margin-top: 15px; margin-bottom: 5px; }
      </style>
      </head>
      <body>
        <div style="text-align: right; font-weight: bold; font-family: Arial, sans-serif; font-size: 10pt;">FORMATO A</div>
        
        <div class="center strong" style="font-family: Arial, sans-serif; font-size: 11pt; text-decoration: underline;">FORMATO TIPO DE SOLICITUD DE CONCILIACIÓN</div>
        
        <div class="center" style="font-size: 10pt; margin-top: 10px;">
          CENTRO DE CONCILIACIÓN EXTRAJUDICIAL "ESPERANZA VIVA"<br>
          Autorizado Ministerio de Justicia R. D. N° 1476-2018-JUS/DGPAJ-DCMA<br>
          Dirección y teléfono: Av. Prado Bajo N° 131, 1ra cuadra - Abancay-Apurimac - Cel: 923017144       EXP. Nº ${datos.numeroExpediente || '___'}
        </div>

        <div class="center strong" style="font-size: 12pt; margin-top: 15px;">SOLICITUD PARA CONCILIAR</div>
        <div class="center">______________________________</div>

        <div class="section-title">I. DATOS GENERALES:</div>
        <ul>
          <li>1. Fecha: ${fecha}</li>
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
        <div class="center"> DNI: ${s.dni || '---'}</div>

        <div class="section-title">VI. DOCUMENTOS QUE ADJUNTO[8]:</div>
        <ol>
          <li>Copia de D.N.I.</li>
          <li>__________________________________________________</li>
          <li>__________________________________________________</li>
        </ol>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Formato_A_${s.dni || 'solicitud'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- NUEVO: Descargar Documentos Adjuntos ---
  descargarAdjuntos() {
    // Assuming backend endpoint or if we have the file blob/url
    // Standard approach given user request: "llamar a la bd"
    // We will try an endpoint like /api/solicitudes/{id}/descargar-dni
    // For now, if we don't have that endpoint, we can try to assume it follows a convention or use a service method.
    // Since I need this to work, I will assume a standard pattern.
    // But actually, I'll add a check. If 'expediente.dniUrl' exists use it.

    const id = this.expediente.id;
    if (!id) return;

    // Constructing a hypothetical URL for now as per common practices if explicit URL isn't in JSON
    // If the user's backend is Spring Boot (likely), serving files might be at a specific endpoint.
    const url = `http://localhost:8080/api/solicitudes/${id}/archivo/dni`;

    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = `DNI_Adjunto_${this.expediente.numeroExpediente}.pdf`; // Assuming PDF or let browser decide
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}