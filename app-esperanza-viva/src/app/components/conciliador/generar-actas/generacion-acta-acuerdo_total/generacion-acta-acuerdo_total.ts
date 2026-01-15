import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { jsPDF } from 'jspdf';
import { UsuarioService } from '../../../../services/usuario.service';

interface Clause {
  titulo: string;
  contenido: string;
}

@Component({
  selector: 'app-generacion-acta-acuerdo-total',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './generacion-acta-acuerdo_total.html',
  styleUrls: ['./generacion-acta-acuerdo_total.css']
})
export class GeneracionActaAcuerdoTotal implements OnInit {
  audienciaId: any;
  conciliadorNombre: string = '';
  audiencia: any = null;

  // Form Data
  datosActa = {
    hechos: '',
    controversia: '',
    abogadoVerificador: '',
    lugarAudiencia: 'Av. Sol 450 - Cusco',
    solicitanteDireccion: '',
    invitadoDireccion: '',
  };

  acuerdos: Clause[] = [
    { titulo: 'PRIMERO', contenido: '' },
    { titulo: 'SEGUNDO', contenido: '' }
  ];

  abogados: any[] = [];



  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.conciliadorNombre = JSON.parse(userJson).nombreCompleto;
    }
    this.audienciaId = this.route.snapshot.paramMap.get('id');

    if (this.audienciaId) {
      this.cargarDatos();
    }
    this.cargarAbogados();
  }

  cargarAbogados() {
    this.usuarioService.listarPorRol('ABOGADO').subscribe({
      next: (data) => {
        // Map backend data to simple objects for the UI/Logic
        this.abogados = data.map(u => ({
          nombre: u.nombreCompleto,
          registro: u.nroColegiatura || 'Sin Regist.'
        }));
      },
      error: (err) => console.error("Error al cargar abogados:", err)
    });
  }

  cargarDatos() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any>(`http://localhost:8080/api/audiencias/${this.audienciaId}`, { headers }).subscribe({
      next: (data) => {
        this.audiencia = data;

        // Pre-fill
        this.datosActa.hechos = this.audiencia.solicitud?.hechos || '';
        // Try to guess controversy or leave blank
        this.datosActa.controversia = this.audiencia.solicitud?.controversia || '';

        this.datosActa.solicitanteDireccion = this.audiencia.solicitud?.solicitante?.domicilio || '';
        this.datosActa.invitadoDireccion = this.audiencia.solicitud?.invitado?.domicilio || '';
      },
      error: (err) => console.error("Error al cargar audiencia:", err)
    });
  }

  agregarClausula() {
    const orden = ['TERCERO', 'CUARTO', 'QUINTO', 'SEXTO', 'SEPTIMO', 'OCTAVO', 'NOVENO', 'DECIMO'];
    const currentCount = this.acuerdos.length;
    // Logic to get next title
    let titulo = 'CLÁUSULA ADICIONAL';
    if (currentCount - 2 < orden.length) {
      titulo = orden[currentCount - 2];
    }

    this.acuerdos.push({ titulo: titulo, contenido: '' });
  }

  eliminarClausula(index: number) {
    if (index > 1) { // Keep at least 2
      this.acuerdos.splice(index, 1);
    }
  }

  finalizarYDescargar() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Save agreements as JSON string in 'resultadoDetalle' for now
    const detalle = {
      ...this.datosActa,
      acuerdos: this.acuerdos
    };

    const payload = {
      resultadoTipo: 'Acuerdo Total',
      resultadoDetalle: JSON.stringify(detalle)
    };

    this.http.put(`http://localhost:8080/api/audiencias/${this.audienciaId}/resultado`, payload, { headers }).subscribe({
      next: () => {
        alert("Proceso Finalizado. Acta Guardada.");
        this.router.navigate(['/conciliador/mis-casos']);
      },
      error: (err) => alert("Error al finalizar: " + err.message)
    });
  }

  descargarPDF() {
    const doc = new jsPDF();
    const sol = this.audiencia.solicitud?.solicitante;
    const inv = this.audiencia.solicitud?.invitado;
    const expNum = this.audiencia.solicitud?.numeroExpediente || '_______';

    // --- HEADER ---
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("FORMATO G", 180, 15);

    doc.setFontSize(11);
    doc.text("FORMATO TIPO DE ACTA DE CONCILIACIÓN CON ACUERDO TOTAL", 105, 25, { align: "center" });
    doc.text("(PERSONAS NATURALES)", 105, 30, { align: "center" });

    doc.text(`CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"`, 105, 40, { align: "center" });
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.text("Autorizado su funcionamiento por Resolución ............... N° _______ - _______", 105, 45, { align: "center" });
    doc.text(`Dirección y teléfono: ${this.datosActa.lugarAudiencia} | Tlf: 987654321           EXP. N° ${expNum}`, 105, 50, { align: "center" });
    doc.line(70, 51, 140, 51);

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text("ACTA DE CONCILIACIÓN N° .........", 105, 65, { align: "center" });

    // --- BODY ---
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    let yPos = 80;

    const hoy = new Date();
    const textoIntro = `En la ciudad de Lima, distrito de _______________ siendo las ____ horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()}, ante mi ${this.conciliadorNombre}, identificado con DNI ___________ en mi calidad de Conciliador Extrajudicial debidamente autorizado por el Ministerio de Justicia con Registro N° ___________, se presentaron con el objeto que les asista en la solución de su conflicto, la parte solicitante: ${sol?.nombres} ${sol?.apellidos}, identificado con DNI ${sol?.dni || '_________'}, con domicilio en ${this.datosActa.solicitanteDireccion || '______________'}, y la parte invitada: ${inv?.nombres} ${inv?.apellidos}, identificado con DNI ${inv?.dni || '_________'}, con domicilio en ${this.datosActa.invitadoDireccion || '______________'}, con el objeto de que les asista en la solución de su conflicto.`;

    const splitIntro = doc.splitTextToSize(textoIntro, 170);
    doc.text(splitIntro, 20, yPos);
    yPos += (splitIntro.length * 5) + 5;

    // INICIADA LA AUDIENCIA (REQUIRED PARAGRAPH)
    const textoIniciada = `Iniciada la audiencia de Conciliación se procedió a informar a las partes sobre el procedimiento conciliatorio, su naturaleza, características fines y ventajas. Asimismo se señaló a las partes las normas de conducta que deberán observar.`;
    const splitIniciada = doc.splitTextToSize(textoIniciada, 170);
    doc.text(splitIniciada, 20, yPos);
    yPos += (splitIniciada.length * 5) + 8;

    // HECHOS
    doc.setFont("times", "bold");
    doc.text("HECHOS EXPUESTOS EN LA SOLICITUD:", 20, yPos);
    yPos += 8;
    doc.setFont("times", "normal");
    const splitHechos = doc.splitTextToSize(this.datosActa.hechos || "(Sin hechos registrados)", 170);
    doc.text(splitHechos, 20, yPos);
    yPos += (splitHechos.length * 5) + 8;

    // CONTROVERSIA
    doc.setFont("times", "bold");
    doc.text("DESCRIPCIÓN DE LA(S) CONTROVERSIA(S):", 20, yPos);
    yPos += 8;
    doc.setFont("times", "normal");
    const splitContro = doc.splitTextToSize(this.datosActa.controversia || "(Sin controversia registrada)", 170);
    doc.text(splitContro, 20, yPos);
    yPos += (splitContro.length * 5) + 15;

    // ACUERDOS
    doc.setFont("times", "bold");
    doc.text("ACUERDO CONCILIATORIO TOTAL:", 20, yPos);
    yPos += 8;

    doc.setFont("times", "normal");
    const introAcuerdo = "Considerando los hechos señalados y las propuestas formuladas por las partes, se conviene en celebrar un Acuerdo en los siguientes términos:";
    doc.text(doc.splitTextToSize(introAcuerdo, 170), 20, yPos);
    yPos += 15;

    this.acuerdos.forEach(acuerdo => {
      if (yPos > 240) { doc.addPage(); yPos = 30; }

      doc.setFont("times", "bold");
      doc.text(`${acuerdo.titulo}.-`, 20, yPos);
      yPos += 6;

      doc.setFont("times", "normal");
      const splitContent = doc.splitTextToSize(acuerdo.contenido || "___________________", 170);
      doc.text(splitContent, 20, yPos);
      yPos += (splitContent.length * 5) + 8;
    });

    // VERIFICACION LEGAL
    if (yPos > 220) { doc.addPage(); yPos = 30; }
    doc.setFont("times", "bold");
    doc.text("VERIFICACIÓN DE LOS ACUERDOS ADOPTADOS:", 20, yPos);
    yPos += 8;

    doc.setFont("times", "normal");
    const abogado = this.abogados.find(a => a.nombre === this.datosActa.abogadoVerificador);
    const textoVerif = `En este Acto ${abogado?.nombre || '___________________'} con Registro del C.A ${abogado?.registro || '____'} abogado de este Centro de Conciliación procedió a verificar la legalidad de los Acuerdos adoptados por las partes conciliantes...`;

    const splitVerif = doc.splitTextToSize(textoVerif, 170);
    doc.text(splitVerif, 20, yPos);
    yPos += (splitVerif.length * 5) + 10;

    const textoCierre = `Leído el texto, los conciliantes manifiestan su conformidad con el mismo... en señal de lo cual firman la presente Acta N° ...........`;
    doc.text(doc.splitTextToSize(textoCierre, 170), 20, yPos);
    yPos += 40;

    // SIGNATURES TABLE
    if (yPos > 240) { doc.addPage(); yPos = 40; }

    doc.setFontSize(10);
    // Row 1
    doc.line(20, yPos, 80, yPos);
    doc.text("Firma y huella del Conciliador", 50, yPos + 5, { align: "center" });

    doc.line(110, yPos, 170, yPos);
    doc.text("Nombre, firma y huella del solicitante", 140, yPos + 5, { align: "center" });

    yPos += 30;
    // Row 2
    doc.line(20, yPos, 80, yPos);
    doc.text("Firma y huella del Abogado", 50, yPos + 5, { align: "center" });

    doc.line(110, yPos, 170, yPos);
    doc.text("Nombre, firma y huella del invitado", 140, yPos + 5, { align: "center" });


    doc.save(`Formato_G_AcuerdoTotal_${expNum}.pdf`);
  }

  descargarWord() {
    const expNum = this.audiencia.solicitud?.numeroExpediente || '_______';
    const hoy = new Date();
    const sol = this.audiencia.solicitud?.solicitante;
    const inv = this.audiencia.solicitud?.invitado;

    let acuerdosHtml = '';
    this.acuerdos.forEach(acuerdo => {
      acuerdosHtml += `
                <p><strong>${acuerdo.titulo}.-</strong></p>
                <p style="text-align: justify;">${acuerdo.contenido || '__________________________________________'}</p>
                <br>
            `;
    });

    const abogado = this.abogados.find(a => a.nombre === this.datosActa.abogadoVerificador);


    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Formato G</title></head><body>";

    const content = `
            <div style="font-family: 'Times New Roman', serif; padding: 20px;">
                <p style="text-align: right; font-weight: bold;">FORMATO G</p>
                <h3 style="text-align: center; text-decoration: underline;">FORMATO TIPO DE ACTA DE CONCILIACIÓN CON ACUERDO TOTAL<br>(PERSONAS NATURALES)</h3>
                
                <p style="text-align: center;"><strong>CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"</strong><br>
                Autorizado su funcionamiento por Resolución ............... N° ______ - _______<br>
                Dirección y teléfono: ${this.datosActa.lugarAudiencia} | Tlf: 987654321 &nbsp;&nbsp;&nbsp; <strong>EXP. N° ${expNum}</strong></p>
                
                <h3 style="text-align: center; text-decoration: underline; margin-top: 20px;">ACTA DE CONCILIACIÓN N° .........</h3>
                
                <p style="text-align: justify;">
                  En la ciudad de Lima, distrito de _______________ siendo las ____ horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()}, ante mi ${this.conciliadorNombre}, identificado con DNI ___________ en mi calidad de Conciliador Extrajudicial debidamente autorizado por el Ministerio de Justicia con Registro N° ___________, se presentaron con el objeto que les asista en la solución de su conflicto, la parte solicitante: ${sol?.nombres} ${sol?.apellidos}, identificado con DNI ${sol?.dni || '_________'}, con domicilio en ${this.datosActa.solicitanteDireccion || '______________'}, y la parte invitada: ${inv?.nombres} ${inv?.apellidos}, identificado con DNI ${inv?.dni || '_________'}, con domicilio en ${this.datosActa.invitadoDireccion || '______________'}, con el objeto de que les asista en la solución de su conflicto.
                </p>

                <p style="text-align: justify;">Iniciada la audiencia de Conciliación se procedió a informar a las partes sobre el procedimiento conciliatorio...</p>

                <strong>HECHOS EXPUESTOS EN LA SOLICITUD:</strong>
                <p style="text-align: justify;">${this.datosActa.hechos || '__________________________________________'}</p>
                <p>(De adjuntarse la solicitud está formará parte integrante del acta.)</p>

                <strong>DESCRIPCIÓN DE LA(S) CONTROVERSIA(S):</strong>
                <p style="text-align: justify;">${this.datosActa.controversia || '__________________________________________'}</p>

                <br>
                <strong>ACUERDO CONCILIATORIO TOTAL:</strong>
                <p style="text-align: justify;">Considerando los hechos señalados y las propuestas formuladas por las partes...:</p>
                
                ${acuerdosHtml}

                <br>
                <strong>VERIFICACIÓN DE LOS ACUERDOS ADOPTADOS:</strong>
                <p style="text-align: justify;">
                En este Acto <strong>${abogado?.nombre || '______________'}</strong> con Registro del C.A <strong>${abogado?.registro || '____'}</strong> abogado de este Centro de Conciliación procedió a verificar la legalidad de los Acuerdos adoptados por las partes conciliantes...
                </p>

                <br><br><br>
                <table style="width: 100%; text-align: center;">
                    <tr>
                         <td style="width: 40%; border-top: 1px solid black;">Firma y huella del Conciliador</td>
                         <td style="width: 10%;"></td>
                         <td style="width: 40%; border-top: 1px solid black;">Nombre, firma y huella del solicitante</td>
                    </tr>
                    <tr><td colspan="3"><br><br></td></tr>
                    <tr>
                         <td style="width: 40%; border-top: 1px solid black;">Firma y huella del Abogado</td>
                         <td style="width: 10%;"></td>
                         <td style="width: 40%; border-top: 1px solid black;">Nombre, firma y huella del invitado</td>
                    </tr>
                </table>
            </div>
        `;

    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Formato_G_AcuerdoTotal_${expNum}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }

  obtenerNombreMes(fecha: Date): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[fecha.getMonth()];
  }
}