import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { jsPDF } from 'jspdf';
import { ActaService } from '../../../../services/acta.service';

@Component({
    selector: 'app-generacion-acta-asistencia-invitacion',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
    templateUrl: './generacion-acta-asistencia-invitacion.html',
    styleUrls: ['./generacion-acta-asistencia-invitacion.css']
})
export class GeneracionActaAsistenciaInvitacion implements OnInit {
    audienciaId: any;
    conciliadorNombre: string = '';
    audiencia: any = null;

    // Form Data
    datosActa = {
        horaVerificacion: '',
        nuevaFecha: '',
        nuevaHora: '',
        lugarAudiencia: 'Av. Sol 450 - Cusco',
        solicitanteDireccion: '',
        invitadoDireccion: '',
        pretension: ''
    };

    constructor(
        private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
        private actaService: ActaService
    ) { }

    ngOnInit(): void {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            this.conciliadorNombre = JSON.parse(userJson).nombreCompleto;
        }
        this.audienciaId = this.route.snapshot.paramMap.get('id');
        this.datosActa.horaVerificacion = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (this.audienciaId) {
            this.cargarDatos();
        }
    }

    cargarDatos() {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.get<any>(`${environment.apiUrl}/audiencias/${this.audienciaId}`, { headers }).subscribe({
            next: (data) => {
                this.audiencia = data;

                // Pre-fill
                this.datosActa.pretension = this.audiencia.solicitud?.hechos || '';
                this.datosActa.solicitanteDireccion = this.audiencia.solicitud?.solicitante?.domicilio || '';
                this.datosActa.invitadoDireccion = this.audiencia.solicitud?.invitado?.domicilio || '';

                // Ensure statuses are set if missing (though they should come from registro)
                if (!this.audiencia.asistenciaSolicitante) this.audiencia.asistenciaSolicitante = 'No asistio';
                if (!this.audiencia.asistenciaInvitado) this.audiencia.asistenciaInvitado = 'No asistio';
            },
            error: (err) => console.error("Error al cargar audiencia:", err)
        });
    }

    // Helper to generate doc
    generarDocPDF(): jsPDF {
        const doc = new jsPDF();
        const sol = this.audiencia.solicitud?.solicitante;
        const inv = this.audiencia.solicitud?.invitado;
        const expNum = this.audiencia.solicitud?.numeroExpediente || '_______';

        // --- HEADER ---
        doc.setFont("times", "bold");
        doc.setFontSize(10);
        doc.text("FORMATO D", 180, 15);

        doc.setFontSize(11);
        doc.text("FORMATO TIPO DE CONSTANCIA DE ASISTENCIA E INVITACIÓN PARA CONCILIAR", 105, 25, { align: "center" });

        doc.text(`CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"`, 105, 40, { align: "center" });
        doc.setFont("times", "normal");
        doc.setFontSize(10);
        doc.text("Autorizado su funcionamiento por Resolución ............... N° _______ - _______", 105, 45, { align: "center" });
        doc.text(`Dirección y teléfono: ${this.datosActa.lugarAudiencia} | Tlf: 987654321           EXP. N° ${expNum}`, 105, 50, { align: "center" });
        doc.line(70, 51, 140, 51);

        doc.setFont("times", "bold");
        doc.setFontSize(12);
        doc.text("CONSTANCIA DE ASISTENCIA E INVITACIÓN", 105, 65, { align: "center" });
        doc.text("PARA CONCILIAR", 105, 70, { align: "center" });
        doc.line(70, 71, 140, 71);

        // --- BODY ---
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        let yPos = 85;

        const hoy = new Date();
        const textoIntro = `En la ciudad de Lima, distrito de _______________ siendo las ${this.datosActa.horaVerificacion} horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()}, ante mi ${this.conciliadorNombre}, en mi calidad de Conciliador debidamente acreditado por el Ministerio de Justicia, mediante Registro N° ___________ presentó su solicitud de conciliación don (ña) ${sol?.nombres} ${sol?.apellidos}, a efectos de llegar a un acuerdo conciliatorio con don (ña) ${inv?.nombres} ${inv?.apellidos}, siendo la(s) materia(s) a Conciliar: ${this.datosActa.pretension}`;

        const splitIntro = doc.splitTextToSize(textoIntro, 170);
        doc.text(splitIntro, 20, yPos);
        yPos += (splitIntro.length * 5) + 10;

        // ASISTENCIA
        doc.setFont("times", "bold");
        doc.text("ASISTENCIA DE UNA DE LAS PARTES:", 20, yPos);
        yPos += 8;

        // Logic to check who attended
        const asistioSol = this.audiencia.asistenciaSolicitante === 'Asistio';
        const asistioInv = this.audiencia.asistenciaInvitado === 'Asistio';
        let asistente = '';
        let ausente = '';

        if (asistioSol) asistente += `${sol?.nombres} ${sol?.apellidos} (Solicitante)`;
        if (asistioInv) asistente += `${inv?.nombres} ${inv?.apellidos} (Invitado)`;

        if (!asistioSol) ausente += `${sol?.nombres} ${sol?.apellidos} (Solicitante)`;
        if (!asistioInv) ausente += `${inv?.nombres} ${inv?.apellidos} (Invitado)`;


        doc.setFont("times", "normal");
        const textoAsistencia = `Siendo las ${this.datosActa.horaVerificacion} horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()} y luego de hacer los llamados respectivos solo se verificó la presencia de: ${asistente || 'NINGUNO'}.`;
        const splitAsistencia = doc.splitTextToSize(textoAsistencia, 170);
        doc.text(splitAsistencia, 20, yPos);
        yPos += (splitAsistencia.length * 5) + 5;

        const textoAusencia = `Habiendo no asistido el (los) señor(a)(es): ${ausente || 'NINGUNO'}.`;
        const splitAusencia = doc.splitTextToSize(textoAusencia, 170);
        doc.text(splitAusencia, 20, yPos);
        yPos += (splitAusencia.length * 5) + 10;

        // REPROGRAMACION
        doc.setFont("times", "bold");
        doc.text("SE SEÑALA NUEVA FECHA PARA LA REALIZACIÓN DE LA AUDIENCIA DE CONCILIACIÓN:", 20, yPos);
        yPos += 8;

        doc.setFont("times", "normal");
        const textoRepro = `De conformidad con lo señalado por la Ley de Conciliación N° 26872... se convoca a una nueva sesión para la realización de la audiencia de conciliación para el día ${this.datosActa.nuevaFecha} a horas ${this.datosActa.nuevaHora}, en las instalaciones del Centro de Conciliación ESPERANZA VIVA ubicado en ${this.datosActa.lugarAudiencia}, dándose por notificada la parte asistente.`;

        const splitRepro = doc.splitTextToSize(textoRepro, 170);
        doc.text(splitRepro, 20, yPos);
        yPos += (splitRepro.length * 5) + 25;

        // SIGNATURES
        if (yPos > 250) {
            doc.addPage();
            yPos = 40;
        }

        doc.setFontSize(10);
        // Conciliator Signature
        doc.line(20, yPos, 80, yPos);
        doc.text("Firma, huella y sello del Conciliador", 50, yPos + 5, { align: "center" });

        // Attendee Signature
        doc.line(110, yPos, 170, yPos);
        doc.text("Nombre, firma y huella de la parte asistente", 140, yPos + 5, { align: 'center' });
        doc.text(asistente.split('(')[0], 140, yPos + 10, { align: 'center' }); // Just name

        return doc;
    }

    finalizarYDescargar() {
        if (!this.datosActa.nuevaFecha || !this.datosActa.nuevaHora) {
            alert("Por favor ingrese la nueva fecha y hora de la audiencia.");
            return;
        }

        const doc = this.generarDocPDF();
        const pdfBlob = doc.output('blob');
        const numeroActa = `CONSTANCIA-ASIST-INVIT-${this.audienciaId}-${new Date().getTime()}`;

        // 1. Upload Blob
        this.actaService.subirActa(this.audienciaId, 'CONSTANCIA_ASISTENCIA_INVITACION', numeroActa, pdfBlob).subscribe({
            next: (res) => {
                console.log("Constancia subida:", res);

                // 2. Update Status
                const token = localStorage.getItem('token');
                const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

                // 🔹 ENVIAR DATOS PARA REPROGRAMACIÓN (Backend detectará fechaAudiencia y creará nueva)
                const payload = {
                    resultadoTipo: 'Inasistencias',
                    resultadoDetalle: 'Asistencia e invitacion para conciliar|' + JSON.stringify({
                        ...this.datosActa,
                        constanciaUrl: res.archivoUrl
                    }),
                    fechaAudiencia: this.datosActa.nuevaFecha,
                    horaAudiencia: this.datosActa.nuevaHora.length === 5 ? this.datosActa.nuevaHora + ':00' : this.datosActa.nuevaHora,
                    lugar: this.datosActa.lugarAudiencia
                };

                this.http.put(`${environment.apiUrl}/audiencias/${this.audienciaId}/resultado`, payload, { headers }).subscribe({
                    next: () => {
                        doc.save(`Formato_D_Constancia_${this.audiencia.solicitud?.numeroExpediente}.pdf`);
                        alert("✅ Proceso Finalizado. Se ha registrado la reprogramación y guardado la constancia.");
                        this.router.navigate(['/conciliador/mis-casos']);
                    },
                    error: (err) => alert("Error al finalizar: " + err.message)
                });
            },
            error: (err) => alert("Error al subir constancia: " + err.message)
        });
    }

    descargarPDF() {
        if (!this.datosActa.nuevaFecha || !this.datosActa.nuevaHora) {
            alert("Por favor ingrese la nueva fecha y hora de la audiencia.");
            return;
        }

        this.generarDocPDF().save(`Formato_D_Constancia_${this.audiencia.solicitud?.numeroExpediente}.pdf`);
    }

    descargarWord() {
        if (!this.datosActa.nuevaFecha || !this.datosActa.nuevaHora) {
            alert("Por favor ingrese la nueva fecha y hora de la audiencia.");
            return;
        }

        const expNum = this.audiencia.solicitud?.numeroExpediente || '_______';
        const hoy = new Date();
        const sol = this.audiencia.solicitud?.solicitante;
        const inv = this.audiencia.solicitud?.invitado;

        const asistioSol = this.audiencia.asistenciaSolicitante === 'Asistio';
        const asistioInv = this.audiencia.asistenciaInvitado === 'Asistio';
        let asistente = '';
        let ausente = '';

        if (asistioSol) asistente += `${sol?.nombres} ${sol?.apellidos} (Solicitante)`;
        if (asistioInv) asistente += `${inv?.nombres} ${inv?.apellidos} (Invitado)`;

        if (!asistioSol) ausente += `${sol?.nombres} ${sol?.apellidos} (Solicitante)`;
        if (!asistioInv) ausente += `${inv?.nombres} ${inv?.apellidos} (Invitado)`;


        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Formato D</title></head><body>";

        const content = `
            <div style="font-family: 'Times New Roman', serif; padding: 20px;">
                <p style="text-align: right; font-weight: bold;">FORMATO D</p>
                <h3 style="text-align: center; text-decoration: underline;">FORMATO TIPO DE CONSTANCIA DE ASISTENCIA E INVITACIÓN PARA CONCILIAR</h3>
                
                <p style="text-align: center;"><strong>CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"</strong><br>
                Autorizado su funcionamiento por Resolución ............... N° ______ - _______<br>
                Dirección y teléfono: ${this.datosActa.lugarAudiencia} | Tlf: 987654321 &nbsp;&nbsp;&nbsp; <strong>EXP. N° ${expNum}</strong></p>
                
                <h3 style="text-align: center; text-decoration: underline; margin-top: 20px;">CONSTANCIA DE ASISTENCIA E INVITACIÓN PARA CONCILIAR</h3>
                
                <p style="text-align: justify;">
                  En la ciudad de Lima, distrito de _______________ siendo las ${this.datosActa.horaVerificacion} horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()}, ante mi ${this.conciliadorNombre}, en mi calidad de Conciliador debidamente acreditado... presentó su solicitud de conciliación don (ña) ${sol?.nombres} ${sol?.apellidos}, a efectos de llegar a un acuerdo conciliatorio con don (ña) ${inv?.nombres} ${inv?.apellidos}, siendo la(s) materia(s) a Conciliar: ${this.datosActa.pretension}.
                </p>

                <br>
                <strong>ASISTENCIA DE UNA DE LAS PARTES:</strong>
                <p style="text-align: justify;">
                Siendo las ${this.datosActa.horaVerificacion} horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()} y luego de hacer los llamados respectivos solo se verificó la presencia de: ${asistente || 'NINGUNO'}.
                </p>

                <p style="text-align: justify;">
                Habiendo no asistido el (los) señor(a)(es): ${ausente || 'NINGUNO'}.
                </p>

                <br>
                <strong>SE SEÑALA NUEVA FECHA PARA LA REALIZACIÓN DE LA AUDIENCIA DE CONCILIACIÓN:</strong>
                <p style="text-align: justify;">
                De conformidad con lo señalado por la Ley de Conciliación N° 26872, se convoca a una nueva sesión para la realización de la audiencia de conciliación para el día <strong>${this.datosActa.nuevaFecha}</strong> a horas <strong>${this.datosActa.nuevaHora}</strong>, en las instalaciones del Centro de Conciliación ESPERANZA VIVA ubicado en ${this.datosActa.lugarAudiencia}, dándose por notificada la parte asistente.
                </p>

                <br><br><br><br><br>
                <table style="width: 100%; text-align: center;">
                    <tr>
                        <td style="width: 40%; border-top: 1px solid black;">
                            Firma y huella del Conciliador
                        </td>
                        <td style="width: 10%;"></td>
                        <td style="width: 40%; border-top: 1px solid black;">
                            ${asistente || 'Parte Asistente'}<br>
                            Firma de la Parte Asistente
                        </td>
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
        fileDownload.download = `Formato_D_Constancia_${expNum}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
    }

    obtenerNombreMes(fecha: Date): string {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[fecha.getMonth()];
    }
}
