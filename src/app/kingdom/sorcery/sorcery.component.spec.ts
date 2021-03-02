import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SorceryComponent } from './sorcery.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { FirebaseServiceStub, AngularFirestoreStub, NotificationServiceStub, MatDialogStub, StoreStub, DragDropEventFactory } from 'src/stubs';
import { Store } from '@ngxs/store';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ResearchComponent } from './research.component';
import { ConjureComponent } from './conjure.component';
import { ActivateComponent } from './activate.component';

describe('SorceryComponent', () => {
  let component: SorceryComponent;
  let fixture: ComponentFixture<SorceryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        DragDropModule,
        BrowserAnimationsModule,
      ],
      declarations: [
        SorceryComponent,
      ],
      providers: [
        { provide: FirebaseService, useValue: FirebaseServiceStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MatDialog, useValue: MatDialogStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SorceryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should ASSIGN a CHARM', async () => {
    const eventFactory = new DragDropEventFactory<any>();
    const event: CdkDragDrop<any, any> = eventFactory.createEvent(0, 0);
    await component.assignCharm(event);
  });

  it('should ASSIGN an ARTIFACT', async () => {
    const eventFactory = new DragDropEventFactory<any>();
    const event: CdkDragDrop<any, any> = eventFactory.createEvent(0, 0);
    await component.assignArtifact(event);
  });

  it('should OPEN the RESEARCH dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openResearchDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(ResearchComponent, { panelClass: 'dialog-responsive', data: null });
  });

  it('should OPEN the CONJURE dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openConjureDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(ConjureComponent, { panelClass: 'dialog-responsive', data: null });
  });

  it('should OPEN the ACTIVATE dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openActivateDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(ActivateComponent, { panelClass: 'dialog-responsive', data: null });
  });

});
