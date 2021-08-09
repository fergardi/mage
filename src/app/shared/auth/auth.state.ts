import { State, Action, Selector, StateContext, NgxsOnInit } from '@ngxs/store';
import { SetUserAction, SetKingdomAction, SetKingdomSuppliesAction, SetKingdomBuildingsAction, LoginWithGoogleAction, LogoutAction } from './auth.actions';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { NotificationService } from 'src/app/services/notification.service';
import { calculate } from 'src/app/pipes/turn.pipe';

export interface AuthStateModel {
  kingdom: any;
  uid: string | null;
  supplies: any[];
  buildings: any[];
  logged: boolean;
  clock: Date | null;
  popup: string | null;
}

export const initial: AuthStateModel = {
  uid: null,
  kingdom: null,
  supplies: [],
  buildings: [],
  logged: false,
  clock: null,
  popup: null,
};

@State<AuthStateModel>({
  name: 'auth',
  defaults: initial,
})
@Injectable()
export class AuthState implements NgxsOnInit {

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
    const turns = state.supplies.find(supply => supply.id === 'turn');
    if (state && turns) {
      const kingdomTurn = JSON.parse(JSON.stringify(turns));
      kingdomTurn.quantity = calculate(kingdomTurn.timestamp.seconds * 1000, Date.now(), kingdomTurn.resource.max, kingdomTurn.resource.ratio);
      return kingdomTurn;
    }
    return null;
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
  public static getKingdomBuildings(state: AuthStateModel): any[] {
    return state && state.buildings;
  }

  @Selector()
  public static getKingdomVillage(state: AuthStateModel): any {
    return state && state.buildings.find(building => building.id === 'village');
  }

  @Selector()
  public static getKingdomNode(state: AuthStateModel): any {
    return state && state.buildings.find(building => building.id === 'node');
  }

  @Selector()
  public static getKingdomWorkshop(state: AuthStateModel): any {
    return state && state.buildings.find(building => building.id === 'workshop');
  }

  @Selector()
  public static getKingdomAcademy(state: AuthStateModel): any {
    return state && state.buildings.find(building => building.id === 'academy');
  }

  @Selector()
  public static getKingdomGuild(state: AuthStateModel): string | boolean {
    return state && state.kingdom && JSON.stringify({ guild: state.kingdom.guild, guilded: state.kingdom.guilded.toMillis() });
  }

  @Selector()
  public static getKingdomClan(state: AuthStateModel): any {
    return state && state.kingdom && state.kingdom.clan;
  }

  @Selector()
  public static getKingdom(state: AuthStateModel): any {
    return state && state.kingdom;
  }

  @Selector()
  public static getUserLoggedIn(state: AuthStateModel): boolean {
    return state && state.logged;
  }

  @Selector()
  public static getAuthState(state: AuthStateModel): AuthStateModel {
    return state;
  }

  @Selector()
  public static getClock(state: AuthStateModel): Date {
    return state && state.clock;
  }

  constructor(
    private angularFireAuth: AngularFireAuth,
    private angularFirestore: AngularFirestore,
    private router: Router,
    private notificationService: NotificationService,
  ) { }

  ngxsOnInit(ctx: StateContext<AuthStateModel>) {
    setInterval(() => {
      ctx.patchState({
        clock: new Date(),
      });
    }, 1000);
    this.angularFireAuth.authState.subscribe((user: any) => {
      if (user) {
        ctx.dispatch(new SetUserAction(user.uid));
        ctx.dispatch(new SetKingdomAction(user.uid));
        ctx.dispatch(new SetKingdomSuppliesAction(user.uid));
        ctx.dispatch(new SetKingdomBuildingsAction(user.uid));
        this.notificationService.success('user.auth.authorized');
        const route = localStorage.getItem('route') || '/kingdom/city';
        // fix to use #fragments
        const tree = this.router.parseUrl(route);
        const fragment = tree.fragment;
        tree.queryParams = {};
        tree.fragment = null;
        this.router.navigate([tree.toString()], { fragment: fragment });
      } else {
        this.router.navigate(['/user/landing']);
      }
    });
  }

  @Action(LoginWithGoogleAction)
  async loginWithGoogle(ctx: StateContext<AuthStateModel>) {
    await this.angularFireAuth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  @Action(LogoutAction)
  async logout(ctx: StateContext<AuthStateModel>) {
    await this.angularFireAuth.signOut();
    const state = ctx.getState();
    ctx.setState({
      ...state,
      uid: null,
      kingdom: null,
      supplies: [],
      buildings: [],
      logged: false,
      clock: null,
    });
  }

  @Action(SetUserAction)
  setUser(ctx: StateContext<AuthStateModel>, payload: SetUserAction) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      uid: payload.uid,
      logged: true,
    });
  }

  @Action(SetKingdomAction)
  setKingdom(ctx: StateContext<AuthStateModel>, payload: SetKingdomAction) {
    return this.angularFirestore.doc<any>(`kingdoms/${payload.uid}`).valueChanges().pipe(
      tap((kingdom: any) => {
        const state = ctx.getState();
        ctx.setState({
          ...state,
          kingdom: kingdom,
        });
      }),
    );
  }

  @Action(SetKingdomSuppliesAction)
  setKingdomSupplies(ctx: StateContext<AuthStateModel>, payload: SetKingdomSuppliesAction) {
    return this.angularFirestore.collection<any>(`kingdoms/${payload.uid}/supplies`).valueChanges({ idField: 'fid' }).pipe(
      tap((supplies: any[]) => {
        const state = ctx.getState();
        ctx.setState({
          ...state,
          supplies: supplies.sort((a, b) => a.resource.sort - b.resource.sort),
        });
      }),
    );
  }

  @Action(SetKingdomBuildingsAction)
  setKingdomBuildings(ctx: StateContext<AuthStateModel>, payload: SetKingdomBuildingsAction) {
    return this.angularFirestore.collection<any>(`kingdoms/${payload.uid}/buildings`).valueChanges({ idField: 'fid' }).pipe(
      tap((buildings: any[]) => {
        const state = ctx.getState();
        ctx.setState({
          ...state,
          buildings: buildings,
        });
      }),
    );
  }

}
