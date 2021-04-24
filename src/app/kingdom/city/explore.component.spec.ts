import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ExploreComponent } from './explore.component';
import { ApiService } from 'src/app/services/api.service';
import { ApiServiceStub, NotificationServiceStub, DialogRefStub, StoreStub } from 'src/stubs';
import { NotificationService } from 'src/app/services/notification.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthState } from 'src/app/shared/auth/auth.state';

describe('ExploreComponent', () => {
  let component: ExploreComponent;
  let fixture: ComponentFixture<ExploreComponent>;

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
      ],
      declarations: [
        ExploreComponent,
        LongPipe,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: StoreStub.select(AuthState.getKingdomLand) },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MatDialogRef, useValue: DialogRefStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should EXPLORE some TURNS', async () => {
    component.form.patchValue({ turns: component.kingdomTurn.quantity });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'exploreLand');
    await component.explore();
    expect(component.form.valid).toBeTrue();
    expect(ApiServiceStub.exploreLand).toHaveBeenCalledWith(component.uid, component.form.value.turns);
  });

  it('should NOT EXPLORE some TURNS', async () => {
    component.form.patchValue({ turns: component.kingdomTurn.quantity + 1 });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'exploreLand');
    await component.explore();
    expect(component.form.valid).toBeFalse();
    expect(ApiServiceStub.exploreLand).not.toHaveBeenCalledWith();
  });

});
