import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { jsPDF } from 'jspdf';
import { ActaService } from '../../../../services/acta.service';

@Component({
    selector: 'app-generacion-acta-inasistencia-ambas-partes',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
    templateUrl: './generacion-acta-inasistencia-ambas-partes.html',
    styleUrls: ['./generacion-acta-inasistencia-ambas-partes.css']
})
export class GeneracionActaInasistenciaAmbasPartes implements OnInit {
    audienciaId: any;
    conciliadorNombre: string = '';
    conciliadorDni: string = '';
    conciliadorRegistro: string = '';
    audiencia: any = null;
    mostrarVistaPrevia: boolean = false;

    // Form Data
    datosActa = {
        hechos: '',
        controversia: '',
        fechaPrimeraCitacion: '',
        horaPrimeraCitacion: '10:00',
        fechaSegundaCitacion: '',
        horaSegundaCitacion: '10:00',
        solicitanteDireccion: '',
        invitadoDireccion: '',
        lugarAudiencia: 'Av. Sol 450 - Cusco',
        horaVerificacion: ''
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
            const user = JSON.parse(userJson);
            this.conciliadorNombre = user.nombreCompleto;
            this.conciliadorDni = user.dni || '____________';
            this.conciliadorRegistro = user.nroRegistro || '____________';
        }
        this.audienciaId = this.route.snapshot.paramMap.get('id');
        if (this.audienciaId) {
            this.cargarDatos();
        }
    }

    cargarDatos() {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.get<any>(`https://web-conciliacion-esperanza-viva-production.up.railway.app/api/audiencias/${this.audienciaId}`, { headers }).subscribe({
            next: (data) => {
                this.audiencia = data;
                // Pre-fill
                this.datosActa.hechos = this.audiencia.solicitud?.hechos || '';
                this.datosActa.controversia = this.audiencia.solicitud?.materiaConciliable || '';

                // Address pre-fill
                this.datosActa.solicitanteDireccion = this.audiencia.solicitud?.solicitante?.domicilio || '';
                this.datosActa.invitadoDireccion = this.audiencia.solicitud?.invitado?.domicilio || '';

                // Set default dates if available, or current
                this.datosActa.fechaPrimeraCitacion = this.audiencia.fecha || new Date().toISOString().split('T')[0];
                this.datosActa.fechaSegundaCitacion = new Date().toISOString().split('T')[0];
                this.datosActa.horaVerificacion = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                // Force status for display in this component context (Both absent)
                this.audiencia.asistenciaSolicitante = 'Falto';
                this.audiencia.asistenciaInvitado = 'Falto';
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

        doc.setFont("times", "bold");
        doc.setFontSize(10);
        doc.text("FORMATO Ñ", 180, 15);
        doc.setFontSize(11);
        doc.text("FORMATO TIPO DE ACTA DE CONCILIACIÓN POR INASISTENCIA DE AMBAS PARTES", 105, 25, { align: "center" });
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
        doc.line(70, 66, 140, 66);

        doc.setFont("times", "normal");
        doc.setFontSize(11);
        let yPos = 80;

        const hoy = new Date();
        const textoIntro = `En la ciudad de Lima, distrito de _______________ siendo las ____ horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()}, ante mi ${this.conciliadorNombre}, identificado con DNI ${this.conciliadorDni} en mi calidad de Conciliador Extrajudicial debidamente autorizado por el Ministerio de Justicia con Registro N° ${this.conciliadorRegistro}, se presentaron con el objeto que les asista en la solución de su conflicto, la parte solicitante: ${sol?.nombres} ${sol?.apellidos}, identificado con DNI ${sol?.dni || '_________'}, con domicilio en ${this.datosActa.solicitanteDireccion || sol?.domicilio || '______________'}, y la parte invitada: ${inv?.nombres} ${inv?.apellidos}, identificado con DNI ${inv?.dni || '_________'}, con domicilio en ${this.datosActa.invitadoDireccion || inv?.domicilio || '______________'}, con el objeto de que les asista en la solución de su conflicto.`;

        const splitIntro = doc.splitTextToSize(textoIntro, 170);
        doc.text(splitIntro, 20, yPos);
        yPos += (splitIntro.length * 5) + 5;

        doc.setFont("times", "bold");
        doc.text("INASISTENCIA DE LAS PARTES:", 20, yPos);
        yPos += 8;

        doc.setFont("times", "normal");
        const textoInasistencia = `No habiendo asistido ninguna de las partes a la Audiencia de Conciliación convocada, se da por concluida la misma y el procedimiento de conciliación.`;

        const splitInasistencia = doc.splitTextToSize(textoInasistencia, 170);
        doc.text(splitInasistencia, 20, yPos);
        yPos += (splitInasistencia.length * 5) + 5;

        const textoRazon = `Por esta razón se extiende la presente Acta N° ..........., dejando expresa constancia que la conciliación no puede realizarse por este hecho.`;
        const splitRazon = doc.splitTextToSize(textoRazon, 170);
        doc.text(splitRazon, 20, yPos);
        yPos += (splitRazon.length * 5) + 8;

        doc.setFont("times", "bold");
        doc.text("HECHOS EXPUESTOS EN LA SOLICITUD:", 20, yPos);
        yPos += 8;
        doc.setFont("times", "normal");
        const hechos = this.datosActa.hechos || "(De adjuntarse la solicitud está formará parte integrante del acta.)";
        const splitHechos = doc.splitTextToSize(hechos, 170);
        doc.text(splitHechos, 20, yPos);
        yPos += (splitHechos.length * 5) + 8;

        doc.setFont("times", "normal");
        doc.text("(De adjuntarse la solicitud está formará parte integrante del acta.)", 20, yPos);
        yPos += 8;

        doc.setFont("times", "bold");
        doc.text("DESCRIPCIÓN DE LA (S) CONTROVERSIA (S) SOBRE LA(S) QUE SE PRETENDÍA(N) CONCILIAR:", 20, yPos);
        yPos += 8;
        doc.setFont("times", "normal");
        const contro = this.datosActa.controversia || "______________________________________________________";
        const splitContro = doc.splitTextToSize(contro, 170);
        doc.text(splitContro, 20, yPos);
        yPos += (splitContro.length * 5) + 20;

        if (yPos > 250) {
            doc.addPage();
            yPos = 40;
        } else {
            yPos = 260; // Force to bottom
        }

        doc.line(70, yPos, 140, yPos); // Center line
        doc.setFontSize(10);
        doc.text("Firma y huella del Conciliador", 105, yPos + 5, { align: "center" });

        return doc;
    }

    finalizarYDescargar() {
        const doc = this.generarDocPDF();
        const pdfBlob = doc.output('blob');
        const numeroActa = `ACTA-INASISTENCIA-AMBAS-${this.audienciaId}-${new Date().getTime()}`;

        // 1. Upload Blob
        this.actaService.subirActa(this.audienciaId, 'INASISTENCIA_AMBAS_PARTES', numeroActa, pdfBlob).subscribe({
            next: (res) => {
                console.log("Acta Inasistencia Ambas Parte subida:", res);

                // 2. Update Status
                const token = localStorage.getItem('token');
                const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
                const payload = {
                    resultadoTipo: 'Inasistencia de ambas partes',
                    resultadoDetalle: JSON.stringify({
                        ...this.datosActa,
                        actaUrl: res.archivoUrl
                    })
                };

                this.http.put(`https://web-conciliacion-esperanza-viva-production.up.railway.app/api/audiencias/${this.audienciaId}/resultado`, payload, { headers }).subscribe({
                    next: () => {
                        doc.save(`Formato_Inasistencia_Ambas_${this.audiencia.solicitud?.numeroExpediente}.pdf`);
                        alert("✅ Proceso Finalizado. Acta guardada en base de datos.");
                        this.router.navigate(['/conciliador/mis-casos']);
                    },
                    error: (err) => alert("Error al actualizar estado: " + err.message)
                });
            },
            error: (err) => alert("Error al subir acta: " + err.message)
        });
    }

    descargarPDF() {
        this.generarDocPDF().save(`Formato_Inasistencia_Ambas_${this.audiencia.solicitud?.numeroExpediente}.pdf`);
    }

    descargarWord() {
        // ... (Keep existing Word generation logic as is, if needed)
        const expNum = this.audiencia.solicitud?.numeroExpediente || '_______';
        const hoy = new Date();
        const sol = this.audiencia.solicitud?.solicitante;
        const inv = this.audiencia.solicitud?.invitado;

        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Formato Ñ</title></head><body>";

        const content = `
            <div style="font-family: 'Times New Roman', serif; padding: 20px;">
                <p style="text-align: right; font-weight: bold;">FORMATO Ñ</p>
                <h3 style="text-align: center; text-decoration: underline;">FORMATO TIPO DE ACTA DE CONCILIACIÓN POR INASISTENCIA DE AMBAS PARTES (PERSONAS NATURALES)</h3>

                <p style="text-align: center;"><strong>CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"</strong><br>
                Autorizado su funcionamiento por Resolución ............... N° ______ - _______<br>
                Dirección y teléfono: ${this.datosActa.lugarAudiencia} | Tlf: 987654321 &nbsp;&nbsp;&nbsp; <strong>EXP. N° ${expNum}</strong></p>
                
                <h3 style="text-align: center; text-decoration: underline; margin-top: 20px;">ACTA DE CONCILIACIÓN N° .........</h3>
                
                <p style="text-align: justify;">
                  En la ciudad de Lima, distrito de _______________ siendo las ____ horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()}, ante mi ${this.conciliadorNombre}, identificado con DNI ${this.conciliadorDni} en mi calidad de Conciliador Extrajudicial debidamente autorizado por el Ministerio de Justicia con Registro N° ${this.conciliadorRegistro}, se presentaron con el objeto que les asista en la solución de su conflicto, la parte solicitante: ${sol?.nombres} ${sol?.apellidos}, identificado con DNI ${sol?.dni || '_________'}, con domicilio en ${this.datosActa.solicitanteDireccion || sol?.domicilio || '______________'}, y la parte invitada: ${inv?.nombres} ${inv?.apellidos}, identificado con DNI ${inv?.dni || '_________'}, con domicilio en ${this.datosActa.invitadoDireccion || inv?.domicilio || '______________'}, con el objeto de que les asista en la solución de su conflicto.
                </p>

                <br>
                <strong>INASISTENCIA DE LAS PARTES:</strong>
                <p style="text-align: justify;">
                No habiendo asistido ninguna de las partes a la Audiencia de Conciliación convocada, se da por concluida la misma y el procedimiento de conciliación.
                </p>

                <p style="text-align: justify;">
                Por esta razón se extiende la presente <strong>Acta N° ...........</strong>, dejando expresa constancia que la conciliación no puede realizarse por este hecho.
                </p>

                <br>
                <strong>HECHOS EXPUESTOS EN LA SOLICITUD:</strong>
                <p style="text-align: justify;">${this.datosActa.hechos || '__________________________________________'}</p>
                <p>(De adjuntarse la solicitud está formará parte integrante del acta.)</p>

                <br>
                <strong>DESCRIPCIÓN DE LA (S) CONTROVERSIA (S) SOBRE LA(S) QUE SE PRETENDÍA(N) CONCILIAR:</strong>
                <p style="text-align: justify;">${this.datosActa.controversia || '__________________________________________'}</p>

                <br><br><br><br><br>
                <table style="width: 100%; text-align: center;">
                    <tr>
                        <td style="width: 30%;"></td>
                        <td style="width: 40%; border-top: 1px solid black;">
                            Firma y huella del Conciliador
                        </td>
                         <td style="width: 30%;"></td>
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
        fileDownload.download = `Formato_Inasistencia_Ambas_${expNum}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
    }

    obtenerNombreMes(fecha: Date): string {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[fecha.getMonth()];
    }
}
