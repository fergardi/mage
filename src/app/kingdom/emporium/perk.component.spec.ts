import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PerkComponent } from './perk.component';
import { TranslateModule } from '@ngx-translate/core';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

describe('PerkComponent', () => {
  let component: PerkComponent;
  let fixture: ComponentFixture<PerkComponent>;
  const perk: any = {
    name: 'test',
    description: 'test',
    image: 'test',
    level: 0,
    max: 1,
    perks: [],
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
