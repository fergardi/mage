import { Injectable } from '@angular/core';
import { TourService } from 'ngx-ui-tour-md-menu';
import { BehaviorSubject, Subject, ReplaySubject } from 'rxjs';
import { IStepOption } from 'ngx-ui-tour-core';

@Injectable({
  providedIn: 'root',
})
export class TutorialService {

  public loaded: ReplaySubject<void> = new ReplaySubject(); // tour

  constructor(
    private tourService: TourService,
  ) {console.log('created') }

  ready() {
    this.loaded.next();
  }

  start(step?: string | undefined) {
    if (step) this.tourService.startAt(step);
    else this.tourService.start();
  }

  initialize() {
    const options: IStepOption = {
      preventScrolling: false,
      enableBackdrop: true,
      waitFor: this.loaded,
    };
    this.tourService.disableHotkeys();
    this.tourService.initialize([
      { route: '/user/landing', stepId: 'tour.legend', anchorId: 'tour.legend', title: 'tour.legend.name', content: 'tour.legend.description' },
      { route: '/kingdom/city', stepId: 'tour.supplies', anchorId: 'tour.supplies', title: 'tour.supplies.name', content: 'tour.supplies.description' },
      { route: '/kingdom/city', stepId: 'tour.city', anchorId: 'tour.city', title: 'tour.city.name', content: 'tour.city.description' },
      { route: '/kingdom/city', stepId: 'tour.tax', anchorId: 'tour.tax', title: 'tour.tax.name', content: 'tour.tax.description' },
      { route: '/kingdom/city', stepId: 'tour.charge', anchorId: 'tour.charge', title: 'tour.charge.name', content: 'tour.charge.description' },
      { route: '/kingdom/city', stepId: 'tour.explore', anchorId: 'tour.explore', title: 'tour.explore.name', content: 'tour.explore.description' },
      { route: '/kingdom/army', stepId: 'tour.army', anchorId: 'tour.army', title: 'tour.army.name', content: 'tour.army.description' },
      { route: '/kingdom/army', stepId: 'tour.attack', anchorId: 'tour.attack', title: 'tour.attack.name', content: 'tour.attack.description' },
      { route: '/kingdom/army', stepId: 'tour.defense', anchorId: 'tour.defense', title: 'tour.defense.name', content: 'tour.defense.description' },
      { route: '/kingdom/army', stepId: 'tour.recruit', anchorId: 'tour.recruit', title: 'tour.recruit.name', content: 'tour.recruit.description' },
      { route: '/kingdom/auction', stepId: 'tour.auction', anchorId: 'tour.auction', title: 'tour.auction.name', content: 'tour.auction.description' },
      { route: '/kingdom/auction', stepId: 'tour.bid', anchorId: 'tour.bid', title: 'tour.bid.name', content: 'tour.bid.description' },
      { route: '/kingdom/census', stepId: 'tour.census', anchorId: 'tour.census', title: 'tour.census.name', content: 'tour.census.description' },
      { route: '/kingdom/census', stepId: 'tour.kingdom', anchorId: 'tour.kingdom', title: 'tour.kingdom.name', content: 'tour.kingdom.description' },
      { route: '/kingdom/archive', stepId: 'tour.archive', anchorId: 'tour.archive', title: 'tour.archive.name', content: 'tour.archive.description' },
      { route: '/kingdom/emporium', stepId: 'tour.emporium', anchorId: 'tour.emporium', title: 'tour.emporium.name', content: 'tour.emporium.description' },
      { route: '/kingdom/emporium', stepId: 'tour.packs', anchorId: 'tour.packs', title: 'tour.packs.name', content: 'tour.packs.description' },
      { route: '/kingdom/temple', stepId: 'tour.temple', anchorId: 'tour.temple', title: 'tour.temple.name', content: 'tour.temple.description' },
      { route: '/kingdom/temple', stepId: 'tour.break', anchorId: 'tour.break', title: 'tour.break.name', content: 'tour.break.description' },
      { route: '/kingdom/temple', stepId: 'tour.dispel', anchorId: 'tour.dispel', title: 'tour.dispel.name', content: 'tour.dispel.description' },
      { route: '/kingdom/sorcery', stepId: 'tour.artifacts', anchorId: 'tour.artifacts', title: 'tour.artifacts.name', content: 'tour.artifacts.description' },
      { route: '/kingdom/sorcery', stepId: 'tour.spells', anchorId: 'tour.spells', title: 'tour.spells.name', content: 'tour.spells.description' },
      { route: '/kingdom/sorcery', stepId: 'tour.arcanism', anchorId: 'tour.arcanism', title: 'tour.arcanism.name', content: 'tour.arcanism.description' },
      { route: '/kingdom/sorcery', stepId: 'tour.protection', anchorId: 'tour.protection', title: 'tour.protection.name', content: 'tour.protection.description' },
      { route: '/kingdom/tavern', stepId: 'tour.tavern', anchorId: 'tour.tavern', title: 'tour.tavern.name', content: 'tour.tavern.description' },
      { route: '/kingdom/tavern', stepId: 'tour.leadership', anchorId: 'tour.leadership', title: 'tour.leadership.name', content: 'tour.leadership.description' },
      { route: '/kingdom/tavern', stepId: 'tour.guard', anchorId: 'tour.guard', title: 'tour.guard.name', content: 'tour.guard.description' },
      { route: '/kingdom/clan', stepId: 'tour.clan', anchorId: 'tour.clan', title: 'tour.clan.name', content: 'tour.clan.description' },
      { route: '/kingdom/clan', stepId: 'tour.guild', anchorId: 'tour.guild', title: 'tour.guild.name', content: 'tour.guild.description' },
      { route: '/user/encyclopedia', stepId: 'tour.encyclopedia', anchorId: 'tour.encyclopedia', title: 'tour.encyclopedia.name', content: 'tour.encyclopedia.description' },
    ], options);
  }
}
