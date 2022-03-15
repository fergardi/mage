import { Component, ViewChild, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay, filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, NavigationEnd, RouterEvent } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { MapboxService } from 'src/app/services/mapbox.service';
import { Store, Select } from '@ngxs/store';
import { LogoutAction } from '../auth/auth.actions';
import { DomService } from 'src/app/services/dom.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthState } from '../auth/auth.state';
import { NotificationService } from 'src/app/services/notification.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { StatusComponent } from './status.component';
import { TutorialService } from 'src/app/services/tutorial.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {

  langs: any[] = [
    { lang: 'es', image: '/assets/images/languages/es.png' },
    { lang: 'en', image: '/assets/images/languages/en.png' },
    { lang: 'fr', image: '/assets/images/languages/fr.png' },
  ];
  groups: any[] = [
    { name: 'shell.group.merchant', image: '/assets/images/cards/merchant.png', links: [
        { url: '/kingdom/city', name: 'kingdom.city.name', description: 'kingdom.city.description', image: '/assets/images/cards/city.png' },
        { url: '/kingdom/auction', name: 'kingdom.auction.name', description: 'kingdom.auction.description', image: '/assets/images/cards/auction.png' },
        { url: '/kingdom/emporium', name: 'kingdom.emporium.name', description: 'kingdom.emporium.description', image: '/assets/images/cards/emporium.png' },
      ],
    },
    { name: 'shell.group.militia', image: '/assets/images/cards/militia.png', links: [
        { url: '/world/map', name: 'world.map.name', description: 'world.map.description', image: '/assets/images/cards/map.png' },
        { url: '/kingdom/army', name: 'kingdom.army.name', description: 'kingdom.army.description', image: '/assets/images/cards/army.png' },
        { url: '/kingdom/tavern', name: 'kingdom.tavern.name', description: 'kingdom.tavern.description', image: '/assets/images/cards/tavern.png' },
      ],
    },
    { name: 'shell.group.spy', image: '/assets/images/cards/spy.png', links: [
        { url: '/kingdom/census', name: 'kingdom.census.name', description: 'kingdom.census.description', image: '/assets/images/cards/census.png' },
        { url: '/kingdom/archive', name: 'kingdom.archive.name', description: 'kingdom.archive.description', image: '/assets/images/cards/archive.png' },
        { url: '/kingdom/clan', name: 'kingdom.clan.name', description: 'kingdom.clan.description', image: '/assets/images/cards/clan.png', disabled: true },
      ],
    },
    { name: 'shell.group.scholar', image: '/assets/images/cards/scholar.png', links: [
        { url: '/kingdom/sorcery', name: 'kingdom.sorcery.name', description: 'kingdom.sorcery.description', image: '/assets/images/cards/sorcery.png' },
        { url: '/kingdom/temple', name: 'kingdom.temple.name', description: 'kingdom.temple.description', image: '/assets/images/cards/temple.png' },
        { url: '/user/encyclopedia', name: 'user.encyclopedia.name', description: 'user.encyclopedia.description', image: '/assets/images/cards/encyclopedia.png' },
      ],
    },
  ];
  @Select((state: any) => state.auth.supplies) kingdomSupplies$: Observable<any[]>;
  link$: Observable<any> = this.router.events
  .pipe(
    filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd),
    map((event: NavigationEnd) => {
      return this.groups.reduce((a, b) => a.concat(b.links), []).find((link: any) => event.url.includes(link.url));
    }),
  );
  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset])
  .pipe(
    map((result: any) => result.matches),
    shareReplay(),
  );
  public reports: number = 0;
  @ViewChild(MatSidenav, {static: true}) drawer: MatSidenav;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public translateService: TranslateService,
    public angularFireAuth: AngularFireAuth,
    private router: Router,
    private mapboxService: MapboxService,
    private store: Store,
    private tutorialService: TutorialService,
    private domService: DomService,
    private angularFirestore: AngularFirestore,
    private notificationService: NotificationService,
    private bottomSheet: MatBottomSheet,
  ) {
    // i18n
    this.translateService.addLangs(this.langs.map(l => l.lang));
    const browser = this.translateService.getBrowserLang();
    this.translateService.use(this.langs.map(l => l.lang).includes(browser) ? browser : this.langs[0].lang);
  }

  ngOnInit(): void {
    this.store.select(AuthState.getUserUID).subscribe(uid => {
      if (uid) {
        this.angularFirestore.collection<any>(`kingdoms/${uid}/letters`, x => x.where('read', '==', false)).valueChanges().subscribe(reports => {
          const oldReports = this.reports;
          this.reports = reports.length;
          if (this.reports > oldReports) this.notificationService.warning('kingdom.archive.new');
        });
      }
    });
  }

  async toggle() {
    await this.drawer.toggle();
    this.mapboxService.resizeMap();
  }

  close() {
    this.isHandset$.subscribe(async isHandset => {
      if (isHandset) {
        await this.drawer.close();
      }
    });
  }

  getLang(): any {
    return this.langs.find(l => l.lang === this.translateService.currentLang);
  }

  tour() {
    this.tutorialService.start();
  }

  login($element: any) {
    this.domService.scrollToTop($element);
    this.router.navigate(['/user/landing']);
  }

  logout() {
    this.store.dispatch(new LogoutAction());
  }

  openStatusSheet() {
    const sheetRef = this.bottomSheet.open(StatusComponent, {
      data: this.kingdomSupplies$,
    });
  }

}
