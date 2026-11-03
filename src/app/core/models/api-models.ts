// ================================================================
// API RESPONSE WRAPPER — matches backend StandardSuccess/StandardError
// ================================================================
export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
  intOpCode?: string;
}

// ================================================================
// ENUMS — mirrors Models/DB/
// ================================================================
// Los ids 2 (SUPERVISOR), 3 (DIRECTOR_USAER), 7 (TRABAJO_SOCIAL), 10 (ALUMNO)
// y 11 (CREADOR_CONTENIDO) quedan reservados/sin usar: existieron como roles y se eliminaron de la BD.
// ESPECIALISTA_COM(4)/PSI(5)/APR(6) se unificaron en un solo rol ESPECIALISTA=5 (migración
// MergeEspecialistaRoles) — ningún endpoint clínico terminó restringido a un solo tipo de
// especialista, así que la especialidad ahora es un dato de perfil (CurrentUser.especialidad),
// no un rol distinto.
export enum UserRole {
  ADMIN = 1,
  ESPECIALISTA = 5,
  DOCENTE = 8,
  TUTOR = 9
}

/** Solo aplica a UserRole.ESPECIALISTA — decide su pantalla de inicio por defecto. */
export type Especialidad = 'PSICOLOGIA' | 'COMUNICACION' | 'APRENDIZAJE';

export enum BoolStatus {
  False = 0,
  True = 1
}

export enum Gender {
  M = 1,
  F = 2
}

export enum CanalizationStatus {
  Pendiente = 'PENDIENTE',
  Recibida = 'RECIBIDA',
  EnProceso = 'EN_PROCESO',
  Cerrada = 'CERRADA'
}

export enum AlertLevel {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2
}

// ================================================================
// AUTH
// ================================================================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  role: string;
  token: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  fatherLastName: string;
  motherLastName?: string;
  role: UserRole;
  phoneNumber?: string;
  status: BoolStatus;
  avatarUrl?: string;
  especialidad?: Especialidad;
  createdAt: string;
  updatedAt: string;
  schoolIds?: string[];
  schoolZoneId?: string;
}

// ================================================================
// USERS
// ================================================================
export interface UserListItem {
  id: string;
  email: string;
  name: string;
  fatherLastName: string;
  motherLastName?: string;
  role: UserRole;
  phoneNumber?: string;
  status: BoolStatus;
  avatarUrl?: string;
  especialidad?: Especialidad;
  schoolId?: string;
  schoolZoneId?: string;
  schoolName?: string;
  createdAt: string;
}

export interface AddUserRequest {
  email: string;
  password: string;
  name: string;
  fatherLastName: string;
  motherLastName?: string;
  role: UserRole;
  schoolZoneId?: string;
  schoolId?: string;
  schoolYearId?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  /** Solo cuando role es ESPECIALISTA — su pantalla de inicio por defecto. */
  especialidad?: Especialidad;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  fatherLastName?: string;
  motherLastName?: string;
  role?: UserRole;
  schoolZoneId?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  status?: BoolStatus;
  /** Solo cuando role es ESPECIALISTA — su pantalla de inicio por defecto. */
  especialidad?: Especialidad;
}

export interface AssignUserGroupRequest {
  groupId: string;
  schoolYearId: string;
  esTitular: boolean;
}

export interface AssignUserSchoolRequest {
  schoolId: string;
  schoolYearId: string;
}

export interface EnumOption {
  key: number;
  value: string;
  label?: string;
}

// ================================================================
// STUDENTS
// ================================================================
export interface StudentListItem {
  id: string;
  name: string;
  fatherLastName: string;
  motherLastName?: string;
  gender: Gender;
  birthDate: string;
  curp?: string;
  photoUrl?: string;
  status: BoolStatus;
  age?: number;
  schoolId?: string;
  schoolName?: string;
  groupId?: string;
  groupName?: string;
  schoolYearId?: string;
  schoolYearName?: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  fatherLastName: string;
  motherLastName?: string;
  gender: Gender;
  birthDate: string;
  curp?: string;
  photoUrl?: string;
  status: BoolStatus;
}

