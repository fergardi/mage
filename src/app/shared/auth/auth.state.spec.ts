import { TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { AuthState, AuthStateModel } from './auth.state';
import { SetUserAction, LogoutAction } from './auth.actions';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireAuthStub, AngularFirestoreStub, NotificationServiceStub } from 'src/stubs';
import { AngularFirestore } from '@angular/fire/firestore';
import { NotificationService } from 'src/app/services/notification.service';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from 'src/app/app-routing.module';

describe('Store', () => {
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
      logged: false,
      clock: null,
      popup: null,
    };
    store.dispatch(new SetUserAction('test'));
    const actual = store.selectSnapshot(AuthState.getAuthState);
    expect(actual.uid).toEqual(expected.uid);
  });

  it('should DISPATCH the LOGOUT action', fakeAsync(() => {
    const expected: AuthStateModel = {
      uid: null,
      kingdom: null,
      supplies: [],
      buildings: [],
      logged: false,
      clock: null,
      popup: null,
    };
    spyOn(AngularFireAuthStub, 'signOut').and.resolveTo(null);
    store.dispatch(new LogoutAction());
    tick();
    const actual = store.selectSnapshot(AuthState.getAuthState);
    expect(actual.uid).toEqual(expected.uid);
  }));

  it('should SELECT the LOGGEDIN', () => {
    expect(store.selectSnapshot(AuthState.getUserLoggedIn)).toBe(true);
  });

  it('should SELECT the CLAN', () => {
    expect(store.selectSnapshot(AuthState.getKingdomClan)).toBe(null);
  });

  it('should SELECT the KINGDOM', () => {
    expect(store.selectSnapshot(AuthState.getKingdom)).toBe(null);
  });

  it('should SELECT the GUILD', () => {
    expect(store.selectSnapshot(AuthState.getKingdomGuild)).toBe(null);
  });

  it('should SELECT the ACADEMY', () => {
    expect(store.selectSnapshot(AuthState.getKingdomAcademy)).toBe(undefined);
  });

  it('should SELECT the WORKSHOP', () => {
    expect(store.selectSnapshot(AuthState.getKingdomWorkshop)).toBe(undefined);
  });

  it('should SELECT the NODE', () => {
    expect(store.selectSnapshot(AuthState.getKingdomNode)).toBe(undefined);
  });

  it('should SELECT the VILLAGE', () => {
    expect(store.selectSnapshot(AuthState.getKingdomVillage)).toBe(undefined);
  });

  it('should SELECT the LAND', () => {
    expect(store.selectSnapshot(AuthState.getKingdomLand)).toBe(undefined);
  });

  it('should SELECT the GOLD', () => {
    expect(store.selectSnapshot(AuthState.getKingdomGold)).toBe(undefined);
  });

  it('should SELECT the MANA', () => {
    expect(store.selectSnapshot(AuthState.getKingdomMana)).toBe(undefined);
  });

  it('should SELECT the UID', () => {
    expect(store.selectSnapshot(AuthState.getUserUID)).toBe('test');
  });

  it('should SELECT the GEM', () => {
    expect(store.selectSnapshot(AuthState.getKingdomGem)).toBe(undefined);
  });

  it('should SELECT the SUPPLIES', () => {
    expect(store.selectSnapshot(AuthState.getKingdomSupplies)).not.toBe(undefined);
  });

  it('should SELECT the POPULATION', () => {
    expect(store.selectSnapshot(AuthState.getKingdomPopulation)).toBe(undefined);
  });

  it('should SELECT the BUILDING', () => {
    expect(store.selectSnapshot(AuthState.getKingdomBuildings)).not.toBe(undefined);
  });

  it('should SELECT the TURN', () => {
    expect(store.selectSnapshot(AuthState.getKingdomTurn)).toBe(null);
  });

  it('should SELECT the CLOCK', () => {
    expect(store.selectSnapshot(AuthState.getClock)).toBe(null);
  });

  it('should SELECT the TREE', () => {
    expect(store.selectSnapshot(AuthState.getKingdomTree)).toBe(null);
  });

});
