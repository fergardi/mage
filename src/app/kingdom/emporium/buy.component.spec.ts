import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BuyComponent } from './buy.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { NotificationServiceStub, DialogRefStub, StoreStub, ApiServiceStub } from 'src/stubs';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';
import { TranslateModule } from '@ngx-translate/core';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';

describe('BuyComponent', () => {
  let component: BuyComponent;
  let fixture: ComponentFixture<BuyComponent>;
  const item: any = {
    id: 'test',
    name: 'test',
    description: 'test',
    image: 'assets/images/items/magic-compass.png',
    faction: {
      id: 'grey',
    },
    gems: 1,
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
        BuyComponent,
        LegendaryPipe,
        IconPipe,
        LongPipe,
      ],
      providers: [
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: item },
        { provide: MatDialogRef, useValue: DialogRefStub },
        { provide: Store, useValue: StoreStub },
        { provide: ApiService, useValue: ApiServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should BUY an ARTIFACT', async () => {
    spyOn(ApiServiceStub, 'buyEmporium');
    await component.buy();
    expect(ApiServiceStub.buyEmporium).toHaveBeenCalledWith(component.uid, component.item.id);
  });

  it('should NOT BUY an ARTIFACT', async () => {
    component.kingdomGem.quantity = 0;
    spyOn(ApiServiceStub, 'buyEmporium');
    await component.buy();
    expect(ApiServiceStub.buyEmporium).not.toHaveBeenCalled();
  });

});
