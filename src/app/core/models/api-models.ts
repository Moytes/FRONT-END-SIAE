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
// Los ids 2 (SUPERVISOR), 3 (DIRECTOR_USAER), 7 (TRABAJO_SOCIAL) y 10 (ALUMNO)
// quedan reservados/sin usar: existieron como roles y se eliminaron de la BD.
export enum UserRole {
  ADMIN = 1,
  ESPECIALISTA_COM = 4,
  ESPECIALISTA_PSI = 5,
  ESPECIALISTA_APR = 6,
  DOCENTE = 8,
  TUTOR = 9,
  CREADOR_CONTENIDO = 11
}

export enum BoolStatus {
  False = 0,
  True = 1
}

export enum Gender {
  M = 1,
  F = 2
}

export enum CanalizationStatus {
  Pendiente = 0,
  Activa = 1,
  Cerrada = 2
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
  id: string;
  studentId: string;
  studentName: string;
  requesterId: string;
  requesterName: string;
  receiverId: string;
  receiverName: string;
  attentionAreaId: string;
  attentionAreaName: string;
  reason: string;
  status: CanalizationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddCanalizationRequest {
  studentId: string;
  schoolYearId: string;
  requesterId: string;
  receiverId: string;
  attentionAreaId: string;
  reason: string;
  notes?: string;
}

export interface UpdateCanalizationStatusRequest {
  status: CanalizationStatus;
  notes?: string;
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
}

// ================================================================
// NOTIFICATIONS
// ================================================================
export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface AddNotificationRequest {
  userId: string;
  title: string;
  body: string;
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

export interface StudentHistorial {
  student: StudentHistorialRecord;
  disabilities: StudentHistorialDisability[];
  attentionAreas: StudentHistorialAttentionArea[];
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

// ================================================================
// CIE
// ================================================================
export interface CIEDimensionCatalog {
  id: string;
  name: string;
  code?: string;
  indicators: CIEIndicatorItem[];
}

export interface CIEIndicatorItem {
  id: string;
  name: string;
  subIndicators: CIESubIndicatorItem[];
}

export interface CIESubIndicatorItem {
  id: string;
  name: string;
}

export interface CIEEvaluationListItem {
  id: string;
  studentId: string;
  studentName: string;
  dimensionId: string;
  dimensionName: string;
  schoolYearId: string;
  status: string;
  createdAt: string;
}

// ================================================================
// TEA SCREENING
// ================================================================
export interface TEAIndicatorCatalog {
  id: string;
  name: string;
  category: string;
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
  studentId: string;
  studentName: string;
  schoolName: string;
  alertLevel: AlertLevel;
  screeningDate: string;
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
