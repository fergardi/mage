import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ResearchComponent } from './research.component';
import { NotificationService } from 'src/app/services/notification.service';
import { NotificationServiceStub, StoreStub, DialogRefStub, ApiServiceStub } from 'src/stubs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

describe('ResearchComponent', () => {
  let component: ResearchComponent;
  let fixture: ComponentFixture<ResearchComponent>;
  const charm: any = {
    spell: {
      image: 'assets/images/spells/white/peace-prosperity.png',
      faction: { id: 'red' },
      name: 'test',
      level: 3,
      turnResearch: 10,
    },
    turns: 5,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatListModule,
        MatFormFieldModule,
        MatBadgeModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatProgressBarModule,
        MatButtonModule,
      ],
      declarations: [
        ResearchComponent,
        LegendaryPipe,
        IconPipe,
        LongPipe,
      ],
      providers: [
        FormBuilder,
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: charm },
        { provide: MatDialogRef, useValue: DialogRefStub },
        { provide: Store, useValue: StoreStub },
        { provide: ApiService, useValue: ApiServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResearchComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should RESEARCH a CHARM', async () => {
    component.form.patchValue({ turns: component.kingdomTurn.quantity - 1 });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'researchCharm');
    await component.research();
    expect(component.form.valid).toBeTrue();
    expect(ApiServiceStub.researchCharm).toHaveBeenCalledWith(component.uid, component.charm.fid, component.form.value.turns);
  });

  it('should NOT RESEARCH a CHARM', async () => {
    component.form.patchValue({ turns: component.kingdomTurn.quantity + 1 });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'researchCharm');
    await component.research();
    expect(component.form.valid).toBeFalse();
    expect(ApiServiceStub.researchCharm).not.toHaveBeenCalled();
  });

});
