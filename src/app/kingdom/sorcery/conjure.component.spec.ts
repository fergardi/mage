import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ConjureComponent } from './conjure.component';
import { NotificationService } from 'src/app/services/notification.service';
import { NotificationServiceStub, MatDialogRefStub, StoreStub, ApiServiceStub, AngularFirestoreStub } from 'src/stubs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { LongPipe } from 'src/app/pipes/long.pipe';

describe('ConjureComponent', () => {
  let component: ConjureComponent;
  let fixture: ComponentFixture<ConjureComponent>;
  const charm: any = {
    fid: 'test',
    spell: {
      name: 'test',
      description: 'test',
      faction: {
        id: 'red',
      },
      image: 'assets/images/spells/red/fireball.png',
      turnCost: 1,
      manaCost: 1,
      legendary: false,
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatChipsModule,
        MatOptionModule,
        MatSelectModule,
        MatListModule,
        BrowserAnimationsModule,
        MatBadgeModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatChipsModule,
      ],
      declarations: [
        ConjureComponent,
        IconPipe,
        LongPipe,
      ],
      providers: [
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: { charm: charm, kingdom: null } },
        { provide: MatDialogRef, useValue: MatDialogRefStub },
        { provide: Store, useValue: StoreStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConjureComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should CONJURE a CHARM', async () => {
    component.selectedCharm = charm;
    spyOn(ApiServiceStub, 'conjureCharm');
    await component.conjure();
    expect(ApiServiceStub.conjureCharm).toHaveBeenCalledWith(component.uid, component.conjuration.charm.fid, component.uid);
  });

  it('should CONJURE a CHARM and CATCH the ERROR', async () => {
    component.selectedCharm = charm;
    spyOn(ApiServiceStub, 'conjureCharm').and.throwError(new Error('test'));
    await component.conjure();
    expect(ApiServiceStub.conjureCharm).toThrowError('test');
  });

  it('should NOT CONJURE a CHARM', async () => {
    component.kingdomMana.quantity = 0;
    component.kingdomTurn.quantity = 0;
    component.selectedCharm = charm;
    spyOn(ApiServiceStub, 'conjureCharm');
    await component.conjure();
    expect(ApiServiceStub.conjureCharm).not.toHaveBeenCalled();
  });

});
