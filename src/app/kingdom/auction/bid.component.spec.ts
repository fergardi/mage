import { ComponentFixture, TestBed, waitForAsync, fakeAsync } from '@angular/core/testing';
import { BidComponent } from './bid.component';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { ShortPipe } from 'src/app/pipes/short.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { ApiServiceStub, NotificationServiceStub, DialogRefStub, StoreStub } from 'src/stubs';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('BidComponent', () => {
  let component: BidComponent;
  let fixture: ComponentFixture<BidComponent>;
  const auction = {
    quantity: 9999,
    type: 'troop',
    join: {
      name: 'test',
      description: 'test',
      id: 'skeleton',
      image: '/assets/images/units/black/skeleton.png',
      faction: 'black',
      legendary: false,
    },
    gold: 100,
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
        MatButtonModule,
        BrowserAnimationsModule,
      ],
      declarations: [
        BidComponent,
        LegendaryPipe,
        ShortPipe,
        LongPipe,
      ],
      providers: [
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: auction },
        { provide: MatDialogRef, useValue: DialogRefStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BidComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should BID with ENOUGH MONEY', fakeAsync(async () => {
    component.form.patchValue({ gold: auction.gold * 2 });
    component.form.updateValueAndValidity();
    await component.bid();
  }));

  it('should NOT BID with NOT ENOUGH MONEY', fakeAsync(async () => {
    component.form.patchValue({ gold: 0 });
    component.form.updateValueAndValidity();
    await component.bid();
  }));
});
