import { Injectable } from '@angular/core';
import { TourService } from 'ngx-ui-tour-md-menu';
import { IStepOption } from 'ngx-ui-tour-core';

@Injectable({
  providedIn: 'root',
})
export class TutorialService {

  constructor(
    private tourService: TourService,
  ) { }

  start(step?: string | undefined) {
    if (step) this.tourService.startAt(step);
    else this.tourService.start();
  }

  initialize() {
    const options: IStepOption = {
      // preventScrolling: false,
      enableBackdrop: true,
      delayAfterNavigation: 500,
      // TODO: fix typed dependency
      // closeOnOutsideClick: true,
    };
    this.tourService.disableHotkeys();
    this.tourService.initialize([
      { route: '/kingdom/city', stepId: 'tour.supplies', anchorId: 'tour.supplies', title: 'kingdom.supplies.name', content: 'kingdom.supplies.tour' },
      { route: '/kingdom/city', stepId: 'tour.city', anchorId: 'tour.city', title: 'kingdom.city.name', content: 'kingdom.city.tour' },
      { route: '/kingdom/city', stepId: 'tour.tax', anchorId: 'tour.tax', title: 'kingdom.tax.name', content: 'kingdom.tax.tour' },
      { route: '/kingdom/city', stepId: 'tour.charge', anchorId: 'tour.charge', title: 'kingdom.charge.name', content: 'kingdom.charge.tour' },
      { route: '/kingdom/city', stepId: 'tour.explore', anchorId: 'tour.explore', title: 'kingdom.explore.name', content: 'kingdom.explore.tour' },
      { route: '/kingdom/auction', stepId: 'tour.auction', anchorId: 'tour.auction', title: 'kingdom.auction.name', content: 'kingdom.auction.tour' },
      { route: '/kingdom/auction', stepId: 'tour.bid', anchorId: 'tour.bid', title: 'kingdom.bid.name', content: 'kingdom.bid.tour' },
      { route: '/kingdom/emporium', stepId: 'tour.emporium', anchorId: 'tour.emporium', title: 'kingdom.emporium.name', content: 'kingdom.emporium.tour' },
      { route: '/kingdom/emporium', stepId: 'tour.tree', anchorId: 'tour.tree', title: 'kingdom.tree.name', content: 'kingdom.tree.tour' },
      { route: '/kingdom/emporium', stepId: 'tour.mining', anchorId: 'tour.mining', title: 'kingdom.mining.name', content: 'kingdom.mining.tour' },
      { route: '/kingdom/army', stepId: 'tour.army', anchorId: 'tour.army', title: 'kingdom.army.name', content: 'kingdom.army.tour' },
      { route: '/kingdom/army', stepId: 'tour.attack', anchorId: 'tour.attack', title: 'kingdom.attack.name', content: 'kingdom.attack.tour' },
      { route: '/kingdom/army', stepId: 'tour.defense', anchorId: 'tour.defense', title: 'kingdom.defense.name', content: 'kingdom.defense.tour' },
      { route: '/kingdom/army', stepId: 'tour.recruit', anchorId: 'tour.recruit', title: 'kingdom.recruit.name', content: 'kingdom.recruit.tour' },
      { route: '/kingdom/tavern', stepId: 'tour.tavern', anchorId: 'tour.tavern', title: 'kingdom.tavern.name', content: 'kingdom.tavern.tour' },
      { route: '/kingdom/tavern', stepId: 'tour.leadership', anchorId: 'tour.leadership', title: 'kingdom.leadership.name', content: 'kingdom.leadership.tour' },
      { route: '/kingdom/tavern', stepId: 'tour.guard', anchorId: 'tour.guard', title: 'kingdom.guard.name', content: 'kingdom.guard.tour' },
      { route: '/kingdom/census', stepId: 'tour.census', anchorId: 'tour.census', title: 'kingdom.census.name', content: 'kingdom.census.tour' },
      { route: '/kingdom/census', stepId: 'tour.kingdom', anchorId: 'tour.kingdom', title: 'kingdom.kingdom.name', content: 'kingdom.kingdom.tour' },
      { route: '/kingdom/archive', stepId: 'tour.archive', anchorId: 'tour.archive', title: 'kingdom.archive.name', content: 'kingdom.archive.tour' },
      { route: '/kingdom/clan', stepId: 'tour.clan', anchorId: 'tour.clan', title: 'kingdom.clan.name', content: 'kingdom.clan.tour' },
      { route: '/kingdom/clan', stepId: 'tour.guild', anchorId: 'tour.guild', title: 'kingdom.guild.name', content: 'kingdom.guild.tour' },
      { route: '/kingdom/sorcery', stepId: 'tour.sorcery', anchorId: 'tour.sorcery', title: 'kingdom.sorcery.name', content: 'kingdom.sorcery.tour' },
      { route: '/kingdom/sorcery', stepId: 'tour.arcanism', anchorId: 'tour.arcanism', title: 'kingdom.arcanism.name', content: 'kingdom.arcanism.tour' },
      { route: '/kingdom/sorcery', stepId: 'tour.protection', anchorId: 'tour.protection', title: 'kingdom.protection.name', content: 'kingdom.protection.tour' },
      { route: '/kingdom/temple', stepId: 'tour.temple', anchorId: 'tour.temple', title: 'kingdom.temple.name', content: 'kingdom.temple.tour' },
      { route: '/kingdom/temple', stepId: 'tour.break', anchorId: 'tour.break', title: 'kingdom.break.name', content: 'kingdom.break.tour' },
      { route: '/kingdom/temple', stepId: 'tour.dispel', anchorId: 'tour.dispel', title: 'kingdom.dispel.name', content: 'kingdom.dispel.tour' },
      { route: '/user/encyclopedia', stepId: 'tour.encyclopedia', anchorId: 'tour.encyclopedia', title: 'user.encyclopedia.name', content: 'user.encyclopedia.tour' },
    ], options);
  }
}
