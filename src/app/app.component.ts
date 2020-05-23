import { Component, OnInit } from '@angular/core';
import { FirebaseService } from './services/firebase.service';
import { TourService } from 'ngx-tour-md-menu';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  constructor(
    private firebaseService: FirebaseService,
    public tourService: TourService,
  ) {
    // this.firebaseService.importCollectionFromJson('factions');
    // this.firebaseService.importCollectionFromJson('structures');
    // this.firebaseService.importCollectionFromJson('items');
    // this.firebaseService.importCollectionFromJson('stores');
    // this.firebaseService.importCollectionFromJson('heroes');
    // this.firebaseService.importCollectionFromJson('units');
    // this.firebaseService.importCollectionFromJson('locations');
    // this.firebaseService.importCollectionFromJson('resources');
    // this.firebaseService.importCollectionFromJson('spells');
    // this.firebaseService.importCollectionFromJson('gods');
    // this.firebaseService.importCollectionFromJson('skills');
    // this.firebaseService.importCollectionFromJson('families');
    // this.firebaseService.importCollectionFromJson('categories');
    // this.firebaseService.importCollectionFromJson('packs');
    // this.firebaseService.loadCollectionIntoCollection('items', 'artifacts');
    // this.firebaseService.loadCollectionIntoCollection('units', 'troops');
    // this.firebaseService.loadCollectionIntoCollection('heroes', 'contracts');
    // this.firebaseService.loadCollectionIntoCollection('spells', 'charms');
    // this.firebaseService.loadCollectionIntoCollection('spells', 'enchantments', ref => ref.where('type', '==', 'enchantment'));
    // this.firebaseService.loadCollectionIntoCollection('resources', 'supplies');
  }

  ngOnInit(): void {
    this.tourService.disableHotkeys();
    this.tourService.initialize([
      {
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
    ]);
  }
}
