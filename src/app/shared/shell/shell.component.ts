import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay, filter, first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, NavigationEnd } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { MatSidenav } from '@angular/material/sidenav';
import { MapboxService } from 'src/app/services/mapbox.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

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
  ]
  links: Array<any> = [
    { url: '/world/map', name: 'kingdom.map.name', description: 'kingdom.map.description', image: '/assets/images/icons/map.png' },
    { url: '/kingdom/city', name: 'kingdom.city.name', description: 'kingdom.city.description', image: '/assets/images/icons/city.png' },
    { url: '/kingdom/army', name: 'kingdom.army.name', description: 'kingdom.army.description', image: '/assets/images/icons/army.png' },
    { url: '/kingdom/auction', name: 'kingdom.auction.name', description: 'kingdom.auction.description', image: '/assets/images/icons/auction.png' },
    { url: '/kingdom/census', name: 'kingdom.census.name', description: 'kingdom.census.description', image: '/assets/images/icons/census.png' },
    { url: '/kingdom/sorcery', name: 'kingdom.sorcery.name', description: 'kingdom.sorcery.description', image: '/assets/images/icons/sorcery.png' },
    { url: '/kingdom/tavern', name: 'kingdom.tavern.name', description: 'kingdom.tavern.description', image: '/assets/images/icons/tavern.png' },
    { url: '/kingdom/archive', name: 'kingdom.archive.name', description: 'kingdom.archive.description', image: '/assets/images/icons/archive.png' },
    { url: '/kingdom/temple', name: 'kingdom.temple.name', description: 'kingdom.temple.description', image: '/assets/images/icons/temple.png' },
    { url: '/kingdom/store', name: 'kingdom.store.name', description: 'kingdom.store.description', image: '/assets/images/icons/store.png' },
    { url: null, name: 'kingdom.sleep.name', description: 'kingdom.sleep.description', image: '/assets/images/icons/sleep.png' },
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
  ) {
    // i18n
    this.translateService.addLangs(this.langs.map(l => l.lang));
    this.translateService.setDefaultLang(this.langs[0].lang);
    let browser = this.translateService.getBrowserLang();  
    this.translateService.use(this.langs.map(l => l.lang).includes(browser) ? browser : this.langs[0].lang);  
  }

  ngOnInit() {
    this.angularFireAuth.authState.pipe(first()).subscribe(user => {
      this.firebaseService.leftJoin(`kingdoms/${user.uid}/supplies`, 'resources', 'id', 'id').pipe(untilDestroyed(this)).subscribe(supplies => {
        this.kingdomSupplies = supplies.sort((a, b) => a.join.sort - b.join.sort);
      });
    });
  }

  async toggle() {
    await this.drawer.toggle()
    this.mapboxService.resize();
  }

  async logout() {
    await this.angularFireAuth.signOut();
    this.router.navigate(['/user/login']);
  }

}
