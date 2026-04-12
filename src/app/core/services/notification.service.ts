import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  NotificationItem,
  AddNotificationRequest,
  ApiResponse
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private api: ApiService) {}

  /** GET /api/notificaciones */
  getMyNotifications(): Observable<NotificationItem[]> {
    return this.api.get<NotificationItem>('api/notificaciones');
  }

  /** POST /api/notificaciones */
  createNotification(request: AddNotificationRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>('api/notificaciones', request);
  }

  /** POST /api/notificaciones/{id}/leer */
  markAsRead(id: string): Observable<ApiResponse<any>> {
    return this.api.post<any>(`api/notificaciones/${id}/leer`, {});
  }
}
