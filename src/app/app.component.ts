import { Component, OnInit } from '@angular/core';
import { LoadingService } from './services/loading.service';
import { FirebaseService, FixtureType } from './services/firebase.service';
import { TutorialService } from './services/tutorial.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  constructor(
    private firebaseService: FirebaseService,
    public loadingService: LoadingService,
    private tutorialService: TutorialService,
  ) { }

  ngOnInit(): void {
    this.tutorialService.initialize();
    this.firebaseService.loadFixtures([
      // FixtureType.FACTIONS,
      // FixtureType.ATTACKS,
      // FixtureType.CATEGORIES,
      // FixtureType.FAMILIES,
      // FixtureType.GODS,
      // FixtureType.GUILDS,
      // FixtureType.RESOURCES,
      // FixtureType.STRUCTURES,
      // FixtureType.SKILLS,
      // FixtureType.UNITS,
      // FixtureType.SPELLS,
      // FixtureType.ITEMS,
      // FixtureType.HEROES,
      // FixtureType.STORES,
      // FixtureType.LOCATIONS,
    ]);
  }
}
