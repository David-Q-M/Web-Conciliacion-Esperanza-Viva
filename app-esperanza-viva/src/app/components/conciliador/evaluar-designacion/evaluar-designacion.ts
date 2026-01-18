import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SolicitudService } from '../../../services/solicitud.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-evaluar-designacion',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './evaluar-designacion.html',
  styleUrls: ['./evaluar-designacion.css']
})
export class EvaluarDesignacion implements OnInit {
  expediente: any = null;
  cargando: boolean = true;
  conciliadorNombre: string = '';

  constructor(
    private route: ActivatedRoute,
    private solicitudService: SolicitudService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
      this.router.navigate(['/login-admin']);
      return;
    }

    const user = JSON.parse(userJson);
    this.conciliadorNombre = user.nombreCompleto;

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarExpediente(Number(id));
    }
  }

  cargarExpediente(id: number) {
    this.solicitudService.obtenerPorId(id).subscribe({
      next: (res) => {
        this.expediente = res;
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al conectar con MariaDB:", err);
        this.router.navigate(['/conciliador/mis-casos']);
      }
    });
  }

  responder(aceptado: boolean) {
    // 🛡️ Estados sincronizados con el flujo legal (ASIGNADO -> DESIGNACION_ACEPTADA)
    const nuevoEstado = aceptado ? 'DESIGNACION_ACEPTADA' : 'ASIGNADO';
    const msg = aceptado ? 'Ha aceptado el caso con éxito.' : 'Ha declinado la designación.';

    this.solicitudService.actualizarEstado(this.expediente.id, nuevoEstado, msg).subscribe({
      next: () => {
        alert(msg);
        if (aceptado) {
          // Si acepta, va directo a Programar Audiencia (Wireframe 41)
          this.router.navigate(['/conciliador/programar-audiencia', this.expediente.id]);
        } else {
          // Si declina, vuelve a su bandeja
          this.router.navigate(['/conciliador/mis-casos']);
        }
      },
      error: (err) => alert("Error en el servidor al actualizar estado: " + err.message)
    });
  }

  generarPDF() {
    const doc = new jsPDF();

    // FORMATO B HEADER
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("FORMATO TIPO DE ESQUELA DE DESIGNACIÓN DEL CONCILIADOR", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"`, 105, 30, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Autorizado su funcionamiento por Resolución N° ......................", 105, 36, { align: "center" });
    doc.text("Dirección y teléfono: Av. Sol 450 - Cusco | Tlf: 987654321                         EXP. N° " + (this.expediente.numeroExpediente || 'S/N'), 105, 42, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("ESQUELA DE DESIGNACIÓN DE CONCILIADOR", 105, 55, { align: "center" });

    let bodyY = 70;
    doc.setFont("helvetica", "normal");
    doc.text("Señor/a", 20, bodyY);
    bodyY += 7;
    doc.text(`Conciliador(a) ${this.conciliadorNombre}`, 20, bodyY);
    doc.text("con Registro N° _______________(y", 130, bodyY);
    bodyY += 7;
    doc.text("registro de especialización según sea el caso) N° _______________________.", 20, bodyY);

    bodyY += 15;
    const p1 = `La presente tiene por objeto informarle que usted ha sido designado como Conciliador en el caso solicitado por ${this.expediente.solicitante?.nombres || '_______________________'} ${this.expediente.solicitante?.apellidos || ''} invitando a ${this.expediente.invitado?.nombres || '_______________________'} ${this.expediente.invitado?.apellidos || ''}`;
    const splitP1 = doc.splitTextToSize(p1, 170);
    doc.text(splitP1, 20, bodyY);

    bodyY += (splitP1.length * 5) + 10;

    const p2 = "Para lo cual, de haber algún impedimento deberá abstenerse de actuar en la conciliación, poniendo en conocimiento las circunstancias que lo afecte, en el día de recibida la presente designación.";
    const splitP2 = doc.splitTextToSize(p2, 170);
    doc.text(splitP2, 20, bodyY);

    bodyY += (splitP2.length * 5) + 10;

    const p3 = `El expediente del caso es el número ${this.expediente.numeroExpediente || '____________'} para que usted lo pueda revisar y encontrar en el archivo del Centro de Conciliación, siendo la(s) materia(s) a conciliar: ${this.expediente.materiaConciliable || '__________________________________'}`;
    const splitP3 = doc.splitTextToSize(p3, 170);
    doc.text(splitP3, 20, bodyY);

    bodyY += 40;
    doc.text(`Lima, ______ de ______________ de ________.`, 20, bodyY);

    bodyY += 30;
    doc.line(110, bodyY, 190, bodyY);
    doc.text("Firma y sello del Director del Centro", 150, bodyY + 5, { align: "center" });

    doc.save("Formato_B_Esquela.pdf");
  }

  generarWord() {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Formato B</title></head><body>";

    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <p style="text-align: right; font-weight: bold;">FORMATO B</p>
            <h3 style="text-align: center; text-decoration: underline;">FORMATO TIPO DE ESQUELA DE DESIGNACIÓN DEL CONCILIADOR</h3>
            <p style="text-align: center;"><strong>CENTRO DE CONCILIACIÓN "ESPERANZA VIVA"</strong><br>
            Autorizado su funcionamiento por Resolución ............... N° ______ - _______<br>
            Dirección y teléfono: Av. Sol 450 - Cusco | Tlf: 987654321 &nbsp;&nbsp;&nbsp; <strong>EXP. N° ${this.expediente.numeroExpediente || 'S/N'}</strong></p>
            
            <h3 style="text-align: center; text-decoration: underline; margin-top: 30px;">ESQUELA DE DESIGNACIÓN DE CONCILIADOR</h3>
            
            <br>
            <p>Señor/a<br>
            Conciliador(a) <strong>${this.conciliadorNombre}</strong> con Registro N° _______________(y registro de especialización según sea el caso) N° _______________________.</p>
            
            <p>La presente tiene por objeto informarle que usted ha sido designado como Conciliador en el caso solicitado por <strong>${this.expediente.solicitante?.nombres} ${this.expediente.solicitante?.apellidos}</strong> invitando a <strong>${this.expediente.invitado?.nombres} ${this.expediente.invitado?.apellidos}</strong></p>
            
            <p>Para lo cual, de haber algún impedimento deberá abstenerse de actuar en la conciliación, poniendo en conocimiento las circunstancias que lo afecte, en el día de recibida la presente designación.</p>
            
            <p>El expediente del caso es el número <strong>${this.expediente.numeroExpediente}</strong> para que usted lo pueda revisar y encontrar en el archivo del Centro de Conciliación, siendo la(s) materia(s) a conciliar: <strong>${this.expediente.materiaConciliable}</strong></p>
            
            <br><br><br>
            <p>Lima, ______ de ______________ de ________.</p>
            
            <br><br><br><br>
            <p style="text-align: right;">____________________________________<br>Firma y sello del Director del Centro</p>
        </div>
    `;

    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'Formato_B_Esquela.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }

}
