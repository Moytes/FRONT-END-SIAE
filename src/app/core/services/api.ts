import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-models';
import { environment } from '../../../environments/environment';

export const API_BASE_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  /** 
   * GET — Retorna directamente los datos (data) del JSchema.
   */
  get<T>(endpoint: string): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(endpoint)
      .pipe(map(r => r.data));
  }

  /** 
   * GET RAW — Retorna el ApiResponse completo.
   */
  getRaw<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(endpoint);
  }

  /** POST — Retorna el ApiResponse completo */
  post<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(endpoint, body);
  }

  /** PUT — Retorna el ApiResponse completo */
  put<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(endpoint, body);
  }

  /** DELETE — Retorna el ApiResponse completo */
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(endpoint);
  }
}
