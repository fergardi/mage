import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DischargeComponent } from './discharge.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRefStub, NotificationServiceStub, ApiServiceStub, StoreStub } from 'src/stubs';
import { TranslateModule } from '@ngx-translate/core';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';

describe('DischargeComponent', () => {
  let component: DischargeComponent;
  let fixture: ComponentFixture<DischargeComponent>;
  const contract: any = {
    fid: 'test',
    hero: {
      name: 'test',
      description: 'test',
      faction: {
        id: 'red',
      },
      image: 'assets/images/heroes/red/dragon-rider.png',
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatListModule,
        MatBadgeModule,
        MatButtonModule,
        MatChipsModule,
      ],
      declarations: [
        DischargeComponent,
        LegendaryPipe,
        IconPipe,
      ],
      providers: [
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: Store, useValue: StoreStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: MatDialogRef, useValue: MatDialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: contract },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DischargeComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should DISCHARGE the CONTRACT', async () => {
    spyOn(ApiServiceStub, 'dischargeContract');
    await component.discharge();
    expect(ApiServiceStub.dischargeContract).toHaveBeenCalledWith(component.uid, component.contract.fid);
  });

  it('should DISCHARGE the CONTRACT and CATCH the ERROR', async () => {
    spyOn(ApiServiceStub, 'dischargeContract').and.throwError(new Error('test'));
    await component.discharge();
    expect(ApiServiceStub.dischargeContract).toThrowError('test');
  });
});
