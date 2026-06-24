import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api';
import { Group, School, SchoolYear, StudentListItem } from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class PsicologiaService {
  constructor(private api: ApiService) {}

  getSchools(): Observable<School[]> {
    return this.api.get<any[]>('api/psicologia/escuelas').pipe(
      map(schools => (schools || []).map(school => ({
        ...school,
        id: school.id?.toString(),
        schoolZoneId: school.schoolZoneId?.toString()
      })))
    );
  }

  getSchoolYears(onlyActive?: boolean): Observable<SchoolYear[]> {
    const qs = onlyActive !== undefined ? `?onlyActive=${onlyActive}` : '';
    return this.api.get<SchoolYear[]>(`api/psicologia/ciclos-escolares${qs}`);
  }

  getGroups(schoolId?: string, schoolYearId?: string): Observable<Group[]> {
    const params: string[] = [];
    if (schoolId) params.push(`schoolId=${Number(schoolId)}`);
    if (schoolYearId) params.push(`schoolYearId=${Number(schoolYearId)}`);
    const qs = params.length ? `?${params.join('&')}` : '';

    return this.api.get<any[]>(`api/psicologia/grupos${qs}`).pipe(
      map(groups => (groups || []).map(group => ({
        ...group,
        id: group.id?.toString(),
        schoolId: group.schoolId?.toString(),
        schoolYearId: group.schoolYearId?.toString(),
        educationLevelId: group.educationLevelId ?? group.EducationLevelId
      })))
    );
  }

  getStudents(search?: string, schoolId?: string, groupId?: string): Observable<StudentListItem[]> {
    const params: string[] = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (schoolId) params.push(`schoolId=${Number(schoolId)}`);
    if (groupId) params.push(`groupId=${Number(groupId)}`);
    const qs = params.length ? `?${params.join('&')}` : '';

    return this.api.get<any[]>(`api/psicologia/alumnos${qs}`).pipe(
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
}
