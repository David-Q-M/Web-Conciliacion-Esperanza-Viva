import { Routes } from '@angular/router';
import { ConsultaExpediente } from './components/consulta-expediente/consulta-expediente';
import { RegistroSolicitud } from './components/registro-solicitud/registro-solicitud';
import { ExitoRegistro } from './components/exito-registro/exito-registro';
import { DescripcionConflicto } from './components/descripcion-conflicto/descripcion-conflicto';
import { DocumentosAdjuntos } from './components/documentos-adjuntos/documentos-adjuntos';
import { ResumenRegistro } from './components/resumen-registro/resumen-registro';
import { LoginAdmin } from './components/login-admin/login-admin';
import { GestionUsuarios } from './components/administrador/gestion-usuarios/gestion-usuarios';
import { DashboardAdmin } from './components/administrador/dashboard-admin/dashboard-admin';
import { Auditoria } from './components/administrador/auditoria/auditoria';
import { Reportes } from './components/administrador/reportes/reportes';
import { Configuracion } from './components/administrador/configuracion/configuracion';
import { authGuard } from './auth.guard';
import { BandejaSolicitudes } from './components/director/bandeja-solicitudes/bandeja-solicitudes';
import { DetalleDirector } from './components/director/detalle/detalle';
import { GestionPersonal } from './components/director/personal/personal';
import { BandejaReportes } from './components/director/bandeja-reportes/bandeja-reportes';

import { BandejaAsignados } from './components/conciliador/bandeja-asignados/bandeja-asignados';
import { EvaluarDesignacion } from './components/conciliador/evaluar-designacion/evaluar-designacion';
import { ProgramarAudiencia } from './components/conciliador/programar-audiencia/programar-audiencia';
import { RegistroAudiencia } from './components/conciliador/registro-audiencia/registro-audiencia';
import { GenerarActa } from './components/conciliador/generar-acta/generar-acta';
import { Historial } from './components/conciliador/historial/historial';
import { AgendaConciliador } from './components/conciliador/agenda/agenda';

export const routes: Routes = [
  // 1. Ruta inicial y Flujo Público
  { path: '', redirectTo: 'consulta', pathMatch: 'full' },
  { path: 'consulta', component: ConsultaExpediente },
  { path: 'registro-solicitud', component: RegistroSolicitud },
  { path: 'descripcion-conflicto', component: DescripcionConflicto },
  { path: 'documentos-adjuntos', component: DocumentosAdjuntos },
  { path: 'resumen-registro/:expediente', component: ResumenRegistro },
  { path: 'exito/:expediente', component: ExitoRegistro },

  // 2. Login Administrativo
  { path: 'login-admin', component: LoginAdmin },

  // 3. 🛡️ Rutas de ADMINISTRADOR (Protegidas)
  { 
    path: 'admin-dashboard', 
    component: DashboardAdmin, 
    canActivate: [authGuard(['ADMINISTRADOR'])] 
  },
  { 
    path: 'gestion-usuarios', 
    component: GestionUsuarios, 
    canActivate: [authGuard(['ADMINISTRADOR'])] 
  },
  { 
    path: 'auditoria', 
    component: Auditoria, 
    canActivate: [authGuard(['ADMINISTRADOR'])] 
  },
  { 
    path: 'reportes', 
    component: Reportes, 
    canActivate: [authGuard(['ADMINISTRADOR', 'DIRECTOR'])] // Ambos pueden ver reportes
  },
  { 
    path: 'configuracion', 
    component: Configuracion, 
    canActivate: [authGuard(['ADMINISTRADOR'])] 
  },

  // 4. 🛡️ Rutas de DIRECTOR (Protegidas)
  { 
    path: 'director/bandeja-solicitudes', 
    component: BandejaSolicitudes,
    canActivate: [authGuard(['DIRECTOR'])] 
  },
  { 
    path: 'director/detalle/:id', 
    component: DetalleDirector, 
    canActivate: [authGuard(['DIRECTOR'])] 
  },
  {
    path: 'director/personal', 
    component: GestionPersonal, 
    canActivate: [authGuard(['DIRECTOR'])] 
  },
  {
    path: 'director/bandeja-reportes', 
    component: BandejaReportes, 
    canActivate: [authGuard(['DIRECTOR'])] 
  },


  { 
    path: 'conciliador',
    canActivate: [authGuard(['CONCILIADOR'])], // Protege el acceso base
    children: [
      { path: '', redirectTo: 'mis-casos', pathMatch: 'full' },
      { path: 'mis-casos', component: BandejaAsignados },
      
      // 🛡️ IMPORTANTE: Estas rutas deben existir y tener el guard con 'CONCILIADOR'
      { 
        path: 'agenda', 
        component: AgendaConciliador, 
        canActivate: [authGuard(['CONCILIADOR'])] 
      },
      { 
        path: 'historial', 
        component: Historial, 
        canActivate: [authGuard(['CONCILIADOR'])] 
      },
      
      { path: 'evaluar/:id', component: EvaluarDesignacion },
      { path: 'programar/:id', component: ProgramarAudiencia },
      { path: 'registro/:id', component: RegistroAudiencia },
      { path: 'generar-acta/:id', component: GenerarActa }
    ]
  },
  // Comodín para rutas no encontradas
  { path: '**', redirectTo: 'consulta' }
];