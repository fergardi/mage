import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

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
  ) {
    this.translateService.addLangs(this.langs);
    this.translateService.setDefaultLang(this.langs[0]);
    let browser = this.translateService.getBrowserLang();  
    this.translateService.use(this.langs.includes(browser) ? browser : this.langs[0]);  

    this.links = [
      { url: '/world/map', name: 'World' },
      { url: '/kingdom/city', name: 'City' },
      { url: '/user/login', name: 'Login' },
      { url: '/kingdom/census', name: 'Census' },
    ]

    console.log(this.translateService.getLangs());
  }

  changeLanguage(lang: string): void {
    console.log(lang);
    this.translateService.use(lang);
  }

}
