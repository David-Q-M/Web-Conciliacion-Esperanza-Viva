import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { jsPDF } from 'jspdf';
import { UsuarioService } from '../../../../services/usuario.service';
import { ActaService } from '../../../../services/acta.service';

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
  conciliadorDni: string = '';
  conciliadorRegistro: string = '';
  audiencia: any = null;

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
    private usuarioService: UsuarioService,
    private actaService: ActaService
  ) { }

  ngOnInit(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.conciliadorNombre = user.nombreCompleto;
      this.conciliadorDni = user.dni || '____________';
      this.conciliadorRegistro = user.nroRegistro || '____________'; // Se asume que en BD es nro_registro o nroRegistro
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
    this.http.get<any>(`${environment.apiUrl}/audiencias/${this.audienciaId}`, { headers }).subscribe({
      next: (data) => {
        this.audiencia = data;
        this.datosActa.hechos = this.audiencia.solicitud?.hechos || '';
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
    let titulo = 'CLÁUSULA ADICIONAL';
    if (currentCount - 2 < orden.length) {
      titulo = orden[currentCount - 2];
    }
    this.acuerdos.push({ titulo: titulo, contenido: '' });
  }

  eliminarClausula(index: number) {
    if (index > 1) {
      this.acuerdos.splice(index, 1);
    }
  }

  // Helper to generate the PDF object without saving immediately
  generarDocPDF(): jsPDF {
    const doc = new jsPDF();
    const sol = this.audiencia.solicitud?.solicitante;
    const inv = this.audiencia.solicitud?.invitado;
    const expNum = this.audiencia.solicitud?.numeroExpediente || '_______';

    // Same PDF generation logic...
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

    doc.setFont("times", "normal");
    doc.setFontSize(11);
    let yPos = 80;
    const hoy = new Date();
    const textoIntro = `En la ciudad de Lima, distrito de _______________ siendo las ____ horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()}, ante mi ${this.conciliadorNombre}, identificado con DNI ${this.conciliadorDni} en mi calidad de Conciliador Extrajudicial debidamente autorizado por el Ministerio de Justicia con Registro N° ${this.conciliadorRegistro}...`;
    const splitIntro = doc.splitTextToSize(textoIntro, 170);
    doc.text(splitIntro, 20, yPos);
    yPos += (splitIntro.length * 5) + 5;

    const textoIniciada = `Iniciada la audiencia de Conciliación se procedió a informar a las partes sobre el procedimiento conciliatorio...`;
    const splitIniciada = doc.splitTextToSize(textoIniciada, 170);
    doc.text(splitIniciada, 20, yPos);
    yPos += (splitIniciada.length * 5) + 8;

    doc.setFont("times", "bold");
    doc.text("HECHOS EXPUESTOS EN LA SOLICITUD:", 20, yPos);
    yPos += 8;
    doc.setFont("times", "normal");
    const splitHechos = doc.splitTextToSize(this.datosActa.hechos || "(Sin hechos registrados)", 170);
    doc.text(splitHechos, 20, yPos);
    yPos += (splitHechos.length * 5) + 8;

    doc.setFont("times", "bold");
    doc.text("DESCRIPCIÓN DE LA(S) CONTROVERSIA(S):", 20, yPos);
    yPos += 8;
    doc.setFont("times", "normal");
    const splitContro = doc.splitTextToSize(this.datosActa.controversia || "(Sin controversia registrada)", 170);
    doc.text(splitContro, 20, yPos);
    yPos += (splitContro.length * 5) + 15;

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

    if (yPos > 220) { doc.addPage(); yPos = 30; }
    doc.setFont("times", "bold");
    doc.text("VERIFICACIÓN DE LOS ACUERDOS ADOPTADOS:", 20, yPos);
    yPos += 8;
    doc.setFont("times", "normal");
    const abogado = this.abogados.find(a => a.nombre === this.datosActa.abogadoVerificador);
    const textoVerif = `En este Acto ${abogado?.nombre || '___________________'}...`;
    doc.text(doc.splitTextToSize(textoVerif, 170), 20, yPos);
    yPos += 25;

    const textoCierre = `Leído el texto, los conciliantes manifiestan su conformidad... en señal de lo cual firman la presente Acta N° ...........`;
    doc.text(doc.splitTextToSize(textoCierre, 170), 20, yPos);

    // Signatures would be here...

    return doc;
  }


  finalizarYDescargar() {
    const doc = this.generarDocPDF();
    const pdfBlob = doc.output('blob');

    const numeroActa = `ACTA-${this.audiencia.id}-${new Date().getFullYear()}`;

    // 1. Upload the Generated Acta
    this.actaService.subirActa(this.audienciaId, 'ACUERDO_TOTAL', numeroActa, pdfBlob).subscribe({
      next: (res) => {
        console.log("Acta subida con éxito:", res);

        // 2. Update Audience Status and Details
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        const detalle = {
          ...this.datosActa,
          acuerdos: this.acuerdos,
          actaUrl: res.archivoUrl // Save the URL reference in the JSON blob too if needed
        };

        const payload = {
          resultadoTipo: 'Acuerdo Total',
          resultadoDetalle: JSON.stringify(detalle)
        };

        this.http.put(`${environment.apiUrl}/audiencias/${this.audienciaId}/resultado`, payload, { headers }).subscribe({
          next: () => {
            // 3. Download for user and navigate
            doc.save(`Formato_G_AcuerdoTotal_${numeroActa}.pdf`);
            alert("✅ Acta guardada y proceso finalizado correctamente.");
            this.router.navigate(['/conciliador/mis-casos']);
          },
          error: (err) => alert("Error al actualizar estado de audiencia: " + err.message)
        });
      },
      error: (err) => alert("Error al subir el archivo del Acta: " + err.message)
    });
  }

  descargarPDF() {
    this.generarDocPDF().save(`Formato_G_AcuerdoTotal_${this.audiencia.solicitud?.numeroExpediente}.pdf`);
  }

  descargarWord() {
    // Keep existing Word logic
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
                  En la ciudad de Lima, distrito de _______________ siendo las ____ horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()}, ante mi ${this.conciliadorNombre}, identificado con DNI ${this.conciliadorDni} en mi calidad de Conciliador Extrajudicial con Registro N° ${this.conciliadorRegistro}...
                </p>

                <strong>ACUERDO CONCILIATORIO TOTAL:</strong>
                ${acuerdosHtml}

                <br>
                <strong>VERIFICACIÓN DE LOS ACUERDOS ADOPTADOS:</strong>
                <p style="text-align: justify;">
                En este Acto <strong>${abogado?.nombre || '______________'}</strong>...
                </p>
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
