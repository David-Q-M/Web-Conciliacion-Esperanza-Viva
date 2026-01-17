import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AudienciaService } from '../../../services/audiencia.service';

@Component({
  selector: 'app-agenda-conciliador',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './agenda.html',
  styleUrls: ['./agenda.css']
})
export class AgendaConciliador implements OnInit {
  conciliadorNombre: string = '';
  listaOriginal: any[] = [];
  listaMostrada: any[] = [];
  stats = { cerrados: 0, hoy: 0, proximos: 0 };
  filtroSeleccionado: 'todos' | 'cerrados' | 'hoy' | 'proximos' = 'todos';
  terminoBusqueda: string = '';
  isLoading: boolean = true;

  constructor(private audienciaService: AudienciaService, private router: Router) { }

  ngOnInit(): void {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
      this.router.navigate(['/login-admin']);
      return;
    }
    const user = JSON.parse(userJson);
    this.conciliadorNombre = user.nombreCompleto;
    // 🛡️ Cargamos los datos reales desde la base de datos
    this.cargarCasosAgenda(user.id);
  }

  cargarCasosAgenda(id: number) {
    this.isLoading = true;
    this.audienciaService.listarPorConciliador(id).subscribe({
      next: (res) => {
        this.listaOriginal = res;
        this.listaMostrada = res;

        // 📊 Cálculo dinámico de métricas para los cuadros superiores
        const hoy = new Date().toISOString().split('T')[0];

        // "Cerrados" lo tomaremos como audiencias pasadas (historial) o con resultado
        this.stats.cerrados = res.filter(a => a.fechaAudiencia < hoy || a.resultadoTipo).length;
        this.stats.hoy = res.filter(a => a.fechaAudiencia === hoy).length;
        this.stats.proximos = res.filter(a => a.fechaAudiencia > hoy).length;
        setTimeout(() => this.isLoading = false, 500);
      },
      error: (err) => {
        console.error("Error al conectar con la API de Agenda:", err);
        this.isLoading = false;
      }
    });
  }

  buscar() {
    const busq = this.terminoBusqueda.toLowerCase();
    this.listaMostrada = this.listaOriginal.filter(a =>
      a.solicitud?.numeroExpediente?.toLowerCase().includes(busq) ||
      a.solicitud?.solicitante?.nombres?.toLowerCase().includes(busq) ||
      a.solicitud?.invitado?.nombres?.toLowerCase().includes(busq)
    );
  }

  filtrarPorEstado(filtro: 'todos' | 'cerrados' | 'hoy' | 'proximos') {
    this.filtroSeleccionado = filtro;
    const hoy = new Date().toISOString().split('T')[0];

    // Primero reiniciamos la lista a la original
    let listaFiltrada = this.listaOriginal;

    if (filtro === 'hoy') {
      listaFiltrada = this.listaOriginal.filter(a => a.fechaAudiencia === hoy);
    } else if (filtro === 'proximos') {
      listaFiltrada = this.listaOriginal.filter(a => a.fechaAudiencia > hoy);
    } else if (filtro === 'cerrados') {
      listaFiltrada = this.listaOriginal.filter(a => a.fechaAudiencia < hoy || a.resultadoTipo);
    }

    this.listaMostrada = listaFiltrada;
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/consulta-expediente']);
  }
}