import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailComponent } from './detail.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogRefStub, AngularFirestoreStub, StoreStub } from 'src/stubs';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngxs/store';
import { TranslateModule } from '@ngx-translate/core';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { ShortPipe } from 'src/app/pipes/short.pipe';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  const kingdom: any = {
    id: 'test',
    name: 'test',
    faction: {
      id: 'test',
      image: 'test',
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
        DetailComponent,
        LongPipe,
        ShortPipe,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: kingdom },
        { provide: MatDialogRef, useValue: MatDialogRefStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
