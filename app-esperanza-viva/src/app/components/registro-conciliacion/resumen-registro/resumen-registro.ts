import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-resumen-registro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen-registro.html',
  styleUrls: ['./resumen-registro.css']
})
export class ResumenRegistro implements OnInit {
  numeroExpediente: string | null = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Captura el número enviado desde la base de datos
    this.numeroExpediente = this.route.snapshot.paramMap.get('expediente');
  }

  volverAlInicio() {
    this.router.navigate(['/consulta']); // Vuelve a la Página 1
  }
}
