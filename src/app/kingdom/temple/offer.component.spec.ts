import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { OfferComponent } from './offer.component';
import { NotificationService } from 'src/app/services/notification.service';
import { NotificationServiceStub, DialogRefStub, StoreStub, ApiServiceStub } from 'src/stubs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ShortPipe } from 'src/app/pipes/short.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';

describe('OfferComponent', () => {
  let component: OfferComponent;
  let fixture: ComponentFixture<OfferComponent>;
  const god: any = {
    name: 'test',
    description: 'test',
    image: 'assets/images/gods/death.png',
    gold: 999999,
    sacrifice: 0,
    increment: 1,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatListModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatBadgeModule,
        MatButtonModule,
      ],
      declarations: [
        OfferComponent,
        LongPipe,
        ShortPipe,
      ],
      providers: [
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: god },
        { provide: MatDialogRef, useValue: DialogRefStub },
        { provide: Store, useValue: StoreStub },
        { provide: ApiService, useValue: ApiServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should OFFER a SACRIFICE', async () => {
    component.form.patchValue({ sacrifice: god.increment });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'offerGod').and.returnValue({ item: 'love-potion' });
    await component.offer();
    expect(component.form.valid).toBeTrue();
    expect(ApiServiceStub.offerGod).toHaveBeenCalledWith(component.uid, component.god.fid, component.form.value.sacrifice);
  });

  it('should NOT OFFER a SACRIFICE', async () => {
    component.form.patchValue({ sacrifice: 0 });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'offerGod');
    await component.offer();
    expect(component.form.valid).toBeFalse();
    expect(ApiServiceStub.offerGod).not.toHaveBeenCalled();
  });

});
