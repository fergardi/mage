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
    return number.toLocaleString(this.translateService.currentLang, {
      useGrouping: true,
      minimumIntegerDigits: 1,
      maximumFractionDigits: 0,
    });
  }

}