export interface AddStudentRequest {
  name: string;
  fatherLastName: string;
  motherLastName?: string;
  gender: Gender;
  birthDate: string;
  curp?: string;
  photoUrl?: string;
}

export interface UpdateStudentRequest {
  name?: string;
  fatherLastName?: string;
  motherLastName?: string;
  gender?: Gender;
  birthDate?: string;
  curp?: string;
  photoUrl?: string;
}

// ================================================================
// TUTORS
// ================================================================
export interface TutorListItem {
  id: string;
  completeName: string;
  parent: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  userId?: string;
}

export interface AddTutorRequest {
  completeName: string;
  parent: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  userId?: string;
}

// ================================================================
// REGISTRATIONS
// ================================================================
export interface AddRegistrationRequest {
  studentId: string;
  groupId: string;
  schoolYearId: string;
}

export interface BulkAddRegistrationRequest {
  studentIds: string[];
  groupId: string;
  schoolYearId: string;
}

// ================================================================
// CATALOGS
// ================================================================
export interface SchoolYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  activo?: boolean;
}

export interface SupervisorCreateStaffRequest {
  email: string;
  password: string;
  name: string;
  fatherLastName: string;
  motherLastName?: string;
  roleId: UserRole;
  schoolId: string;
  phone?: string;
  avatarUrl?: string;
}

export interface SupervisorUpdateStaffRequest {
  email: string;
  name: string;
  fatherLastName: string;
  motherLastName?: string;
  roleId: UserRole;
  schoolId: string;
  phone?: string;
  avatarUrl?: string;
  activo: boolean;
}

