import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay, filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, NavigationEnd } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { MatSidenav } from '@angular/material/sidenav';
import { MapboxService } from 'src/app/services/mapbox.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { LogoutAction } from '../auth/auth.actions';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
@UntilDestroy()
export class ShellComponent implements OnInit {

  langs: Array<any> = [
    { lang: 'es', image: '/assets/images/languages/es.png' },
    { lang: 'en', image: '/assets/images/languages/en.png' },
    { lang: 'fr', image: '/assets/images/languages/fr.png' },
  ]
  links: Array<any> = [
    { url: '/user/login', name: 'user.login.name', description: 'user.login.description', image: '/assets/images/icons/login.png', visible: false },
    { url: '/world/map', name: 'world.map.name', description: 'world.map.description', image: '/assets/images/icons/map.png', visible: true },
    { url: '/kingdom/city', name: 'kingdom.city.name', description: 'kingdom.city.description', image: '/assets/images/icons/city.png', visible: true },
    { url: '/kingdom/army', name: 'kingdom.army.name', description: 'kingdom.army.description', image: '/assets/images/icons/army.png', visible: true },
    { url: '/kingdom/auction', name: 'kingdom.auction.name', description: 'kingdom.auction.description', image: '/assets/images/icons/auction.png', visible: true },
    { url: '/kingdom/census', name: 'kingdom.census.name', description: 'kingdom.census.description', image: '/assets/images/icons/census.png', visible: true },
    { url: '/kingdom/sorcery', name: 'kingdom.sorcery.name', description: 'kingdom.sorcery.description', image: '/assets/images/icons/sorcery.png', visible: true },
    { url: '/kingdom/tavern', name: 'kingdom.tavern.name', description: 'kingdom.tavern.description', image: '/assets/images/icons/tavern.png', visible: true },
    { url: '/kingdom/archive', name: 'kingdom.archive.name', description: 'kingdom.archive.description', image: '/assets/images/icons/archive.png', visible: true },
    { url: '/kingdom/temple', name: 'kingdom.temple.name', description: 'kingdom.temple.description', image: '/assets/images/icons/temple.png', visible: true },
    { url: '/kingdom/emporium', name: 'kingdom.emporium.name', description: 'kingdom.emporium.description', image: '/assets/images/icons/emporium.png', visible: true },
    { url: '/user/encyclopedia', name: 'user.encyclopedia.name', description: 'user.encyclopedia.description', image: '/assets/images/icons/encyclopedia.png', visible: true },
  ];
  kingdomSupplies: any[] = [];

  link$: Observable<any> = this.router.events
  .pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map(event => this.links.find(link => link.url === event.url))
  )
  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset])
  .pipe(
    map(result => result.matches),
    shareReplay()
  );

  @ViewChild(MatSidenav, {static: true}) drawer: MatSidenav;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public translateService: TranslateService,
    public angularFireAuth: AngularFireAuth,
    private router: Router,
    private firebaseService: FirebaseService,
    private mapboxService: MapboxService,
    private notificationService: NotificationService,
    private store: Store,
  ) {
    // i18n
    this.translateService.addLangs(this.langs.map(l => l.lang));
    this.translateService.setDefaultLang(this.langs[0].lang);
    let browser = this.translateService.getBrowserLang();
    this.translateService.use(this.langs.map(l => l.lang).includes(browser) ? browser : this.langs[0].lang);
  }

  ngOnInit() {
    this.angularFireAuth.authState.pipe(untilDestroyed(this)).subscribe(user => {
      if (user && user.uid) {
        this.firebaseService.leftJoin(`kingdoms/${user.uid}/supplies`, 'resources', 'id', 'id').pipe(untilDestroyed(this)).subscribe(supplies => {
          this.kingdomSupplies = supplies.sort((a, b) => a.join.sort - b.join.sort);
        });
      }
    });
  }

  async toggle() {
    await this.drawer.toggle()
    this.mapboxService.resize();
  }

  async logout() {
    this.store.dispatch(new LogoutAction());
  }

  getFlag() {
    return this.langs.find(l => l.lang === this.translateService.currentLang)?.image;
  }

}
