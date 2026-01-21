import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

// EXCELJS & FILE-SAVER
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

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
        this.mes = (new Date().getMonth() + 1).toString();
        this.cargarDatos();
    }

    cargarDatos() {
        if (!this.mes || !this.anio) {
            alert('Por favor seleccione mes y año');
            return;
        }
        this.isLoading = true;
        this.http.get<any[]>(`${environment.apiUrl}/solicitudes`).subscribe({
            next: (data) => {
                this.rawSolicitudes = data.filter(s => {
                    const dateStr = s.fechaPresentacion || '';
                    const fecha = new Date(dateStr);
                    if (isNaN(fecha.getTime())) return false;
                    return (fecha.getMonth() + 1).toString() === this.mes && fecha.getFullYear().toString() === this.anio;
                });
                this.calcularEstadisticas();
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Error cargando reporte", err);
                this.isLoading = false;
            }
        });
    }

    calcularEstadisticas() {
        let civilCount = 0;
        let familiaCount = 0;
        const total = this.rawSolicitudes.length || 1;

        this.rawSolicitudes.forEach(s => {
            const mat = (s.materiaConciliable || '').toUpperCase();
            if (mat.includes('FAMILIA') || mat.includes('ALIMENTOS')) familiaCount++;
            else civilCount++;
        });

        this.materias = [
            { tipo: 'Civil', cantidad: civilCount, porcentaje: Math.round((civilCount / total) * 100) },
            { tipo: 'Familia', cantidad: familiaCount, porcentaje: Math.round((familiaCount / total) * 100) }
        ];
    }

    async generarHojaSumaria() {
        if (!this.rawSolicitudes || this.rawSolicitudes.length === 0) {
            alert('No hay datos para exportar en este periodo.');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const datos = this.calcularMatricesDatos();

        await this.construirHoja(workbook, "Hoja Sumaria", "HOJA SUMARIA DEL SERVICIO CONCILIATORIO PRIVADO", datos);
        await this.construirHoja(workbook, "Anexo", "HOJA SUMARIA DEL SERVICIO CONCILIATORIO PRIVADO - ANEXO", datos);

        const buffer = await workbook.xlsx.writeBuffer();
        const fileName = `Hoja_Sumaria_${this.mes}_${this.anio}.xlsx`;
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        FileSaver.saveAs(blob, fileName);
    }

    private calcularMatricesDatos() {
        const filasCivil = [
            'Convocatoria a Junta o Asamblea (*)', 'Desalojo', 'Resolución Contractual', 'División y Partición de Bienes',
            'Incumplimiento de Contrato', 'Indemnización', 'Interdicto (Derechos Reales)', 'Oblig. de dar, Hacer, No Hacer (1)',
            'Oblig. de dar Suma de Dinero', 'Otorgamiento de Escritura Pública', 'Rectificación de Áreas', 'Reivindicación',
            'Ofrecimiento de Pago (2)', 'OTROS (Anexo 1)'
        ];
        const filasFamilia = [
            'Alimentos (3)', 'Régimen de Visitas', 'Tenencia', 'Alimentos, Régimen de Visitas, Tenencia (4)',
            'Gastos de Embarazo', 'Liquidac. Soc. Gananciales (5)', 'OTROS (Anexo 1)'
        ];
        const filasContrataciones = [
            'Ampliación de plazo', 'Conformidad de obra o servicio', 'Liquidación Contrato', 'Pagos',
            'Recepción y/o conformidad', 'Resolución de Contrato', 'Valorizaciones', 'Defectos o Vicios ocultos', 'OTROS (Anexo 1)'
        ];

        const matrizCivil = Array(filasCivil.length).fill(0).map(() => Array(16).fill(0));
        const matrizFamilia = Array(filasFamilia.length).fill(0).map(() => Array(16).fill(0));
        const matrizContrataciones = Array(filasContrataciones.length).fill(0).map(() => Array(16).fill(0));

        this.rawSolicitudes.forEach(s => {
            const materia = (s.subMateria || s.materiaConciliable || '').toUpperCase();
            const resultado = (s.resultadoTipo || '').toUpperCase();
            const estado = (s.estado || '').toUpperCase();
            const modalidad = (s.modalidad || 'PRESENCIAL').toUpperCase();

            let matrizDestino = matrizCivil;
            let indiceFila = filasCivil.length - 1;

            if (materia.includes('ALIMENTOS') && materia.includes('VISITAS')) indiceFila = 3;
            else if (materia.includes('ALIMENTOS')) { matrizDestino = matrizFamilia; indiceFila = 0; }
            else if (materia.includes('VISITAS')) { matrizDestino = matrizFamilia; indiceFila = 1; }
            else if (materia.includes('TENENCIA')) { matrizDestino = matrizFamilia; indiceFila = 2; }
            else if (materia.includes('EMBARAZO')) { matrizDestino = matrizFamilia; indiceFila = 4; }
            else if (materia.includes('GANANCIALES')) { matrizDestino = matrizFamilia; indiceFila = 5; }
            else if (materia.includes('FAMILIA')) { matrizDestino = matrizFamilia; indiceFila = filasFamilia.length - 1; }
            else if (materia.includes('CONTRATACIONES')) { matrizDestino = matrizContrataciones; indiceFila = filasContrataciones.length - 1; }
            else {
                if (materia.includes('DESALOJO')) indiceFila = 1;
                else if (materia.includes('RESOLUCION') || materia.includes('RESOLUCIÓN')) indiceFila = 2;
                else if (materia.includes('DIVISION') || materia.includes('PARTICION')) indiceFila = 3;
                else if (materia.includes('INCUMPLIMIENTO')) indiceFila = 4;
                else if (materia.includes('INDEMNIZACION')) indiceFila = 5;
                else if (materia.includes('INTERDICTO')) indiceFila = 6;
                else if (materia.includes('HACER') || materia.includes('DAR')) indiceFila = 7;
                else if (materia.includes('SUMA DE DINERO')) indiceFila = 8;
                else if (materia.includes('ESCRITURA')) indiceFila = 9;
                else if (materia.includes('RECTIFICACION')) indiceFila = 10;
                else if (materia.includes('REIVINDICACION')) indiceFila = 11;
                else if (materia.includes('OFRECIMIENTO')) indiceFila = 12;
            }

            const isVirtual = (modalidad.includes('VIRTUAL') || modalidad.includes('ELECTRONICO'));

            if (isVirtual) matrizDestino[indiceFila][1]++;
            else matrizDestino[indiceFila][0]++;

            let isConcluido = ['FINALIZADA', 'CONCILIADA', 'CERRADO', 'CONCLUIDO'].includes(estado);

            if (isConcluido) {
                let col = -1;
                if (resultado.includes('TOTAL')) col = 5;
                else if (resultado.includes('PARCIAL')) col = 6;
                else if (resultado.includes('FALTA DE ACUERDO') || resultado.includes('NO ACUERDO')) col = 7;
                else if (resultado.includes('UNA PARTE')) col = 9;
                else if (resultado.includes('AMBAS PARTES')) col = 10;
                else if (resultado.includes('MOTIVADA')) col = 11;
                else col = 12;

                if (col !== -1) {
                    matrizDestino[indiceFila][col]++;
                    matrizDestino[indiceFila][15]++;
                    if (isVirtual) matrizDestino[indiceFila][14]++;
                    else matrizDestino[indiceFila][13]++;
                }
            } else {
                matrizDestino[indiceFila][4]++;
            }
        });

        return { filasCivil, filasFamilia, filasContrataciones, matrizCivil, matrizFamilia, matrizContrataciones };
    }

    private async construirHoja(workbook: ExcelJS.Workbook, nombreHoja: string, tituloTexto: string, datos: any) {
        const ws = workbook.addWorksheet(nombreHoja, {
            pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
        });

        ws.columns = [
            { width: 40 },
            { width: 12 }, { width: 12 },
            { width: 12 }, { width: 12 },
            { width: 10 },
            { width: 5 }, { width: 5 }, { width: 5 }, { width: 5 }, { width: 5 }, { width: 5 }, { width: 5 }, { width: 5 },
            { width: 12 }, { width: 12 },
            { width: 10 }
        ];

        ws.mergeCells('A1:Q1');
        const titleCell = ws.getCell('A1');
        titleCell.value = tituloTexto;
        titleCell.font = { bold: true, size: 12, name: 'Arial' };
        titleCell.alignment = { horizontal: 'center' };

        ws.getCell('A3').value = 'NOMBRE DEL CENTRO DE CONCILIACIÓN';
        ws.getCell('A3').font = { bold: true, size: 8 };

        ws.mergeCells('E3:Q4');
        const centroCell = ws.getCell('E3');
        centroCell.value = 'CENTRO DE CONCILIACIÓN EXTRAJUDICIAL "ESPERANZA VIVA"';
        centroCell.alignment = { horizontal: 'center', vertical: 'middle' };
        centroCell.font = { bold: true, size: 14 };

        // Explicit Border Type
        const borderStyle: Partial<ExcelJS.Borders> = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        centroCell.border = borderStyle;

        const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
        const row6 = ws.getRow(6);
        row6.getCell(4).value = 'AÑO';
        row6.getCell(5).value = this.anio;
        row6.getCell(5).border = borderStyle;
        row6.getCell(5).alignment = { horizontal: 'center' };

        row6.getCell(7).value = 'PERIODO';
        row6.getCell(8).value = meses[parseInt(this.mes) - 1] || this.mes;

        ws.mergeCells('H6:I6'); // Combinar para que quepa el mes (FIXED)
        const mesCell = row6.getCell(8);
        mesCell.border = borderStyle;
        mesCell.alignment = { horizontal: 'center' };

        this.crearCabeceraTabla(ws);

        let currentRow = 10;
        currentRow = this.agregarSeccion(ws, currentRow, 'CIVIL', datos.filasCivil, datos.matrizCivil);
        currentRow = this.agregarSeccion(ws, currentRow, 'FAMILIA', datos.filasFamilia, datos.matrizFamilia);
        currentRow = this.agregarSeccion(ws, currentRow, 'CONTRATACIONES DEL ESTADO', datos.filasContrataciones, datos.matrizContrataciones);

        const totalRow = ws.getRow(currentRow);
        totalRow.getCell(1).value = 'TOTAL GENERAL';
        totalRow.getCell(1).font = { bold: true };
        totalRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9D9D9' } };

        const sumMatrices = (c: number) => {
            return datos.matrizCivil.reduce((a: any, b: any) => a + b[c], 0) +
                datos.matrizFamilia.reduce((a: any, b: any) => a + b[c], 0) +
                datos.matrizContrataciones.reduce((a: any, b: any) => a + b[c], 0);
        }

        for (let c = 0; c < 16; c++) {
            const val = sumMatrices(c);
            const cell = totalRow.getCell(c + 2);
            cell.value = val;
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center' };
            cell.border = borderStyle;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9D9D9' } };
        }
        totalRow.getCell(1).border = borderStyle;

        let f = currentRow + 2;
        ws.getCell(`A${f}`).value = '(1) Obligación de dar no incluye sumas de dinero';
        ws.getCell(`H${f}`).value = '(4) Cuando se concilie las 03 materias.';
        f++;
        ws.getCell(`A${f}`).value = '(2) Incluye pago alquileres y otras deudas dinerarias';
        ws.getCell(`H${f}`).value = '(5) en matrimonio o unión de hecho';
        f++;
        ws.getCell(`A${f}`).value = '(3) Fijación de pensión, aumento, reducción...';

        f += 2;
        ws.getCell(`A${f}`).value = 'A.T. Acuerdo Total'; ws.getCell(`C${f}`).value = 'F.A. Falta de Acuerdo'; ws.getCell(`H${f}`).value = 'I.A.P. Inasistencia de Ambas Partes';
        f++;
        ws.getCell(`A${f}`).value = 'A.P. Acuerdo Parcial'; ws.getCell(`C${f}`).value = 'I.U.P. Inasistencia de una Parte'; ws.getCell(`H${f}`).value = 'D.M.C. Decisión Motivada del Conciliador';

        f += 5;
        ws.mergeCells(`G${f}:M${f}`);
        const firma = ws.getCell(`G${f}`);
        firma.value = 'FIRMA Y SELLO DEL DIRECTOR DEL CENTRO';
        firma.border = { top: { style: 'thin' } };
        firma.alignment = { horizontal: 'center' };
    }

    private crearCabeceraTabla(ws: ExcelJS.Worksheet) {
        const gray = 'F2F2F2';
        // TS Correct Typing for Border
        const border: Partial<ExcelJS.Borders> = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        const setStyle = (cell: string, val: string) => {
            const c = ws.getCell(cell);
            c.value = val;
            // TS Correct Typing for Fill
            const fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: gray } };
            c.fill = fill;
            c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            c.border = border;
            c.font = { bold: true, size: 8 };
        };

        ws.mergeCells('A7:A9'); setStyle('A7', 'MATERIAS');
        ws.mergeCells('B7:C7'); setStyle('B7', 'PROCEDIMIENTOS INICIADOS');
        ws.mergeCells('B8:B9'); setStyle('B8', 'PRESENCIAL');
        ws.mergeCells('C8:C9'); setStyle('C8', 'MEDIOS\nELECTRONICOS');

        ws.mergeCells('D7:D9'); setStyle('D7', 'CONVERTIDOS DE\nPRESENCIAL A\nELECTRONICO');
        ws.mergeCells('E7:E9'); setStyle('E7', 'CONVERTIDOS DE\nELECTRONICOS A\nPRESENCIAL');
        ws.mergeCells('F7:F9'); setStyle('F7', 'EN\nTRAMITE');

        ws.mergeCells('G7:N7'); setStyle('G7', 'CONCLUIDOS');
        ws.mergeCells('G8:G9'); setStyle('G8', 'A.T.');
        ws.mergeCells('H8:H9'); setStyle('H8', 'A.P.');
        ws.mergeCells('I8:I9'); setStyle('I8', 'F.A.');

        ws.mergeCells('J8:K8'); setStyle('J8', 'I.U.P.');
        setStyle('J9', 'Solicitante');
        setStyle('K9', 'Invitado');

        ws.mergeCells('L8:L9'); setStyle('L8', 'I.A.P.');
        ws.mergeCells('M8:M9'); setStyle('M8', 'D.M.C.');
        ws.mergeCells('N8:N9'); setStyle('N8', 'C.I.');

        ws.mergeCells('O7:P7'); setStyle('O7', 'MODALIDAD QUE CONCLUYE');
        ws.mergeCells('O8:O9'); setStyle('O8', 'PRESENCIAL');
        ws.mergeCells('P8:P9'); setStyle('P8', 'MEDIOS\nELECTRONICOS');

        ws.mergeCells('Q7:Q9'); setStyle('Q7', 'TOTAL\nCONCLUIDOS');
    }

    private agregarSeccion(ws: ExcelJS.Worksheet, startRow: number, titulo: string, labels: string[], dataMatrix: number[][]): number {
        const border: Partial<ExcelJS.Borders> = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        ws.mergeCells(`A${startRow}:Q${startRow}`);
        const tCell = ws.getCell(`A${startRow}`);
        tCell.value = titulo;
        tCell.font = { bold: true };

        // Explicit Fill
        const fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BFBFBF' } };
        tCell.fill = fill;
        tCell.border = border;

        let r = startRow + 1;
        labels.forEach((label, idx) => {
            const row = ws.getRow(r);

            const cLabel = row.getCell(1);
            cLabel.value = label;
            cLabel.border = border;
            cLabel.font = { size: 9 };

            const rowData = dataMatrix[idx];
            rowData.forEach((val, colIdx) => {
                const cell = row.getCell(colIdx + 2);
                cell.value = val;
                cell.alignment = { horizontal: 'center' };
                cell.border = border;
                if (val > 0) cell.font = { bold: true };
            });

            r++;
        });

        const totalRow = ws.getRow(r);
        totalRow.getCell(1).value = 'TOTAL';
        totalRow.getCell(1).font = { bold: true };
        totalRow.getCell(1).alignment = { horizontal: 'right' };
        totalRow.getCell(1).border = border;

        const totalData = dataMatrix.reduce((acc, curr) => curr.map((v, i) => v + acc[i]), Array(16).fill(0));
        totalData.forEach((val, colIdx) => {
            const cell = totalRow.getCell(colIdx + 2);
            cell.value = val;
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center' };
            cell.border = border;
            const totalFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } };
            cell.fill = totalFill;
        });

        return r + 2;
    }

    cerrarSesion() {
        localStorage.clear();
        this.router.navigate(['/consulta']);
    }
}
