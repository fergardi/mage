import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SorceryComponent } from './sorcery.component';
import { AngularFirestoreStub, NotificationServiceStub, MatDialogStub, StoreStub, DragDropEventFactory, ApiServiceStub } from 'src/stubs';
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
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { ShortPipe } from 'src/app/pipes/short.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { ApiService } from 'src/app/services/api.service';

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
        MatProgressBarModule,
        MatBadgeModule,
      ],
      declarations: [
        SorceryComponent,
        IconPipe,
        ShortPipe,
        LongPipe,
      ],
      providers: [
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MatDialog, useValue: MatDialogStub },
        { provide: ApiService, useValue: ApiServiceStub },
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
    // spyOn(ApiServiceStub, 'assignCharm');
    await component.assignCharm(event);
    // expect(ApiServiceStub.assignCharm).toHaveBeenCalledWith(component.uid, ['test']);
  });

  it('should ASSIGN an ARTIFACT', async () => {
    const eventFactory = new DragDropEventFactory<any>();
    const event: CdkDragDrop<any, any> = eventFactory.createEvent(0, 0);
    // spyOn(ApiServiceStub, 'assignArtifact');
    await component.assignArtifact(event);
    // expect(ApiServiceStub.assignArtifact).toHaveBeenCalledWith(component.uid, ['test']);
  });

  it('should OPEN the RESEARCH dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openResearchDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(ResearchComponent, { panelClass: 'dialog-responsive', data: null });
  });

  it('should OPEN the CONJURE dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openConjureDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(ConjureComponent, { panelClass: 'dialog-responsive', data: { charm: null, kingdom: null } });
  });

  it('should OPEN the ACTIVATE dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openActivateDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(ActivateComponent, { panelClass: 'dialog-responsive', data: { artifact: null, kingdom: null } });
  });

});
