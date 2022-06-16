import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegendComponent } from './legend.component';
import { StoreStub, AngularFirestoreStub, TutorialServiceStub } from 'src/stubs';
import { Store } from '@ngxs/store';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ShortPipe } from 'src/app/pipes/short.pipe';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { TutorialService } from 'src/app/services/tutorial.service';

describe('LegendComponent', () => {
  let component: LegendComponent;
  let fixture: ComponentFixture<LegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatCardModule,
        MatIconModule,
        MatChipsModule,
        MatPaginatorModule,
        MatTableModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatNativeDateModule,
        MatListModule,
        MatBadgeModule,
      ],
      declarations: [
        LegendComponent,
        LongPipe,
        ShortPipe,
      ],
      providers: [
        { provide: TutorialService, useValue: TutorialServiceStub },
        { provide: Store, useValue: StoreStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });
});
