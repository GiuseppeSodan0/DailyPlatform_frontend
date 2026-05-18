import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      @for (toast of toastService.toasts$(); track toast.id) {
        <div
          class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all animate-slide-up"
          [class.bg-green-50]="toast.type === 'success'"
          [class.text-green-800]="toast.type === 'success'"
          [class.border]="toast.type === 'success'"
          [class.border-green-200]="toast.type === 'success'"
          [class.bg-red-50]="toast.type === 'error'"
          [class.text-red-800]="toast.type === 'error'"
          [class.border]="toast.type === 'error'"
          [class.border-red-200]="toast.type === 'error'"
          [class.bg-blue-50]="toast.type === 'info'"
          [class.text-blue-800]="toast.type === 'info'"
          [class.border]="toast.type === 'info'"
          [class.border-blue-200]="toast.type === 'info'"
        >
          <span class="flex-1">{{ toast.message }}</span>
          <button
            (click)="toastService.dismiss(toast.id)"
            class="p-1 rounded hover:bg-black/5 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(1rem); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up { animation: slide-up 0.2s ease-out; }
  `],
})
export class ToastContainer {
  toastService = inject(ToastService);
}
