import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { LoadingService } from './services/loading.service';
import { FirebaseService, FixtureType } from './services/firebase.service';
import { TutorialService } from './services/tutorial.service';
import { Router, Scroll, RouterEvent, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

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
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any,
  ) { }

  ngOnInit(): void {
    // anchors
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        if (event.url !== '/user/landing') localStorage.setItem('route', event.url);
      }
      if (event instanceof Scroll && event.anchor && isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          const anchor = document.querySelector('#' + event.anchor);
          if (!anchor) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            anchor.scrollIntoView({ behavior: 'smooth' });
          }
        }, 1000);
      }
    });
    // fixtures
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
      // FixtureType.LEGENDS,
    ]);
  }
}
