import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BuildComponent } from './build.component';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { StoreStub, MatDialogRefStub, NotificationServiceStub, ApiServiceStub } from 'src/stubs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Building, Faction, Structure } from 'src/app/shared/type/interface.model';
import { FactionType } from 'src/app/shared/type/enum.type';

describe('BuildComponent', () => {
  let component: BuildComponent;
  let fixture: ComponentFixture<BuildComponent>;
  const faction: Faction = {
    type: undefined,
    subtype: null,
    name: undefined,
    description: undefined,
    image: undefined,
    marker: undefined,
    opposites: [],
    adjacents: [],
    id: FactionType.BLACK,
  };
  const structure: Structure = {
    name: 'test',
    image: 'assets/images/structures/academy.png',
    turnRatio: 10,
    goldCost: 1,
    faction: faction,
    type: '',
    subtype: '',
    description: '',
    id: '',
    resources: [],
    manaCost: 0,
    populationCost: 0,
    goldProduction: 0,
    manaProduction: 0,
    populationProduction: 0,
    goldMaintenance: 0,
    manaMaintenance: 0,
    populationMaintenance: 0,
    goldCapacity: 0,
    manaCapacity: 0,
    populationCapacity: 0,
    power: 0
  }
  const building: Building = {
    fid: 'test',
    quantity: 10,
    structure: structure,
    id: ''
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
        { provide: MatDialogRef, useValue: MatDialogRefStub },
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

  it('should BUILD some LANDS and CATCH errors', async () => {
    component.form.patchValue({ quantity: component.kingdomLand.quantity });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'buildStructure').and.throwError(new Error('test'));
    await component.build();
    expect(ApiServiceStub.buildStructure).toThrowError('test');
  });

  it('should NOT BUILD some LANDS', async () => {
    component.form.patchValue({ quantity: 9999999 });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'buildStructure');
    await component.build();
    expect(component.form.valid).toBeFalse();
    expect(ApiServiceStub.buildStructure).not.toHaveBeenCalled();
  });

  it('should DEMOLISH some LANDS', async () => {
    component.form.patchValue({ quantity: 5 });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'demolishStructure');
    await component.demolish();
    expect(component.form.valid).toBeTrue();
    expect(ApiServiceStub.demolishStructure).toHaveBeenCalledWith(component.uid, component.building.fid, component.form.value.quantity);
  });

  it('should DEMOLISH some LANDS and CATCH errors', async () => {
    component.form.patchValue({ quantity: 5 });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'demolishStructure').and.throwError(new Error('test'));
    await component.demolish();
    expect(ApiServiceStub.demolishStructure).toThrowError('test');
  });

  it('should NOT DEMOLISH some LANDS', async () => {
    component.form.patchValue({ quantity: 9999999 });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'demolishStructure');
    await component.demolish();
    expect(component.form.valid).toBeFalse();
    expect(ApiServiceStub.demolishStructure).not.toHaveBeenCalled();
  });

});
