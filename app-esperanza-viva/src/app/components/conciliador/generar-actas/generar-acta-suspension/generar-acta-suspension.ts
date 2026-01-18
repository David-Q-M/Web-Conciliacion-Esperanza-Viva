import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { ActaService } from '../../../../services/acta.service';

@Component({
    selector: 'app-generar-acta-suspension',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './generar-acta-suspension.html',
    styleUrls: ['./generar-acta-suspension.css']
})
export class GenerarActaSuspension implements OnInit {
    audienciaId: any;
    expediente: any = {};
    abogados: any[] = [];
    conciliadorNombre: string = '';

    // Conciliator details for PDF
    conciliadorDni: string = '';
    conciliadorRegistro: string = '';

    acta = {
        antecedentes: '',
        controversias: '',
        abogadoVerificadorId: null,
        // No clauses required for suspension
    };

    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,
        private router: Router,
        private actaService: ActaService
    ) { }

    ngOnInit(): void {
        const userJson = localStorage.getItem('currentUser');
        if (!userJson) {
            this.router.navigate(['/login-admin']);
            return;
        }
        const user = JSON.parse(userJson);
        this.conciliadorNombre = user.nombreCompleto;
        this.conciliadorDni = user.dni || '';
        this.conciliadorRegistro = user.nroRegistro || '';

        this.audienciaId = this.route.snapshot.paramMap.get('id');
        if (this.audienciaId) {
            this.cargarDatos();
            this.cargarAbogados();
        }
    }

    cargarDatos() {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.get<any>(`https://web-conciliacion-esperanza-viva-production.up.railway.app/api/audiencias/${this.audienciaId}`, { headers }).subscribe({
            next: (audiencia) => {
                if (audiencia.solicitud) {
                    this.expediente = audiencia.solicitud;
                    this.acta.antecedentes = audiencia.solicitud.hechos || '';
                } else {
                    console.warn("La audiencia no tiene solicitud vinculada directamente.");
                }
            },
            error: (err) => console.error("Error al obtener datos de la audiencia", err)
        });
    }

    cargarAbogados() {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.get<any[]>('https://web-conciliacion-esperanza-viva-production.up.railway.app/api/usuarios-sistema', { headers }).subscribe({
            next: (res) => {
                this.abogados = res.filter(u => u.rol === 'ABOGADO' && u.estado === 'ACTIVO');
            },
            error: (err) => console.error("Error al cargar abogados", err)
        });
    }

    generarDocPDF(): jsPDF {
        const doc = new jsPDF();
        const sol = this.expediente?.solicitante;
        const inv = this.expediente?.invitado;
        const expNum = this.expediente?.numeroExpediente || '_______';

        const centerText = (text: string, y: number, size: number = 10, font: string = 'normal') => {
            doc.setFont("times", font);
            doc.setFontSize(size);
            doc.text(text, 105, y, { align: "center" });
        };

        // --- HEADER ---
        centerText(`CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"`, 20, 10, 'bold');
        centerText("ACTA DE SUSPENSIÓN DE AUDIENCIA", 30, 10, 'bold');
        centerText(`EXPEDIENTE N° ${expNum}`, 40, 10, 'bold');

        // --- BODY ---
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        let yPos = 60;
        const hoy = new Date();

        const textoIntro = `En la ciudad de Lima, siendo las ____ horas del día ${hoy.getDate()} del mes de ${this.obtenerNombreMes(hoy)} del año ${hoy.getFullYear()}, ante mí ${this.conciliadorNombre}, identificado con DNI ${this.conciliadorDni}, conciliador extrajudicial con Registro N° ${this.conciliadorRegistro}, se dio inicio a la Audiencia de Conciliación con la asistencia de las partes:`;

        const printParagraph = (text: string) => {
            const split = doc.splitTextToSize(text, 170);
            doc.text(split, 20, yPos, { align: "justify", maxWidth: 170 });
            yPos += (split.length * 5) + 5;
        };

        printParagraph(textoIntro);

        // PARTES
        if (sol) {
            printParagraph(`SOLICITANTE: ${sol.nombres} ${sol.apellidos}, con DNI ${sol.dni}.`);
        }
        if (inv) {
            printParagraph(`INVITADO: ${inv.nombres} ${inv.apellidos}, con DNI ${inv.dni}.`);
        }

        yPos += 5;
        doc.setFont("times", "bold");
        doc.text("ANTECEDENTES:", 20, yPos);
        yPos += 6;
        doc.setFont("times", "normal");
        printParagraph(this.acta.antecedentes || "__________________");

        yPos += 5;
        doc.setFont("times", "bold");
        doc.text("CONTROVERSIA:", 20, yPos);
        yPos += 6;
        doc.setFont("times", "normal");
        printParagraph(this.acta.controversias || "__________________");

        yPos += 10;
        doc.setFont("times", "bold");
        doc.text("ACUERDO DE SUSPENSIÓN:", 20, yPos);
        yPos += 6;
        doc.setFont("times", "normal");
        printParagraph("Las partes acuerdan suspender la presente audiencia de conciliación por mutuo acuerdo, programándose la continuación de la misma para una nueva fecha que será debidamente notificada.");

        yPos += 20;

        // FIRMAS
        if (yPos > 240) { doc.addPage(); yPos = 40; }
        doc.setFontSize(10);

        doc.line(20, yPos, 80, yPos);
        doc.text("Firma del Conciliador", 50, yPos + 5, { align: "center" });

        doc.line(110, yPos, 170, yPos);
        doc.text("Firma del Solicitante", 140, yPos + 5, { align: "center" });

        yPos += 30;
        doc.line(110, yPos, 170, yPos);
        doc.text("Firma del Invitado", 140, yPos + 5, { align: "center" });

        return doc;
    }

    emitirActaFinal() {
        if (!this.acta.antecedentes || this.acta.antecedentes.trim().length < 10) {
            alert("Los antecedentes son obligatorios y deben ser detallados.");
            return;
        }

        if (!this.acta.controversias || this.acta.controversias.trim().length < 10) {
            alert("La descripción de las controversias es obligatoria.");
            return;
        }

        if (!this.acta.abogadoVerificadorId) {
            alert("Es obligatorio seleccionar un abogado verificador.");
            return;
        }

        const doc = this.generarDocPDF();
        const pdfBlob = doc.output('blob');
        const numeroActa = `ACTA-SUSPENSION-${this.audienciaId}-${new Date().getTime()}`;

        // 1. Upload Blob
        this.actaService.subirActa(this.audienciaId, 'SUSPENSION', numeroActa, pdfBlob).subscribe({
            next: (res) => {
                console.log("Acta Suspensión subida:", res);

                // 2. Update Status and Details
                const token = localStorage.getItem('token');
                const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

                const payload = {
                    resultadoTipo: 'Suspensión',
                    resultadoDetalle: JSON.stringify({
                        antecedentes: this.acta.antecedentes,
                        controversias: this.acta.controversias,
                        abogadoVerificadorId: this.acta.abogadoVerificadorId,
                        actaUrl: res.archivoUrl
                    })
                };

                this.http.put(`https://web-conciliacion-esperanza-viva-production.up.railway.app/api/audiencias/${this.audienciaId}/resultado`, payload, { headers }).subscribe({
                    next: () => {
                        doc.save(`Acta_Suspension_${this.expediente?.numeroExpediente}.pdf`);
                        alert("✅ Acta de Suspensión Emitida con éxito!");
                        this.router.navigate(['/conciliador/mis-casos']);
                    },
                    error: (err) => alert("Error al actualizar audiencia: " + err.message)
                });
            },
            error: (err) => alert("Error al subir acta: " + err.message)
        });
    }

    obtenerNombreMes(fecha: Date): string {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[fecha.getMonth()];
    }

    cerrarSesion() {
        localStorage.clear();
        this.router.navigate(['/login-admin']);
    }
}
