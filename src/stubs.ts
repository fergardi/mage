import { AuthState } from './app/shared/auth/auth.state';
import { of, Observable } from 'rxjs';
import * as mapboxgl from 'mapbox-gl';
import { environment } from './environments/environment';
import { CdkDragDrop, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { IStepOption } from 'ngx-ui-tour-core';
import { map } from 'lodash';

export const NotificationServiceStub: any = {
  success: () => null,
  warning: () => null,
  error: () => null,
};

export const SnackBarStub: any = {
  open: () => {
    return {
      afterDismissed: () => of(null),
    };
  },
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
        return JSON.stringify({ guild: { id: 'hunter' }, guilded: new Date().getTime() });
      default:
        return selector;
    }
  },
  select: (selector: any): Observable<any> => {
    return of(StoreStub.selectSnapshot(selector));
  },
  dispatch: (a: any) => of(a),
};

export const BottomSheetRefStub: any = {
  close: () => null,
};

interface ApiServiceStubInterface {
  taxGold: any;
  disbandTroop: any;
  bidAuction: any;
  recruitUnit: any;
  readLetter: any;
  battleKingdom: any;
  refreshAuction: any;
  exploreLand: any;
  chargeMana: any;
  buildStructure: any;
  activateArtifact: any;
  offerGod: any;
  conjureCharm: any;
  assignArmy: any;
  researchCharm: any;
  removeLetters: any;
  buyEmporium: any;
  sendLetter: any;
  foundateClan: any;
  assignCharm: any;
  assignArtifact: any;
  breakEnchantment: any;
  dispelIncantation: any;
  adventureQuest: any;
  tradeDeal: any;
  addShop: any;
  addQuest: any;
  dischargeContract: any;
  favorGuild: any;
  joinClan: any;
  leaveClan: any;
  demolishStructure: any;
  plantTree: any;
  createKingdom: any;
  populateMap: any;
}

export const ApiServiceStub: ApiServiceStubInterface = {
  taxGold: () => Promise.resolve(null),
  disbandTroop: () => Promise.resolve(null),
  bidAuction: () => Promise.resolve(null),
  recruitUnit: () => Promise.resolve(null),
  readLetter: () => Promise.resolve(null),
  battleKingdom: () => Promise.resolve(null),
  refreshAuction: () => Promise.resolve(null),
  exploreLand: () => Promise.resolve(null),
  chargeMana: () => Promise.resolve(null),
  buildStructure: () => Promise.resolve(null),
  activateArtifact: () => Promise.resolve(null),
  offerGod: () => Promise.resolve({ item: 'love-potion' }),
  conjureCharm: () => Promise.resolve(null),
  assignArmy: () => Promise.resolve(null),
  researchCharm: () => Promise.resolve(null),
  removeLetters: () => Promise.resolve(null),
  buyEmporium: () => Promise.resolve(null),
  sendLetter: () => Promise.resolve(null),
  foundateClan: () => Promise.resolve(null),
  assignCharm: () => Promise.resolve(null),
  assignArtifact: () => Promise.resolve(null),
  breakEnchantment: () => Promise.resolve(null),
  dispelIncantation: () => Promise.resolve(null),
  adventureQuest: () => Promise.resolve(null),
  tradeDeal: () => Promise.resolve(null),
  addShop: () => Promise.resolve(null),
  addQuest: () => Promise.resolve(null),
  dischargeContract: () => Promise.resolve(null),
  favorGuild: () => Promise.resolve(null),
  joinClan: () => Promise.resolve(null),
  leaveClan: () => Promise.resolve(null),
  demolishStructure: () => Promise.resolve(null),
  plantTree: () => Promise.resolve(null),
  createKingdom: () => Promise.resolve(null),
  populateMap: () => Promise.resolve(null),
};

export const CacheServiceStub: any = {
  getSkills: () => Promise.resolve([]),
  getUnits: () => Promise.resolve([]),
  getSpells: () => Promise.resolve([]),
  getItems: () => Promise.resolve([]),
  getGods: () => Promise.resolve([]),
  getStructures: () => Promise.resolve([]),
  getHeroes: () => Promise.resolve([]),
  getResources: () => Promise.resolve([]),
  getFamilies: () => Promise.resolve([]),
  getCategories: () => Promise.resolve([]),
  getGuilds: () => Promise.resolve([{ id: 'hunter', name: 'test', faction: { id: 'grey' } }]),
  getAttacks: () => Promise.resolve([]),
  getFactions: () => Promise.resolve([{ id: 'test', name: 'test' }]),
  getStores: () => Promise.resolve([]),
  getLocations: () => Promise.resolve([]),
  getPacks: () => Promise.resolve([]),
  getPerks: () => Promise.resolve([]),
};

export const MatDialogRefStub: any = {
  close: () => null,
};

export const MatDialogStub: any = {
  open: () => ({ afterClosed: () => of(true) }),
};

export const MatBottomSheetStub: any = {
  open: () => ({ afterClosed: () => of(null) }),
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
        item: { name: 'test', description: 'test', faction: { id: 'grey' } },
        spell: { name: 'test', description: 'test', faction: { id: 'red' } },
        unit: { name: 'test', description: 'test', faction: { id: 'red' } },
        hero: { name: 'test', description: 'test', faction: { id: 'red' } },
        timestamp: { toMillis: () => 0 },
        auctioned: { toMillis: () => 0 },
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
  signInWithEmailAndPassword: () => Promise.resolve(),
  createUserWithEmailAndPassword: () => Promise.resolve(),
  sendPasswordResetEmail: () => Promise.resolve(),
  signInWithPopup: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  auth: jasmine.createSpyObj('auth', {
    signInAnonymously: Promise.resolve(),
    signInWithEmailAndPassword: Promise.resolve(),
    signInWithPopup: Promise.resolve(),
    signOut: Promise.resolve(),
  }),
  authState: of<object>({ uid: 'test', displayName: 'test', isAnonymous: true }),
};

export const TourServiceStub: any = {
  disableHotkeys: () => null,
  initialize: (steps: IStepOption[], stepDefaults?: IStepOption) => null,
  start: () => null,
  startAt: () => null,
  hasPrev: () => true,
  hasNext: () => true,
};

export const TutorialServiceStub: any = {
  initialize: () => null,
  start: () => null,
};

export const MapboxServiceStub: any = {
  map: null,
  initialize: () => {
    const mapbox = (mapboxgl as typeof mapboxgl);
    mapbox.accessToken = environment.mapbox.token;
    const m = new mapboxgl.Map({
      container: 'map',
      style: environment.mapbox.style + '?optimize=true',
      zoom: environment.mapbox.zoom,
      center: [environment.mapbox.lng, environment.mapbox.lat],
      pitch: environment.mapbox.pitch,
      attributionControl: true,
      interactive: true,
    });
    MapboxServiceStub.map = m;
  },
  resizeMap: () => null,
  addShopByClick: () => null,
  addQuestByClick: () => null,
  addKingdomByClick: () => null,
  clearMarkers: () => null,
  terminalize: () => {
    MapboxServiceStub.map.remove();
  },
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
      dropPoint: { x: 0, y: 0 },
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
