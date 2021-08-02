import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DisbandComponent } from './disband.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';
import { TranslateModule } from '@ngx-translate/core';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { ApiServiceStub, NotificationServiceStub, DialogRefStub, StoreStub } from 'src/stubs';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatChipsModule } from '@angular/material/chips';
import { IconPipe } from 'src/app/pipes/icon.pipe';

describe('DisbandComponent', () => {
  let component: DisbandComponent;
  let fixture: ComponentFixture<DisbandComponent>;
  const troop = {
    quantity: 9999,
    unit: {
      name: 'test',
      description: 'test',
      id: 'skeleton',
      image: '/assets/images/units/black/skeleton.png',
      faction: {
        id: 'black',
      },
      legendary: false,
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatBadgeModule,
        MatListModule,
        MatFormFieldModule,
        FormsModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatChipsModule,
      ],
      declarations: [
        DisbandComponent,
        LegendaryPipe,
        LongPipe,
        IconPipe,
      ],
      providers: [
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: troop },
        { provide: MatDialogRef, useValue: DialogRefStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisbandComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should DISBAND a troop', () => {
    component.form.patchValue({ quantity: 1 });
    component.disband();
  });

  it('should NOT DISBAND a troop', () => {
    component.form.patchValue({ quantity: 0 });
    component.disband();
  });
});
