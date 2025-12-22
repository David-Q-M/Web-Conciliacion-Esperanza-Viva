import { Routes } from '@angular/router';
import { ConsultaExpediente } from './components/consulta-expediente/consulta-expediente';
import { RegistroSolicitud } from './components/registro-solicitud/registro-solicitud';
import { ExitoRegistro } from './components/exito-registro/exito-registro';
import { DescripcionConflicto } from './components/descripcion-conflicto/descripcion-conflicto';
import { DocumentosAdjuntos } from './components/documentos-adjuntos/documentos-adjuntos';
import { ResumenRegistro } from './components/resumen-registro/resumen-registro';
import { LoginAdmin } from './components/login-admin/login-admin';
import { GestionUsuarios } from './components/gestion-usuarios/gestion-usuarios';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'consulta', pathMatch: 'full' },
  { path: 'consulta', component: ConsultaExpediente },
  
  // 🔹 CAMBIO AQUÍ: Ahora coincide con el botón del HTML
  { path: 'registro-solicitud', component: RegistroSolicitud },
  
  { path: 'descripcion-conflicto', component: DescripcionConflicto },
  { path: 'documentos-adjuntos', component: DocumentosAdjuntos },
  { path: 'resumen-registro/:expediente', component: ResumenRegistro },
  { path: 'exito/:expediente', component: ExitoRegistro },

  // Rutas administrativas protegidas
  { path: 'login-admin', component: LoginAdmin },
  { path: 'gestion-usuarios', component: GestionUsuarios, canActivate: [authGuard] }
];