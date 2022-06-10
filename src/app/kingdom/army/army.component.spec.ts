import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ArmyComponent } from './army.component';
import { MatDialogStub, ApiServiceStub, LoadingServiceStub, StoreStub, CacheServiceStub, NotificationServiceStub, DragDropEventFactory, AngularFirestoreStub, TutorialServiceStub } from 'src/stubs';
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
import { AngularFirestore } from '@angular/fire/firestore';
import { ShortPipe } from 'src/app/pipes/short.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { TutorialService } from 'src/app/services/tutorial.service';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { Troop } from 'src/app/shared/type/interface.model';

describe('ArmyComponent', () => {
  let component: ArmyComponent;
  let fixture: ComponentFixture<ArmyComponent>;
  const troop: Troop = {
    id: '',
    quantity: 10,
    unit: undefined,
    troopId: '',
    assignment: 0,
    sort: 0,
  };

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
        MatBadgeModule,
      ],
      declarations: [
        ArmyComponent,
        ShortPipe,
        LongPipe,
        IconPipe,
      ],
      providers: [
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: CacheService, useValue: CacheServiceStub },
        { provide: Store, useValue: StoreStub },
        { provide: MatDialog, useValue: MatDialogStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: LoadingService, useValue: LoadingServiceStub },
        { provide: TutorialService, useValue: TutorialServiceStub },
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
    // TODO expect
  });

  it('should UPDATE the ARMY', () => {
    component.kingdomTroops = [troop];
    component.attackTroops = [troop];
    component.defenseTroops = [troop];
    component.updateArmy();
    // TODO expect
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
