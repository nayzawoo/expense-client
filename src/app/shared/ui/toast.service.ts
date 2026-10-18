import { Injectable, signal } from '@angular/core';

export type ToastSeverity = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  severity: ToastSeverity;
  summary: string;
}

@Injectable()
export class ToastService {
  private nextId = 1;
  readonly messages = signal<ToastMessage[]>([]);

  show(severity: ToastSeverity, summary: string): void {
    const id = this.nextId++;
    this.messages.update((list) => [...list, { id, severity, summary }]);
    window.setTimeout(() => this.dismiss(id), 4000);
  }

  dismiss(id: number): void {
    this.messages.update((list) => list.filter((m) => m.id !== id));
  }
}
