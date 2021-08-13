import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireAuthStub, CacheServiceStub, StoreStub, ApiServiceStub, NotificationServiceStub } from 'src/stubs';
import { CacheService } from 'src/app/services/cache.service';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { NotificationService } from 'src/app/services/notification.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatCardModule,
        MatTabsModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
      ],
      declarations: [
        LoginComponent,
      ],
      providers: [
        FormBuilder,
        { provide: AngularFireAuth, useValue: AngularFireAuthStub },
        { provide: CacheService, useValue: CacheServiceStub },
        { provide: Store, useValue: StoreStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: AngularFireAuth, useValue: AngularFireAuthStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should CHANGE the TYPES', () => {
    const login = new MatTabChangeEvent();
    login.index = 0;
    component.changeType(login);
    expect(component.type).toBe('login');
    const signup = new MatTabChangeEvent();
    signup.index = 1;
    component.changeType(signup);
    expect(component.type).toBe('signup');
    const reset = new MatTabChangeEvent();
    reset.index = 2;
    component.changeType(reset);
    expect(component.type).toBe('reset');
  });
/*
  it('should GEOLOCALIZE the BROWSER', async () => {
    const position = { coords: { latitude: 0, longitude: 0 } };
    const mockGeolocation: jasmine.SpyObj<Geolocation> = jasmine.createSpyObj('navigator.geolocation', ['getCurrentPosition']);
    mockGeolocation.getCurrentPosition.and.callFake(() => {
      return { then: () => position };
    });
    await component.getCurrentPosition();
    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
  });
*/
  it('should LOGIN the USER', async () => {
    const angularFireAuthSpy = spyOn(AngularFireAuthStub, 'signInWithEmailAndPassword');
    component.type = component.types[0];
    await component.login();
    expect(angularFireAuthSpy).toHaveBeenCalled();
  });
/*
  it('should SIGNUP the ACCOUNT', async () => {
    const angularFireAuthSpy = spyOn(AngularFireAuthStub, 'createUserWithEmailAndPassword');
    component.type = component.types[1];
    await component.login();
    expect(angularFireAuthSpy).toHaveBeenCalled();
  });
*/
  it('should RESET the PASSWORD', async () => {
    const angularFireAuthSpy = spyOn(AngularFireAuthStub, 'sendPasswordResetEmail');
    component.type = component.types[2];
    await component.login();
    expect(angularFireAuthSpy).toHaveBeenCalled();
  });

});
