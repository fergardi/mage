import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireAuthStub, CacheServiceStub, StoreStub, ApiServiceStub, NotificationServiceStub, MatDialogStub } from 'src/stubs';
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
import { MatDialog } from '@angular/material/dialog';

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
        { provide: MatDialog, useValue: MatDialogStub },
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
    expect(component.loginType).toBe('login');
    const signup = new MatTabChangeEvent();
    signup.index = 1;
    component.changeType(signup);
    expect(component.loginType).toBe('signup');
    const reset = new MatTabChangeEvent();
    reset.index = 2;
    component.changeType(reset);
    expect(component.loginType).toBe('reset');
  });

  it('should GEOLOCALIZE the BROWSER', async () => {
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((...args: any[]) => {
      const position = { coords: { latitude: 0, longitude: 0 } };
      args[0](position);
    });
    await component.getCurrentPosition();
    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it('should LOGIN the USER', async () => {
    const event = new MatTabChangeEvent();
    event.index = 0;
    component.changeType(event);
    component.form.patchValue({
      email: 'test@test.com',
      username: 'test123',
      password: 'test123',
      password2: 'test123',
      faction: {
        id: 'black',
      },
    });
    spyOn(AngularFireAuthStub, 'signInWithEmailAndPassword');
    await component.login();
    expect(AngularFireAuthStub.signInWithEmailAndPassword).toHaveBeenCalled();
  });

  it('should SIGNUP the ACCOUNT', async () => {
    const event = new MatTabChangeEvent();
    event.index = 1;
    component.changeType(event);
    component.form.patchValue({
      email: 'test@test.com',
      username: 'test123',
      password: 'test123',
      password2: 'test123',
      faction: {
        id: 'black',
      },
    });
    component.form.updateValueAndValidity();
    spyOn(AngularFireAuthStub, 'createUserWithEmailAndPassword').and.resolveTo({ user: { uid: 'test' } });
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((...args: any[]) => {
      const position = { coords: { latitude: 0, longitude: 0 } };
      args[0](position);
    });
    await component.login();
    expect(AngularFireAuthStub.createUserWithEmailAndPassword).toHaveBeenCalled();
  });

  it('should RESET the PASSWORD', async () => {
    const event = new MatTabChangeEvent();
    event.index = 2;
    component.changeType(event);
    component.form.patchValue({
      email: 'test@test.com',
      username: 'test123',
      password: 'test123',
      password2: 'test123',
      faction: {
        id: 'black',
      },
    });
    spyOn(AngularFireAuthStub, 'sendPasswordResetEmail');
    await component.login();
    expect(AngularFireAuthStub.sendPasswordResetEmail).toHaveBeenCalled();
  });

  it('should FAIL the LOGIN', async () => {
    const event = new MatTabChangeEvent();
    event.index = 0;
    component.changeType(event);
    component.form.patchValue({
      email: 'test@test.com',
      username: 'test123',
      password: 'test123',
      password2: 'test123',
      faction: {
        id: 'black',
      },
    });
    spyOn(AngularFireAuthStub, 'signInWithEmailAndPassword').and.rejectWith(new Error('test'));
    spyOn(AngularFireAuthStub, 'signOut');
    await component.login();
    expect(AngularFireAuthStub.signInWithEmailAndPassword).toHaveBeenCalled();
    expect(AngularFireAuthStub.signOut).toHaveBeenCalled();
  });

});
