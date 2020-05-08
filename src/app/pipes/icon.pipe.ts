import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'icon'
})
export class IconPipe implements PipeTransform {

  constructor(
    private domSanitizer: DomSanitizer,
    private translateService: TranslateService,
  ) {}

  transform(text: string, skills: any[], families: any[], categories: any[], units: any[], resources: any[], spells: any[]): SafeHtml {
    let terms = [skills, families, categories, units, resources, spells].reduce((a, b) => a.concat(b), []);
    terms.forEach(term => {
      text = text.replace(`<${term.id}>`, `&nbsp;<img class="icon" title="${this.translateService.instant(term.name)}" src="${term.image}"/>&nbsp;`);
    })
    return this.domSanitizer.bypassSecurityTrustHtml(text);
  }

}
