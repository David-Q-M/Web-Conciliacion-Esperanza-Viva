import { Routes } from '@angular/router';
import { ConsultaExpediente } from './components/consulta-expediente/consulta-expediente';
import { RegistroSolicitud } from './components/registro-solicitud/registro-solicitud';
import { ExitoRegistro } from './components/exito-registro/exito-registro';
import { DescripcionConflicto } from './components/descripcion-conflicto/descripcion-conflicto';
import { DocumentosAdjuntos } from './components/documentos-adjuntos/documentos-adjuntos';
import { ResumenRegistro } from './components/resumen-registro/resumen-registro';

export const routes: Routes = [
  // Página de inicio (Wireframe-1)
  { path: '', redirectTo: 'consulta', pathMatch: 'full' },
  { path: 'consulta', component: ConsultaExpediente},
  
  // Página de Registro (Wireframe-2 y 3)
  { path: 'nueva-solicitud', component: RegistroSolicitud },
  { path: 'descripcion-conflicto', component: DescripcionConflicto},
  { path: 'documentos-adjuntos', component: DocumentosAdjuntos },
  { path: 'resumen-registro/:expediente', component: ResumenRegistro },
  
  // Página de Éxito/Resultado (Wireframe-5)
  { path: 'exito/:expediente', component: ExitoRegistro}
];