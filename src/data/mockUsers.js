export const USUARIOS_SINTETICOS = [
  {
    id: 'USR-01',
    usuario: 'infraestructura@unt.edu.pe',
    password: '123',
    nombre: 'Ing. Carlos Mendoza (Simulado)',
    rol: 'ENTIDAD',
    etiquetaRol: 'Área de Infraestructura / Entidad',
    permisos: ['VER_TODO', 'APROBAR_TRAMITE', 'EXPORTAR_PDF']
  },
  {
    id: 'USR-02',
    usuario: 'supervisor@obra.pe',
    password: '123',
    nombre: 'Ing. Elena Ríos (Simulado)',
    rol: 'SUPERVISOR',
    etiquetaRol: 'Supervisor de Obra',
    permisos: ['VALIDAR_CALIDAD', 'LEVANTAR_BLOQUEO', 'OPINAR_TRAMITE']
  },
  {
    id: 'USR-03',
    usuario: 'residente@contratista.pe',
    password: '123',
    nombre: 'Arq. Jorge Paredes (Simulado)',
    rol: 'RESIDENTE',
    etiquetaRol: 'Residente de Obra',
    permisos: ['REGISTRAR_AVANCE', 'REPORTAR_INCIDENCIA', 'SOLICITAR_TRAMITE']
  },
  {
    id: 'USR-04',
    usuario: 'contratos@unt.edu.pe',
    password: '123',
    nombre: 'Abg. Sofía Vargas (Simulado)',
    rol: 'CONTRACTUAL',
    etiquetaRol: 'Gestión Contractual',
    permisos: ['CONTROL_PLAZOS', 'VER_AUDITORIA', 'EXPORTAR_PDF']
  }
];