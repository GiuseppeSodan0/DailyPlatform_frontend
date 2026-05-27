import { Component, input, model, signal, computed, ElementRef, HostListener, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SelectItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="relative">
      <button
        type="button"
        (click)="toggle()"
        class="w-full flex items-center justify-between rounded-lg border border-gray-300 px-4 py-2.5 text-sm bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
        [class.text-gray-900]="!!selectedItem()"
        [class.text-gray-400]="!selectedItem()"
      >
        <span class="truncate">{{ selectedItem()?.name || placeholder() }}</span>
        <svg class="w-4 h-4 ml-2 text-gray-400 shrink-0 transition-transform" [class.rotate-180]="open()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      @if (open()) {
        <div class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          @if (searchable()) {
            <div class="p-2 border-b border-gray-100">
              <input
                #searchInput
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                (keydown)="onKeydown($event)"
                type="text"
                placeholder="Cerca..."
                class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
          }
          <div class="overflow-y-auto max-h-48">
            @for (item of filteredItems(); track item.id; let i = $index) {
              <button
                type="button"
                (click)="select(item)"
                (mouseenter)="hoveredIndex.set(i)"
                class="w-full text-left px-4 py-2 text-sm transition-colors"
                [class.bg-blue-50]="item.id === selectedId()"
                [class.text-blue-700]="item.id === selectedId()"
                [class.font-medium]="item.id === selectedId()"
                [class.bg-gray-50]="hoveredIndex() === i && item.id !== selectedId()"
                [class.text-gray-900]="true"
              >
                {{ item.name }}
              </button>
            } @empty {
              <div class="px-4 py-6 text-center text-sm text-gray-400">Nessun risultato</div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class AppSelect {
  readonly items = input<SelectItem[]>([]);
  readonly placeholder = input('Seleziona...');
  readonly searchable = input(true);
  readonly selectedId = model<number | null>(null);

  readonly open = signal(false);
  readonly searchQuery = signal('');
  readonly hoveredIndex = signal(0);

  private searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  constructor(private elementRef: ElementRef) {}

  selectedItem = computed(() => {
    const id = this.selectedId();
    if (id === null) return null;
    return this.items().find(i => i.id === id) ?? null;
  });

  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.items();
    return this.items().filter(i => i.name.toLowerCase().includes(query));
  });

  toggle(): void {
    if (this.open()) {
      this.close();
    } else {
      this.openDropdown();
    }
  }

  openDropdown(): void {
    this.open.set(true);
    this.hoveredIndex.set(0);
    this.searchQuery.set('');
    setTimeout(() => {
      this.searchInputRef()?.nativeElement.focus();
    });
  }

  close(): void {
    this.open.set(false);
    this.searchQuery.set('');
    this.hoveredIndex.set(0);
  }

  select(item: SelectItem): void {
    this.selectedId.set(item.id);
    this.close();
  }

  onKeydown(event: KeyboardEvent): void {
    const items = this.filteredItems();
    if (items.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.hoveredIndex.update(i => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.hoveredIndex.update(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        this.select(items[this.hoveredIndex()]);
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
