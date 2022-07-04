import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManifestComponent } from './manifest.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFirestoreStub, MatDialogRefStub } from 'src/stubs';
import { TranslateModule } from '@ngx-translate/core';
import { ShortPipe } from 'src/app/pipes/short.pipe';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { Clan, Faction, Kingdom } from 'src/app/shared/type/interface.model';
import { FactionType } from 'src/app/shared/type/enum.type';

describe('ManifestComponent', () => {
  let component: ManifestComponent;
  let fixture: ComponentFixture<ManifestComponent>;
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
  const kingdom: Kingdom = {
    buildings: [],
    supplies: [],
    clan: undefined,
    coordinates: undefined,
    faction: faction,
    guild: undefined,
    attacked: null,
    guilded: null,
    id: 'test',
    name: '',
    position: undefined,
    power: 0,
    tree: undefined,
  };
  const clan: Clan = {
    name: 'test',
    image: 'test',
    power: 0,
    leader: kingdom,
    description: '',
    members: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatListModule,
        MatBadgeModule,
      ],
      declarations: [
        ManifestComponent,
        ShortPipe,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: clan },
        { provide: MatDialogRef, useValue: MatDialogRefStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManifestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

});
