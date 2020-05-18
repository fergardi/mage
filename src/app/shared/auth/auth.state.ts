import { State, Action, Selector, StateContext, NgxsOnInit } from '@ngxs/store';
import { SetUserAction, LoginWithGoogleAction, LogoutAction } from './auth.actions';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AuthStateModel {
  uid: string | null
  supplies: any[]
  logged: boolean
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    uid: null,
    supplies: [],
    logged: false,
  }
})
@Injectable()
export class AuthState implements NgxsOnInit {

  constructor(
    private angularFireAuth: AngularFireAuth,
    private firebaseService: FirebaseService,
    private router: Router,
  ) { }

  ngxsOnInit(ctx: StateContext<AuthStateModel>) {
    this.angularFireAuth.authState.subscribe(user => {
      if (user) {
        ctx.dispatch(new SetUserAction(user.uid));
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
      uid: null,
      supplies: [],
      logged: false,
    });
    this.router.navigate(['/user/login']);
  }

  @Action(SetUserAction)
  setUser(ctx: StateContext<AuthStateModel>, payload: SetUserAction) {
    return this.firebaseService.leftJoin(`kingdoms/${payload.uid}/supplies`, 'resources', 'id', 'id').pipe(
      tap(supplies => {
        const state = ctx.getState();
        ctx.setState({
          ...state,
          uid: payload.uid,
          supplies: supplies.sort((a, b) => a.join.sort - b.join.sort),
          logged: true,
        });
      })
    );
  }

  @Selector()
  public static getUserUID(state: AuthStateModel): string {
    return state && state.uid;
  }

  @Selector()
  public static getKingdomSupplies(state: AuthStateModel): any[] {
    return state && state.supplies;
  }

  @Selector()
  public static getKingdomGem(state: AuthStateModel): any {
    return state && state.supplies.find(supply => supply.id === 'gem');
  }

  @Selector()
  public static getKingdomTurn(state: AuthStateModel): any {
    return state && state.supplies.find(supply => supply.id === 'turn');
  }

  @Selector()
  public static getKingdomLand(state: AuthStateModel): any {
    return state && state.supplies.find(supply => supply.id === 'land');
  }

  @Selector()
  public static getKingdomGold(state: AuthStateModel): any {
    return state && state.supplies.find(supply => supply.id === 'gold');
  }

  @Selector()
  public static getKingdomMana(state: AuthStateModel): any {
    return state && state.supplies.find(supply => supply.id === 'mana');
  }

  @Selector()
  public static getKingdomPopulation(state: AuthStateModel): any {
    return state && state.supplies.find(supply => supply.id === 'population');
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
