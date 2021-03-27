import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BuildComponent } from './build.component';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { StoreStub, DialogRefStub, NotificationServiceStub, ApiServiceStub } from 'src/stubs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('BuildComponent', () => {
  let component: BuildComponent;
  let fixture: ComponentFixture<BuildComponent>;
  const building: any = {
    fid: 'test',
    quantity: 10,
    structure: {
      name: 'test',
      image: 'assets/images/structures/academy.png',
      turnRatio: 10,
      goldCost: 1,
      faction: {
        id: 'grey',
      },
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        MatListModule,
        MatBadgeModule,
        BrowserAnimationsModule,
      ],
      declarations: [
        BuildComponent,
        IconPipe,
        LongPipe,
      ],
      providers: [
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MatDialogRef, useValue: DialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: building },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should BUILD some LANDS', async () => {
    component.form.patchValue({ quantity: component.kingdomLand.quantity });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'buildStructure');
    await component.build();
    expect(component.form.valid).toBeTrue();
    expect(ApiServiceStub.buildStructure).toHaveBeenCalledWith(component.uid, component.building.fid, component.form.value.quantity);
  });

  it('should NOT BUILD some LANDS', async () => {
    component.form.patchValue({ quantity: 9999999 });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'buildStructure');
    await component.build();
    expect(component.form.valid).toBeFalse();
    expect(ApiServiceStub.buildStructure).not.toHaveBeenCalled();
  });

});
