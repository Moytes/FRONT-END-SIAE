// ================================================================
// API RESPONSE WRAPPER — matches backend StandardSuccess/StandardError
// ================================================================
export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T[];
}

// ================================================================
// ENUMS — mirrors Models/DB/
// ================================================================
export enum UserRole {
  ADMIN = 1,
  SUPERVISOR = 2,
  DIRECTOR_USAER = 3,
  ESPECIALISTA_COM = 4,
  ESPECIALISTA_PSI = 5,
  ESPECIALISTA_APR = 6,
  TRABAJO_SOCIAL = 7,
  DOCENTE = 8
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
  schoolZoneId?: string;
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
  schoolName?: string;
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
}

export interface AddTutorRequest {
  completeName: string;
  parent: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
}

// ================================================================
// REGISTRATIONS
// ================================================================
export interface AddRegistrationRequest {
  studentId: string;
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
}

export interface SchoolZone {
  id: string;
  name: string;
  code?: string;
}

export interface School {
  id: string;
  name: string;
  cct?: string;
  schoolZoneId: string;
  schoolZoneName?: string;
}

export interface Group {
  id: string;
  name: string;
  grade: number;
  schoolId: string;
  schoolName?: string;
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

export interface MaterialType {
  id: string;
  name: string;
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
export interface MaterialListItem {
  id: string;
  title: string;
  description?: string;
  materialTypeId: string;
  materialTypeName: string;
  dimensionId?: string;
  dimensionName?: string;
  grade?: number;
  fileUrl?: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
}

export interface AddMaterialRequest {
  title: string;
  description?: string;
  materialTypeId: string;
  dimensionId?: string;
  grade?: number;
  fileUrl?: string;
  imageUrl?: string;
  createdById?: string;
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
export interface StudentAssignmentListItem {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  materialId: string;
  materialTitle: string;
  isCompleted: boolean;
  completedAt?: string;
  score?: number;
  createdAt: string;
}

export interface AddAssignmentRequest {
  materialId: string;
  assignedById: string;
  schoolYearId: string;
  groupId?: string;
  studentIds?: string[];
}

export interface CompleteAssignmentStudentRequest {
  score?: number;
  notes?: string;
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
