import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { TourService } from 'ngx-tour-core';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { routes } from './app-routing.module';
import { FirebaseService } from './services/firebase.service';
import { FirebaseServiceStub } from 'src/stubs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

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
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

});
