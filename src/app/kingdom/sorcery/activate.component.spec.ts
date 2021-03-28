import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivateComponent } from './activate.component';
import { NotificationService } from 'src/app/services/notification.service';
import { NotificationServiceStub, DialogRefStub, StoreStub, ApiServiceStub, AngularFirestoreStub } from 'src/stubs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFirestore } from '@angular/fire/firestore';

describe('ActivateComponent', () => {
  let component: ActivateComponent;
  let fixture: ComponentFixture<ActivateComponent>;
  const artifact: any = {
    item: {
      name: 'test',
      description: 'test',
      image: 'assets/images/items/magic-compass.png',
      turns: 1,
      faction: {
        id: 'grey',
      },
    },
    quantity: 1,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatSelectModule,
        ReactiveFormsModule,
        FormsModule,
        MatListModule,
        MatButtonModule,
        MatBadgeModule,
        BrowserAnimationsModule,
      ],
      declarations: [
        ActivateComponent,
        LegendaryPipe,
        IconPipe,
      ],
      providers: [
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: artifact },
        { provide: MatDialogRef, useValue: DialogRefStub },
        { provide: Store, useValue: StoreStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should ACTIVATE an ARTIFACT', () => {
    component.activate();
  });

  it('should NOT ACTIVATE an ARTIFACT', () => {
    component.kingdomTurn.quantity = 0;
    component.activate();
  });

});
