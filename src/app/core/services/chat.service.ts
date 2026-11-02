import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { ApiService } from './api';
import { environment } from '../../../environments/environment';
import { ChatChannel, ChatContact, ChatMessage } from '../models/api-models';

/**
 * Módulo de chat (RQF06). REST para listar/enviar (SAEV3 /api/chat) y SignalR solo para
 * recibir mensajes en tiempo real; el hub vive en el mismo core detrás del gateway.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = inject(ApiService);
  private connection: HubConnection | null = null;
  private incoming = new Subject<ChatMessage>();

  /** Mensajes nuevos de cualquier canal del usuario (incluidos los propios desde otra pestaña). */
  readonly messages$ = this.incoming.asObservable();

  getChannels(): Observable<ChatChannel[]> {
    return this.api.get<ChatChannel[]>('api/chat/canales');
  }

  getContacts(): Observable<ChatContact[]> {
    return this.api.get<ChatContact[]>('api/chat/contactos');
  }

  openChannel(studentId: string, userId: string): Observable<ChatChannel> {
    return this.api.post<ChatChannel>('api/chat/canales', { studentId, userId }).pipe(map(r => r.data));
  }

  getMessages(channelId: number, beforeId?: number): Observable<ChatMessage[]> {
    const query = beforeId ? `?beforeId=${beforeId}` : '';
    return this.api.get<ChatMessage[]>(`api/chat/canales/${channelId}/mensajes${query}`);
  }

  sendMessage(channelId: number, text: string): Observable<ChatMessage> {
    return this.api.post<ChatMessage>(`api/chat/canales/${channelId}/mensajes`, { text }).pipe(map(r => r.data));
  }

  markAsRead(channelId: number): Observable<unknown> {
    // El gateway rechaza POST con cuerpo vacío, por eso se manda {}.
    return this.api.post(`api/chat/canales/${channelId}/leido`, {});
  }

  async connect(): Promise<void> {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) return;

    this.connection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/chat/hub`, {
        accessTokenFactory: () => localStorage.getItem('SIAE_JWT_TOKEN') ?? ''
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.on('mensaje', (message: ChatMessage) => this.incoming.next(message));

    try {
      await this.connection.start();
    } catch (err) {
      // Sin tiempo real el chat sigue funcionando por REST; solo no llegan mensajes solos.
      console.error('[Chat] No se pudo conectar al hub:', err);
    }
  }

  async disconnect(): Promise<void> {
    await this.connection?.stop();
    this.connection = null;
  }

  get isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }
}
