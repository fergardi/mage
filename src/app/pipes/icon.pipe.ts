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

  transform(text: string = '', object?: any): SafeHtml {
    if (text && object) {
      const terms = [object.skills || [], object.families || [], object.categories || [], object.units || [], object.resources || [], object.spells || [], object.adjacents || [], object.opposites || [], object.resistances || []].reduce((a, b) => a.concat(b), []);
      terms.forEach((term: any) => text = text.replace(`<${term.id}>`, `<img class="icon" title="${this.translateService.instant(term.name)}" src="${term.image}">`));
    }
    text = (text || '')
    .replace(/<gold>/g, `<img class="icon" title="${this.translateService.instant('resource.gold.name')}" src="/assets/images/resources/gold.png">`)
    .replace(/<mana>/g, `<img class="icon" title="${this.translateService.instant('resource.mana.name')}" src="/assets/images/resources/mana.png">`)
    .replace(/<population>/g, `<img class="icon" title="${this.translateService.instant('resource.population.name')}" src="/assets/images/resources/population.png">`)
    .replace(/<land>/g, `<img class="icon" title="${this.translateService.instant('resource.land.name')}" src="/assets/images/resources/land.png">`)
    .replace(/<turn>/g, `<img class="icon" title="${this.translateService.instant('resource.turn.name')}" src="/assets/images/resources/turn.png">`)
    .replace(/<gem>/g, `<img class="icon" title="${this.translateService.instant('resource.gem.name')}" src="/assets/images/resources/gem.png">`)
    .replace(/<power>/g, `<img class="icon" title="${this.translateService.instant('icon.power.name')}" src="/assets/images/icons/power.png">`)
    .replace(/<attack>/g, `<img class="icon" title="${this.translateService.instant('type.attack.name')}" src="/assets/images/icons/attack.png">`)
    .replace(/<defense>/g, `<img class="icon" title="${this.translateService.instant('type.defense.name')}" src="/assets/images/icons/defense.png">`)
    .replace(/<health>/g, `<img class="icon" title="${this.translateService.instant('type.health.name')}" src="/assets/images/icons/health.png">`)
    .replace(/<initiative>/g, `<img class="icon" title="${this.translateService.instant('type.initiative.name')}" src="/assets/images/icons/initiative.png">`)
    .replace(/<skeleton>/g, `<img class="icon" title="${this.translateService.instant('unit.skeleton.name')}" src="/assets/images/units/black/skeleton.png">`)
    .replace(/<sheep>/g, `<img class="icon" title="${this.translateService.instant('unit.sheep.name')}" src="/assets/images/units/grey/sheep.png">`);
    return this.domSanitizer.bypassSecurityTrustHtml(text);
  }

}
