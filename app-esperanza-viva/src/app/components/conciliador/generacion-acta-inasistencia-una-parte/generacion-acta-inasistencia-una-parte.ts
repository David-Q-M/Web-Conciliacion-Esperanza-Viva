import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { jsPDF } from 'jspdf';

@Component({
    selector: 'app-generacion-acta-inasistencia-una-parte',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
    templateUrl: './generacion-acta-inasistencia-una-parte.html',
    styleUrls: ['./generacion-acta-inasistencia-una-parte.css']
})
export class GeneracionActaInasistenciaUnaParte implements OnInit {
    audienciaId: any;
    conciliadorNombre: string = '';
    audiencia: any = null;
    mostrarVistaPrevia: boolean = false;

    // Form Data
    datosActa = {
        horaVerificacion: '',
        reprogramacionFecha: '',
        reprogramacionHora: '',
        lugarAudiencia: '',
        solicitanteDireccion: '',
        invitadoDireccion: '',
        pretension: ''
    };

    constructor(
        private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute
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
    }

    cargarDatos() {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.get<any>(`http://localhost:8080/api/audiencias/${this.audienciaId}`, { headers }).subscribe({
            next: (data) => {
                this.audiencia = data;

                // Pre-fill data if available
                this.datosActa.lugarAudiencia = 'Centro de Conciliación Esperanza Viva'; // Default or from DB
                this.datosActa.solicitanteDireccion = this.audiencia.solicitud?.solicitante?.direccion || '';
                this.datosActa.invitadoDireccion = this.audiencia.solicitud?.invitado?.direccion || '';
                this.datosActa.pretension = this.audiencia.solicitud?.pretension || '';

                // Format explicit attendance strings for display
                this.audiencia.asistenciaSolicitante = (this.audiencia.asistenciaSolicitante === true || this.audiencia.asistenciaSolicitante === 'Asistio') ? 'Asistio' : 'No asistio';
                this.audiencia.asistenciaInvitado = (this.audiencia.asistenciaInvitado === true || this.audiencia.asistenciaInvitado === 'Asistio') ? 'Asistio' : 'No asistio';

                this.datosActa.horaVerificacion = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            },
            error: (err) => console.error("Error al cargar audiencia:", err)
        });
    }

    toggleVistaPrevia() {
        this.mostrarVistaPrevia = !this.mostrarVistaPrevia;
    }

    finalizarYDescargar() {
        // Logic to save the act/result and download/finish
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        const payload = {
            resultadoTipo: 'Inasistencia de una de las partes',
            resultadoDetalle: JSON.stringify(this.datosActa)
        };

        this.http.put(`http://localhost:8080/api/audiencias/${this.audienciaId}/resultado`, payload, { headers }).subscribe({
            next: () => {
                alert("Acta de inasistencia registrada correctamente.");
                this.descargarPDF(); // Default to PDF on finish
                this.router.navigate(['/conciliador/mis-casos']);
            },
            error: (err) => alert("Error al finalizar: " + err.message)
        });
    }

