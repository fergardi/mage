import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReportComponent } from './report.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogRefStub, FirebaseServiceStub, ApiServiceStub, StoreStub } from 'src/stubs';
import { FirebaseService } from 'src/app/services/firebase.service';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { ShortPipe } from 'src/app/pipes/short.pipe';
import { MatBadgeModule } from '@angular/material/badge';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;
  const report = {
    read: false,
    from: 'auction',
    to: 'test',
    join: {
      join: {
        id: '',
        image: '',
      },
    },
    message: {
      join: {
        id: '',
      },
      unit: {
        id: 'skeleton',
      },
      quantity: 999,
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatBadgeModule,
      ],
      declarations: [
        ReportComponent,
        LegendaryPipe,
        ShortPipe,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: report },
        { provide: MatDialogRef, useValue: DialogRefStub },
        { provide: FirebaseService, useValue: FirebaseServiceStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: Store, useValue: StoreStub },
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

  it('should CREATE', () => {
    expect(component).toBeTruthy();
  });
});
