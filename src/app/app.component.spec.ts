import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { FirebaseService } from './services/firebase.service';
import { TourService } from 'ngx-tour-core';
import { TourMatMenuModule } from 'ngx-tour-md-menu';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

const FirebaseServiceStub = {
  joinObject: () => null,
};


describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TourMatMenuModule.forRoot(),
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

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
