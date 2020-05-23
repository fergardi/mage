import { Component } from '@angular/core';
import { FirebaseService } from './services/firebase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  constructor(
    private firebaseService: FirebaseService,
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
}