    descargarPDF() {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Helper: Centered text
        const centerText = (text: string, y: number) => {
            const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
            const x = (pageWidth - textWidth) / 2;
            doc.text(text, x, y);
        };

        // Helper: Right-aligned text
        const rightText = (text: string, y: number, margin = 20) => {
            const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
            doc.text(text, pageWidth - margin - textWidth, y);
        };

        // --- HEADER ---
        doc.setFont("times", "bold");
        doc.setFontSize(10);
        rightText("FORMATO D", 15);

        doc.setFontSize(11);
        centerText("FORMATO TIPO DE CONSTANCIA DE ASISTENCIA E INVITACIÓN PARA CONCILIAR", 25);

        doc.setFont("times", "normal");
        doc.setFontSize(10);
        centerText("CENTRO DE CONCILIACIÓN ESPERANZA VIVA", 35);
        centerText("Autorizado su funcionamiento por Resolución ................ N° _______-_______", 40);

        // Build address line
        const expNum = this.audiencia.solicitud?.numeroExpediente || '_______';
        doc.text(`Dirección y teléfono: ${this.datosActa.lugarAudiencia}`, 20, 45);
        rightText(`EXP. N° ${expNum}`, 45);

        doc.line(20, 47, pageWidth - 20, 47); // Horizontal line

        // --- TITLE ---
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        centerText("CONSTANCIA DE ASISTENCIA E INVITACIÓN", 60);
        centerText("PARA CONCILIAR", 66);

        // --- PARAGRAPH 1 ---
        doc.setFont("times", "normal    ");
        doc.setFontSize(11);

        const fechaActual = new Date();
        const dia = fechaActual.getDate();
        const mes = this.obtenerNombreMes(fechaActual);
        const anio = fechaActual.getFullYear();
        const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const conciliador = this.conciliadorNombre || '______________________';
        const solicitante = `${this.audiencia.solicitud?.solicitante?.nombres} ${this.audiencia.solicitud?.solicitante?.apellidos}`;
        const invitado = `${this.audiencia.solicitud?.invitado?.nombres} ${this.audiencia.solicitud?.invitado?.apellidos}`;
        const materia = this.datosActa.pretension || '______________________';

        const body1 = `En la ciudad de Lima, siendo las ${horaActual} horas del día ${dia} del mes de ${mes} del año ${anio} , ante mi ${conciliador}, en mi calidad de Conciliador debidamente acreditado por el Ministerio de Justicia, mediante Registro N° ___________, presentó su solicitud de conciliación don (ña) ${solicitante}, a efectos de llegar a un acuerdo conciliatorio con don (ña) ${invitado}, siendo la(s) materia(s) a Conciliar: ${materia}.`;

        const splitBody1 = doc.splitTextToSize(body1, 170);
        doc.text(splitBody1, 20, 80);

        doc.line(20, 115, pageWidth - 20, 115);

        // --- ASISTENCIA DE UNA DE LAS PARTES ---
        let yPos = 125;
        doc.setFont("times", "bold");
        doc.text("ASISTENCIA DE UNA DE LAS PARTES:", 20, yPos);
        yPos += 10;

        doc.setFont("times", "normal");
        const asistenciaTexto = `Siendo las ${this.datosActa.horaVerificacion || '___:___'} horas del dia ${dia} del mes de ${mes} del año ${anio}, y luego de hacer los llamados respectivos solo se verificó la presencia de:`;

        const splitAsistencia = doc.splitTextToSize(asistenciaTexto, 170);
        doc.text(splitAsistencia, 20, yPos);
        yPos += 15;

        // Dynamic check for who attended
        let asistentes = '';
        let ausentes = '';
        if (this.audiencia.asistenciaSolicitante === 'Asistio') asistentes += `Solicitante: ${solicitante}. `;
        else ausentes += `Solicitante: ${solicitante}. `;

        if (this.audiencia.asistenciaInvitado === 'Asistio') asistentes += `Invitado: ${invitado}. `;
        else ausentes += `Invitado: ${invitado}. `;

        doc.text(`Habiendo asistido: ${asistentes || 'Ninguno'}`, 20, yPos);
        yPos += 10;
        doc.text(`Habiendo no asistido el (los) señor(a)(es): ${ausentes || 'Ninguno'}`, 20, yPos);

        yPos += 10;
        doc.line(20, yPos, pageWidth - 20, yPos);
        yPos += 10;

        // --- NUEVA FECHA ---
        doc.setFont("times", "bold");
        doc.text("SE SEÑALA NUEVA FECHA PARA LA REALIZACIÓN DE LA AUDIENCIA DE CONCILIACIÓN:", 20, yPos);
        yPos += 10;

        doc.setFont("times", "normal");
        // Format reprogrammation date
        let reproDateStr = "___/___/____";
        let reproAnio = "____";
        let reproMes = "________";
        let reproDia = "__";

        if (this.datosActa.reprogramacionFecha) {
            const rDate = new Date(this.datosActa.reprogramacionFecha + 'T12:00:00');
            reproDia = rDate.getDate().toString();
            reproMes = this.obtenerNombreMes(rDate);
            reproAnio = rDate.getFullYear().toString();
        }

        const legalText = `De conformidad con lo señalado por la Ley de Conciliación Nº 26872, modificado por el Decreto Legislativo Nº 1070 y el Decreto Supremo Nº 014-2008-JUS - Reglamento de la Ley de Conciliación, se convoca a una nueva sesión para la realización de la audiencia de conciliación para el día ${reproDia} del mes de ${reproMes} de ${reproAnio}, a horas ${this.datosActa.reprogramacionHora || '___:___'}, en las instalaciones del Centro de Conciliación ESPERANZA VIVA ubicado en ${this.datosActa.lugarAudiencia}, dándose por notificada la parte asistente.`;

        const splitLegal = doc.splitTextToSize(legalText, 170);
        doc.text(splitLegal, 20, yPos);

        // --- SIGNATURES ---
        yPos = 250;
        doc.line(30, yPos, 90, yPos); // Line 1
        doc.line(120, yPos, 180, yPos); // Line 2

        yPos += 5;
        doc.setFontSize(10);
        doc.text("Firma, huella y sello del Conciliador", 35, yPos);
        doc.text("Nombre, firma y huella de la parte asistente", 125, yPos);

        // Save PDF
        doc.save(`Constancia_Inasistencia_${expNum}.pdf`);
    }

