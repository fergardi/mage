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

export const SnackBarStub: any = {
  open: () => {( { afterDismissed: () => of(null) } )},
};

export const StoreStub: any = {
  selectSnapshot: (selector: any): any => {
    switch (selector) {
      case AuthState.getKingdomTurn:
      case AuthState.getKingdomLand:
      case AuthState.getKingdomPopulation:
      case AuthState.getKingdomGem:
      case AuthState.getKingdomMana:
      case AuthState.getKingdomGold:
        return { quantity: 10, resource: { faction: { id: 'test' } } };
      case AuthState.getKingdomWorkshop:
      case AuthState.getKingdomAcademy:
      case AuthState.getKingdomVillage:
      case AuthState.getKingdomNode:
        return { quantity: 10, structure: { faction: { id: 'test' } } };
      case AuthState.getUserUID:
        return 'uid';
      case AuthState.getUserLoggedIn:
        return true;
      case AuthState.getKingdomGuild:
        return JSON.stringify({ guild: 'hunter', guilded: new Date().getTime() });
      default:
        return selector;
    }
  },
  select: (selector: any): Observable<any> => {
    return of(StoreStub.selectSnapshot(selector));
  },
  dispatch: (a: any) => of(a),
  /*
  select: (selector: any): Observable<any> => {
    switch (selector) {
      case AuthState.getKingdomTurn:
      case AuthState.getKingdomLand:
      case AuthState.getKingdomPopulation:
      case AuthState.getKingdomGem:
      case AuthState.getKingdomMana:
      case AuthState.getKingdomGold:
        return of({ quantity: 10, resource: { faction: { id: 'test' } } });
      case AuthState.getKingdomGuild:
        return of(JSON.stringify({ guild: 'hunter', guilded: new Date().getTime() }));
      case AuthState.getKingdomWorkshop:
      case AuthState.getKingdomAcademy:
      case AuthState.getKingdomVillage:
      case AuthState.getKingdomNode:
        return of({ quantity: 10, structure: { faction: { id: 'test' } } });
      default:
        return of(selector);
    }
  },
  */
};

export const DialogRefStub: any = {
  close: () => null,
};

export const BottomSheetRefStub: any = {
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
  sendLetter: () => null,
  foundateClan: () => null,
  assignCharm: () => null,
  assignArtifact: () => null,
  breakEnchantment: () => null,
  dispelIncantation: () => null,
  adventureReward: () => null,
  dealGood: () => null,
  addShop: () => null,
  addQuest: () => null,
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

export const MatBottomSheetStub: any = {
  open() {
    return {
      afterClosed: () => of({action: true}),
    };
  },
};

export const EventStub: any = {
  stopPropagation: () => null,
};

export const AngularFirestoreStub: any = {
  collection: () => {
    return {
      get: () => ({ toPromise: () => ({ docs: [] }) }),
      valueChanges: () => of([{
        faction: { id: 'grey' },
        from: { id: 'test', faction: { id: 'red' } },
        to: { id: 'test', faction: { id: 'red' } },
        message: { item: { faction: { id: 'grey' } } },
        item: { faction: { id: 'grey' } },
        spell: { faction: { id: 'red' } },
        unit: { faction: { id: 'red' } },
        hero: { faction: { id: 'red' } },
        timestamp: { toMillis: () => 0 },
        id: 'test',
        name: 'test',
        turns: 1,
      }]),
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
  startLoading: () => null,
  stopLoading: () => null,
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

export const NgxmTourServiceStub: any = {

};

export const TutorialServiceStub: any = {

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

export const FirebaseServiceStub: any = {
  loadFixtures: () => null,
};

export class DragDropEventFactory<T> {

  createInContainerEvent(containerId: string, data: T[], fromIndex: number, toIndex: number): CdkDragDrop<T[], T[]> {
    const event = this.createEvent(fromIndex, toIndex);
    const container: any = { id: containerId, data: data };
    event.container = (container as CdkDropList<T[]>);
    event.previousContainer = event.container;
    event.item = ({ data: data[fromIndex] } as CdkDrag<T>);
    return event;
  }

  createCrossContainerEvent(from: ContainerModel<T>, to: ContainerModel<T>): CdkDragDrop<T[], T[]> {
    const event = this.createEvent(from.index, to.index);
    event.container = this.createContainer(to);
    event.previousContainer = this.createContainer(from);
    event.item = ({ data: from.data[from.index] } as CdkDrag<T>);
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
    return container as CdkDropList<T[]>;
  }
}

export interface ContainerModel<T> {
  id: string;
  data: T[];
  index: number;
}
