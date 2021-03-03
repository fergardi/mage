import { AuthState } from './app/shared/auth/auth.state';
import { of, Observable } from 'rxjs';
import * as mapboxgl from 'mapbox-gl';
import { environment } from './environments/environment';
import { CdkDragDrop, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';

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
  activateArtifact: () => null,
  offerGod: () => ({ item: 'love-potion' }),
  conjureCharm: () => null,
  assignArmy: () => null,
  researchCharm: () => null,
  removeLetters: () => null,
  buyEmporium: () => null,
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
  getPacks: () => [],
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
  doc: () => {
    return {
      get: () => ({ toPromise: () => ({ docs: [] }) }),
      valueChanges: () => of(null),
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
  authState: of<object>({ uid: 'test', displayName: 'test', isAnonymous: true }),
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

export class DragDropEventFactory<T> {

  createInContainerEvent(containerId: string, data: T[], fromIndex: number, toIndex: number): CdkDragDrop<T[], T[]> {
    const event = this.createEvent(fromIndex, toIndex);
    const container: any = { id: containerId, data: data };
    event.container = <CdkDropList<T[]>>container;
    event.previousContainer = event.container;
    event.item = <CdkDrag<T>>{ data: data[fromIndex] };
    return event;
  }

  createCrossContainerEvent(from: ContainerModel<T>, to: ContainerModel<T>): CdkDragDrop<T[], T[]> {
    const event = this.createEvent(from.index, to.index);
    event.container = this.createContainer(to);
    event.previousContainer = this.createContainer(from);
    event.item = <CdkDrag<T>>{ data: from.data[from.index] };
    return event;
  }

  createEvent(previousIndex: number, currentIndex: number): CdkDragDrop<T[], T[]> {
    return {
      previousIndex: previousIndex,
      currentIndex: currentIndex,
      item: undefined,
      container: undefined,
      previousContainer: undefined,
      isPointerOverContainer: true,
      distance: { x: 0, y: 0 },
    };
  }

  createContainer(model: ContainerModel<T>): CdkDropList<T[]> {
    const container: any = { id: model.id, data: model.data };
    return <CdkDropList<T[]>>container;
  }
}

export interface ContainerModel<T> {
  id: string;
  data: T[];
  index: number;
}