export interface AddSchoolYearRequest {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface SchoolZone {
  id: string;
  name: string;
  code?: string;
  number?: string;
  cct?: string;
  description?: string;
}

export interface AddSchoolZoneRequest {
  number: string;
  cct: string;
  name?: string;
  description?: string;
}

export interface School {
  id: string;
  name: string;
  cct?: string;
  schoolZoneId: string;
  schoolZoneName?: string;
  educationLevelId?: number;
  educationLevelName?: string;
}

export interface AddSchoolRequest {
  name: string;
  cct: string;
  turn: number;
  educationLevelId: number;
  schoolZoneId?: string;
}

export interface Group {
  id: string;
  displayName: string;
  gradeId?: number;
  grade: number;
  section: string;
  schoolId: string;
  schoolName: string;
  schoolYearId: string;
  schoolYearName?: string;
  educationLevelId?: number;
  educationLevelName?: string;
}

export interface GroupTeacher {
  userId: string;
  fullName: string;
  esTitular: boolean;
}

export interface GroupWithTeachers extends Group {
  teachers: GroupTeacher[];
}

export interface AssignDocenteRequest {
  docenteId: string;
  schoolYearId: string;
  esTitular: boolean;
}

export interface AddGroupRequest {
  section: string;
  grade: number;
  gradeId?: number;
  schoolId: string;
  schoolYearId: string;
}

export interface TrabajoSocialQuickStudentRequest {
  name: string;
  fatherLastName: string;
  motherLastName?: string;
  sexo: Gender;
  birthDate: string;
  curp?: string;
  photoUrl?: string;
  groupId: string;
  schoolYearId: string;
  ingressDate?: string;
  isNew: boolean;
  isTracking: boolean;
  finalSituation?: number;
  notes?: string;
  tutorCompleteName: string;
  tutorParentesco?: string;
  tutorPhone?: string;
  tutorEmail?: string;
  tutorAddress?: string;
  createTutorAccount: boolean;
  tutorPassword?: string;
  studentEmail?: string;
  studentPassword?: string;
}

export interface TrabajoSocialBulkRegistrationRequest {
  studentIds: string[];
  groupId: string;
  schoolYearId: string;
  ingressDate?: string;
  isNew: boolean;
  isTracking: boolean;
  notes?: string;
}

export interface DisabilityCatalog {
  id: string;
  name: string;
  description?: string;
}

export interface AttentionArea {
  id: string;
  name: string;
}

// Forma real confirmada contra backend-clases (CatalogosController.GetTiposMaterial,
// devuelve la entidad TipoMaterial sin proyectar) — usa "clave"/"nombre", no "name".
export interface MaterialType {
  id: number;
  clave: string;
  nombre: string;
  descripcion?: string;
}

// ================================================================
// CANALIZATIONS
// ================================================================
export interface CanalizationListItem {
  id: number;
  alumnoId: string;
  alumnoNombre: string;
  alumnoCurp?: string;
  grado?: number;
  grupo?: string;
  escuelaNombre?: string;
  cicloId: number;
  fecha: string;
  areaCanaliza?: number;
  areaNombre?: string;
  motivo: string;
  accionesAula?: string;
  solicitanteId?: string;
  solicitanteNombre?: string;
  receptorId?: string;
  receptorNombre?: string;
  fechaRecibido?: string;
  estado: CanalizationStatus;
  tipoAtencion?: string;
  fechaAtencion?: string;
  observacionesClinicas?: string;
  derivarAreaId?: number;
  derivarAreaNombre?: string;
  prioridad?: 'BAJA' | 'MEDIA' | 'ALTA';
  createdAt: string;
}

export interface AddCanalizationRequest {
  alumnoId: string;
  cicloId: number;
  areaCanaliza?: number;
  motivo: string;
  accionesAula?: string;
  solicitanteId?: string;
  receptorId?: string;
}

export interface UpdateCanalizationStatusRequest {
  estado: CanalizationStatus;
}

export interface AttendCanalizationRequest {
  tipoAtencion: string;
  fechaAtencion: string;
  observacionesClinicas?: string;
  derivarAreaId: number;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
}

// ================================================================
// MATERIALS
// ================================================================
// Nombres de campo en español — reflejan tal cual la forma real que devuelve
// backend-clases (MaterialesController), que NO envuelve sus respuestas.
export interface MaterialListItem {
  id: number;
  titulo: string;
  descripcion?: string;
  tipoId: number;
  tipoNombre: string;
  nivelId?: number;
  gradoMin?: number;
  gradoMax?: number;
  dimensionId?: number;
  attentionAreaId?: number;
  nivelDesempeno?: 'INICIAL' | 'EN_PROCESO' | 'LOGRADO';
  creadorId: string;
  archivoUrl?: string;
  archivoMime?: string;
  archivoSize?: number;
  thumbnailUrl?: string;
  contenidoJson?: string;
  criteriosJson?: string;
  publicado: boolean;
  evaluacionAuto: boolean;
  instruccionesAplicacion?: string;
  materialesNecesarios?: string;
  duracionEstimadaMin?: number;
  perfilRecomendado?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AddMaterialRequest {
  titulo: string;
  descripcion?: string;
  tipoId: number;
  nivelId?: number;
  gradoMin?: number;
  gradoMax?: number;
  dimensionId?: number;
  attentionAreaId?: number;
  nivelDesempeno?: 'INICIAL' | 'EN_PROCESO' | 'LOGRADO';
  contenidoJson?: string;
  criteriosJson?: string;
  archivoR2Key?: string;
  archivoUrl?: string;
  archivoSize?: number;
  archivoMime?: string;
  thumbnailR2Key?: string;
  thumbnailUrl?: string;
  tags: string[];
  evaluacionAuto?: boolean;
  publicado?: boolean;
  instruccionesAplicacion?: string;
  materialesNecesarios?: string;
  duracionEstimadaMin?: number;
  perfilRecomendado?: string;
}

// ================================================================
// ASSIGNMENTS
// ================================================================
// Forma real confirmada contra backend-clases (AsignacionesController) — el
// enum EstadoAsignacion se serializa como string (JsonStringEnumConverter).
export type EstadoAsignacion = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADO' | 'EVALUADO';

export interface AsignacionAlumnoItem {
  id: number;
  alumnoId: string;
  estado: EstadoAsignacion;
  fechaCompletado?: string;
  retroalimentacion?: string;
}

export interface Asignacion {
  id: number;
  fechaAsignacion: string;
  fechaLimite?: string;
  instrucciones?: string;
  material: { id: number; titulo: string };
  alumnos: AsignacionAlumnoItem[];
}

export interface AddAssignmentRequest {
  materialId: number;
  alumnosIds: string[];
  cicloId: number;
  suscripcionAcademiaId?: number;
  fechaLimite?: string;
  instrucciones?: string;
}

export interface SetRetroalimentacionRequest {
  retroalimentacion: string;
  calificacionManual?: string;
}

export interface SetEstadoAsignacionRequest {
  estado: EstadoAsignacion;
}

export interface AsignacionProgresoItem {
  id: number;
  asignacionId: number;
  materialId: number;
  materialTitulo: string;
  fechaAsignacion: string;
  fechaLimite?: string;
  instrucciones?: string;
  estado: EstadoAsignacion | string;
  fechaCompletado?: string;
  retroalimentacion?: string;
  calificacionManual?: string;
}

export interface AsignacionResumen {
  total: number;
  pendiente: number;
  enProgreso: number;
  completado: number;
  evaluado: number;
}

// ================================================================
// TUTOR — HISTORIAL / EVALUACIONES / SESIONES
// ================================================================
// Forma real confirmada contra backend-core (AlumnoPortalController.GetHistorial).
export interface StudentHistorialDisability {
  id: number;
  studentId: string;
  disabilityId: number;
  disabilityCVE: string;
  disabilityName: string;
  disabilityCategory: number;
  schoolYearId: number;
  schoolYearName: string;
  externalDiagnosis: boolean;
}

export interface StudentHistorialAttentionArea {
  id: number;
  studentId: string;
  attentionAreaId: number;
  attentionAreaCVE: string;
  attentionAreaName: string;
  schoolYearId: number;
  isRequired: boolean;
  notes?: string;
}

export interface StudentHistorialTutor {
  id: number;
  studentId: string;
  completeName: string;
  parentesco?: string;
  phone?: string;
  email?: string;
  address?: string;
  userId?: string;
}

export interface StudentHistorialRegistration {
  id: number;
  groupId: number;
  groupName: string;
  schoolId: number;
  schoolName: string;
  schoolYearId: number;
  schoolYearName: string;
  ingressDate: string;
  isNew: boolean;
  isTracking: boolean;
  finalSituation?: number;
  notes?: string;
}

export interface StudentHistorialRecord {
  id: string;
  name: string;
  fatherLastName: string;
  motherLastName?: string;
  sexo: number;
  birthDate: string;
  curp?: string;
  photoUrl?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  tutors: StudentHistorialTutor[];
  registrations: StudentHistorialRegistration[];
}

export interface StudentHistorialActividad {
  id: number;
  materialTitulo: string;
  estado: string;
  fechaAsignacion: string;
  fechaLimite?: string;
  fechaCompletado?: string;
  retroalimentacion?: string;
  instrucciones?: string;
}

export interface DocenteObservacion {
  id: number;
  studentId: string;
  docenteId: string;
  docenteNombre?: string;
  schoolYearId?: number;
  texto: string;
  createdAt: string;
}

export interface StudentHistorialEvaluacionResumen {
  tipo: string;
  fecha: string;
  estado?: string;
}

export interface StudentHistorial {
  student: StudentHistorialRecord;
  disabilities: StudentHistorialDisability[];
  attentionAreas: StudentHistorialAttentionArea[];
  actividades?: StudentHistorialActividad[];
  observaciones?: DocenteObservacion[];
  evaluacionesResumen?: StudentHistorialEvaluacionResumen[];
}

// Forma real confirmada contra backend-reportes (TutorController / EvaluacionRepository / SesionRepository).
export interface EvaluacionDetalle {
  id: number;
  alumnoId: string;
  studentName?: string;
  cicloId: number;
  fechaElaboracion: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
  motivoEvaluacion?: string;
  conductaEvaluacion?: string;
  antecedentesEmbarazo?: string;
  antecedentesHeredo?: string;
  desarrolloMotor?: string;
  desarrolloLenguaje?: string;
  historiaMedica?: string;
  historiaEscolar?: string;
  situacionFamiliar?: string;
  descripcionAlumno?: string;
  contextoFamiliar?: string;
  contextoEscolar?: string;
  contextoSocial?: string;
  desarrolloFisico?: string;
  desarrolloCognitivo?: string;
  desarrolloSocioafectivo?: string;
  evaluacionAprendizajes?: string;
  creatividad?: string;
  interpretacionResultados?: string;
  conclusiones?: string;
}

// Forma real confirmada contra backend-reportes (TutorController).
export interface TutorEvaluacionResumen {
  id: number;
  alumnoId: string;
  cicloId: number;
  fechaElaboracion: string;
  estado: string;
  motivoEvaluacion?: string;
}

export interface TutorCita {
  id: number;
  alumnoId: string;
  tipoCita: string;
  fecha: string;
  hora: string;
  modalidad: string;
  estado: string;
}

export interface SesionPsicologica {
  id: number;
  alumnoId: string;
  alumnoNombre?: string;
  psicologoId: string;
  cicloId: number;
  fecha: string;
  tipo?: string;
  motivo?: string;
  nota: string;
  acuerdos?: string;
  createdAt: string;
}

// ================================================================
// PSYCHOEDUCATIONAL ASSESSMENT
// ================================================================
export interface PsychoeducationalAssessmentListItem {
  id: string;
  studentId: string;
  studentName: string;
  schoolYearId: string;
  schoolYearName: string;
  status: string;
  createdAt: string;
}

export interface PsychoeducationalAssessmentDetail {
  id: number;
  alumnoId: string;
  studentName?: string;
  cicloId: number;
  fechaElaboracion?: string;
  estado: string;
  areasEvaluar?: string[];
  instrumentosAplicar?: string[];
  instrumentosDetalle?: string;
  motivoEvaluacion?: string;
  conductaEvaluacion?: string;
  antecedentesEmbarazo?: string;
  antecedentesHeredo?: string;
  desarrolloMotor?: string;
  desarrolloLenguaje?: string;
  historiaMedica?: string;
  historiaEscolar?: string;
  situacionFamiliar?: string;
  descripcionAlumno?: string;
  contextoFamiliar?: string;
  contextoEscolar?: string;
  contextoSocial?: string;
  desarrolloFisico?: string;
  desarrolloCognitivo?: string;
  desarrolloSocioafectivo?: string;
  evaluacionAprendizajes?: string;
  creatividad?: string;
  interpretacionResultados?: string;
  conclusiones?: string;
}

export interface SavePsychoeducationalAssessmentRequest {
  alumnoId: string;
  cicloId: number;
  estado: 'BORRADOR' | 'EN_REVISION';
  areasEvaluar: string[];
  instrumentosAplicar: string[];
  instrumentosDetalle?: string;
  motivoEvaluacion?: string;
  conductaEvaluacion?: string;
  antecedentesEmbarazo?: string;
  antecedentesHeredo?: string;
  desarrolloMotor?: string;
  desarrolloLenguaje?: string;
  historiaMedica?: string;
  historiaEscolar?: string;
  situacionFamiliar?: string;
  descripcionAlumno?: string;
  contextoFamiliar?: string;
  contextoEscolar?: string;
  contextoSocial?: string;
  desarrolloFisico?: string;
  desarrolloCognitivo?: string;
  desarrolloSocioafectivo?: string;
  evaluacionAprendizajes?: string;
  creatividad?: string;
  interpretacionResultados?: string;
  conclusiones?: string;
}

// ================================================================
// CIE
// ================================================================
// Los campos de acá abajo reflejan exactamente lo que devuelve CieController (backend-reportes) —
// antes decían name/studentId/dimensionName/status en inglés, pero el backend siempre mandó
// nombre/alumnoId/dimensionId (sin nombre)/estado; ninguno de esos campos llegaba nunca con
// valor, quedaban undefined en silencio (tablas y gráficas vacías sin ningún error visible).
export interface CIEDimensionCatalog {
  id: number;
  clave: string;
  nombre: string;
  colorHex?: string;
  descripcion?: string;
  orden: number;
  indicadores: CIEIndicatorItem[];
}

export interface CIEIndicatorItem {
  id: number;
  dimensionId: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  orden: number;
  subindicadores: CIESubIndicatorItem[];
}

export interface CIESubIndicatorItem {
  id: number;
  indicadorId: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  orden: number;
}

export interface CIEEvaluationListItem {
  id: number;
  alumnoId: string;
  alumnoNombre: string;
  evaluadorId: string;
  cicloId: number;
  dimensionId: number;
  fecha: string;
  observaciones?: string;
  estado: string;
  createdAt: string;
}

// ================================================================
// TEA SCREENING
// ================================================================
export interface TEAIndicatorCatalog {
  id: number;
  dominio: string;
  codigo: string;
  descripcion: string;
  orden: number;
}

export interface TeaScreeningRespuestaInput {
  indicadorId: number;
  frecuencia: number;
  intensidad: number;
  observacion?: string;
}

export interface CreateTeaScreeningRequest {
  studentId: string;
  cicloId: number;
  contextoObs?: string;
  respuestas: TeaScreeningRespuestaInput[];
}

export interface TeaScreeningHistoryItem {
  id: number;
  alumnoId: string;
  evaluadorId: string;
  cicloId: number;
  fecha: string;
  contextoObs?: string;
  observacionesGenerales?: string;
  puntajeTotal?: number;
  nivelAlerta?: string;
  requiereCanalizacion: boolean;
  createdAt: string;
}

export interface TEAScreeningListItem {
  id: string;
  studentId: string;
  studentName: string;
  schoolYearId: string;
  schoolYearName: string;
  alertLevel: AlertLevel;
  evaluatorId: string;
  evaluatorName: string;
  createdAt: string;
}

// ================================================================
// REPORTS
// ================================================================
export interface StudentDataSheetItem {
  studentId: string;
  studentName: string;
  schoolName: string;
  groupName: string;
  grade: number;
  disabilities: string[];
  attentionAreas: string[];
  cieStatus?: string;
  teaAlertLevel?: AlertLevel;
}

export interface CIESummaryItem {
  studentId: string;
  studentName: string;
  dimensionName: string;
  totalIndicators: number;
  completedIndicators: number;
  percentage: number;
}

export interface TEAAlertItem {
  id?: number;
  studentId: string;
  studentName: string;
  schoolName: string;
  grade?: number;
  groupName?: string;
  alertLevel: AlertLevel;
  screeningDate: string;
  createdAt?: string;
  contextoObs?: string;
  observaciones?: string;
  requiereCanalizacion?: boolean;
  puntajeTotal?: number;
  seguimientoEstado?: 'ACTIVA' | 'EN_MONITOREO' | 'NOTIFICADA' | 'RESUELTA';
  seguimientoAt?: string;
  seguimientoNota?: string;
}

export interface ScheduleAppointmentRequest {
  alumnoId: string;
  teaScreeningId?: number;
  tipoCita: string;
  fecha: string;
  hora: string;
  modalidad: 'PRESENCIAL' | 'VIRTUAL';
  notasTutor?: string;
}

export interface ScheduleAppointmentResult {
  id: number;
}

export interface CitaListItem {
  id: number;
  alumnoId: string;
  alumnoNombre: string;
  tipoCita: string;
  fecha: string;
  hora: string;
  modalidad: string;
  estado: 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA';
  teaScreeningId?: number;
  notasTutor?: string;
  createdAt: string;
}

export interface EvalPsicoBap {
  id?: number;
  tipoBap?: string;
  contexto?: string;
  indicadorInclusion?: string;
  descripcion?: string;
}

export interface EvalPsicoColaborador {
  id?: number;
  usuarioId?: string;
  nombreExterno?: string;
  rolColaborador?: string;
  firmaDigital?: boolean;
  fechaFirma?: string;
}

export interface AddSesionRequest {
  cicloId: number;
  fecha?: string;
  tipo?: string;
  motivo?: string;
  nota: string;
  acuerdos?: string;
}

export interface UpdateSesionRequest {
  fecha?: string;
  tipo?: string;
  motivo?: string;
  nota: string;
  acuerdos?: string;
}

export interface SesionListItem {
  id: number;
  alumnoId: string;
  alumnoNombre?: string;
  psicologoId: string;
  cicloId: number;
  fecha: string;
  tipo?: string;
  motivo?: string;
  nota: string;
  acuerdos?: string;
  createdAt: string;
}

export interface ExpedienteAlumnoDto {
  id: string;
  nombreCompleto: string;
  curp?: string;
  escuelaNombre?: string;
  grupo?: string;
  grado?: number;
  areasAtencion: string[];
  discapacidades: string[];
}

export interface ExpedienteActividad {
  id: number;
  materialTitulo: string;
  estado: string;
  fechaAsignacion: string;
  fechaLimite?: string;
  fechaCompletado?: string;
  retroalimentacion?: string;
  instrucciones?: string;
}

export interface ExpedienteDto {
  alumno: ExpedienteAlumnoDto;
  canalizaciones: CanalizationListItem[];
  evaluaciones: PsychoeducationalAssessmentListItem[];
  teaHistorial: TeaScreeningHistoryItem[];
  citas: CitaListItem[];
  sesiones: SesionListItem[];
  cieResumen: CIESummaryItem[];
  actividades?: ExpedienteActividad[];
}

// ================================================================
// ALUMNO PORTAL
// ================================================================
export interface AlumnoPortalStudent {
  id: string;
  name: string;
  fatherLastName: string;
  motherLastName?: string;
  fullName: string;
  birthDate: string;
  photoUrl?: string;
  schoolId: number;
  schoolName: string;
  groupId: number;
  groupName: string;
  schoolYearId: number;
  schoolYearName: string;
  educationLevelId: number;
  educationLevelName: string;
  accessedByTutor: boolean;
}

export interface AlumnoPortalPerfil {
  roleClave: string;
  accessedByTutor: boolean;
  students: AlumnoPortalStudent[];
}

export interface AlumnoTrabajo {
  id: number;
  asignacionId: number;
  alumnoId: string;
  estado: string;
  fechaInicio?: string;
  fechaCompletado?: string;
  retroalimentacion?: string;
  asignacion: {
    fechaAsignacion: string;
    fechaLimite?: string;
    instrucciones?: string;
    asignadoPorId?: string;
    asignadoPorNombre?: string;
    material: {
      id: number;
      titulo: string;
      descripcion?: string;
      tipo: string;
      tipoClave: string;
      archivoUrl?: string;
      thumbnailUrl?: string;
      contenidoJson?: string;
    };
  };
}

// ================================================================
// CHAT (RQF06) — /api/chat
// ================================================================

export type ChatChannelKind = 'DOCENTE_ESPECIALISTA' | 'FAMILIA_DOCENTE';

export interface ChatChannel {
  id: number;
  kind: ChatChannelKind;
  studentId: string;
  studentName: string;
  counterpartUserId: string;
  counterpartName: string;
  counterpartRole: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
}

export interface ChatContact {
  kind: ChatChannelKind;
  studentId: string;
  studentName: string;
  userId: string;
  userName: string;
  userRole: string;
  channelId?: number | null;
}

export interface ChatMessage {
  id: number;
  channelId: number;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}
