import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'icon',
})
export class IconPipe implements PipeTransform {

  constructor(
    private domSanitizer: DomSanitizer,
    private translateService: TranslateService,
  ) {}

  transform(text: string, object: any): SafeHtml {
    if (object) {
      const terms = [object.skills || [], object.families || [], object.categories || [], object.units || [], object.resources || [], object.spells || [], object.adjacents || [], object.opposites || []].reduce((a, b) => a.concat(b), []);
      terms.forEach((term: any) => {
        text = text.replace(`<${term.id}>`, `<img class="icon" title="${this.translateService.instant(term.name)}" src="${term.image}">`);
      });
      return this.domSanitizer.bypassSecurityTrustHtml(text);
    } else {
      return text;
    }
  }

}
