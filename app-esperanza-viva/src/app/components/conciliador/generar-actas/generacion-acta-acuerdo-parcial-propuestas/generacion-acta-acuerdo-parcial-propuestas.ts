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
    selector: 'app-generacion-acta-acuerdo-parcial-propuestas',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
    templateUrl: './generacion-acta-acuerdo-parcial-propuestas.html',
    styleUrls: ['./generacion-acta-acuerdo-parcial-propuestas.css']
})
export class GeneracionActaAcuerdoParcialPropuestas implements OnInit {
    audienciaId: any;
    conciliadorNombre: string = '';
    audiencia: any = null;

    // Form Data
    datosActa = {
        hechos: '',
        controversia: '',
        puntosSinAcuerdo: '',
        abogadoVerificador: '',
        lugarAudiencia: 'Av. Sol 450 - Cusco',
        solicitanteDireccion: '',
        invitadoDireccion: '',
        // Conciliator Data (Editable)
        conciliadorDni: '',
        conciliadorRegistro: '',
        conciliadorEspecialidad: '',
        // Posiciones
        posicionSolicitante: '',
        posicionInvitado: '',
        // Propuestas
        propuestaSolicitante: '',
        propuestaInvitado: ''
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
            this.conciliadorNombre = user.nombreCompleto || '';
            this.datosActa.conciliadorDni = user.dni || '';
            this.datosActa.conciliadorRegistro = user.nroRegistro || '';
            this.datosActa.conciliadorEspecialidad = user.nroEspecialidad || '';
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
                this.datosActa.controversia = this.audiencia.solicitud?.materiaConciliable || '';
                const sol = this.audiencia.solicitud?.solicitante;
                const inv = this.audiencia.solicitud?.invitado;
                this.datosActa.solicitanteDireccion = sol?.domicilio || '';
                this.datosActa.invitadoDireccion = inv?.domicilio || '';
            },
            error: (err) => console.error("Error al cargar audiencia:", err)
        });
    }

    agregarClausula() {
        const orden = ['TERCERO', 'CUARTO', 'QUINTO', 'SEXTO', 'SEPTIMO', 'OCTAVO', 'NOVENO', 'DECIMO'];
        const currentCount = this.acuerdos.length;
        let titulo = 'CLÁUSULA ADICIONAL';
        if (currentCount - 2 < orden.length) titulo = orden[currentCount - 2];
        this.acuerdos.push({ titulo: titulo, contenido: '' });
    }

    eliminarClausula(index: number) {
        if (index > 1) this.acuerdos.splice(index, 1);
    }

    // Helper to generate doc
    generarDocPDF(): jsPDF {
        const doc = new jsPDF();
        const sol = this.audiencia.solicitud?.solicitante;
        const inv = this.audiencia.solicitud?.invitado;
        const expNum = this.audiencia.solicitud?.numeroExpediente || '_______';

        // Helper for centered text
        const centerText = (text: string, y: number, size: number = 10, font: string = 'normal') => {
            doc.setFont("times", font);
            doc.setFontSize(size);
            doc.text(text, 105, y, { align: "center" });
        };

        // --- HEADER ---
        doc.setFont("times", "bold");
        doc.setFontSize(10);
        doc.text("FORMATO I", 190, 15, { align: "right" });

        centerText("FORMATO TIPO DE ACTA DE CONCILIACIÓN CON ACUERDO PARCIAL CON", 25, 12, 'bold');
        centerText("POSICIONES Y/O PROPUESTAS DE LAS PARTES CONCILIANTES", 30, 12, 'bold');
        centerText("(PERSONAS NATURALES)", 35, 12, 'bold');

        centerText(`CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"`, 45, 11, 'bold');
        centerText("Autorizado su funcionamiento por Resolución ............... N° _______ - _______", 50, 10, 'normal');

        doc.setFont("times", "normal");
        doc.text(`Dirección y teléfono: ${this.datosActa.lugarAudiencia} | Tlf: 987654321`, 50, 56);
        doc.setFont("times", "bold");
        doc.text(`EXP. N° ${expNum}`, 160, 56);

        // Underline for header info
        doc.line(50, 57, 130, 57);

        centerText("ACTA DE CONCILIACIÓN N° .........", 70, 14, 'bold');
        doc.line(75, 71, 135, 71); // Underline title

        // --- BODY ---
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        let yPos = 85;
        const hoy = new Date();
        const concDni = this.datosActa.conciliadorDni || '________________';
        const concReg = this.datosActa.conciliadorRegistro || '________________';

        // Introductory Paragraph
        const textoIntro = `En la ciudad de Lima, distrito de _______________ siendo las ____ horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()}, ante mi ${this.conciliadorNombre}, identificado con Documento Nacional de Identidad N° ${concDni} en mi calidad de Conciliador Extrajudicial debidamente autorizado por el Ministerio de Justicia con Registro N° ${concReg}, se presentaron a la Audiencia de conciliación el (la) señor(a) ${sol?.nombres} ${sol?.apellidos}, identificado con Documento Nacional de Identidad N° ${sol?.dni || '_________'}, con domicilio en ${this.datosActa.solicitanteDireccion || '______________'} distrito de ____________, provincia y departamento de ____________ y el señor(a) ${inv?.nombres} ${inv?.apellidos}, quien fue invitada a conciliar mediante comunicación que se dejó en el domicilio señalado por la solicitante ubicado en ${this.datosActa.invitadoDireccion || '______________'}, distrito del _______________, provincia y departamento de ____________ con el objeto de que les asista en la solución de su conflicto.`;

        // Justified text function
        const printParagraph = (text: string) => {
            const split = doc.splitTextToSize(text, 170);
            doc.text(split, 20, yPos, { align: "justify", maxWidth: 170 });
            yPos += (split.length * 5) + 5;
        };

        printParagraph(textoIntro);

        const textoIniciada = `Iniciada la audiencia de Conciliación se procedió a informar a las partes sobre el procedimiento conciliatorio, su naturaleza, características, fines y ventajas. Asimismo se señaló a las partes las normas de conducta que deberán observar.`;
        printParagraph(textoIniciada);

        // HECHOS
        doc.setFont("times", "bold");
        doc.text("HECHOS EXPUESTOS EN LA SOLICITUD:", 20, yPos);
        yPos += 6;
        doc.setFont("times", "normal");
        printParagraph(this.datosActa.hechos || "__________________________________________________________________________________________________________________________________________________________________");
        doc.line(20, yPos - 2, 190, yPos - 2); // Line under facts

        doc.text("(De adjuntarse la solicitud está formará parte integrante del acta.)", 20, yPos + 5);
        yPos += 15;

        // CONTROVERSIA 
        doc.setFont("times", "bold");
        doc.text("DESCRIPCIÓN DE LA(S) CONTROVERSIA(S):", 20, yPos);
        yPos += 6;
        doc.setFont("times", "normal");
        printParagraph(this.datosActa.controversia || "__________________________________________________________________________________________________________________________________________________________________");
        doc.line(20, yPos - 2, 190, yPos - 2);
        yPos += 5;

        // ACUERDOS
        doc.setFont("times", "bold");
        doc.text("ACUERDO CONCILIATORIO:", 20, yPos);
        yPos += 6;
        doc.setFont("times", "normal");
        printParagraph("Considerando los hechos señalados y las propuestas formuladas por las partes, se conviene en celebrar un Acuerdo en los siguientes términos:");

        this.acuerdos.forEach(acuerdo => {
            if (yPos > 250) { doc.addPage(); yPos = 30; }
            doc.setFont("times", "bold");
            doc.text(`${acuerdo.titulo}.-`, 20, yPos);
            yPos += 6;
            doc.setFont("times", "normal");
            printParagraph(acuerdo.contenido || "__________________________________________________________");
            doc.line(20, yPos - 2, 190, yPos - 2);
        });

        // PUNTOS SIN ACUERDO
        if (yPos > 240) { doc.addPage(); yPos = 30; }
        doc.setFont("times", "bold");
        doc.text("DESCRIPCIÓN DE LAS CONTROVERSIAS RESPECTO DE LAS CUALES NO SE ARRIBÓ A SOLUCIÓN ALGUNA:", 20, yPos, { maxWidth: 170 });
        yPos += 12;
        doc.setFont("times", "normal");
        printParagraph(this.datosActa.puntosSinAcuerdo || "__________________________________________________________________________________________________________________________________________________________________");
        doc.line(20, yPos - 2, 190, yPos - 2);

        // POSICIONES
        if (yPos > 240) { doc.addPage(); yPos = 30; }
        doc.setFont("times", "bold");
        doc.text("POSICIONES DEL SOLICITANTE Y/O INVITADO: (Siempre que ambas partes lo autoricen).", 20, yPos);
        yPos += 8;
        doc.setFont("times", "normal");
        printParagraph(`Solicitante: ${this.datosActa.posicionSolicitante || '________________________'}`);
        doc.line(20, yPos - 2, 190, yPos - 2);
        printParagraph(`Invitado: ${this.datosActa.posicionInvitado || '________________________'}`);
        doc.line(20, yPos - 2, 190, yPos - 2);
        yPos += 5;

        // PROPUESTAS
        doc.setFont("times", "bold");
        doc.text("PROPUESTAS DEL SOLICITANTE Y/O INVITADO: (Siempre que ambas partes lo autoricen).", 20, yPos);
        yPos += 8;
        doc.setFont("times", "normal");
        printParagraph(`Solicitante: ${this.datosActa.propuestaSolicitante || '________________________'}`);
        doc.line(20, yPos - 2, 190, yPos - 2);
        printParagraph(`Invitado: ${this.datosActa.propuestaInvitado || '________________________'}`);
        doc.line(20, yPos - 2, 190, yPos - 2);
        yPos += 5;

        // VERIFICACION LEGAL
        if (yPos > 220) { doc.addPage(); yPos = 30; }
        doc.setFont("times", "bold");
        doc.text("VERIFICACIÓN DE LOS ACUERDOS ADOPTADOS:", 20, yPos);
        yPos += 6;
        doc.setFont("times", "normal");
        const abogado = this.abogados.find(a => a.nombre === this.datosActa.abogadoVerificador);
        const textoVerif = `En este Acto ${abogado?.nombre || '______________'} (nombres del abogado), con Registro del C.A ____ Nº ${abogado?.registro || '___________'}, abogado de este Centro de Conciliación procedió a verificar la legalidad de los Acuerdos adoptados por las partes conciliantes, quienes decidieron aprobar el Acuerdo, dejándose expresa constancia que conocen, que de conformidad con el Artículo 18° del Decreto Legislativo N° 1070, concordado con el artículo 688° del Decreto Legislativo N° 1069, el Acta de este acuerdo conciliatorio constituye Título Ejecutivo.`;
        printParagraph(textoVerif);

        // TEXTO CIERRE
        const textoCierre = `Leído el texto, los conciliantes manifiestan su conformidad con el mismo, siendo las ____ horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()}, en señal de lo cual firman la presente Acta N° ..........., la misma que consta de ___ (___) páginas.`;
        printParagraph(textoCierre);
        yPos += 20;

        // FIRMAS
        if (yPos > 240) { doc.addPage(); yPos = 40; }
        doc.setFontSize(10);

        // C - S
        doc.line(20, yPos, 80, yPos);
        doc.text("Firma y huella del Conciliador", 50, yPos + 5, { align: "center" });
        doc.line(110, yPos, 170, yPos);
        doc.text("Nombre, firma y huella del solicitante", 140, yPos + 5, { align: "center" });

        yPos += 30;
        // A - I
        doc.line(20, yPos, 80, yPos);
        doc.text("Firma y huella del Abogado", 50, yPos + 5, { align: "center" });
        doc.line(110, yPos, 170, yPos);
        doc.text("Nombre, firma y huella del invitado", 140, yPos + 5, { align: "center" });

        return doc;
    }

    finalizarYDescargar() {
        const doc = this.generarDocPDF();
        const pdfBlob = doc.output('blob');
        const numeroActa = `ACTA-ACUERDO-PARCIAL-PROP-${this.audienciaId}-${new Date().getTime()}`;

        // 1. Upload Blob
        this.actaService.subirActa(this.audienciaId, 'ACUERDO_PARCIAL_PROPUESTAS', numeroActa, pdfBlob).subscribe({
            next: (res) => {
                console.log("Acta Acuerdo Parcial Propuestas subida:", res);

                // 2. Update Status
                const token = localStorage.getItem('token');
                const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
                const detalle = {
                    ...this.datosActa,
                    acuerdos: this.acuerdos,
                    actaUrl: res.archivoUrl
                };
                const payload = {
                    resultadoTipo: 'Acuerdo Parcial con Propuestas',
                    resultadoDetalle: JSON.stringify(detalle)
                };

                this.http.put(`${environment.apiUrl}/audiencias/${this.audienciaId}/resultado`, payload, { headers }).subscribe({
                    next: () => {
                        doc.save(`Formato_I_AcuerdoParcialPropuestas_${this.audiencia.solicitud?.numeroExpediente}.pdf`);
                        alert("✅ Proceso Finalizado. Acta Guardada.");
                        this.router.navigate(['/conciliador/mis-casos']);
                    },
                    error: (err) => alert("Error al finalizar: " + err.message)
                });
            },
            error: (err) => alert("Error al subir acta: " + err.message)
        });
    }

    descargarPDF() {
        this.generarDocPDF().save(`Formato_I_AcuerdoParcialPropuestas_${this.audiencia.solicitud?.numeroExpediente}.pdf`);
    }

    descargarWord() {
        const expNum = this.audiencia.solicitud?.numeroExpediente || '_______';
        const hoy = new Date();
        const sol = this.audiencia.solicitud?.solicitante;
        const inv = this.audiencia.solicitud?.invitado;
        const abogado = this.abogados.find(a => a.nombre === this.datosActa.abogadoVerificador);
        const concDni = this.datosActa.conciliadorDni || '___________';
        const concReg = this.datosActa.conciliadorRegistro || '___________';

        let acuerdosHtml = '';
        this.acuerdos.forEach(acuerdo => {
            acuerdosHtml += `
                <p><strong>${acuerdo.titulo}.-</strong></p>
                <div style="border-bottom: 1px solid black; padding-bottom: 5px; margin-bottom: 10px;">
                    <p style="text-align: justify; margin: 0;">${acuerdo.contenido || '__________________________________________'}</p>
                </div>
            `;
        });

        const header = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                  xmlns:w='urn:schemas-microsoft-com:office:word' 
                  xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>Formato I</title>
                <style>
                    body { font-family: 'Times New Roman', serif; padding: 2cm; }
                    .title { text-align: center; font-weight: bold; text-decoration: underline; text-transform: uppercase; }
                    .center { text-align: center; }
                    .justify { text-align: justify; }
                    .bold { font-weight: bold; }
                    .line { border-bottom: 1px solid black; width: 100%; margin: 5px 0; }
                    td { vertical-align: top; padding: 10px; }
                </style>
            </head>
            <body>`;

        const content = `
            <div style="text-align: right; font-weight: bold;">FORMATO I</div>
            <div class="title" style="font-size: 14pt; margin-top: 10px;">FORMATO TIPO DE ACTA DE CONCILIACIÓN CON ACUERDO PARCIAL CON<br>POSICIONES Y/O PROPUESTAS DE LAS PARTES CONCILIANTES<br>(PERSONAS NATURALES)</div>
         
            <div class="center" style="margin-top: 20px;">
                <strong>CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"</strong><br>
                <span>Autorizado su funcionamiento por Resolución ............... N° ______ - _______</span><br>
                <div style="display: flex; justify-content: space-between; width: 80%; margin: 0 auto; border-bottom: 1px solid black;">
                    <span>Dirección y teléfono: ${this.datosActa.lugarAudiencia} | Tlf: 987654321</span>
                    <strong>EXP. N° ${expNum}</strong>
                </div>
            </div>
            
            <div class="title" style="margin-top: 20px;">ACTA DE CONCILIACIÓN N° .........</div>
            
            <p class="justify">
              En la ciudad de Lima, distrito de _______________ siendo las ____ horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()}, ante mi ${this.conciliadorNombre}, identificado con DNI ${concDni} en mi calidad de Conciliador Extrajudicial debidamente autorizado por el Ministerio de Justicia con Registro N° ${concReg}, se presentaron a la Audiencia de conciliación el (la) señor(a) ${sol?.nombres} ${sol?.apellidos}, identificado con DNI ${sol?.dni || '_________'}, con domicilio en ${this.datosActa.solicitanteDireccion || '______________'}, distrito de ________, provincia y departamento de ______ y el señor(a) ${inv?.nombres} ${inv?.apellidos}, quien fue invitada a conciliar mediante comunicación que se dejó en el domicilio señalado por la solicitante ubicado en ${this.datosActa.invitadoDireccion || '______________'}, con el objeto de que les asista en la solución de su conflicto.
            </p>

            <p class="justify">Iniciada la audiencia de Conciliación se procedió a informar a las partes sobre el procedimiento conciliatorio, su naturaleza, características fines y ventajas. Asimismo se señaló a las partes las normas de conducta que deberán observar.</p>

            <div class="bold">HECHOS EXPUESTOS EN LA SOLICITUD:</div>
            <div style="border-bottom: 1px solid black; margin-bottom: 10px;">
                 <p class="justify" style="margin: 0;">${this.datosActa.hechos || '__________________________________________'}</p>
            </div>
            <p>(De adjuntarse la solicitud está formará parte integrante del acta.)</p>

            <div class="bold">DESCRIPCIÓN DE LA(S) CONTROVERSIA(S):</div>
            <div style="border-bottom: 1px solid black; margin-bottom: 10px;">
                 <p class="justify" style="margin: 0;">${this.datosActa.controversia || '__________________________________________'}</p>
            </div>

            <br>
            <div class="bold">ACUERDO CONCILIATORIO:</div>
            <p class="justify">Considerando los hechos señalados y las propuestas formuladas por las partes, se conviene en celebrar un Acuerdo en los siguientes términos:</p>
            ${acuerdosHtml}

            <br>
            <div class="bold">DESCRIPCIÓN DE LAS CONTROVERSIAS RESPECTO DE LAS CUALES NO SE ARRIBÓ A SOLUCIÓN ALGUNA:</div>
            <div style="border-bottom: 1px solid black; margin-bottom: 10px;">
                <p>${this.datosActa.puntosSinAcuerdo || '__________________________________________'}</p>
            </div>

             <br>
            <div class="bold">POSICIONES DEL SOLICITANTE Y/O INVITADO: (Siempre que ambas partes lo autoricen).</div>
            <div style="border-bottom: 1px solid black; margin-bottom: 5px;">
                <p><strong>Solicitante:</strong> ${this.datosActa.posicionSolicitante || '________________________________'}</p>
            </div>
            <div style="border-bottom: 1px solid black; margin-bottom: 5px;">
                <p><strong>Invitado:</strong> ${this.datosActa.posicionInvitado || '________________________________'}</p>
            </div>

             <br>
            <div class="bold">PROPUESTAS DEL SOLICITANTE Y/O INVITADO: (Siempre que ambas partes lo autoricen).</div>
            <div style="border-bottom: 1px solid black; margin-bottom: 5px;">
                <p><strong>Solicitante:</strong> ${this.datosActa.propuestaSolicitante || '________________________________'}</p>
            </div>
            <div style="border-bottom: 1px solid black; margin-bottom: 5px;">
                <p><strong>Invitado:</strong> ${this.datosActa.propuestaInvitado || '________________________________'}</p>
            </div>

            <br>
            <div class="bold">VERIFICACIÓN DE LOS ACUERDOS ADOPTADOS:</div>
            <p class="justify">
            En este Acto <strong>${abogado?.nombre || '______________'}</strong> (nombres del abogado), con Registro del C.A ____ Nº <strong>${abogado?.registro || '___________'}</strong>, abogado de este Centro de Conciliación procedió a verificar la legalidad de los Acuerdos adoptados por las partes conciliantes, quienes decidieron aprobar el Acuerdo, dejándose expresa constancia que conocen, que de conformidad con el Artículo 18° del Decreto Legislativo N° 1070, concordado con el artículo 688° del Decreto Legislativo N° 1069, el Acta de este acuerdo conciliatorio constituye Título Ejecutivo.
            </p>

            <p class="justify">
                Leído el texto, los conciliantes manifiestan su conformidad con el mismo, siendo las ____ horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()}, en señal de lo cual firman la presente Acta N° ..........., la misma que consta de ___ (___) páginas.
            </p>

            <br><br><br>
            <table style="width: 100%; text-align: center; border-collapse: collapse;">
                <tr>
                      <td style="width: 40%; border-top: 1px solid black;">Firma y huella del Conciliador</td>
                      <td style="width: 10%;"></td>
                      <td style="width: 40%; border-top: 1px solid black;">Nombre, firma y huella del solicitante</td>
                </tr>
                <tr><td colspan="3" style="height: 50px;"></td></tr>
                <tr>
                      <td style="width: 40%; border-top: 1px solid black;">Firma y huella del Abogado</td>
                      <td style="width: 10%;"></td>
                      <td style="width: 40%; border-top: 1px solid black;">Nombre, firma y huella del invitado</td>
                </tr>
            </table>
        `;
        const footer = "</body></html>";
        const sourceButtons = header + content + footer;

        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceButtons);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = `Formato_I_AcuerdoParcialPropuestas_${expNum}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
    }

    obtenerNombreMes(fecha: Date): string {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[fecha.getMonth()];
    }
}
