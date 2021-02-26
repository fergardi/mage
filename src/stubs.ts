import { AuthState } from './app/shared/auth/auth.state';
import { of, Observable } from 'rxjs';
import * as mapboxgl from 'mapbox-gl';
import { environment } from './environments/environment';

export const NotificationServiceStub: any = {
  success: () => null,
  warning: () => null,
  error: () => null,
};

export const StoreStub: any = {
  selectSnapshot: (type: any) => {
    switch (type) {
      case AuthState.getKingdomTurn:
      case AuthState.getKingdomLand:
      case AuthState.getKingdomPopulation:
      case AuthState.getKingdomGem:
      case AuthState.getKingdomMana:
      case AuthState.getKingdomGold:
      case AuthState.getKingdomWorkshop:
        return { quantity: 10 };
      case AuthState.getUserUID:
        return 'uid';
      case AuthState.getUserLoggedIn:
        return true;
    }
  },
  select: (a: any) => of(a),
  dispatch: (a: any) => of(a),
};

export const DialogRefStub: any = {
  close: () => null,
};

export const ApiServiceStub: any = {
  taxGold: () => null,
  disbandTroop: () => null,
  bidAuction: () => null,
  recruitUnit: () => null,
  readLetter: () => null,
  battleKingdom: () => null,
  refreshAuction: () => null,
  exploreLand: () => null,
  chargeMana: () => null,
  buildStructure: () => null,
};

export const FirebaseServiceStub: any = {
  selfJoin: (a: any) => a,
  leftJoin: (): Observable<any[]> => of([]),
};

export const CacheServiceStub: any = {
  getSkills: () => [],
  getUnits: () => [],
  getSpells: () => [],
  getItems: () => [],
  getGods: () => [],
  getStructures: () => [],
  getHeroes: () => [],
  getResources: () => [],
  getFamilies: () => [],
  getCategories: () => [],
  getGuilds: () => [],
  getAttacks: () => [],
  getFactions: () => [{ id: 'test', name: 'test' }],
  getStores: () => [],
  getLocations: () => [],
};

export const MatDialogStub: any = {
  open() {
    return {
      afterClosed: () => of({action: true}),
    };
  },
};

export const AngularFirestoreStub: any = {
  collection: () => {
    return {
      get: () => ({ toPromise: () => ({ docs: [] }) }),
      valueChanges: () => of([{ test: 'test' }]),
    };
  },
};

export const LoadingServiceStub: any = {
  setLoading: () => null,
};

export const AngularFireAuthStub: any = {
  auth: jasmine.createSpyObj('auth', {
    signInAnonymously: Promise.resolve(),
    signInWithEmailAndPassword: Promise.resolve(),
    signInWithPopup: Promise.resolve(),
    signOut: Promise.resolve(),
  }),
  authState: of<object>({ uid: '17WvU2Vj58SnTz8v7EqyYYb0WRc2', displayName: 'test', isAnonymous: true }),
};

export const MapboxServiceStub: any = {
  map: null,
  initialize: () => {
    const mapbox = (mapboxgl as typeof mapboxgl);
    mapbox.accessToken = environment.mapbox.token;
    const map = new mapboxgl.Map({
      container: 'map',
      style: environment.mapbox.style + '?optimize=true',
      zoom: environment.mapbox.zoom,
      center: [environment.mapbox.lng, environment.mapbox.lat],
      pitch: environment.mapbox.pitch,
      attributionControl: true,
      interactive: true,
    });
    MapboxServiceStub.map = map;
  },
  resizeMap: () => null,
  addShopByClick: () => null,
  addQuestByClick: () => null,
  addBot: () => null,
  populateMap: () => Promise.resolve(null),
  clearMarkers: () => null,
};

export const RouterStub: any = {
  events: of([]),
  navigate: jasmine.createSpy('navigate'),
};
