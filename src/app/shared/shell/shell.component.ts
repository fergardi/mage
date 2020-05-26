import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay, filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, NavigationEnd } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { MapboxService } from 'src/app/services/mapbox.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store, Select } from '@ngxs/store';
import { LogoutAction } from '../auth/auth.actions';
import { TourService } from 'ngx-tour-md-menu';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
@UntilDestroy()
export class ShellComponent {

  uid: string = null;
  langs: Array<any> = [
    { lang: 'es', image: '/assets/images/languages/es.png' },
    { lang: 'en', image: '/assets/images/languages/en.png' },
    { lang: 'fr', image: '/assets/images/languages/fr.png' },
  ];
  links: Array<any> = [
    { url: '/user/landing', name: 'user.landing.name', description: 'user.landing.description', image: '/assets/images/icons/landing.png', guarded: false, logged: false },
    { url: '/user/login', name: 'user.login.name', description: 'user.login.description', image: '/assets/images/icons/login.png', guarded: false, logged: false },
    { url: '/world/map', name: 'world.map.name', description: 'world.map.description', image: '/assets/images/icons/map.png', guarded: true, logged: true },
    { url: '/kingdom/city', name: 'kingdom.city.name', description: 'kingdom.city.description', image: '/assets/images/icons/city.png', guarded: true, logged: true },
    { url: '/kingdom/army', name: 'kingdom.army.name', description: 'kingdom.army.description', image: '/assets/images/icons/army.png', guarded: true, logged: true },
    { url: '/kingdom/auction', name: 'kingdom.auction.name', description: 'kingdom.auction.description', image: '/assets/images/icons/auction.png', guarded: true, logged: true },
    { url: '/kingdom/census', name: 'kingdom.census.name', description: 'kingdom.census.description', image: '/assets/images/icons/census.png', guarded: true, logged: true },
    { url: '/kingdom/sorcery', name: 'kingdom.sorcery.name', description: 'kingdom.sorcery.description', image: '/assets/images/icons/sorcery.png', guarded: true, logged: true },
    { url: '/kingdom/tavern', name: 'kingdom.tavern.name', description: 'kingdom.tavern.description', image: '/assets/images/icons/tavern.png', guarded: true, logged: true },
    { url: '/kingdom/archive', name: 'kingdom.archive.name', description: 'kingdom.archive.description', image: '/assets/images/icons/archive.png', guarded: true, logged: true },
    { url: '/kingdom/temple', name: 'kingdom.temple.name', description: 'kingdom.temple.description', image: '/assets/images/icons/temple.png', guarded: true, logged: true },
    { url: '/kingdom/emporium', name: 'kingdom.emporium.name', description: 'kingdom.emporium.description', image: '/assets/images/icons/emporium.png', guarded: true, logged: true },
    { url: '/user/encyclopedia', name: 'user.encyclopedia.name', description: 'user.encyclopedia.description', image: '/assets/images/icons/encyclopedia.png', guarded: false, logged: true },
  ];
  @Select((state: any) => state.auth.supplies) kingdomSupplies$: Observable<any[]>;
  link$: Observable<any> = this.router.events
  .pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map(event => {
      let route = this.links.find(link => link.url === event.url);
      return route;
    })
  );
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
    private mapboxService: MapboxService,
    private store: Store,
    private tourService: TourService,
  ) {
    // i18n
    this.translateService.addLangs(this.langs.map(l => l.lang));
    this.translateService.setDefaultLang(this.langs[0].lang);
    let browser = this.translateService.getBrowserLang();
    this.translateService.use(this.langs.map(l => l.lang).includes(browser) ? browser : this.langs[0].lang);
  }

  async toggle() {
    await this.drawer.toggle();
    this.mapboxService.resize();
  }

  close() {
    this.isHandset$.pipe(untilDestroyed(this)).subscribe(isHandset => {
      if (isHandset) this.drawer.close();
    })
  }

  logout() {
    this.store.dispatch(new LogoutAction());
  }

  getFlag(): string {
    return this.langs.find(l => l.lang === this.translateService.currentLang)?.image;
  }

  tour() {
    // if (!this.drawer.opened) await this.drawer.open();
    this.tourService.start();
  }

}
