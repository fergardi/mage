import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReportComponent } from './report.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogRefStub, FirebaseServiceStub } from 'src/stubs';
import { FirebaseService } from 'src/app/services/firebase.service';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

fdescribe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;
  const report = {
    from: 'test',
    to: 'test',
    join: {
      join: {
        image: '',
      },
    },
    message: {
      unit: 'skeleton',
      quantity: 999,
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
      ],
      declarations: [
        ReportComponent,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: report },
        { provide: MatDialogRef, useValue: DialogRefStub },
        { provide: FirebaseService, useValue: FirebaseServiceStub },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
