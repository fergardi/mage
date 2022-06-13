import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TomeComponent } from './tome.component';
import { MatDialogRefStub } from 'src/stubs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { Faction, Tome } from 'src/app/shared/type/interface.model';
import { FactionType } from 'src/app/shared/type/enum.type';

describe('TomeComponent', () => {
  let component: TomeComponent;
  let fixture: ComponentFixture<TomeComponent>;
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
  const tome: Tome = {
    type: 'god',
    id: 'death',
    name: 'god.death.name',
    description: 'god.death.description',
    image: '/assets/images/gods/death.png',
    faction: faction,
    legendary: true,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatListModule,
        MatButtonModule,
        MatChipsModule,
        MatDialogModule,
        MatBadgeModule,
      ],
      declarations: [
        LegendaryPipe,
        TomeComponent,
        IconPipe,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: tome },
        { provide: MatDialogRef, useValue: MatDialogRefStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TomeComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

});
