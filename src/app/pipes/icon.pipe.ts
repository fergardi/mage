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
    let terms = [];
    if (skills) terms = terms.concat(skills);
    if (families) terms = terms.concat(families);
    if (categories) terms = terms.concat(categories);
    if (units) terms = terms.concat(units);
    if (resources) terms = terms.concat(resources);
    if (spells) terms = terms.concat(spells);
    terms.forEach(term => {
      text = text.replace(`<${term.id}>`, `&nbsp;<img class="icon" title="${this.translateService.instant(term.name)}" src="${term.image}"/>&nbsp;`);
    })
    return this.domSanitizer.bypassSecurityTrustHtml(text);
  }

}
