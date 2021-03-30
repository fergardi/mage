import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReportComponent } from './report.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogRefStub, ApiServiceStub, StoreStub } from 'src/stubs';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { ShortPipe } from 'src/app/pipes/short.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;
  const report = {
    timestamp: { toMillis: () => 0 },
    read: false,
    from: {
      name: 'test',
      faction: {
        name: 'test',
        id: 'grey',
      },
    },
    to: 'test',
    join: {
      name: 'test',
      join: {
        id: 'red',
        name: 'test',
        image: 'assets/images/factions/red.png',
      },
    },
    message: {
      join: {
        type: 'unit',
        name: 'test',
        description: 'test',
        image: 'assets/images/units/red/lizardman.png',
        id: 'red',
      },
      quantity: 999,
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatBadgeModule,
        MatListModule,
        MatButtonModule,
        MatChipsModule,
      ],
      declarations: [
        ReportComponent,
        LegendaryPipe,
        ShortPipe,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: report },
        { provide: MatDialogRef, useValue: DialogRefStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });
});
