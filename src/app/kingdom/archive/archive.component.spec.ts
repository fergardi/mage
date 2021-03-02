import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ArchiveComponent } from './archive.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { FirebaseServiceStub, MatDialogStub, StoreStub, NotificationServiceStub, ApiServiceStub, LoadingServiceStub } from 'src/stubs';
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

describe('ArchiveComponent', () => {
  let component: ArchiveComponent;
  let fixture: ComponentFixture<ArchiveComponent>;

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
      ],
      declarations: [
        ArchiveComponent,
      ],
      providers: [
        { provide: FirebaseService, useValue: FirebaseServiceStub },
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

  it('should OPEN the REPORT dialog', async () => {
    const report = { message: null };
    spyOn(MatDialogStub, 'open');
    await component.openReportDialog(report);
    expect(MatDialogStub.open).toHaveBeenCalledWith(ReportComponent, { panelClass: 'dialog-responsive', data: report });
  });

  it('should REMOVE the LETTERS', async () => {
    component.selection.select({ fid: 'test' });
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
