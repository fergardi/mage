import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PerkComponent } from './perk.component';
import { TranslateModule } from '@ngx-translate/core';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { Faction, Perk } from 'src/app/shared/type/interface.model';
import { FactionType } from 'src/app/shared/type/enum.type';

describe('PerkComponent', () => {
  let component: PerkComponent;
  let fixture: ComponentFixture<PerkComponent>;
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
  const perk: Perk = {
    type: 'test',
    subtype: 'test',
    faction: faction,
    id: 'test',
    name: 'test',
    description: 'test',
    image: 'test',
    sort: 0,
    level: 0,
    max: 1,
    perks: [],
    troopBonus: 0,
    goldBonus: 0,
    manaBonus: 0,
    populationBonus: 0,
    constructionBonus: 0,
    godBonus: 0,
    explorationBonus: 0,
    attackBonus: 0,
    defenseBonus: 0,
    healthBonus: 0,
    researchBonus: 0,
    magicalDefenseBonus: 0,
    physicalDefenseBonus: 0,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatTooltipModule,
        MatBadgeModule,
      ],
      declarations: [
        PerkComponent,
        IconPipe,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerkComponent);
    component = fixture.componentInstance;
    component.disabled = false;
    component.perk = perk;
    fixture.detectChanges();
  });

  it('should CREATE the COMPONENT', () => {
    expect(component).toBeTruthy();
  });

  it('should INCREASE the PERK', () => {
    expect(component.perk.level).toBe(0);
    component.increasePerk(component.perk);
    expect(component.perk.level).toBe(1);
  });

});
