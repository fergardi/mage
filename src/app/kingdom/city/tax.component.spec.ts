import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TaxComponent } from './tax.component';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { StoreStub, MatDialogRefStub, NotificationServiceStub, ApiServiceStub } from 'src/stubs';
import { of, Observable } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Building, Faction, Supply } from 'src/app/shared/type/interface.model';
import { FactionType } from 'src/app/shared/type/enum.type';

describe('TaxComponent', () => {
  let component: TaxComponent;
  let fixture: ComponentFixture<TaxComponent>;
  const faction: Faction = {
    type: undefined,
    subtype: null,
    name: undefined,
    description: undefined,
    image: undefined,
    marker: undefined,
    opposites: [],
    adjacents: [],
    id: FactionType.GREY,
  };
  const village$: Observable<Building> = of({
    id: 'test',
    quantity: 0,
    structure: {
      type: undefined,
      subtype: undefined,
      name: undefined,
      description: undefined,
      id: undefined,
      faction: faction,
      image: undefined,
      resources: [],
      turnRatio: undefined,
      goldCost: undefined,
      manaCost: undefined,
      populationCost: undefined,
      goldProduction: undefined,
      manaProduction: undefined,
      populationProduction: undefined,
      goldMaintenance: undefined,
      manaMaintenance: undefined,
      populationMaintenance: undefined,
      goldCapacity: undefined,
      manaCapacity: undefined,
      populationCapacity: undefined,
      power: undefined,
    },
  });
  const gold: Supply = {
    balance: 0,
    id: 'test',
    max: 0,
    quantity: 10,
    resource: null,
    timestamp: null,
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatListModule,
        MatBadgeModule,
        MatButtonModule,
        MatInputModule,
        BrowserAnimationsModule,
      ],
      declarations: [
        TaxComponent,
        LongPipe,
        IconPipe,
      ],
      providers: [
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: village$ },
        { provide: MatDialogRef, useValue: MatDialogRefStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    component.kingdomTurn = gold;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should TAX some TURNS', async () => {
    component.form.patchValue({ turns: component.kingdomTurn.quantity });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'taxGold');
    await component.tax();
    expect(component.form.valid).toBeTrue();
    expect(ApiServiceStub.taxGold).toHaveBeenCalledWith(component.uid, component.form.value.turns);
  });

  it('should NOT TAX some TURNS', async () => {
    component.form.patchValue({ turns: component.kingdomTurn.quantity + 1 });
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'taxGold');
    await component.tax();
    expect(component.form.valid).toBeFalse();
    expect(ApiServiceStub.taxGold).not.toHaveBeenCalled();
  });

});
