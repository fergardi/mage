import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { TourService } from 'ngx-ui-tour-core';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { routes } from './app-routing.module';
import { FirebaseService } from './services/firebase.service';
import { FirebaseServiceStub } from 'src/stubs';
import { Router, NavigationEnd, Scroll } from '@angular/router';
import { Subject } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        TourMatMenuModule.forRoot(),
        TranslateModule.forRoot(),
      ],
      declarations: [
        AppComponent,
      ],
      providers: [
        TourService,
        { provide: FirebaseService, useValue: FirebaseServiceStub },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should LISTEN the NAVIGATION', () => {
    spyOn(localStorage, 'setItem');
    const navigation = new NavigationEnd(0, '/test', '/test');
    (router.events as Subject<NavigationEnd>).next(navigation);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should LISTEN the SCROLL', fakeAsync(() => {
    spyOn(window, 'scrollTo');
    const navigation = new NavigationEnd(0, '/test', '/test');
    const scroll = new Scroll(navigation, [0 , 0], 'test');
    (router.events as Subject<Scroll>).next(scroll);
    tick(1500);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(window.scrollTo).toHaveBeenCalled();
    });
  }));

});
