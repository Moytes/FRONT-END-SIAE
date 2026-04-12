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
  ApiResponse
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  constructor(private api: ApiService) {}

  /** GET /api/ciclos-escolares?onlyActive= */
  getSchoolYears(onlyActive?: boolean): Observable<SchoolYear[]> {
    const qs = onlyActive !== undefined ? `?onlyActive=${onlyActive}` : '';
    return this.api.get<SchoolYear>(`api/ciclos-escolares${qs}`);
  }

  /** GET /api/zonas-escolares */
  getSchoolZones(): Observable<SchoolZone[]> {
    return this.api.get<SchoolZone>('api/zonas-escolares');
  }

  /** GET /api/escuelas?schoolZoneId= */
  getSchools(schoolZoneId?: string): Observable<School[]> {
    const qs = schoolZoneId ? `?schoolZoneId=${schoolZoneId}` : '';
    return this.api.get<School>(`api/escuelas${qs}`);
  }

  /** GET /api/grados */
  getGrades(): Observable<EnumOption[]> {
    return this.api.get<EnumOption>('api/grados');
  }

  /** GET /api/grupos?schoolId=&schoolYearId= */
  getGroups(schoolId?: string, schoolYearId?: string): Observable<Group[]> {
    const params: string[] = [];
    if (schoolId) params.push(`schoolId=${schoolId}`);
    if (schoolYearId) params.push(`schoolYearId=${schoolYearId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<Group>(`api/grupos${qs}`);
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
}