    descargarWord() {
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
            "xmlns:w='urn:schemas-microsoft-com:office:word' " +
            "xmlns='http://www.w3.org/TR/REC-html40'>" +
            "<head><meta charset='utf-8'><title>Constancia Inasistencia</title></head><body>";

        const footer = "</body></html>";

        const expNum = this.audiencia.solicitud?.numeroExpediente || '_______';
        const fechaActual = new Date();
        const dia = fechaActual.getDate();
        const mes = this.obtenerNombreMes(fechaActual);
        const anio = fechaActual.getFullYear();
        const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const conciliador = this.conciliadorNombre || '______________________';
        const solicitante = `${this.audiencia.solicitud?.solicitante?.nombres} ${this.audiencia.solicitud?.solicitante?.apellidos}`;
        const invitado = `${this.audiencia.solicitud?.invitado?.nombres} ${this.audiencia.solicitud?.invitado?.apellidos}`;
        const materia = this.datosActa.pretension || '______________________';

        let asistentes = '';
        let ausentes = '';
        if (this.audiencia.asistenciaSolicitante === 'Asistio') asistentes += `Solicitante: ${solicitante}. `;
        else ausentes += `Solicitante: ${solicitante}. `;
        if (this.audiencia.asistenciaInvitado === 'Asistio') asistentes += `Invitado: ${invitado}. `;
        else ausentes += `Invitado: ${invitado}. `;

        let reproAnio = "____";
        let reproMes = "________";
        let reproDia = "__";
        if (this.datosActa.reprogramacionFecha) {
            const rDate = new Date(this.datosActa.reprogramacionFecha + 'T12:00:00');
            reproDia = rDate.getDate().toString();
            reproMes = this.obtenerNombreMes(rDate);
            reproAnio = rDate.getFullYear().toString();
        }


        const body = `
      <div style="font-family: 'Times New Roman', serif; padding: 20px;">
        <p style="text-align: right; font-weight: bold;">FORMATO D</p>
        <h3 style="text-align: center; text-decoration: underline;">FORMATO TIPO DE CONSTANCIA DE ASISTENCIA E INVITACIÓN PARA CONCILIAR</h3>
        
        <br>
        <p style="text-align: center;"><strong>CENTRO DE CONCILIACIÓN ESPERANZA VIVA</strong><br>
        Autorizado su funcionamiento por Resolución ................ N° _______-_______<br>
        Dirección y teléfono: ${this.datosActa.lugarAudiencia} <span style="float:right;">EXP. N° ${expNum}</span></p>
        
        <div style="text-align: center; margin-top: 20px;">
           <h3 style="text-decoration: underline;">CONSTANCIA DE ASISTENCIA E INVITACIÓN</h3>
           <h3 style="text-decoration: underline;">PARA CONCILIAR</h3>
        </div>
        
        <p style="text-align: justify;">
          En la ciudad de Lima, siendo las ${horaActual} horas del día ${dia} del mes de ${mes} del año ${anio}, ante mi ${conciliador}, en mi calidad de Conciliador debidamente acreditado por el Ministerio de Justicia, mediante Registro N° ___________, presentó su solicitud de conciliación don (ña) ${solicitante}, a efectos de llegar a un acuerdo conciliatorio con don (ña) ${invitado}, siendo la(s) materia(s) a Conciliar: ${materia}.
        </p>

        <hr>

        <h4>ASISTENCIA DE UNA DE LAS PARTES:</h4>
        <p style="text-align: justify;">
          Siendo las ${this.datosActa.horaVerificacion || '___:___'} horas del dia ${dia} del mes de ${mes} del año ${anio}, y luego de hacer los llamados respectivos solo se verificó la presencia de:
        </p>

        <p>Habiendo asistido: ${asistentes || 'Ninguno'}</p>
        <p>Habiendo no asistido el (los) señor(a)(es): ${ausentes || 'Ninguno'}</p>

        <hr>

        <h4>SE SEÑALA NUEVA FECHA PARA LA REALIZACIÓN DE LA AUDIENCIA DE CONCILIACIÓN:</h4>
        <p style="text-align: justify;">
        De conformidad con lo señalado por la Ley de Conciliación Nº 26872, modificado por el Decreto Legislativo Nº 1070 y el Decreto Supremo Nº 014-2008-JUS - Reglamento de la Ley de Conciliación, se convoca a una nueva sesión para la realización de la audiencia de conciliación para el día ${reproDia} del mes de ${reproMes} de ${reproAnio}, a horas ${this.datosActa.reprogramacionHora || '___:___'}, en las instalaciones del Centro de Conciliación ESPERANZA VIVA ubicado en ${this.datosActa.lugarAudiencia}, dándose por notificada la parte asistente.
        </p>

        <br><br><br><br>

        <table style="width: 100%; text-align: center;">
            <tr>
                <td>___________________________________<br>Firma, huella y sello del Conciliador</td>
                <td>___________________________________<br>Nombre, firma y huella de la parte asistente</td>
            </tr>
        </table>
      </div>
    `;

        const sourceHTML = header + body + footer;
        const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Constancia_Inasistencia_${expNum}.doc`;
        link.click();
    }

    obtenerNombreMes(fecha: Date): string {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[fecha.getMonth()];
    }
}
