import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, MaterialListItem, AddMaterialRequest } from '../models/api-models';

export interface MaterialFilters {
  tag?: string;
  tipoId?: number;
  grado?: number;
  nivelId?: number;
  attentionAreaId?: number;
  nivelDesempeno?: string;
  q?: string;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  mime: string;
}

// api/v1/materiales vive en backend-clases (responde "crudo"), pero el
// interceptor global normaliza TODO a { statusCode, data, ... } — ver la nota
// en alumno-portal.service.ts. Por eso aquí también se desenvuelve `.data`.
@Injectable({ providedIn: 'root' })
export class MaterialService {
  constructor(private http: HttpClient) {}

  private buildQuery(filters: MaterialFilters): string {
    const params: string[] = [];
    if (filters.tag) params.push(`tag=${encodeURIComponent(filters.tag)}`);
    if (filters.tipoId !== undefined) params.push(`tipoId=${filters.tipoId}`);
    if (filters.grado !== undefined) params.push(`grado=${filters.grado}`);
    if (filters.nivelId !== undefined) params.push(`nivelId=${filters.nivelId}`);
    if (filters.attentionAreaId !== undefined) params.push(`attentionAreaId=${filters.attentionAreaId}`);
    if (filters.nivelDesempeno) params.push(`nivelDesempeno=${encodeURIComponent(filters.nivelDesempeno)}`);
    if (filters.q) params.push(`q=${encodeURIComponent(filters.q)}`);
    return params.length ? `?${params.join('&')}` : '';
  }

  /** GET /api/v1/materiales — catálogo publicado (+ borradores propios) */
  getMateriales(filters: MaterialFilters = {}): Observable<MaterialListItem[]> {
    return this.http.get<ApiResponse<MaterialListItem[]>>(`api/v1/materiales${this.buildQuery(filters)}`)
      .pipe(map(r => r.data));
  }

  /** GET /api/v1/materiales/mios — materiales propios (todos los estados) */
  getMisMateriales(todos = false): Observable<MaterialListItem[]> {
    return this.http.get<ApiResponse<MaterialListItem[]>>(`api/v1/materiales/mios?todos=${todos}`)
      .pipe(map(r => r.data));
  }

  /** GET /api/v1/materiales/{id} */
  getMaterial(id: number): Observable<MaterialListItem> {
    return this.http.get<ApiResponse<MaterialListItem>>(`api/v1/materiales/${id}`)
      .pipe(map(r => r.data));
  }

  /** POST /api/v1/materiales */
  createMaterial(request: AddMaterialRequest): Observable<{ id: number }> {
    return this.http.post<ApiResponse<{ id: number }>>('api/v1/materiales', request)
      .pipe(map(r => r.data));
  }

  /** PUT /api/v1/materiales/{id} */
  updateMaterial(id: number, request: AddMaterialRequest): Observable<void> {
    return this.http.put<ApiResponse<void>>(`api/v1/materiales/${id}`, request)
      .pipe(map(r => r.data));
  }

  /** PATCH /api/v1/materiales/{id}/publicado */
  setPublicado(id: number, publicado: boolean): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`api/v1/materiales/${id}/publicado`, { publicado })
      .pipe(map(r => r.data));
  }

  /** DELETE /api/v1/materiales/{id} */
  deleteMaterial(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`api/v1/materiales/${id}`)
      .pipe(map(r => r.data));
  }

  /** POST /api/v1/materiales/upload (multipart/form-data) */
  uploadFile(file: File, kind?: 'archivo' | 'thumbnail'): Observable<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (kind) formData.append('kind', kind);
    return this.http.post<ApiResponse<UploadResult>>('api/v1/materiales/upload', formData)
      .pipe(map(r => r.data));
  }
}
