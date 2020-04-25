import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay, filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {

  langs: Array<any> = [
    'es',
    'en',
  ]
  links: Array<any> = [
    { url: '/world/map', name: 'sidenav.map.name', description: 'sidenav.map.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Fmap.png?alt=media&token=a2e85734-3e8a-4cb4-a83e-c308da7fe741' },
    { url: '/kingdom/city', name: 'sidenav.city.name', description: 'sidenav.city.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Fcity.png?alt=media&token=23ca75ae-204b-46c5-8bda-848aa65ca39d' },
    { url: '/kingdom/army', name: 'sidenav.army.name', description: 'sidenav.army.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Farmy.png?alt=media&token=cb4c9a9f-4903-4499-b71d-8545365cff8e' },
    { url: '/kingdom/auction', name: 'sidenav.auction.name', description: 'sidenav.auction.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Fauction.png?alt=media&token=4ff0494e-e4fd-4d17-b8d0-9f1fed4e913d' },
    { url: '/kingdom/census', name: 'sidenav.census.name', description: 'sidenav.census.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Fcensus.png?alt=media&token=c6ede9d7-66b8-4758-9bf2-1e1dd7f69137' },
    { url: '/kingdom/sorcery', name: 'sidenav.sorcery.name', description: 'sidenav.sorcery.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Fsorcery.png?alt=media&token=b9416d03-9196-464c-92c8-1dc82a0aeca7' },
    { url: '/kingdom/tavern', name: 'sidenav.tavern.name', description: 'sidenav.tavern.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Ftavern.png?alt=media&token=162b4678-d152-4a12-9c2c-2873bc304500' },
    { url: '/kingdom/archive', name: 'sidenav.archive.name', description: 'sidenav.archive.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Farchive.png?alt=media&token=afd1b2d3-999e-45d0-a7ae-17c85287dcda' },
    { url: '/kingdom/temple', name: 'sidenav.temple.name', description: 'sidenav.temple.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Ftemple.png?alt=media&token=abbe4941-7aef-45c7-a451-6b1617c0c447' },
    { url: null, name: 'sidenav.sleep.name', description: 'sidenav.sleep.description', image: 'https://firebasestorage.googleapis.com/v0/b/mage-c4259.appspot.com/o/pages%2Fsleep.png?alt=media&token=ea8c0fb7-7889-4460-821b-be4e13bb522b' },
  ];
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

  constructor(
    private breakpointObserver: BreakpointObserver,
    public translateService: TranslateService,
    public angularFireAuth: AngularFireAuth,
    private router: Router,
  ) {
    // i18n
    this.translateService.addLangs(this.langs);
    this.translateService.setDefaultLang(this.langs[0]);
    let browser = this.translateService.getBrowserLang();  
    this.translateService.use(this.langs.includes(browser) ? browser : this.langs[0]);  
  }

  async logout() {
    await this.angularFireAuth.signOut();
    this.router.navigate(['/user/login']);
  }

}
