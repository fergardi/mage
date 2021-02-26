import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CityComponent } from './city.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogStub, StoreStub } from 'src/stubs';
import { Store } from '@ngxs/store';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';

describe('CityComponent', () => {
  let component: CityComponent;
  let fixture: ComponentFixture<CityComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatCardModule,
        MatListModule,
        MatBadgeModule,
      ],
      declarations: [
        CityComponent,
        LongPipe,
        IconPipe,
      ],
      providers: [
        { provide: MatDialog, useValue: MatDialogStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CityComponent);
    component = fixture.componentInstance;
    Object.defineProperty(component, 'kingdomBuildings$', { writable: true });
    Object.defineProperty(component, 'village$', { writable: true });
    Object.defineProperty(component, 'node$', { writable: true });
    Object.defineProperty(component, 'workshop$', { writable: true });
    Object.defineProperty(component, 'land$', { writable: true });
    Object.defineProperty(component, 'turn$', { writable: true });
    component.kingdomBuildings$ = of([]);
    component.village$ = of(null);
    component.node$ = of(null);
    component.workshop$ = of(null);
    component.land$ = of(null);
    component.turn$ = of(null);
    fixture.detectChanges();
  });

  it('should CREATE', () => {
    expect(component).toBeTruthy();
  });

  it('should OPEN the BUILD dialog', () => {
    component.openBuildDialog(null);
  });

  it('should OPEN the TAX dialog', () => {
    component.openTaxDialog(null);
  });

  it('should OPEN the CHARGE dialog', () => {
    component.openChargeDialog(null);
  });

  it('should OPEN the EXPLORE dialog', () => {
    component.openExploreDialog(null);
  });

});
