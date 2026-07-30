import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api';
import {
  StudentListItem,
  StudentRecord,
  AddStudentRequest,
  UpdateStudentRequest,
  TutorListItem,
  AddTutorRequest,
  AddRegistrationRequest,
  BulkAddRegistrationRequest,
  ApiResponse
} from '../models/api-models';

export interface BulkRegistrationResult {
  studentId: string;
  success: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  constructor(private api: ApiService) {}


  getStudents(search?: string, schoolId?: string, groupId?: string): Observable<StudentListItem[]> {
    const params: string[] = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (schoolId) params.push(`schoolId=${schoolId}`);
    if (groupId) params.push(`groupId=${groupId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<StudentListItem[]>(`api/alumnos${qs}`);
  }


  getStudentRecord(id: string): Observable<StudentRecord> {
    return this.api.get<StudentRecord>(`api/alumnos/${id}`);
  }

  /** POST /api/alumnos */
  createStudent(request: AddStudentRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>('api/alumnos', request);
  }

  /** PUT /api/alumnos/{id} */
  updateStudent(id: string, request: UpdateStudentRequest): Observable<ApiResponse<any>> {
    return this.api.put<any>(`api/alumnos/${id}`, request);
  }

  /** GET /api/alumnos/{id}/tutores */
  getTutors(studentId: string): Observable<TutorListItem[]> {
    return this.api.get<TutorListItem[]>(`api/alumnos/${studentId}/tutores`);
  }

  /** POST /api/alumnos/{id}/tutores */
  addTutor(studentId: string, request: AddTutorRequest): Observable<ApiResponse<string>> {
    const payload = {
      completeName: request.completeName,
      parentesco: request.parent,
      phone: request.phoneNumber || null,
      email: request.email || null,
      address: request.address || null,
      userId: request.userId || null
    };
    return this.api.post<string>(`api/alumnos/${studentId}/tutores`, payload);
  }

  /** POST /api/inscripciones */
  addRegistration(request: AddRegistrationRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>('api/inscripciones', request);
  }

  /**
   * No existe un endpoint masivo real y alcanzable (el único "inscripciones/masiva"
   * vive en TrabajoSocialController, atado al rol TRABAJO_SOCIAL ya eliminado).
   * Se dispara una llamada a POST /api/inscripciones por alumno; los fallos
   * individuales (ej. ya inscrito) no cancelan al resto.
   */
  bulkAddRegistration(request: BulkAddRegistrationRequest): Observable<BulkRegistrationResult[]> {
    const calls = request.studentIds.map(studentId =>
      this.addRegistration({
        studentId,
        groupId: request.groupId,
        schoolYearId: request.schoolYearId
      }).pipe(
        map((): BulkRegistrationResult => ({ studentId, success: true })),
        catchError((err): Observable<BulkRegistrationResult> =>
          of({ studentId, success: false, error: err?.error?.message || err?.message || 'Error desconocido' })
        )
      )
    );
    return forkJoin(calls);
  }
}
