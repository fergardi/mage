import { TestBed, waitForAsync } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { AuthState, AuthStateModel } from './auth.state';
import { SetUserAction } from './auth.actions';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireAuthStub, AngularFirestoreStub, NotificationServiceStub } from 'src/stubs';
import { AngularFirestore } from '@angular/fire/firestore';
import { NotificationService } from 'src/app/services/notification.service';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from 'src/app/app-routing.module';

describe('Auth store', () => {
  let store: Store;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([AuthState]),
        RouterTestingModule.withRoutes(routes),
      ],
      providers: [
        { provide: AngularFireAuth, useValue: AngularFireAuthStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.inject(Store);
  });

  it('should CREATE the INSTANCE', () => {
    expect(store).toBeTruthy();
  });

  it('should DISPATCH the USER action', () => {
    const expected: AuthStateModel = {
      uid: 'test',
      kingdom: null,
      supplies: [],
      buildings: [],
      logged: true,
      clock: null,
      popup: null,
    };
    store.dispatch(new SetUserAction('test'));
    const actual = store.selectSnapshot(AuthState.getAuthState);
    expect(actual.uid).toEqual(expected.uid);
  });

});
