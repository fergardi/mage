import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ArchiveComponent } from './archive.component';
import { MatDialogStub, StoreStub, NotificationServiceStub, ApiServiceStub, LoadingServiceStub, AngularFirestoreStub, TutorialServiceStub } from 'src/stubs';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { NotificationService } from 'src/app/services/notification.service';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportComponent } from './report.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { TutorialService } from 'src/app/services/tutorial.service';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatChipsModule } from '@angular/material/chips';
import { Kingdom, Letter } from 'src/app/shared/type/interface.model';

describe('ArchiveComponent', () => {
  let component: ArchiveComponent;
  let fixture: ComponentFixture<ArchiveComponent>;
  const kingdom: Kingdom = {
    buildings: [],
    supplies: [],
    clan: undefined,
    coordinates: undefined,
    faction: undefined,
    guild: undefined,
    attacked: null,
    guilded: null,
    id: 'test',
    name: '',
    position: undefined,
    power: 0,
    tree: undefined,
  };
  const letter: Letter = {
    fid: 'test',
    read: false,
    from: kingdom,
    subject: '',
    message: '',
    timestamp: null,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
        BrowserAnimationsModule,
        MatIconModule,
        MatToolbarModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        FormsModule,
        ReactiveFormsModule,
        MatChipsModule,
      ],
      declarations: [
        ArchiveComponent,
        LongPipe,
      ],
      providers: [
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: TutorialService, useValue: TutorialServiceStub },
        { provide: MatDialog, useValue: MatDialogStub },
        { provide: Store, useValue: StoreStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: LoadingService, useValue: LoadingServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should OPEN the REPORT dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openReportDialog(letter);
    expect(MatDialogStub.open).toHaveBeenCalledWith(ReportComponent, { panelClass: 'dialog-responsive', data: letter });
  });

  it('should REMOVE the LETTERS', async () => {
    component.selection.select(letter);
    spyOn(ApiServiceStub, 'removeLetters');
    await component.deleteReports();
    expect(ApiServiceStub.removeLetters).toHaveBeenCalledWith(component.uid, ['test']);
  });

  it('should NOT REMOVE the LETTERS', async () => {
    spyOn(ApiServiceStub, 'removeLetters');
    await component.deleteReports();
    expect(ApiServiceStub.removeLetters).not.toHaveBeenCalled();
  });

});
