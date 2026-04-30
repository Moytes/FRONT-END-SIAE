import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-models';

// En desarrollo, el proxy configurado en angular.json redirigirá las peticiones /api a Render.
// En producción (Vercel/Render), se puede configurar la URL base real o usar rutas relativas si están en el mismo dominio.
export const API_BASE_URL = ''; 

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  readonly baseUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  /** GET — returns the unwrapped data array */
  get<T>(endpoint: string): Observable<T[]> {
    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`)
      .pipe(map(r => r.data));
  }

  /** GET — returns the full ApiResponse */
  getRaw<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`);
  }

  /** POST — returns the full ApiResponse */
  post<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body);
  }

  /** PUT — returns the full ApiResponse */
  put<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body);
  }

  /** DELETE — returns the full ApiResponse */
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`);
  }
}
