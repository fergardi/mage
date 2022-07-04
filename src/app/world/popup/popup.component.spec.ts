import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PopupComponent } from './popup.component';
import { MatDialogStub, AngularFirestoreStub, StoreStub, ApiServiceStub, NotificationServiceStub } from 'src/stubs';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { FactionType, LocationType, PopupType, StoreType } from 'src/app/shared/type/enum.type';
import { DealComponent } from './deal.component';
import { AdventureComponent } from './adventure.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Deal, Faction, Popup } from 'src/app/shared/type/interface.model';
import { NotificationService } from 'src/app/services/notification.service';
import firebase from 'firebase/compat/app';

describe('PopupComponent', () => {
  let component: PopupComponent;
  let fixture: ComponentFixture<PopupComponent>;
  const faction: Faction = {
    type: FactionType.BLACK,
    subtype: null,
    name: undefined,
    description: undefined,
    image: undefined,
    marker: undefined,
    opposites: [],
    adjacents: [],
    id: undefined,
  };
  const kingdom: Popup = {
    type: PopupType.KINGDOM,
    buildings: [],
    supplies: [],
    clan: undefined,
    coordinates: undefined,
    faction: faction,
    guild: undefined,
    attacked: null,
    guilded: null,
    id: '',
    name: '',
    position: undefined,
    power: 0,
    tree: undefined,
    store: undefined,
    visited: null,
    turns: 0,
    location: undefined,
  };
  const shop: Popup = {
    type: PopupType.SHOP,
    buildings: [],
    supplies: [],
    clan: undefined,
    coordinates: undefined,
    faction: undefined,
    guild: undefined,
    attacked: null,
    guilded: null,
    id: '',
    name: '',
    position: undefined,
    power: 0,
    tree: undefined,
    store: {
      type: undefined,
      subtype: undefined,
      image: undefined,
      name: undefined,
      description: undefined,
      id: StoreType.INN,
      faction: faction,
    },
    visited: firebase.firestore.Timestamp.now(),
    turns: 0,
    location: undefined,
  };
  const quest: Popup = {
    type: PopupType.QUEST,
    buildings: [],
    supplies: [],
    clan: undefined,
    coordinates: undefined,
    faction: undefined,
    guild: undefined,
    attacked: null,
    guilded: null,
    id: '',
    name: '',
    position: undefined,
    power: 0,
    tree: undefined,
    store: undefined,
    visited: firebase.firestore.Timestamp.now(),
    turns: 0,
    location: {
      type: undefined,
      subtype: undefined,
      faction: faction,
      families: undefined,
      id: LocationType.CASTLE,
      name: undefined,
      description: undefined,
      image: undefined,
    },
  };
  const deal: Deal = {
    gold: 10,
    quantity: 10,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatCardModule,
        MatChipsModule,
        MatIconModule,
      ],
      declarations: [
        PopupComponent,
      ],
      providers: [
        { provide: Store, useValue: StoreStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: MatDialog, useValue: MatDialogStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupComponent);
    component = fixture.componentInstance;
    component.data = kingdom;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should CREATE the INSTANCE as KINGDOM popup', () => {
    component.data = kingdom;
    expect(component).toBeTruthy();
    expect(component.data.type).toBe(PopupType.KINGDOM);
  });

  it('should CREATE the INSTANCE as SHOP popup', () => {
    component.data = shop;
    expect(component).toBeTruthy();
    expect(component.data.type).toBe(PopupType.SHOP);
  });

  it('should CREATE the INSTANCE as QUEST popup', () => {
    component.data = quest;
    expect(component).toBeTruthy();
    expect(component.data.type).toBe(PopupType.QUEST);
  });

  it('should OPEN the SHOP dialog', () => {
    component.data = shop;
    spyOn(MatDialogStub, 'open');
    component.openDealDialog(deal);
    expect(MatDialogStub.open).toHaveBeenCalledWith(DealComponent, { panelClass: 'dialog-responsive', data: { deal: deal, shop: shop } });
  });

  it('should OPEN the QUEST dialog', () => {
    component.data = quest;
    spyOn(MatDialogStub, 'open');
    component.openAdventureDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(AdventureComponent, { panelClass: 'dialog-responsive', data: { reward: null, quest: quest } });
  });

});
