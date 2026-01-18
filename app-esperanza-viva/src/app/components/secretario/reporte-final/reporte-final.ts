import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-reporte-final',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
    templateUrl: './reporte-final.html',
    styleUrls: ['./reporte-final.css']
})
export class ReporteFinal implements OnInit {
    secretarioNombre: string = 'Dr. Luis Alberto Ramirez';
    mes: string = '';
    anio: string = new Date().getFullYear().toString();

    // Stats
    materias: any[] = [];
    resultados: any[] = [];

    isLoading: boolean = false;
    rawSolicitudes: any[] = [];

    constructor(private http: HttpClient, private router: Router) { }

    ngOnInit(): void {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            const user = JSON.parse(userJson);
            this.secretarioNombre = user.nombreCompleto || this.secretarioNombre;
        }
        // Initialize with current month
        this.mes = (new Date().getMonth() + 1).toString();
        this.cargarDatos(); // Auto load current month
    }

    cargarDatos() {
        if (!this.mes || !this.anio) {
            alert('Por favor seleccione mes y año');
            return;
        }

        this.isLoading = true;
        this.http.get<any[]>('http://localhost:8080/api/solicitudes').subscribe({
            next: (data) => {
                // Filter by date
                this.rawSolicitudes = data.filter(s => {
                    const dateStr = s.fechaPresentacion || '';
                    const fecha = new Date(dateStr);
                    // Check valid date
                    if (isNaN(fecha.getTime())) return false;

                    const sMes = fecha.getMonth() + 1;
                    const sAnio = fecha.getFullYear();
                    return sMes.toString() === this.mes && sAnio.toString() === this.anio;
                });

                this.calcularEstadisticas();
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Error cargando reporte", err);
                this.isLoading = false;
                // Don't alert on auto-load if empty, but alert on manual click? 
                // Just keeping silent or simple log is better for UX start
            }
        });
    }

    calcularEstadisticas() {
        // 1. Materias Conciliables (Grouped by Civil vs Familia)
        let civilCount = 0;
        let familiaCount = 0;
        let laboralCount = 0;
        let otrosCount = 0;

        this.rawSolicitudes.forEach(s => {
            const mat = (s.materiaConciliable || '').toUpperCase();

            // Basic Keyword Heuristic
            if (mat.includes('FAMILIA') || mat.includes('ALIMENTOS') || mat.includes('TENENCIA') || mat.includes('VISITAS')) {
                familiaCount++;
            } else if (mat.includes('CIVIL') || mat.includes('DESALOJO') || mat.includes('DEUDA') || mat.includes('OBLIGACION') || mat.includes('INDEMNIZACION')) {
                civilCount++;
            } else if (mat.includes('LABORAL')) {
                laboralCount++;
            } else {
                otrosCount++;
            }
        });

        const total = this.rawSolicitudes.length || 1;

        this.materias = [
            { tipo: 'Civil (Desalojos, Deudas)', cantidad: civilCount, porcentaje: Math.round((civilCount / total) * 100) },
            { tipo: 'Familia (Alimentos, Tenencia)', cantidad: familiaCount, porcentaje: Math.round((familiaCount / total) * 100) }
        ];

        // Add others if significant
        if (laboralCount > 0) this.materias.push({ tipo: 'Laboral', cantidad: laboralCount, porcentaje: Math.round((laboralCount / total) * 100) });
        if (otrosCount > 0) this.materias.push({ tipo: 'Otros', cantidad: otrosCount, porcentaje: Math.round((otrosCount / total) * 100) });


        // 2. Resultados (Outcomes)
        const resultadoMap = new Map<string, number>();

        // Initialize standard outcomes with 0
        resultadoMap.set('Acuerdo Total', 0);
        resultadoMap.set('Acuerdo Parcial', 0);
        resultadoMap.set('Falta de Acuerdo', 0);
        resultadoMap.set('Inasistencia Una Parte', 0);
        resultadoMap.set('Inasistencia Ambas Partes', 0);

        this.rawSolicitudes.forEach(s => {
            // Priority: s.resultadoTipo (from Audiencia) -> Derived from State
            let tipo = s.resultadoTipo || '';

            // Normalize
            if (!tipo) {
                // Fallback Logic
                if (s.estado === 'FINALIZADA' || s.estado === 'APROBADA') tipo = 'Acuerdo Total'; // Assumption
                else if (s.estado === 'OBSERVADA') tipo = 'Pendiente Subsanación';
                else tipo = 'En Trámite';
            }

            // Clean up string matching
            if (tipo.toUpperCase().includes('TOTAL')) tipo = 'Acuerdo Total';
            else if (tipo.toUpperCase().includes('PARCIAL')) tipo = 'Acuerdo Parcial';
            else if (tipo.toUpperCase().includes('FALTA DE ACUERDO')) tipo = 'Falta de Acuerdo';
            else if (tipo.toUpperCase().includes('UNA PARTE')) tipo = 'Inasistencia Una Parte';
            else if (tipo.toUpperCase().includes('AMBAS PARTES')) tipo = 'Inasistencia Ambas Partes';

            resultadoMap.set(tipo, (resultadoMap.get(tipo) || 0) + 1);
        });

        // Convert map to array and filter out zeros if desired, or keep main ones
        this.resultados = [];
        resultadoMap.forEach((cant, tipo) => {
            if (cant > 0 || ['Acuerdo Total', 'Acuerdo Parcial', 'Falta de Acuerdo'].includes(tipo)) {
                this.resultados.push({ tipo, cantidad: cant });
            }
        });
    }

    generarHojaSumaria() {
        if (!this.rawSolicitudes || this.rawSolicitudes.length === 0) {
            alert('No hay datos para exportar en este periodo.');
            return;
        }

        const wb: XLSX.WorkBook = XLSX.utils.book_new();

        // --- SHEET 1: RESUMEN ESTADÍSTICO ---
        const resumenData = [
            ['REPORTE MENSUAL - CENTRO DE CONCILIACIÓN ESPERANZA VIVA'],
            [`Periodo: ${this.mes}/${this.anio}`],
            [`Generado por: ${this.secretarioNombre}`],
            [''],
            ['I. MATERIAS CONCILIABLES'],
            ['Materia', 'Cantidad', 'Porcentaje'],
            ...this.materias.map(m => [m.tipo, m.cantidad, `${m.porcentaje}%`]),
            [''],
            ['II. RESULTADOS DE ACTAS'],
            ['Resultado', 'Cantidad'],
            ...this.resultados.map(r => [r.tipo, r.cantidad])
        ];

        const wsResumen: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(resumenData);

        // Basic Column Widths
        wsResumen['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }];

        XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Estadístico');

        // --- SHEET 2: DETALLE DE CASOS ---
        // Flatten data for nice columns
        const detalleData = this.rawSolicitudes.map(s => {
            return {
                'N° Expediente': s.numeroExpediente,
                'Fecha Recepción': s.fechaPresentacion,
                'Solicitante': s.solicitanteNombre || 'N/A',
                'Invitado': s.invitadoNombre || 'N/A',
                'Apoderado': s.apoderadoNombre || 'N/A', // Added Apoderado
                'Materia': s.materiaConciliable,
                'Estado Actual': s.estado,
                'Resultado': s.resultadoTipo || 'En Trámite',
                'Conciliador': s.conciliadorNombre || 'No Asignado'
            };
        });

        const wsDetalle: XLSX.WorkSheet = XLSX.utils.json_to_sheet(detalleData);

        // Auto-width for detail columns (heuristic)
        const wscols = [
            { wch: 15 }, // Expediente
            { wch: 15 }, // Fecha
            { wch: 30 }, // Solicitante
            { wch: 30 }, // Invitado
            { wch: 30 }, // Apoderado
            { wch: 25 }, // Materia
            { wch: 15 }, // Estado
            { wch: 20 }, // Resultado
            { wch: 25 }, // Conciliador
        ];
        wsDetalle['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle de Casos');

        // Save File
        const fileName = `Hoja_Sumaria_${this.mes}_${this.anio}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    cerrarSesion() {
        localStorage.clear();
        this.router.navigate(['/consulta']);
    }
}
