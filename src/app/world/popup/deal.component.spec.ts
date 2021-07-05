import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DealComponent } from './deal.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogRefStub, NotificationServiceStub, StoreStub, ApiServiceStub } from 'src/stubs';
import { NotificationService } from 'src/app/services/notification.service';
import { TranslateModule } from '@ngx-translate/core';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatListModule } from '@angular/material/list';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';

describe('DealComponent', () => {
  let component: DealComponent;
  let fixture: ComponentFixture<DealComponent>;
  const data: any = {
    deal: {
      fid: 'test',
      join: {
        name: 'test',
        faction: {
          id: 'green',
        },
        image: 'assets/images/units/green/elf.png',
      },
      quantity: 1,
      gold: 1,
    },
    shop: {
      id: 'test',
      store: {
        id: 'test',
      },
    },
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
        { provide: Store, useValue: StoreStub },
        { provide: MatDialogRef, useValue: DialogRefStub },
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
    spyOn(ApiServiceStub, 'dealGood');
    await component.deal();
    expect(ApiServiceStub.dealGood).toHaveBeenCalledWith(component.uid, component.data.shop.id, 'charms', component.data.deal.fid);
  });

  it('should NOT DEAL a GOOD', async () => {
    component.kingdomGold.quantity = 0;
    spyOn(ApiServiceStub, 'dealGood');
    await component.deal();
    expect(ApiServiceStub.dealGood).not.toHaveBeenCalled();
  });

});
