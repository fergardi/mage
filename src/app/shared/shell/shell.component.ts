import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {

  langs = [
    'es',
    'en',
  ]
  links:Array<any> = [];
  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset])
  .pipe(
    map(result => result.matches),
    shareReplay()
  );

  constructor(
    private breakpointObserver: BreakpointObserver,
    public translateService: TranslateService,
    public angularFireAuth: AngularFireAuth,
    private router: Router,
  ) {
    this.translateService.addLangs(this.langs);
    this.translateService.setDefaultLang(this.langs[0]);
    let browser = this.translateService.getBrowserLang();  
    this.translateService.use(this.langs.includes(browser) ? browser : this.langs[0]);  
    this.links = [
      { url: '/world/map', name: 'World' },
      { url: '/kingdom/city', name: 'City' },
      { url: '/kingdom/census', name: 'Census' },
    ]
  }

  async logout() {
    await this.angularFireAuth.signOut();
    this.router.navigate(['/user/login']);
  }

}
