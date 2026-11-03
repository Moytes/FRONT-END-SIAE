import { Component, ElementRef, OnDestroy, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, firstValueFrom } from 'rxjs';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../services/auth.service';
import { ChatChannel, ChatChannelKind, ChatContact, ChatMessage, UserRole } from '../../core/models/api-models';

type KindFilter = 'all' | ChatChannelKind;

const KIND_LABELS: Record<ChatChannelKind, string> = {
  DOCENTE_ESPECIALISTA: 'Docente · Especialista',
  FAMILIA_DOCENTE: 'Familia · Docente',
};

/**
 * Chat (RQF06): canales docente↔especialista y familia↔docente, siempre sobre un alumno.
 * El historial y el envío van por REST; SignalR solo empuja los mensajes nuevos.
 */
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatPage implements OnInit, OnDestroy {
  private chat = inject(ChatService);
  private auth = inject(AuthService);
  private subscription?: Subscription;
  private messagesBox = viewChild<ElementRef<HTMLElement>>('messagesBox');

  readonly kindLabels = KIND_LABELS;
  readonly pageSize = 50;

  channels = signal<ChatChannel[]>([]);
  activeChannelId = signal<number | null>(null);
  messages = signal<ChatMessage[]>([]);
  kindFilter = signal<KindFilter>('all');
  search = signal('');
  draft = '';

  loadingChannels = signal(true);
  loadingMessages = signal(false);
  hasOlder = signal(false);
  sending = signal(false);
  error = signal('');

  // Nueva conversación
  showNewChat = signal(false);
  contacts = signal<ChatContact[]>([]);
  loadingContacts = signal(false);
  contactSearch = signal('');

  get myId(): string | undefined {
    return this.auth.currentUser()?.id;
  }

  /** Solo el docente participa en los dos tipos de canal; los demás ven uno solo. */
  readonly showKindFilter = computed(() => Number(this.auth.currentUser()?.role) === UserRole.DOCENTE);

  readonly activeChannel = computed(() =>
    this.channels().find(c => c.id === this.activeChannelId()) ?? null);

  readonly filteredChannels = computed(() => {
    const q = this.search().trim().toLocaleLowerCase('es');
    const kind = this.kindFilter();
    return this.channels().filter(c =>
      (kind === 'all' || c.kind === kind) &&
      (!q || `${c.counterpartName} ${c.studentName} ${c.counterpartRole}`.toLocaleLowerCase('es').includes(q)));
  });

  readonly filteredContacts = computed(() => {
    const q = this.contactSearch().trim().toLocaleLowerCase('es');
    return this.contacts().filter(c =>
      !q || `${c.userName} ${c.studentName} ${c.userRole}`.toLocaleLowerCase('es').includes(q));
  });

  async ngOnInit(): Promise<void> {
    this.subscription = this.chat.messages$.subscribe(m => this.onIncoming(m));
    await Promise.all([this.chat.connect(), this.loadChannels()]);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.chat.disconnect();
  }

  async loadChannels(): Promise<void> {
    this.loadingChannels.set(true);
    try {
      this.channels.set(await firstValueFrom(this.chat.getChannels()));
    } catch {
      this.error.set('No se pudieron cargar las conversaciones.');
    } finally {
      this.loadingChannels.set(false);
    }
  }

  async selectChannel(channel: ChatChannel): Promise<void> {
    this.activeChannelId.set(channel.id);
    this.messages.set([]);
    this.error.set('');
    this.loadingMessages.set(true);
    try {
      const page = await firstValueFrom(this.chat.getMessages(channel.id));
      if (this.activeChannelId() !== channel.id) return;
      this.messages.set(page);
      this.hasOlder.set(page.length === this.pageSize);
      this.scrollToBottom();
      this.markRead(channel.id);
    } catch {
      this.error.set('No se pudo cargar el historial.');
    } finally {
      this.loadingMessages.set(false);
    }
  }

  async loadOlder(): Promise<void> {
    const channelId = this.activeChannelId();
    const first = this.messages()[0];
    if (!channelId || !first) return;

    this.loadingMessages.set(true);
    try {
      const page = await firstValueFrom(this.chat.getMessages(channelId, first.id));
      this.messages.update(list => [...page, ...list]);
      this.hasOlder.set(page.length === this.pageSize);
    } finally {
      this.loadingMessages.set(false);
    }
  }

  async send(): Promise<void> {
    const channelId = this.activeChannelId();
    const text = this.draft.trim();
    if (!channelId || !text || this.sending()) return;

    this.sending.set(true);
    this.error.set('');
    try {
      const message = await firstValueFrom(this.chat.sendMessage(channelId, text));
      this.draft = '';
      this.appendMessage(message);
    } catch (err: any) {
      this.error.set(typeof err?.error?.data === 'string' ? err.error.data : 'No se pudo enviar el mensaje.');
    } finally {
      this.sending.set(false);
    }
  }

  onDraftKeydown(event: KeyboardEvent): void {
    // Enter envía; Shift+Enter hace salto de línea.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  async openNewChat(): Promise<void> {
    this.showNewChat.set(true);
    this.contactSearch.set('');
    this.loadingContacts.set(true);
    try {
      this.contacts.set(await firstValueFrom(this.chat.getContacts()));
    } catch {
      this.error.set('No se pudieron cargar los contactos.');
    } finally {
      this.loadingContacts.set(false);
    }
  }

  async startChat(contact: ChatContact): Promise<void> {
    try {
      const channel = await firstValueFrom(this.chat.openChannel(contact.studentId, contact.userId));
      this.channels.update(list => [channel, ...list.filter(c => c.id !== channel.id)]);
      this.showNewChat.set(false);
      this.kindFilter.set('all');
      this.search.set('');
      await this.selectChannel(channel);
    } catch (err: any) {
      this.error.set(typeof err?.error?.data === 'string' ? err.error.data : 'No se pudo abrir la conversación.');
    }
  }

  isMine(message: ChatMessage): boolean {
    return message.senderId === this.myId;
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  formatTime(value?: string | null): string {
    if (!value) return '';
    const date = new Date(value);
    const now = new Date();
    return date.toDateString() === now.toDateString()
      ? date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  }

  private onIncoming(message: ChatMessage): void {
    const known = this.channels().some(c => c.id === message.channelId);
    if (!known) {
      // Alguien abrió un canal nuevo con este usuario.
      this.loadChannels();
      return;
    }

    const isActive = message.channelId === this.activeChannelId();
    this.channels.update(list => {
      const updated = list.map(c => c.id !== message.channelId ? c : {
        ...c,
        lastMessage: message.text,
        lastMessageAt: message.createdAt,
        unreadCount: isActive || message.senderId === this.myId ? 0 : c.unreadCount + 1,
      });
      // La conversación con actividad sube al inicio.
      return [...updated.filter(c => c.id === message.channelId), ...updated.filter(c => c.id !== message.channelId)];
    });

    if (isActive) {
      this.appendMessage(message);
      if (message.senderId !== this.myId) this.markRead(message.channelId);
    }
  }

  private appendMessage(message: ChatMessage): void {
    // El mensaje propio llega dos veces (respuesta del POST y eco del hub).
    if (this.messages().some(m => m.id === message.id)) return;
    this.messages.update(list => [...list, message]);
    this.channels.update(list => list.map(c => c.id !== message.channelId ? c : {
      ...c, lastMessage: message.text, lastMessageAt: message.createdAt,
    }));
    this.scrollToBottom();
  }

  private markRead(channelId: number): void {
    this.channels.update(list => list.map(c => c.id === channelId ? { ...c, unreadCount: 0 } : c));
    this.chat.markAsRead(channelId).subscribe({ error: () => { /* no bloquea la lectura */ } });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messagesBox()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
