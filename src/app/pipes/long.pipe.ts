import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'long',
})
export class LongPipe implements PipeTransform {

  constructor() {}

  transform(value: number): string {
    return value !== undefined && value !== null
      ? value.toLocaleString('de-DE', { // de-DE is the only locale that allows showing a thousand separator under 10.000
          useGrouping: true,
          minimumIntegerDigits: 1,
          minimumFractionDigits: value % 1 !== 0 ? 3 : 0,
          maximumFractionDigits: value % 1 !== 0 ? 3 : 0,
        })
      : '';
  }

}
