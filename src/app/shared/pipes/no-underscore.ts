import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noUnderscore',
  standalone: true,
})
export class NoUnderscorePipe implements PipeTransform {
  transform(value: unknown): string {
    return typeof value === 'string' ? value.replace(/_/g, ' ') : '';
  }
}
