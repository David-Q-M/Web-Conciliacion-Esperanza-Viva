import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';

@Component({
  selector: 'app-exito-registro',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exito-registro.html',
  styleUrls: ['./exito-registro.css']
})
export class ExitoRegistro implements OnInit {
  expediente: any = null; 
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private solicitudService: SolicitudService
  ) {}

  ngOnInit(): void {
    // Obtenemos el número real generado en MariaDB
    const numeroBusqueda = this.route.snapshot.paramMap.get('expediente');
    
    if (numeroBusqueda) {
      this.solicitudService.obtenerExpediente(numeroBusqueda).subscribe({
        next: (data) => {
          this.expediente = data; // Guardamos los datos reales (solicitante, invitado, materia)
          this.cargando = false;
        },
        error: (err) => {
          console.error("Error al conectar con MariaDB", err);
          this.cargando = false; 
        }
      });
    }
  }
}