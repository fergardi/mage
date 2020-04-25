import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, of } from 'rxjs';
import { map, shareReplay, filter, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, NavigationEnd } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { MatSidenav } from '@angular/material/sidenav';
import { MapboxService } from 'src/app/services/mapbox.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {

  langs: Array<any> = [
    { lang: 'es', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/languages%2Fes.png?alt=media&token=6fd7ecaf-4127-44d2-983b-08490bd1b708' },
    { lang: 'en', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/languages%2Fen.png?alt=media&token=f9bc5fd7-4050-4ef9-99ba-6477c7bee0d4' },
  ]
  links: Array<any> = [
    { url: '/world/map', name: 'kingdom.map.name', description: 'kingdom.map.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Fmap.png?alt=media&token=a2e85734-3e8a-4cb4-a83e-c308da7fe741' },
    { url: '/kingdom/city', name: 'kingdom.city.name', description: 'kingdom.city.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Fcity.png?alt=media&token=23ca75ae-204b-46c5-8bda-848aa65ca39d' },
    { url: '/kingdom/army', name: 'kingdom.army.name', description: 'kingdom.army.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Farmy.png?alt=media&token=cb4c9a9f-4903-4499-b71d-8545365cff8e' },
    { url: '/kingdom/auction', name: 'kingdom.auction.name', description: 'kingdom.auction.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Fauction.png?alt=media&token=4ff0494e-e4fd-4d17-b8d0-9f1fed4e913d' },
    { url: '/kingdom/census', name: 'kingdom.census.name', description: 'kingdom.census.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Fcensus.png?alt=media&token=c6ede9d7-66b8-4758-9bf2-1e1dd7f69137' },
    { url: '/kingdom/sorcery', name: 'kingdom.sorcery.name', description: 'kingdom.sorcery.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Fsorcery.png?alt=media&token=b9416d03-9196-464c-92c8-1dc82a0aeca7' },
    { url: '/kingdom/tavern', name: 'kingdom.tavern.name', description: 'kingdom.tavern.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Ftavern.png?alt=media&token=162b4678-d152-4a12-9c2c-2873bc304500' },
    { url: '/kingdom/archive', name: 'kingdom.archive.name', description: 'kingdom.archive.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Farchive.png?alt=media&token=afd1b2d3-999e-45d0-a7ae-17c85287dcda' },
    { url: '/kingdom/temple', name: 'kingdom.temple.name', description: 'kingdom.temple.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Ftemple.png?alt=media&token=abbe4941-7aef-45c7-a451-6b1617c0c447' },
    { url: '/kingdom/store', name: 'kingdom.store.name', description: 'kingdom.store.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Fstore.png?alt=media&token=dc9b28b8-28f7-495a-bcc1-7e8f12c04eed' },
    { url: null, name: 'kingdom.sleep.name', description: 'kingdom.sleep.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Fsleep.png?alt=media&token=ea8c0fb7-7889-4460-821b-be4e13bb522b' },
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
  isMap$: Observable<boolean> = this.router.events
  .pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map(event => event.url.includes('/world/map'))
  )

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
    this.getKingdomSupplies().subscribe(supplies => {
      this.kingdomSupplies = supplies.sort((a, b) => a.join.sort - b.join.sort);
    });
  }

  getKingdomSupplies(): Observable<any> {
    return this.angularFireAuth.authState.pipe(
      switchMap(user => {
        return user
          ? this.firebaseService.leftJoin(`kingdoms/${user.uid}/supplies`, 'resources', 'id', 'id')
          : of([]);
      })
    );
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
