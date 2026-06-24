import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  MaterialListItem,
  AddMaterialRequest,
  ApiResponse,
  CIEDimensionCatalog
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class MaterialService {
  constructor(private api: ApiService) {}

  /** GET /api/materiales?tag=&dimensionId=&grade= */
  getMaterials(tag?: string, dimensionId?: string, grade?: number): Observable<MaterialListItem[]> {
    const params: string[] = [];
    if (tag) params.push(`tag=${encodeURIComponent(tag)}`);
    if (dimensionId) params.push(`dimensionId=${dimensionId}`);
    if (grade !== undefined) params.push(`grade=${grade}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<MaterialListItem[]>(`api/v1/materiales${qs}`);
  }

  /** POST /api/materiales */
  createMaterial(request: AddMaterialRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>('api/v1/materiales', request);
  }

  /** POST /api/materiales/{id}/tags */
  assignTags(materialId: string, tags: string[]): Observable<ApiResponse<string[]>> {
    return this.api.post<string[]>(`api/v1/materiales/${materialId}/tags`, { tags });
  }

  /** GET /api/dialogos?materialId= */
  getDialogs(materialId?: string): Observable<any[]> {
    const qs = materialId ? `?materialId=${materialId}` : '';
    return this.api.get<any[]>(`api/v1/dialogos${qs}`);
  }

  /** POST /api/dialogos */
  createDialog(request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>('api/v1/dialogos', request);
  }

  /** GET /api/cie/catalogos/dimensiones */
  getCIEDimensions(): Observable<CIEDimensionCatalog[]> {
    return this.api.get<CIEDimensionCatalog[]>('api/v1/cie/catalogos/dimensiones');
  }
}
