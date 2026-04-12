import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  StudentAssignmentListItem,
  AddAssignmentRequest,
  CompleteAssignmentStudentRequest,
  ApiResponse
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  constructor(private api: ApiService) {}

  /** POST /api/asignaciones */
  createAssignment(request: AddAssignmentRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>('api/asignaciones', request);
  }

  /** GET /api/alumnos/{id}/asignaciones */
  getAssignmentsByStudent(studentId: string): Observable<StudentAssignmentListItem[]> {
    return this.api.get<StudentAssignmentListItem>(`api/alumnos/${studentId}/asignaciones`);
  }

  /** POST /api/asignaciones-alumnos/{id}/completar */
  completeAssignmentStudent(
    assignmentStudentId: string,
    request: CompleteAssignmentStudentRequest
  ): Observable<ApiResponse<any>> {
    return this.api.post<any>(`api/asignaciones-alumnos/${assignmentStudentId}/completar`, request);
  }

  /** POST /api/dialogos/{id}/progreso */
  addDialogProgress(dialogId: string, request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>(`api/dialogos/${dialogId}/progreso`, request);
  }
}
