import { ComponentFixture, TestBed, waitForAsync, inject } from '@angular/core/testing';
import { CensusComponent } from './census.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { FirebaseServiceStub, AngularFirestoreStub, MatDialogStub, StoreStub, RouterStub } from 'src/stubs';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { MatDialog } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/firestore';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BattleComponent } from './battle.component';
import { ActivateComponent } from '../sorcery/activate.component';
import { ConjureComponent } from '../sorcery/conjure.component';
import { LetterComponent } from './letter.component';
import { routes } from 'src/app/app-routing.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('CensusComponent', () => {
  let component: CensusComponent;
  let fixture: ComponentFixture<CensusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes(routes),
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatPaginatorModule,
        BrowserAnimationsModule,
        MatTableModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
      ],
      declarations: [
        CensusComponent,
        LongPipe,
      ],
      providers: [
        { provide: FirebaseService, useValue: FirebaseServiceStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: MatDialog, useValue: MatDialogStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CensusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should OPEN the ATTACK dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openAttackDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(BattleComponent, { panelClass: 'dialog-responsive', data: null });
  });

  it('should OPEN the LETTER dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openLetterDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(LetterComponent, { panelClass: 'dialog-responsive', data: null });
  });

  it('should OPEN the ACTIVATE dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openActivateDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(ActivateComponent, { panelClass: 'dialog-responsive', data: null });
  });

  it('should OPEN the CONJURE dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openConjureDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(ConjureComponent, { panelClass: 'dialog-responsive', data: null });
  });

  it('should SHOW in MAP', inject([Router], async (router: Router) => {
    const kingdom = { fid: 0 };
    spyOn(router, 'navigate').and.stub();
    await component.showInMap(kingdom);
    expect(router.navigate).toHaveBeenCalledWith([`/world/map/${kingdom.fid}`]);
  }));

});
