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
    this.firebaseService.importCollectionFromJson('buildings');
    this.firebaseService.importCollectionFromJson('factions');
    this.firebaseService.importCollectionFromJson('items');
  }
}
