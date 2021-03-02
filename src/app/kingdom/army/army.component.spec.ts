import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ArmyComponent } from './army.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { FirebaseServiceStub, MatDialogStub, ApiServiceStub, LoadingServiceStub, StoreStub, CacheServiceStub, NotificationServiceStub, DragDropEventFactory } from 'src/stubs';
import { NotificationService } from 'src/app/services/notification.service';
import { CacheService } from 'src/app/services/cache.service';
import { Store } from '@ngxs/store';
import { MatDialog } from '@angular/material/dialog';
import { LoadingService } from 'src/app/services/loading.service';
import { ApiService } from 'src/app/services/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { DisbandComponent } from './disband.component';
import { RecruitComponent } from './recruit.component';

describe('ArmyComponent', () => {
  let component: ArmyComponent;
  let fixture: ComponentFixture<ArmyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatListModule,
        BrowserAnimationsModule,
        DragDropModule,
      ],
      declarations: [
        ArmyComponent,
      ],
      providers: [
        { provide: FirebaseService, useValue: FirebaseServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: CacheService, useValue: CacheServiceStub },
        { provide: Store, useValue: StoreStub },
        { provide: MatDialog, useValue: MatDialogStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: LoadingService, useValue: LoadingServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArmyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should DRAG and DROP', () => {
    const eventFactory = new DragDropEventFactory<any>();
    const event: CdkDragDrop<any, any> = eventFactory.createEvent(0, 0);
    component.assignTroop(event);
  });

  it('should UPDATE the ARMY', () => {
    component.kingdomTroops = [{ fid: 'test '}];
    component.attackTroops = [{ fid: 'test '}];
    component.defenseTroops = [{ fid: 'test '}];
    component.updateArmy();
  });

  it('should OPEN the RECRUIT dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openRecruitDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(RecruitComponent, { panelClass: 'dialog-responsive', data: null });
  });

  it('should OPEN the DISBAND dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openDisbandDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(DisbandComponent, { panelClass: 'dialog-responsive', data: null });
  });

});
