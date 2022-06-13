import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DischargeComponent } from './discharge.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRefStub, NotificationServiceStub, ApiServiceStub, StoreStub } from 'src/stubs';
import { TranslateModule } from '@ngx-translate/core';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';
import { Contract, Faction, Hero } from 'src/app/shared/type/interface.model';
import { AssignmentType, FactionType } from 'src/app/shared/type/enum.type';

describe('DischargeComponent', () => {
  let component: DischargeComponent;
  let fixture: ComponentFixture<DischargeComponent>;
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
  const hero: Hero = {
    name: 'test',
    description: 'test',
    faction: faction,
    image: 'assets/images/heroes/red/dragon-rider.png',
    type: '',
    subtype: '',
    id: '',
    skills: [],
    families: [],
    categories: [],
    resistances: [],
    units: [],
    resources: [],
    spells: [],
    attack: 0,
    defense: 0,
    health: 0,
    power: 0,
    attackBonus: 0,
    defenseBonus: 0,
    healthBonus: 0,
    resurrectionBonus: 0,
    exploreBonus: 0,
    buildBonus: 0,
    researchBonus: 0,
    goldProduction: 0,
    manaProduction: 0,
    populationProduction: 0,
    goldMaintenance: 0,
    manaMaintenance: 0,
    populationMaintenance: 0,
    legendary: false,
    multiple: false,
    battle: false,
    self: false
  }
  const contract: Contract = {
    fid: 'test',
    hero: hero,
    id: '',
    level: 0,
    contractId: '',
    assignment: AssignmentType.NONE,
    sort: 0
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatListModule,
        MatBadgeModule,
        MatButtonModule,
        MatChipsModule,
      ],
      declarations: [
        DischargeComponent,
        LegendaryPipe,
        IconPipe,
      ],
      providers: [
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: Store, useValue: StoreStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: MatDialogRef, useValue: MatDialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: contract },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DischargeComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should DISCHARGE the CONTRACT', async () => {
    spyOn(ApiServiceStub, 'dischargeContract');
    await component.discharge();
    expect(ApiServiceStub.dischargeContract).toHaveBeenCalledWith(component.uid, component.contract.fid);
  });

  it('should DISCHARGE the CONTRACT and CATCH the ERROR', async () => {
    spyOn(ApiServiceStub, 'dischargeContract').and.throwError(new Error('test'));
    await component.discharge();
    expect(ApiServiceStub.dischargeContract).toThrowError('test');
  });
});
