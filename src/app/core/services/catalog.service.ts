import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  SchoolYear,
  SchoolZone,
  School,
  Group,
  DisabilityCatalog,
  AttentionArea,
  MaterialType,
  EnumOption,
  ApiResponse,
  AddSchoolZoneRequest,
  AddSchoolYearRequest
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  constructor(private api: ApiService) {}

  /** GET /api/catalogos/ciclos-escolares?onlyActive= */
  getSchoolYears(onlyActive?: boolean): Observable<SchoolYear[]> {
    const qs = onlyActive !== undefined ? `?onlyActive=${onlyActive}` : '';
    return this.api.get<SchoolYear>(`api/catalogos/ciclos-escolares${qs}`);
  }

  /** POST /api/catalogos/ciclos-escolares */
  createSchoolYear(request: AddSchoolYearRequest): Observable<ApiResponse<SchoolYear>> {
    return this.api.post<SchoolYear>('api/catalogos/ciclos-escolares', request);
  }

  /** GET /api/catalogos/zonas-escolares */
  getSchoolZones(): Observable<SchoolZone[]> {
    return this.api.get<SchoolZone>('api/catalogos/zonas-escolares');
  }

  /** GET /api/catalogos/escuelas?schoolZoneId= */
  getSchools(schoolZoneId?: string): Observable<School[]> {
    const qs = schoolZoneId ? `?schoolZoneId=${schoolZoneId}` : '';
    return this.api.get<School>(`api/catalogos/escuelas${qs}`);
  }

  /** GET /api/catalogos/grados */
  getGrades(): Observable<EnumOption[]> {
    return this.api.get<EnumOption>('api/catalogos/grados');
  }

  /** GET /api/catalogos/grupos?schoolId=&schoolYearId= */
  getGroups(schoolId?: string, schoolYearId?: string): Observable<Group[]> {
    const params: string[] = [];
    if (schoolId) params.push(`schoolId=${schoolId}`);
    if (schoolYearId) params.push(`schoolYearId=${schoolYearId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<Group>(`api/catalogos/grupos${qs}`);
  }

  /** GET /api/catalogos/discapacidades */
  getDisabilities(): Observable<DisabilityCatalog[]> {
    return this.api.get<DisabilityCatalog>('api/catalogos/discapacidades');
  }

  /** GET /api/catalogos/areas-atencion */
  getAttentionAreas(): Observable<AttentionArea[]> {
    return this.api.get<AttentionArea>('api/catalogos/areas-atencion');
  }

  /** GET /api/catalogos/tipos-material */
  getMaterialTypes(): Observable<MaterialType[]> {
    return this.api.get<MaterialType>('api/catalogos/tipos-material');
  }

  /** POST /api/catalogos/zonas-escolares */
  createSchoolZone(request: AddSchoolZoneRequest): Observable<ApiResponse<SchoolZone>> {
    return this.api.post<SchoolZone>('api/catalogos/zonas-escolares', request);
  }

  /** POST /api/catalogos/escuelas */
  createSchool(request: any): Observable<ApiResponse<School>> {
    return this.api.post<School>('api/catalogos/escuelas', request);
  }

  /** POST /api/catalogos/grupos */
  createGroup(request: any): Observable<ApiResponse<Group>> {
    return this.api.post<Group>('api/catalogos/grupos', request);
  }
}
