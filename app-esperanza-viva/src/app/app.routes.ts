import { Routes } from '@angular/router';
import { ConsultaExpediente } from './components/consulta-expediente/consulta-expediente';
import { RegistroSolicitud } from './components/registro-conciliacion/registro-solicitud/registro-solicitud';
import { ExitoRegistro } from './components/registro-conciliacion/exito-registro/exito-registro';
import { DescripcionConflicto } from './components/registro-conciliacion/descripcion-conflicto/descripcion-conflicto';
import { DocumentosAdjuntos } from './components/registro-conciliacion/documentos-adjuntos/documentos-adjuntos';
import { ResumenRegistro } from './components/registro-conciliacion/resumen-registro/resumen-registro';
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
import { GenerarActaSuspension } from './components/conciliador/generar-actas/generar-acta-suspension/generar-acta-suspension';
import { Historial } from './components/conciliador/historial/historial';
import { AgendaConciliador } from './components/conciliador/agenda/agenda';
import { SuspensionAudiencia } from './components/conciliador/generar-actas/suspension-audiencia/suspension-audiencia';
import { GeneracionActaAcuerdoTotal } from './components/conciliador/generar-actas/generacion-acta-acuerdo_total/generacion-acta-acuerdo_total';
import { GeneracionActaInasistenciaUnaParte } from './components/conciliador/generar-actas/generacion-acta-inasistencia-una-parte/generacion-acta-inasistencia-una-parte';
import { GeneracionActaInasistenciaAmbasPartes } from './components/conciliador/generar-actas/generacion-acta-inasistencia-ambas-partes/generacion-acta-inasistencia-ambas-partes';
import { GeneracionActaAsistenciaInvitacion } from './components/conciliador/generar-actas/generacion-acta-asistencia-invitacion/generacion-acta-asistencia-invitacion';
import { GeneracionActaAcuerdoParcial } from './components/conciliador/generar-actas/generacion-acta-acuerdo-parcial/generacion-acta-acuerdo-parcial';

export const routes: Routes = [
  // 1. Ruta inicial y Flujo Público
  { path: '', redirectTo: 'consulta', pathMatch: 'full' },
  { path: 'consulta', component: ConsultaExpediente },
  { path: 'registro-solicitud', component: RegistroSolicitud },
  { path: 'descripcion-conflicto', component: DescripcionConflicto },
  { path: 'documentos-adjuntos', component: DocumentosAdjuntos },
  { path: 'resumen-registro/:expediente', component: ResumenRegistro },
  { path: 'exito-registro/:expediente', component: ExitoRegistro },

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
      { path: 'programar-audiencia/:id', component: ProgramarAudiencia },
      { path: 'registro-audiencia/:id', component: RegistroAudiencia },
      { path: 'generar-acta-suspension/:id', component: GenerarActaSuspension },
      { path: 'registro-audiencia/:id', component: RegistroAudiencia },
      { path: 'suspencion-audiencia/:id', component: SuspensionAudiencia },
      { path: 'generacion-acta-acuerdo_total/:id', component: GeneracionActaAcuerdoTotal },
      { path: 'generacion-acta-inasistencia-una-parte/:id', component: GeneracionActaInasistenciaUnaParte },
      { path: 'generar-acta-inasistencia-ambas-partes/:id', component: GeneracionActaInasistenciaAmbasPartes },
      { path: 'generar-acta-asistencia-invitacion/:id', component: GeneracionActaAsistenciaInvitacion },
      { path: 'generacion-acta-acuerdo-parcial/:id', component: GeneracionActaAcuerdoParcial },
      { path: 'generacion-acta-acuerdo-parcial-propuestas/:id', loadComponent: () => import('./components/conciliador/generar-actas/generacion-acta-acuerdo-parcial-propuestas/generacion-acta-acuerdo-parcial-propuestas').then(m => m.GeneracionActaAcuerdoParcialPropuestas) },
      { path: 'generacion-acta-acuerdo-sustento-probable/:id', loadComponent: () => import('./components/conciliador/generar-actas/generacion-acta-acuerdo-sustento-probable/generacion-acta-acuerdo-sustento-probable').then(m => m.GeneracionActaAcuerdoSustentoProbable) },
      { path: 'generacion-acta-falta-acuerdo/:id', loadComponent: () => import('./components/conciliador/generar-actas/generacion-acta-falta-acuerdo/generacion-acta-falta-acuerdo').then(m => m.GeneracionActaFaltaAcuerdo) },
      { path: 'generacion-acta-falta-acuerdo-posiciones-propuesta/:id', loadComponent: () => import('./components/conciliador/generar-actas/generacion-acta-falta-acuerdo-posiciones-propuesta/generacion-acta-falta-acuerdo-posiciones-propuesta').then(m => m.GeneracionActaFaltaAcuerdoPosicionesPropuesta) },
      { path: 'generacion-acta-falta-acuerdo-sustento/:id', loadComponent: () => import('./components/conciliador/generar-actas/generacion-acta-falta-acuerdo-sustento/generacion-acta-falta-acuerdo-sustento').then(m => m.GeneracionActaFaltaAcuerdoSustento) }
    ]
  },

  // 5. 🛡️ Rutas de ABOGADO (Protegidas)
  {
    path: 'abogado',
    canActivate: [authGuard(['ABOGADO'])],
    children: [
      { path: '', redirectTo: 'pendientes', pathMatch: 'full' },
      {
        path: 'pendientes',
        loadComponent: () => import('./components/abogado/bandeja-pendientes/bandeja-pendientes').then(m => m.BandejaPendientes)
      },
      {
        path: 'historial',
        loadComponent: () => import('./components/abogado/historial-abogado/historial-abogado').then(m => m.HistorialAbogado)
      },
      {
        path: 'revision/:id',
        loadComponent: () => import('./components/abogado/revision-acta/revision-acta').then(m => m.RevisionActa)
      }
    ]
  },

  // 6. 🛡️ Rutas de NOTIFICADOR (Protegidas)
  {
    path: 'notificador',
    canActivate: [authGuard(['NOTIFICADOR'])],
    children: [
      { path: '', redirectTo: 'pendientes', pathMatch: 'full' },
      {
        path: 'pendientes',
        loadComponent: () => import('./components/notificador/bandeja-notificador/bandeja-notificador').then(m => m.BandejaNotificador)
      },
      {
        path: 'historial',
        loadComponent: () => import('./components/notificador/historial-notificador/historial-notificador').then(m => m.HistorialNotificador)
      },
      {
        path: 'certificacion/:id',
        loadComponent: () => import('./components/notificador/generar-certificacion/generar-certificacion').then(m => m.GenerarCertificacion)
      }
    ]
  },
  // Comodín para rutas no encontradas
  { path: '**', redirectTo: 'consulta' }
];