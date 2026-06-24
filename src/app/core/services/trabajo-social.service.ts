import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api';
import {
  AddGroupRequest,
  AddTutorRequest,
  ApiResponse,
  AssignDocenteRequest,
  EnumOption,
  Group,
  GroupWithTeachers,
  School,
  SchoolYear,
  StudentListItem,
  TrabajoSocialBulkRegistrationRequest,
  TrabajoSocialQuickStudentRequest,
  TutorListItem,
  UpdateStudentRequest,
  UserListItem
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class TrabajoSocialService {
  constructor(private api: ApiService) {}

  getSchools(): Observable<School[]> {
    return this.api.get<School[]>('api/trabajo-social/escuelas');
  }

  getSchoolYears(onlyActive?: boolean): Observable<SchoolYear[]> {
    const qs = onlyActive !== undefined ? `?onlyActive=${onlyActive}` : '';
    return this.api.get<SchoolYear[]>(`api/trabajo-social/ciclos-escolares${qs}`);
  }

  getGrades(educationLevelId?: number): Observable<EnumOption[]> {
    const qs = educationLevelId ? `?educationLevelId=${educationLevelId}` : '';
    return this.api.get<any[]>(`api/trabajo-social/grados${qs}`).pipe(
      map(grades => (grades || []).map(grade => ({
        key: grade.id ?? grade.Id,
        value: (grade.numero ?? grade.Numero)?.toString(),
        label: grade.nombre ?? grade.Nombre
      })))
    );
  }

  getGroups(schoolId?: string, schoolYearId?: string): Observable<Group[]> {
    const params: string[] = [];
    if (schoolId) params.push(`schoolId=${Number(schoolId)}`);
    if (schoolYearId) params.push(`schoolYearId=${Number(schoolYearId)}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<any[]>(`api/trabajo-social/grupos${qs}`).pipe(
      map(groups => (groups || []).map(group => ({
        ...group,
        id: group.id?.toString(),
        schoolId: group.schoolId?.toString(),
        schoolYearId: group.schoolYearId?.toString(),
        educationLevelId: group.educationLevelId ?? group.EducationLevelId
      })))
    );
  }

  createGroup(request: AddGroupRequest): Observable<ApiResponse<number>> {
    return this.api.post<number>('api/trabajo-social/grupos', {
      schoolId: Number(request.schoolId),
      gradeId: Number(request.gradeId ?? request.grade),
      section: request.section,
      schoolYearId: Number(request.schoolYearId)
    });
  }

  getStudents(search?: string, schoolId?: string, groupId?: string): Observable<StudentListItem[]> {
    const params: string[] = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (schoolId) params.push(`schoolId=${Number(schoolId)}`);
    if (groupId) params.push(`groupId=${Number(groupId)}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<any[]>(`api/trabajo-social/alumnos${qs}`).pipe(
      map(students => (students || []).map(student => ({
        ...student,
        gender: student.sexo ?? student.gender,
        status: student.activo ? 1 : 0,
        schoolId: student.schoolId?.toString(),
        groupId: student.groupId?.toString(),
        schoolYearId: student.schoolYearId?.toString()
      })))
    );
  }

  quickRegisterStudent(request: TrabajoSocialQuickStudentRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>('api/trabajo-social/alumnos/registro-rapido', {
      ...request,
      sexo: Number(request.sexo) || 1,
      groupId: Number(request.groupId) || 0,
      schoolYearId: Number(request.schoolYearId) || 0,
      ingressDate: request.ingressDate || null,
      finalSituation: request.finalSituation ?? null,
      tutorEmail: request.tutorEmail || null,
      tutorPhone: request.tutorPhone || null,
      tutorPassword: request.tutorPassword || null,
      studentEmail: request.studentEmail || null,
      studentPassword: request.studentPassword || null
    });
  }

  updateStudent(studentId: string, request: UpdateStudentRequest): Observable<ApiResponse<any>> {
    return this.api.put<any>(`api/trabajo-social/alumnos/${studentId}`, request);
  }

  getTutors(studentId: string): Observable<TutorListItem[]> {
    return this.api.get<any[]>(`api/trabajo-social/alumnos/${studentId}/tutores`).pipe(
      map(tutors => (tutors || []).map(tutor => ({
        ...tutor,
        parent: tutor.parentesco ?? tutor.parent,
        phoneNumber: tutor.phone ?? tutor.phoneNumber
      })))
    );
  }

  addTutor(studentId: string, request: AddTutorRequest): Observable<ApiResponse<number>> {
    return this.api.post<number>(`api/trabajo-social/alumnos/${studentId}/tutores`, {
      completeName: request.completeName,
      parentesco: request.parent || null,
      phone: request.phoneNumber || null,
      email: request.email || null,
      address: request.address || null
    });
  }

  createTutorAccount(studentId: string, tutorId: number, email: string, password: string): Observable<ApiResponse<any>> {
    return this.api.post<any>(`api/trabajo-social/alumnos/${studentId}/tutores/${tutorId}/cuenta`, {
      email,
      password
    });
  }

  getDocentes(schoolId?: string): Observable<UserListItem[]> {
    const qs = schoolId ? `?schoolId=${Number(schoolId)}` : '';
    return this.api.get<any[]>(`api/trabajo-social/docentes${qs}`).pipe(
      map(users => (users || []).map(u => ({
        ...u,
        id: u.id,
        schoolId: u.schoolId?.toString()
      })))
    );
  }

  getGroupsWithTeachers(schoolId?: string, schoolYearId?: string): Observable<GroupWithTeachers[]> {
    const params: string[] = [];
    if (schoolId) params.push(`schoolId=${Number(schoolId)}`);
    if (schoolYearId) params.push(`schoolYearId=${Number(schoolYearId)}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<any[]>(`api/trabajo-social/grupos-con-docentes${qs}`).pipe(
      map(groups => (groups || []).map(group => ({
        ...group,
        id: group.id?.toString(),
        schoolId: group.schoolId?.toString(),
        schoolYearId: group.schoolYearId?.toString(),
        educationLevelId: group.educationLevelId,
        teachers: (group.teachers || []).map((t: any) => ({
          userId: t.userId,
          fullName: t.fullName,
          esTitular: t.esTitular
        }))
      })))
    );
  }

  assignDocenteToGroup(groupId: string, request: AssignDocenteRequest): Observable<ApiResponse<number>> {
    return this.api.post<number>(`api/trabajo-social/grupos/${Number(groupId)}/docentes`, {
      docenteId: request.docenteId,
      schoolYearId: Number(request.schoolYearId),
      esTitular: request.esTitular
    });
  }

  bulkRegister(request: TrabajoSocialBulkRegistrationRequest): Observable<ApiResponse<number>> {
    return this.api.post<number>('api/trabajo-social/inscripciones/masiva', {
      ...request,
      groupId: Number(request.groupId),
      schoolYearId: Number(request.schoolYearId)
    });
  }
}
