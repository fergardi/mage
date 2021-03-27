import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PopupComponent } from './popup.component';
import { MatDialogStub, AngularFirestoreStub, StoreStub, ApiServiceStub } from 'src/stubs';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { PopupType } from 'src/app/shared/type/common.type';
import { DealComponent } from './deal.component';
import { AdventureComponent } from './adventure.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';

describe('PopupComponent', () => {
  let component: PopupComponent;
  let fixture: ComponentFixture<PopupComponent>;
  const data: any = {
    type: PopupType.KINGDOM,
    faction: {
      name: 'test',
      description: 'test',
      image: 'assets/images/factions/black.png',
      marker: 'assets/images/factions/black.png',
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatCardModule,
      ],
      declarations: [
        PopupComponent,
      ],
      providers: [
        { provide: Store, useValue: StoreStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: MatDialog, useValue: MatDialogStub },
        { provide: ApiService, useValue: ApiServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should CREATE the INSTANCE as KINGDOM popup', () => {
    const kingdom: any = {
      type: PopupType.KINGDOM,
      faction: {
        name: 'test',
        description: 'test',
        image: 'assets/images/factions/black.png',
        marker: 'assets/images/factions/black.png',
      },
    };
    fixture = TestBed.createComponent(PopupComponent);
    component = fixture.componentInstance;
    component.data = kingdom;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.data.type).toBe(PopupType.KINGDOM);
  });

  it('should CREATE the INSTANCE as SHOP popup', () => {
    const shop: any = {
      type: PopupType.SHOP,
      store: {
        name: 'test',
        description: 'test',
        image: 'assets/images/stores/inn.png',
      },
    };
    fixture = TestBed.createComponent(PopupComponent);
    component = fixture.componentInstance;
    component.data = shop;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.data.type).toBe(PopupType.SHOP);
  });

  it('should CREATE the INSTANCE as QUEST popup', () => {
    const quest: any = {
      type: PopupType.QUEST,
      location: {
        name: 'test',
        description: 'test',
        image: 'assets/images/locations/volcano.png',
      },
    };
    fixture = TestBed.createComponent(PopupComponent);
    component = fixture.componentInstance;
    component.data = quest;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.data.type).toBe(PopupType.QUEST);
  });

  it('should OPEN the SHOP dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openDealDialog({ hero: {} });
    expect(MatDialogStub.open).toHaveBeenCalledWith(DealComponent, { panelClass: 'dialog-responsive', data: { hero: {}, join: {} } });
  });

  it('should OPEN the QUEST dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openAdventureDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(AdventureComponent, { panelClass: 'dialog-responsive', data: null });
  });

});
