import { Component, OnInit } from '@angular/core';
import { TourService } from 'ngx-tour-md-menu';
import { LoadingService } from './services/loading.service';
// import { FirebaseService, FixtureType } from './services/firebase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  constructor(
    // private firebaseService: FirebaseService,
    public tourService: TourService,
    public loadingService: LoadingService,
  ) {
    // this.firebaseService.joinFixtures([FixtureType.ITEMS]);
  }

  ngOnInit(): void {
    this.tourService.disableHotkeys();
    this.tourService.initialize([
      {
        route: '/kingdom/city',
        anchorId: 'tour.supplies',
        title: 'tour.supplies.name',
        content: 'tour.supplies.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/city',
        anchorId: 'tour.city',
        title: 'tour.city.name',
        content: 'tour.city.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/city',
        anchorId: 'tour.tax',
        title: 'tour.tax.name',
        content: 'tour.tax.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/city',
        anchorId: 'tour.charge',
        title: 'tour.charge.name',
        content: 'tour.charge.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/city',
        anchorId: 'tour.explore',
        title: 'tour.explore.name',
        content: 'tour.explore.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/army',
        anchorId: 'tour.recruit',
        title: 'tour.recruit.name',
        content: 'tour.recruit.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/army',
        anchorId: 'tour.army',
        title: 'tour.army.name',
        content: 'tour.army.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/army',
        anchorId: 'tour.attack',
        title: 'tour.attack.name',
        content: 'tour.attack.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/army',
        anchorId: 'tour.defense',
        title: 'tour.defense.name',
        content: 'tour.defense.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/auction',
        anchorId: 'tour.auction',
        title: 'tour.auction.name',
        content: 'tour.auction.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/auction',
        anchorId: 'tour.bid',
        title: 'tour.bid.name',
        content: 'tour.bid.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/census',
        anchorId: 'tour.census',
        title: 'tour.census.name',
        content: 'tour.census.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/census',
        anchorId: 'tour.kingdom',
        title: 'tour.kingdom.name',
        content: 'tour.kingdom.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/archive',
        anchorId: 'tour.archive',
        title: 'tour.archive.name',
        content: 'tour.archive.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/emporium',
        anchorId: 'tour.emporium',
        title: 'tour.emporium.name',
        content: 'tour.emporium.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/emporium',
        anchorId: 'tour.packs',
        title: 'tour.packs.name',
        content: 'tour.packs.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/temple',
        anchorId: 'tour.temple',
        title: 'tour.temple.name',
        content: 'tour.temple.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/temple',
        anchorId: 'tour.dispel',
        title: 'tour.dispel.name',
        content: 'tour.dispel.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/sorcery',
        anchorId: 'tour.artifacts',
        title: 'tour.artifacts.name',
        content: 'tour.artifacts.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/sorcery',
        anchorId: 'tour.spells',
        title: 'tour.spells.name',
        content: 'tour.spells.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/tavern',
        anchorId: 'tour.tavern',
        title: 'tour.tavern.name',
        content: 'tour.tavern.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/tavern',
        anchorId: 'tour.leadership',
        title: 'tour.leadership.name',
        content: 'tour.leadership.description',
        enableBackdrop: true,
      },
      {
        route: '/kingdom/tavern',
        anchorId: 'tour.guard',
        title: 'tour.guard.name',
        content: 'tour.guard.description',
        enableBackdrop: true,
      },
    ]);
  }
}
