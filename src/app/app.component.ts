import { Component } from '@angular/core';
import { FirebaseService } from './services/firebase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  title = 'mage';

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
  }
}
