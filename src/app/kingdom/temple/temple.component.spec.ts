import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TempleComponent } from './temple.component';
import { AngularFirestoreStub, MatDialogStub, StoreStub, TutorialServiceStub } from 'src/stubs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { OfferComponent } from './offer.component';
import { DispelComponent } from './dispel.component';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ShortPipe } from 'src/app/pipes/short.pipe';
import { TutorialService } from 'src/app/services/tutorial.service';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { BreakComponent } from './break.component';

describe('TempleComponent', () => {
  let component: TempleComponent;
  let fixture: ComponentFixture<TempleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatCardModule,
        MatListModule,
        MatBadgeModule,
        MatProgressBarModule,
        MatIconModule,
        MatChipsModule,
      ],
      declarations: [
        TempleComponent,
        IconPipe,
        ShortPipe,
        LongPipe,
      ],
      providers: [
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: MatDialog, useValue: MatDialogStub },
        { provide: Store, useValue: StoreStub },
        { provide: TutorialService, useValue: TutorialServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TempleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should OPEN the OFFER dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openOfferDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(OfferComponent, { panelClass: 'dialog-responsive', data: null });
  });

  it('should OPEN the DISPEL dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openDispelDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(DispelComponent, { panelClass: 'dialog-responsive', data: null });
  });

  it('should OPEN the BREAK dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openBreakDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(BreakComponent, { panelClass: 'dialog-responsive', data: null });
  });

});
