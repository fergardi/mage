import { ComponentFixture, TestBed, waitForAsync, fakeAsync } from '@angular/core/testing';
import { BidComponent } from './bid.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { ShortPipe } from 'src/app/pipes/short.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatBadge } from '@angular/material/badge';
import { ApiServiceStub, NotificationServiceStub, DialogRefStub, StoreStub } from 'src/stubs';

fdescribe('BidComponent', () => {
  let component: BidComponent;
  let fixture: ComponentFixture<BidComponent>;
  const auction = {
    quantity: 9999,
    type: 'troop',
    join: {
      name: 'unit.skeleton.name',
      description: 'unit.skeleton.description',
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
      ],
      declarations: [
        MatBadge,
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
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
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
