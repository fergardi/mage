import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TavernComponent } from './tavern.component';
import { NotificationServiceStub, MatDialogStub, StoreStub, ApiServiceStub, AngularFirestoreStub, TutorialServiceStub } from 'src/stubs';
import { NotificationService } from 'src/app/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatListModule } from '@angular/material/list';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DischargeComponent } from './discharge.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { ShortPipe } from 'src/app/pipes/short.pipe';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { TutorialService } from 'src/app/services/tutorial.service';

describe('TavernComponent', () => {
  let component: TavernComponent;
  let fixture: ComponentFixture<TavernComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatCardModule,
        MatIconModule,
        MatChipsModule,
        BrowserAnimationsModule,
        MatListModule,
        DragDropModule,
        MatBadgeModule,
      ],
      declarations: [
        TavernComponent,
        ShortPipe,
        IconPipe,
      ],
      providers: [
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MatDialog, useValue: MatDialogStub },
        { provide: Store, useValue: StoreStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: TutorialService, useValue: TutorialServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TavernComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should OPEN the DISCHARGE dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openDischargeDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(DischargeComponent, { panelClass: 'dialog-responsive', data: null });
  });

});
