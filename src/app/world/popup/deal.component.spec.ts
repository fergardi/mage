import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DealComponent } from './deal.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRefStub, NotificationServiceStub, StoreStub, ApiServiceStub } from 'src/stubs';
import { NotificationService } from 'src/app/services/notification.service';
import { TranslateModule } from '@ngx-translate/core';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatListModule } from '@angular/material/list';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { Store as SStore } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { Deal, Faction, Shop, Store } from 'src/app/shared/type/interface.model';
import { FactionType, StoreType } from 'src/app/shared/type/enum.type';
import firebase from 'firebase/compat/app';

describe('DealComponent', () => {
  let component: DealComponent;
  let fixture: ComponentFixture<DealComponent>;
  const faction: Faction = {
    type: undefined,
    subtype: null,
    name: undefined,
    description: undefined,
    image: undefined,
    marker: undefined,
    opposites: [],
    adjacents: [],
    id: FactionType.GREY,
  };
  const store: Store = {
    type: '',
    subtype: '',
    image: '',
    name: '',
    description: '',
    id: StoreType.INN,
    faction: faction,
  };
  const shop: Shop = {
    id: 'test',
    store: store,
    name: '',
    type: StoreType.INN,
    visited: firebase.firestore.Timestamp.now(),
  };
  const deal: Deal = {
    fid: 'test',
      join: {
        name: 'test',
        faction: faction,
        image: '',
      },
    gold: 1,
    quantity: 1
  };
  const data = {
    deal: deal,
    shop: shop,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatListModule,
        MatBadgeModule,
        MatButtonModule,
      ],
      declarations: [
        DealComponent,
        LegendaryPipe,
        IconPipe,
        LongPipe,
      ],
      providers: [
        { provide: SStore, useValue: StoreStub },
        { provide: MatDialogRef, useValue: MatDialogRefStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: NotificationService, useValue: NotificationServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DealComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should DEAL a GOOD', async () => {
    spyOn(ApiServiceStub, 'tradeDeal');
    await component.deal();
    expect(ApiServiceStub.tradeDeal).toHaveBeenCalledWith(component.uid, component.data.shop.id, 'contracts', component.data.deal.fid);
  });

  it('should NOT DEAL a GOOD', async () => {
    component.kingdomGold.quantity = 0;
    spyOn(ApiServiceStub, 'tradeDeal');
    await component.deal();
    expect(ApiServiceStub.tradeDeal).not.toHaveBeenCalled();
  });

});
