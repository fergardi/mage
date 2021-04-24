import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChargeComponent } from './charge.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StoreStub, DialogRefStub, NotificationServiceStub, ApiServiceStub } from 'src/stubs';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { AuthState } from 'src/app/shared/auth/auth.state';

describe('ChargeComponent', () => {
  let component: ChargeComponent;
  let fixture: ComponentFixture<ChargeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatListModule,
        MatBadgeModule,
        MatButtonModule,
      ],
      declarations: [
        ChargeComponent,
        LongPipe,
        IconPipe,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: StoreStub.select(AuthState.getKingdomNode) },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MatDialogRef, useValue: DialogRefStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargeComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should CHARGE some TURNS', async () => {
    component.form.patchValue({ turns: component.kingdomTurn.quantity });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'chargeMana');
    await component.charge();
    expect(component.form.valid).toBeTrue();
    expect(ApiServiceStub.chargeMana).toHaveBeenCalledWith(component.uid, component.form.value.turns);
  });

  it('should NOT CHARGE some TURNS', async () => {
    component.form.patchValue({ turns: component.kingdomTurn.quantity + 1 });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'chargeMana');
    await component.charge();
    expect(component.form.valid).toBeFalse();
    expect(ApiServiceStub.chargeMana).not.toHaveBeenCalled();
  });

});
