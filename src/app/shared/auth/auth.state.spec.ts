import { TestBed, waitForAsync } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { AuthState, AuthStateModel } from './auth.state';
import { SetUserAction } from './auth.actions';

describe('Auth store', () => {
  let store: Store;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([AuthState])]
    }).compileComponents();
    store = TestBed.get(Store);
  }));

  it('should create an action and add an item', () => {
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
    expect(actual).toEqual(expected);
  });

});
