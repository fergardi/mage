import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'long',
})
export class LongPipe implements PipeTransform {

  constructor() {}

  transform(number: number): string {
    return number !== undefined && number !== null
      ? number.toLocaleString('de-DE', { // de-DE is the only locale that allows show a thousand separator under 10.000
          useGrouping: true,
          minimumIntegerDigits: 1,
          minimumFractionDigits: number % 1 !== 0 ? 3 : 0,
          maximumFractionDigits: number % 1 !== 0 ? 3 : 0,
        })
      : '';
  }

}
