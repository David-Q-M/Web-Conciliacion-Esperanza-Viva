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
    selector: 'app-generacion-acta-acuerdo-sustento-probable',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
    templateUrl: './generacion-acta-acuerdo-sustento-probable.html',
    styleUrls: ['./generacion-acta-acuerdo-sustento-probable.css']
})
export class GeneracionActaAcuerdoSustentoProbable implements OnInit {
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
        // Conciliator
        conciliadorDni: '',
        conciliadorRegistro: '',
        conciliadorEspecialidad: '',
        // Reconvencion
        hechosInvitado: '',
        controversiaInvitado: ''
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
        this.http.get<any>(`http://localhost:8080/api/audiencias/${this.audienciaId}`, { headers }).subscribe({
            next: (data) => {
                this.audiencia = data;
                this.datosActa.hechos = this.audiencia.solicitud?.hechos || '';
                this.datosActa.controversia = this.audiencia.solicitud?.controversia || '';
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

    finalizarYDescargar() {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const detalle = { ...this.datosActa, acuerdos: this.acuerdos };
        const payload = {
            resultadoTipo: 'Acuerdo Parcial con Sustento de Reconvencion',
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

        const centerText = (text: string, y: number, size: number = 10, font: string = 'normal') => {
            doc.setFont("times", font);
            doc.setFontSize(size);
            doc.text(text, 105, y, { align: "center" });
        };

        // --- HEADER ---
        doc.setFont("times", "bold");
        doc.setFontSize(10);
        doc.text("FORMATO J", 195, 15, { align: "right" });

        centerText("FORMATO TIPO DE ACTA DE CONCILIACIÓN CON ACUERDO PARCIAL CON SUSTENTO DE", 105, 25, 'bold');
        centerText("SU PROBABLE RECONVENCIÓN", 105, 30, 'bold');
        centerText("(PERSONAS NATURALES)", 105, 35, 'bold');

        centerText(`CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"`, 105, 45, 'bold');

        doc.setFont("times", "normal");
        doc.text("Autorizado su funcionamiento por Resolución ............... N° _______ - _______", 105, 50, { align: "center" });

        doc.text(`Dirección y teléfono: ${this.datosActa.lugarAudiencia} | Tlf: 987654321           EXP. N° ${expNum}`, 105, 55, { align: "center" });
        doc.line(60, 56, 150, 56); // Underline address

        doc.setFont("times", "bold");
        doc.setFontSize(12);
        doc.text("ACTA DE CONCILIACIÓN N° .........", 105, 70, { align: "center" });
        doc.setLineWidth(0.5);
        doc.line(75, 71, 135, 71); // Bold Underline title
        doc.setLineWidth(0.2);

        // --- BODY ---
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        let yPos = 85;
        const hoy = new Date();
        const concDni = this.datosActa.conciliadorDni || '________________';
        const concReg = this.datosActa.conciliadorRegistro || '________________';

        const textoIntro = `En la ciudad de Lima, distrito de _______________ siendo las ____ horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()}, ante mi ${this.conciliadorNombre}, identificado con Documento Nacional de Identidad N° ${concDni} en mi calidad de Conciliador Extrajudicial debidamente autorizado por el Ministerio de Justicia con Registro N° ${concReg}, se presentaron a la Audiencia de conciliación el (la) señor(a) ${sol?.nombres} ${sol?.apellidos}, identificado con Documento Nacional de Identidad N° ${sol?.dni || '_________'}, con domicilio en ${this.datosActa.solicitanteDireccion || '______________'} distrito de ____________, provincia y departamento de ____________ y el (la) señor(a) ${inv?.nombres} ${inv?.apellidos}, quien fue invitada a conciliar mediante comunicación que se dejó en el domicilio señalado por la solicitante ubicado en ${this.datosActa.invitadoDireccion || '______________'}, distrito del _______________, provincia y departamento de ____________ con el objeto de que les asista en la solución de su conflicto.`;

        const printParagraph = (text: string) => {
            const split = doc.splitTextToSize(text, 170);
            doc.text(split, 20, yPos, { align: "justify", maxWidth: 170 });
            yPos += (split.length * 5) + 5;
        };

        printParagraph(textoIntro);
        printParagraph(`Iniciada la audiencia de Conciliación se procedió a informar a las partes sobre el procedimiento conciliatorio, su naturaleza, características, fines y ventajas. Asimismo se señaló a las partes las normas de conducta que deberán observar.`);

        // HECHOS
        doc.setFont("times", "bold");
        doc.text("HECHOS EXPUESTOS EN LA SOLICITUD:", 20, yPos);
        yPos += 6;
        doc.setFont("times", "normal");
        printParagraph(this.datosActa.hechos || "__________________________________________________________________________________________________________________________________________________________________");
        doc.line(20, yPos - 2, 190, yPos - 2);

        doc.text("(De adjuntarse la solicitud está formará parte integrante del acta.)", 20, yPos + 5);
        yPos += 15;

        // CONTROVERSIA 
        doc.setFont("times", "bold");
        doc.text("DESCRIPCIÓN DE LA(S) CONTROVERSIA(S) CON ACUERDO:", 20, yPos);
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

        // --- SPECIFIC TO FORMATO J (Reconvencion) ---
        if (yPos > 240) { doc.addPage(); yPos = 30; }

        doc.setFont("times", "bold");
        doc.text("HECHOS EXPUESTOS POR EL INVITADO: (sustento de su probable reconvención).", 20, yPos);
        yPos += 8;
        doc.setFont("times", "normal");
        printParagraph(this.datosActa.hechosInvitado || "__________________________________________________________________________________________________________________________________________________________________");
        doc.line(20, yPos - 2, 190, yPos - 2);
        yPos += 5;

        doc.setFont("times", "bold");
        doc.text("DESCRIPCIÓN DE LA(S) CONTROVERSIA(S): (sustento de su probable reconvención).", 20, yPos);
        yPos += 8;
        doc.setFont("times", "normal");
        printParagraph(this.datosActa.controversiaInvitado || "__________________________________________________________________________________________________________________________________________________________________");
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

        doc.line(20, yPos, 80, yPos);
        doc.text("Firma y huella del Conciliador", 50, yPos + 5, { align: "center" });

        doc.line(110, yPos, 170, yPos);
        doc.text("Nombre, firma y huella del solicitante", 140, yPos + 5, { align: "center" });

        yPos += 30;
        doc.line(20, yPos, 80, yPos);
        doc.text("Firma y huella del Abogado", 50, yPos + 5, { align: "center" });

        doc.line(110, yPos, 170, yPos);
        doc.text("Nombre, firma y huella del invitado", 140, yPos + 5, { align: "center" });

        doc.save(`Formato_J_AcuerdoParcialSustentoProbable_${expNum}.pdf`);
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
            </div>`;
        });

        const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Formato J</title><style>
            body { font-family: 'Times New Roman', serif; padding: 2cm; } 
            .justify { text-align: justify; } 
            .center { text-align: center; } 
            .bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
        </style></head><body>`;

        const content = `
        <div style="text-align: right; font-weight: bold;">FORMATO J</div>
        
        <div class="center bold uppercase" style="font-size: 14pt; margin-top: 10px;">
            FORMATO TIPO DE ACTA DE CONCILIACIÓN CON ACUERDO PARCIAL CON SUSTENTO DE<br>SU PROBABLE RECONVENCIÓN<br>(PERSONAS NATURALES)
        </div>
         
        <div class="center" style="margin-top: 20px;">
            <strong>CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"</strong><br>
            Autorizado su funcionamiento por Resolución ............... N° ______ - _______<br>
            <div style="display: flex; justify-content: space-between; width: 80%; margin: 0 auto; border-bottom: 1px solid black;">
                <span>Dirección y teléfono: ${this.datosActa.lugarAudiencia} | Tlf: 987654321</span>
                <strong>EXP. N° ${expNum}</strong>
            </div>
        </div>
            
        <div class="center bold uppercase" style="margin-top: 20px; text-decoration: underline;">ACTA DE CONCILIACIÓN N° .........</div>
            
        <p class="justify">
            En la ciudad de Lima, distrito de _______________ siendo las ____ horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()}, ante mi ${this.conciliadorNombre}, identificado con DNI ${concDni} en mi calidad de Conciliador Extrajudicial debidamente autorizado por el Ministerio de Justicia con Registro N° ${concReg}, se presentaron a la Audiencia de conciliación el (la) señor(a) ${sol?.nombres} ${sol?.apellidos}, identificado con DNI ${sol?.dni || '_________'}, con domicilio en ${this.datosActa.solicitanteDireccion || '______________'}, distrito de ________, provincia y departamento de ______ y el (la) señor(a) ${inv?.nombres} ${inv?.apellidos}, quien fue invitada a conciliar mediante comunicación que se dejó en el domicilio señalado por la solicitante ubicado en ${this.datosActa.invitadoDireccion || '______________'}, con el objeto de que les asista en la solución de su conflicto.
        </p>

        <p class="justify">Iniciada la audiencia de Conciliación se procedió a informar a las partes sobre el procedimiento conciliatorio, su naturaleza, características fines y ventajas. Asimismo se señaló a las partes las normas de conducta que deberán observar.</p>

        <div class="bold">HECHOS EXPUESTOS EN LA SOLICITUD:</div>
        <div style="border-bottom: 1px solid black; margin-bottom: 5px;">
            <p class="justify" style="margin: 0;">${this.datosActa.hechos || '__________________________________________'}</p>
        </div>
        <p>(De adjuntarse la solicitud está formará parte integrante del acta.)</p>

        <div class="bold">DESCRIPCIÓN DE LA(S) CONTROVERSIA(S) CON ACUERDO:</div>
        <div style="border-bottom: 1px solid black; margin-bottom: 5px;">
            <p class="justify" style="margin: 0;">${this.datosActa.controversia || '__________________________________________'}</p>
        </div>

        <br>
        <div class="bold">ACUERDO CONCILIATORIO:</div>
        <p class="justify">Considerando los hechos señalados y las propuestas formuladas por las partes, se conviene en celebrar un Acuerdo en los siguientes términos:</p>
        ${acuerdosHtml}

        <br>
        <div class="bold">DESCRIPCIÓN DE LAS CONTROVERSIAS RESPECTO DE LAS CUALES NO SE ARRIBÓ A SOLUCIÓN ALGUNA:</div>
        <div style="border-bottom: 1px solid black; margin-bottom: 5px;">
            <p class="justify" style="margin: 0;">${this.datosActa.puntosSinAcuerdo || '__________________________________________'}</p>
        </div>

        <br>
        <div class="bold">HECHOS EXPUESTOS POR EL INVITADO: (sustento de su probable reconvención).</div>
        <div style="border-bottom: 1px solid black; margin-bottom: 5px;">
             <p class="justify" style="margin: 0;">${this.datosActa.hechosInvitado || '__________________________________________'}</p>
        </div>

        <br>
        <div class="bold">DESCRIPCIÓN DE LA(S) CONTROVERSIA(S): (sustento de su probable reconvención).</div>
        <div style="border-bottom: 1px solid black; margin-bottom: 5px;">
            <p class="justify" style="margin: 0;">${this.datosActa.controversiaInvitado || '__________________________________________'}</p>
        </div>

        <br>
        <div class="bold">VERIFICACIÓN DE LOS ACUERDOS ADOPTADOS:</div>
        <p class="justify">En este Acto <strong>${abogado?.nombre || '______________'}</strong> (nombres del abogado), con Registro del C.A ____ Nº <strong>${abogado?.registro || '___________'}</strong>, abogado de este Centro de Conciliación procedió a verificar la legalidad de los Acuerdos adoptados por las partes conciliantes, quienes decidieron aprobar el Acuerdo, dejándose expresa constancia que conocen, que de conformidad con el Artículo 18° del Decreto Legislativo N° 1070, concordado con el artículo 688° del Decreto Legislativo N° 1069, el Acta de este acuerdo conciliatorio constituye Título Ejecutivo.</p>

        <p class="justify">Leído el texto, los conciliantes manifiestan su conformidad con el mismo, siendo las ____ horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()}, en señal de lo cual firman la presente Acta N° ..........., la misma que consta de ___ (___) páginas.</p>

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
        const sourceHTML = header + content + footer;

        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = `Formato_J_AcuerdoParcialSustentoProbable_${expNum}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
    }

    obtenerNombreMes(fecha: Date): string {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[fecha.getMonth()];
    }
}
