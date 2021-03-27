import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ConjureComponent } from './conjure.component';
import { NotificationService } from 'src/app/services/notification.service';
import { NotificationServiceStub, DialogRefStub, StoreStub, ApiServiceStub, AngularFirestoreStub } from 'src/stubs';
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
import { AngularFirestore } from '@angular/fire/firestore';

describe('ConjureComponent', () => {
  let component: ConjureComponent;
  let fixture: ComponentFixture<ConjureComponent>;
  const charm: any = {
    join: {
      name: 'test',
      description: 'test',
      faction: 'red',
      image: 'assets/images/spells/red/fireball.png',
      turnCost: 1,
      manaCost: 1,
    },
    manaCost: 1,
    legendary: false,
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
      ],
      declarations: [
        ConjureComponent,
        IconPipe,
      ],
      providers: [
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: charm },
        { provide: MatDialogRef, useValue: DialogRefStub },
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

  it('should CONJURE a CHARM', () => {
    component.conjure();
  });

  it('should NOT CONJURE a CHARM', () => {
    component.kingdomMana.quantity = 0;
    component.kingdomTurn.quantity = 0;
    component.conjure();
  });

});
