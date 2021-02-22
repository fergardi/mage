import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecruitComponent } from './recruit.component';
import { ApiService } from 'src/app/services/api.service';
import { ApiServiceStub, NotificationServiceStub, DialogRefStub, StoreStub } from 'src/stubs';
import { Store } from '@ngxs/store';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { MatBadge } from '@angular/material/badge';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('RecruitComponent', () => {
  let component: RecruitComponent;
  let fixture: ComponentFixture<RecruitComponent>;
  const unit = {
    name: 'unit.skeleton.name',
    description: 'unit.skeleton.description',
    id: 'skeleton',
    image: '/assets/images/units/black/skeleton.png',
    faction: 'black',
    legendary: false,
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
        LegendaryPipe,
        LongPipe,
        RecruitComponent,
      ],
      providers: [
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: unit },
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
    fixture = TestBed.createComponent(RecruitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should RECRUIT troops with ENOUGH MONEY', () => {
    component.form.patchValue({ quantity: 1 });
    component.form.updateValueAndValidity();
    component.recruit();
    expect(component.form.valid).toBeTrue();
  });

  it('should NOT RECRUIT troops with NOT ENOUGH MONEY', () => {
    component.form.patchValue({ quantity: 1000 });
    component.form.updateValueAndValidity();
    component.recruit();
    expect(component.form.valid).toBeFalse();
  });
});
