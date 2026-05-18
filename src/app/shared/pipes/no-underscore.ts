import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noUnderscore',
  standalone: true,
})
export class NoUnderscorePipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/_/g, ' ');
  }
}
