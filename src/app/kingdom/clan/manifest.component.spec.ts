import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManifestComponent } from './manifest.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFirestoreStub, DialogRefStub } from 'src/stubs';
import { TranslateModule } from '@ngx-translate/core';
import { ShortPipe } from 'src/app/pipes/short.pipe';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';

describe('ManifestComponent', () => {
  let component: ManifestComponent;
  let fixture: ComponentFixture<ManifestComponent>;
  const clan: any = {
    name: 'test',
    image: 'test',
    power: 0,
    leader: {
      name: 'test',
      faction: {
        id: 'test',
      },
      power: 0,
    },
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
        { provide: MatDialogRef, useValue: DialogRefStub },
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
