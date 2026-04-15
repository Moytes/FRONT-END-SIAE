import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  StudentListItem,
  StudentRecord,
  AddStudentRequest,
  UpdateStudentRequest,
  TutorListItem,
  AddTutorRequest,
  AddRegistrationRequest,
  ApiResponse
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class StudentService {
  constructor(private api: ApiService) {}


  getStudents(search?: string, schoolId?: string): Observable<StudentListItem[]> {
    const params: string[] = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (schoolId) params.push(`schoolId=${schoolId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<StudentListItem>(`api/alumnos${qs}`);
  }


  getStudentRecord(id: string): Observable<StudentRecord[]> {
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
    return this.api.get<TutorListItem>(`api/alumnos/${studentId}/tutores`);
  }

  /** POST /api/alumnos/{id}/tutores */
  addTutor(studentId: string, request: AddTutorRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(`api/alumnos/${studentId}/tutores`, request);
  }

  /** POST /api/inscripciones */
  addRegistration(request: AddRegistrationRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>('api/inscripciones', request);
  }
}
