import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RecruitComponent } from './recruit.component';
import { ApiService } from 'src/app/services/api.service';
import { ApiServiceStub, NotificationServiceStub, MatDialogRefStub, StoreStub } from 'src/stubs';
import { Store } from '@ngxs/store';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatToolbarModule } from '@angular/material/toolbar';

describe('RecruitComponent', () => {
  let component: RecruitComponent;
  let fixture: ComponentFixture<RecruitComponent>;
  const unit = {
    name: 'test',
    description: 'test',
    id: 'skeleton',
    image: '/assets/images/units/black/skeleton.png',
    faction: {
      id: 'black',
    },
    legendary: false,
    gold: 1,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatBadgeModule,
        MatListModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatChipsModule,
        MatToolbarModule,
      ],
      declarations: [
        LegendaryPipe,
        LongPipe,
        RecruitComponent,
        IconPipe,
      ],
      providers: [
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: unit },
        { provide: MatDialogRef, useValue: MatDialogRefStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecruitComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should RECRUIT troops with ENOUGH MONEY', async () => {
    component.form.patchValue({ quantity: 1 });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'recruitUnit');
    await component.recruit();
    expect(component.form.valid).toBeTrue();
    expect(ApiServiceStub.recruitUnit).toHaveBeenCalledWith(component.uid, component.unit.id, component.form.value.quantity);
  });

  it('should NOT RECRUIT troops with NOT ENOUGH MONEY', async () => {
    component.form.patchValue({ quantity: 1000 });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'recruitUnit');
    await component.recruit();
    expect(component.form.valid).toBeFalse();
    expect(ApiServiceStub.recruitUnit).not.toHaveBeenCalled();
  });
});
