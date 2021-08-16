import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EmporiumComponent } from './emporium.component';
import { CacheService } from 'src/app/services/cache.service';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { StoreStub, MatDialogStub, CacheServiceStub, TutorialServiceStub } from 'src/stubs';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BuyComponent } from './buy.component';
import { TutorialService } from 'src/app/services/tutorial.service';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { of } from 'rxjs';
import { PerkComponent } from './perk.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { PlantComponent } from './plant.component';

describe('EmporiumComponent', () => {
  let component: EmporiumComponent;
  let fixture: ComponentFixture<EmporiumComponent>;
  const tree: any = {
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
        MatCardModule,
        MatListModule,
        BrowserAnimationsModule,
        MatIconModule,
        MatChipsModule,
        MatTooltipModule,
        MatBadgeModule,
      ],
      declarations: [
        EmporiumComponent,
        PerkComponent,
        PlantComponent,
        LongPipe,
        IconPipe,
      ],
      providers: [
        { provide: CacheService, useValue: CacheServiceStub },
        { provide: MatDialog, useValue: MatDialogStub },
        { provide: Store, useValue: StoreStub },
        { provide: TutorialService, useValue: TutorialServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmporiumComponent);
    component = fixture.componentInstance;
    Object.defineProperty(component, 'tree$', { writable: true });
    component.tree$ = of({});
    component.kingdomTree = tree;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should OPEN the BUY dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openBuyDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(BuyComponent, { panelClass: 'dialog-responsive', data: null });
  });

  it('should OPEN the PLANT dialog', () => {
    component.gems = 5;
    const branches = {
      strategy: null,
      agriculture: null,
      alchemy: null,
      architecture: null,
      culture: null,
      teology: null,
      cartography: null,
      metalurgy: null,
      medicine: null,
      forge: null,
      science: null,
      mysticism: null,
      masonry: null,
    };
    spyOn(MatDialogStub, 'open').and.returnValue(({ afterClosed: () => of(true) }));
    component.openPlantDialog();
    expect(MatDialogStub.open).toHaveBeenCalledWith(PlantComponent, { panelClass: 'dialog-responsive', data: { branches: branches, gems: 5 } });
  });

  it('should RESET the TREE', () => {
    component.resetTree();
    expect(component.gems).toBe(0);
  });

  it('should INCREASE the GEMS', () => {
    component.increaseGems(5);
    expect(component.gems).toBe(5);
  });

});
