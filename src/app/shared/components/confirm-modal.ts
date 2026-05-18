import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" (click)="cancel.emit()"></div>
        <div class="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ title() }}</h3>
          <p class="mt-2 text-sm text-gray-600">{{ message() }}</p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              (click)="cancel.emit()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {{ cancelText() }}
            </button>
            <button
              (click)="confirm.emit()"
              [class]="'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ' + (danger() ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700')"
            >
              {{ confirmText() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmModal {
  open = input(false);
  title = input('Conferma');
  message = input('Sei sicuro?');
  confirmText = input('Conferma');
  cancelText = input('Annulla');
  danger = input(false);
  confirm = output<void>();
  cancel = output<void>();
}
