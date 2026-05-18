import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal-wrapper',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 sm:pt-20 overflow-y-auto">
        <div class="fixed inset-0 bg-black/50" (click)="close.emit()"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto p-6 sm:p-8">
          <button
            (click)="close.emit()"
            class="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          @if (title()) {
            <h2 class="text-xl font-semibold text-gray-900 mb-6 pr-8">{{ title() }}</h2>
          }
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class ModalWrapper {
  open = input(false);
  title = input('');
  close = output<void>();
}
