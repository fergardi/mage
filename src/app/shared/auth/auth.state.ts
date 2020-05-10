import { State, Action, Selector, StateContext, NgxsOnInit } from '@ngxs/store';
import { SetUserAction, LoginWithGoogleAction, LogoutAction } from './auth.actions';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  uid: string
}

export interface AuthStateModel {
  user: User | null;
  logged: boolean;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    logged: false
  }
})
@Injectable()
export class AuthState implements NgxsOnInit {

  constructor(
    private angularFireAuth: AngularFireAuth,
    private router: Router,
  ) { }

  ngxsOnInit(ctx: StateContext<AuthStateModel>) {
    this.angularFireAuth.authState.subscribe(async user => {
      if (user) {
        await ctx.dispatch(new SetUserAction({ uid: user.uid })).toPromise();
        // this.router.navigate(['/world/map']);
      }
    });
  }

  @Action(LoginWithGoogleAction)
  async loginWithGoogle(ctx: StateContext<AuthStateModel>) {
    await this.angularFireAuth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  @Action(LogoutAction)
  async logout(ctx: StateContext<AuthStateModel>) {
    const state = ctx.getState();
    await this.angularFireAuth.signOut();
    ctx.setState({
      ...state,
      user: null,
      logged: false,
    });
    this.router.navigate(['/user/login']);
  }

  @Action(SetUserAction)
  setUser(ctx: StateContext<AuthStateModel>, action: SetUserAction) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      user: action.payload,
      logged: true,
    });
  }

  @Selector()
  public static getUserUID(state: AuthStateModel): string {
    return state && state.user && state.user.uid;
  }

  @Selector()
  public static getUserLoggedIn(state: AuthStateModel): boolean {
    return state && state.logged;
  }

  @Selector()
  public static getAuthState(state: AuthStateModel): AuthStateModel {
    return state;
  }

}
