import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-generacion-acta-acuerdo_total',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './generacion-acta-acuerdo_total.html',
  styleUrls: ['./generacion-acta-acuerdo_total.css']
})
export class GeneracionActaAcuerdoTotal implements OnInit {
  audienciaId: any;
  conciliadorNombre: string = '';
  mostrarVistaPrevia: boolean = false;

  expediente: any = { numeroExpediente: '', solicitante: {}, invitado: {} };

  // Datos del acta según Wireframe 48
  acta = {
    ciudad: 'Lima',
    distrito: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    conciliadorDni: '',
    hechos: '',
    controversias: '',
    abogadoVerificador: ''
  };

  // Cláusulas dinámicas (WF 48)
  clausulas: any[] = [
    { titulo: 'PRIMERO', contenido: 'El invitado se compromete a pagar la suma de S/ 5000...' },
    { titulo: 'SEGUNDO', contenido: 'El pago se realizara en la cuenta BCP -----' }
  ];

  abogados: string[] = [];

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
      this.conciliadorNombre = user.nombreCompleto;
      // Intento de obtener DNI desde diferentes propiedades posibles
      this.acta.conciliadorDni = user.dni || user.numeroDocumento || user.documento || '';
    }
    this.audienciaId = this.route.snapshot.paramMap.get('id');
    if (this.audienciaId) this.cargarDatos();
    this.cargarAbogados();
  }

  cargarAbogados() {
    // Se asume que los "Abogados Verificadores" son los CONCILIADORES (o DIRECTORES) registrados
    // Si existe rol 'ABOGADO', cambiar 'CONCILIADOR' por 'ABOGADO'
    this.usuarioService.listarPorRol('CONCILIADOR').subscribe({
      next: (users) => {
        this.abogados = users.map(u => u.nombreCompleto);
      },
      error: (err) => console.error("Error al cargar abogados:", err)
    });
  }

  cargarDatos() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any>(`http://localhost:8080/api/audiencias/${this.audienciaId}`, { headers }).subscribe({
      next: (data) => {
        // Mapeo robusto de datos
        this.expediente = data.solicitud || {};

        // Formatear nombres completos para evitar errores de campos vacíos
        this.expediente.solicitanteNombreCompleto = (this.expediente.solicitante?.nombres || '') + ' ' + (this.expediente.solicitante?.apellidos || '');
        this.expediente.invitadoNombreCompleto = (this.expediente.invitado?.nombres || '') + ' ' + (this.expediente.invitado?.apellidos || '');

        // Precargar hechos y controversias
        this.acta.hechos = this.expediente.hechos || 'Sin hechos registrados';
        this.acta.controversias = this.expediente.pretension || this.expediente.controversia || 'Sin controversias registradas';
      }
    });
  }

  agregarClausula() {
    const nombres = ['TERCERO', 'CUARTO', 'QUINTO', 'SEXTO', 'SÉPTIMO', 'OCTAVO'];
    const siguiente = nombres[this.clausulas.length - 2] || 'SIGUIENTE';
    this.clausulas.push({ titulo: siguiente, contenido: '' });
  }

  toggleVistaPrevia() { this.mostrarVistaPrevia = !this.mostrarVistaPrevia; }

  emitirActaFinal() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const payload = {
      resultadoTipo: 'Acuerdo Total',
      resultadoDetalle: JSON.stringify(this.clausulas),
      abogadoVerificador: this.acta.abogadoVerificador
    };

    this.http.put(`http://localhost:8080/api/audiencias/${this.audienciaId}/resultado`, payload, { headers }).subscribe({
      next: () => {
        alert("Acta guardada exitosamente. Ahora puede descargar los documentos.");
        // Opcional: Podríamos activar una bandera para mostrar los botones de descarga si estuvieran ocultos
      },
      error: (err) => console.error("Error al guardar acta:", err)
    });
  }

  // 📄 WORD: Generación mediante HTML Blob (Formato G)
  descargarWord() {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>Acta de Conciliación</title></head><body>";

    const footer = "</body></html>";

    let clausulasHtml = '';
    this.clausulas.forEach(c => {
      clausulasHtml += `<p><strong>${c.titulo}:</strong> ${c.contenido}</p>`;
    });

    const body = `
      <div style="font-family: 'Times New Roman', serif; padding: 20px;">
        <p style="text-align: right; font-weight: bold;">FORMATO G</p>
        <h3 style="text-align: center; text-decoration: underline;">FORMATO TIPO DE ACTA DE CONCILIACIÓN CON ACUERDO TOTAL</h3>
        <h4 style="text-align: center;">(PERSONAS NATURALES)</h4>
        
        <br>
        <p style="text-align: center;"><strong>CENTRO DE CONCILIACIÓN ESPERANZA VIVA</strong><br>
        Autorizado su funcionamiento por Resolución ................ N° _______-_______<br>
        Dirección y teléfono: ..................................................................... EXP. N° ${this.expediente.numeroExpediente}</p>
        
        <br>
        <h3 style="text-align: center; text-decoration: underline;">ACTA DE CONCILIACIÓN N° .....................</h3>
        
        <p style="text-align: justify;">
          En la ciudad de ${this.acta.ciudad}, distrito de ${this.acta.distrito} siendo las ${this.acta.hora} horas del día ${new Date(this.acta.fecha).getDate() + 1} del mes de ${this.obtenerNombreMes(this.acta.fecha)} del año ${new Date(this.acta.fecha).getFullYear()}, 
          ante mi ${this.conciliadorNombre}, identificado con DNI ${this.acta.conciliadorDni} en mi calidad de Conciliador Extrajudicial...
          se presentaron con el objeto que les asista en la solución de su conflicto, la parte solicitante 
          <strong>${this.expediente.solicitanteNombreCompleto || '___________'}</strong> y la parte invitada <strong>${this.expediente.invitadoNombreCompleto || '___________'}</strong>.
        </p>

        <h4>HECHOS EXPUESTOS EN LA SOLICITUD:</h4>
        <p>${this.acta.hechos}</p>

        <h4>DESCRIPCIÓN DE LA(S) CONTROVERSIA(S):</h4>
        <p>${this.acta.controversias}</p>

        <h4 style="text-align: center; text-decoration: underline;">ACUERDOS DEL ACTA</h4>
        ${clausulasHtml}

        <br><br>
        <p><strong>VERIFICACIÓN DE LEGALIDAD:</strong> ${this.acta.abogadoVerificador || '__________________'}</p>
      </div>
    `;

    const sourceHTML = header + body + footer;
    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Acta_Acuerdo_Total_${this.expediente.numeroExpediente}.doc`;
    link.click();
  }

  // 📄 PDF: Generación usando jsPDF (Formato G)
  descargarPDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Helper to center text
    const centerText = (text: string, y: number) => {
      const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };

    doc.setFont("times", "bold"); doc.setFontSize(10);
    doc.text("FORMATO G", pageWidth - 30, 15);

    doc.setFontSize(11);
    centerText("FORMATO TIPO DE ACTA DE CONCILIACIÓN CON ACUERDO TOTAL", 25);
    centerText("(PERSONAS NATURALES)", 30);

    doc.setFont("times", "normal"); doc.setFontSize(10);
    centerText("CENTRO DE CONCILIACIÓN ESPERANZA VIVA", 40);
    centerText("Autorizado su funcionamiento por Resolución ................ N° _______-_______", 45);
    centerText(`Dirección y teléfono: ............................................... EXP. N° ${this.expediente.numeroExpediente}`, 50);

    doc.setFont("times", "bold"); doc.setFontSize(12);
    centerText("ACTA DE CONCILIACIÓN N° .....................", 65);

    const dia = new Date(this.acta.fecha).getDate() + 1; // Ajuste zona horaria simple
    const mes = this.obtenerNombreMes(this.acta.fecha);
    const anio = new Date(this.acta.fecha).getFullYear();

    doc.setFont("times", "normal"); doc.setFontSize(11);
    const bodyArgs = `En la ciudad de ${this.acta.ciudad}, distrito de ${this.acta.distrito} siendo las ${this.acta.hora} horas del día ${dia} del mes de ${mes} del año ${anio}, ante mi ${this.conciliadorNombre}, identificado con DNI ${this.acta.conciliadorDni} en mi calidad de Conciliador Extrajudicial debidamente autorizado por el Ministerio de Justicia con Registro N° ............... y registro de especialidad en asuntos de carácter familiar N° ..............., se presentaron con el objeto que les asista en la solución de su conflicto, la parte solicitante ${this.expediente.solicitanteNombreCompleto} y la parte invitada ${this.expediente.invitadoNombreCompleto}.`;

    const splitBody = doc.splitTextToSize(bodyArgs, 170);
    doc.text(splitBody, 20, 80);

    let yPos = 80 + (splitBody.length * 5) + 5;

    doc.setFont("times", "bold");
    doc.text("HECHOS EXPUESTOS EN LA SOLICITUD:", 20, yPos);
    yPos += 5;
    doc.setFont("times", "normal");
    const splitHechos = doc.splitTextToSize(this.acta.hechos, 170);
    doc.text(splitHechos, 20, yPos);
    yPos += (splitHechos.length * 5) + 5;

    doc.setFont("times", "bold");
    doc.text("DESCRIPCIÓN DE LA(S) CONTROVERSIA(S):", 20, yPos);
    yPos += 5;
    doc.setFont("times", "normal");
    const splitContro = doc.splitTextToSize(this.acta.controversias, 170);
    doc.text(splitContro, 20, yPos);
    yPos += (splitContro.length * 5) + 10;

    // Add pages if needed logic omitted for brevity, assuming generic fit or user will split.

    doc.setFont("times", "bold");
    centerText("ACUERDOS DEL ACTA", yPos);
    yPos += 10;

    this.clausulas.forEach(c => {
      doc.setFont("times", "bold");
      doc.text(`${c.titulo}:`, 20, yPos);
      doc.setFont("times", "normal");
      const splitContent = doc.splitTextToSize(c.contenido, 135);
      doc.text(splitContent, 55, yPos);
      yPos += (splitContent.length * 5) + 5;
    });

    // Verification
    yPos += 10;
    doc.setFont("times", "italic");
    doc.text(`Abogado Verificador: ${this.acta.abogadoVerificador || 'PENDIENTE'}`, 20, yPos);

    doc.save(`Acta_Acuerdo_Total_${this.expediente.numeroExpediente}.pdf`);
  }

  obtenerNombreMes(fechaStr: string): string {
    const fecha = new Date(fechaStr + 'T12:00:00');
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[fecha.getMonth()];
  }
}