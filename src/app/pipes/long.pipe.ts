import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'long'
})
export class LongPipe implements PipeTransform {

  constructor(
    private translateService: TranslateService,
  ) {}

  transform(number: number): string {
    return number !== undefined && number !== null
      ? number.toLocaleString(this.translateService.currentLang, {
          useGrouping: true,
          minimumIntegerDigits: 1,
          minimumFractionDigits: number % 1 !== 0 ? 3 : 0,
          maximumFractionDigits: number % 1 !== 0 ? 3 : 0,
        })
      : '';
  }

}
