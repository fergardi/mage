import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DisbandComponent } from './disband.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';
import { TranslateModule } from '@ngx-translate/core';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatBadge } from '@angular/material/badge';

const NotificationServiceStub: any = {
  success: () => null,
  warning: () => null,
  error: () => null,
};

const StoreStub: any = {
  selectSnapshot: () => null,
};

const ApiServiceStub: any = {
  disbandTroop: (a, b, c) => null,
};

fdescribe('DisbandComponent', () => {
  let component: DisbandComponent;
  let fixture: ComponentFixture<DisbandComponent>;
  const troop = {
    quantity: 9999,
    join: {
      type: 'unit',
      name: 'unit.skeleton.name',
      description: 'unit.skeleton.description',
      id: 'skeleton',
      image: '/assets/images/units/black/skeleton.png',
      faction: 'black',
      categories: ['melee'],
      resistances: [],
      skills: [],
      families: ['undead'],
      initiative: 1,
      attack: 100,
      defense: 40,
      health: 70,
      gold: 0,
      goldMaintenance: 0,
      manaMaintenance: 0.01,
      populationMaintenance: 0,
      power: 10,
      legendary: false,
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot(),
      ],
      declarations: [
        MatBadge,
        DisbandComponent,
        LegendaryPipe,
        LongPipe,
      ],
      providers: [
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: troop },
        { provide: MatDialogRef, useValue: {} },
        { provide: Store, useValue: StoreStub },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisbandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
