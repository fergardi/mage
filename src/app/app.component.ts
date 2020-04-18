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
    this.firebaseService.importCollection('buildings');
    this.firebaseService.importCollection('factions');
    // this.firebaseService.importCollection('kingdoms');
  }
}
