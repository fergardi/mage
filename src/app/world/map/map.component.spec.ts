import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MapComponent } from './map.component';
import { NotificationService } from 'src/app/services/notification.service';
import { NotificationServiceStub, AngularFirestoreStub, MapboxServiceStub, StoreStub, CacheServiceStub, ApiServiceStub } from 'src/stubs';
import { AngularFirestore } from '@angular/fire/firestore';
import { MapboxService } from 'src/app/services/mapbox.service';
import { Store } from '@ngxs/store';
import { CacheService } from 'src/app/services/cache.service';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { StoreType, LocationType, FactionType } from 'src/app/shared/type/common.type';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatMenuModule,
        MatIconModule,
      ],
      declarations: [
        MapComponent,
      ],
      providers: [
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: CacheService, useValue: CacheServiceStub },
        { provide: Store, useValue: StoreStub },
        { provide: MapboxService, useValue: MapboxServiceStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: ActivatedRoute, useValue: {} },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });
/*
  it('should POPULATE the MAP', async () => {
    spyOn(MapboxServiceStub, 'populateMap');
    await component.populateMap();
    expect(MapboxServiceStub.populateMap).toHaveBeenCalled();
  });

  it('should ADD a SHOP', () => {
    spyOn(MapboxServiceStub, 'addShopByClick');
    component.addShop(StoreType.INN);
    expect(MapboxServiceStub.addShopByClick).toHaveBeenCalled();
  });

  it('should ADD a QUEST', () => {
    spyOn(MapboxServiceStub, 'addQuestByClick');
    component.addQuest(LocationType.GRAVEYARD);
    expect(MapboxServiceStub.addQuestByClick).toHaveBeenCalled();
  });

  it('should ADD a KINGDOM', () => {
    spyOn(MapboxServiceStub, 'addBot');
    component.addKingdom(FactionType.BLACK);
    expect(MapboxServiceStub.addBot).toHaveBeenCalled();
  });
*/
});
