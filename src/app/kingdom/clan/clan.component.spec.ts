import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ClanComponent } from './clan.component';
import { TranslateModule } from '@ngx-translate/core';
import { CacheServiceStub, StoreStub, AngularFirestoreStub, ApiServiceStub, NotificationServiceStub, MatDialogStub } from 'src/stubs';
import { Store } from '@ngxs/store';
import { CacheService } from 'src/app/services/cache.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ShortPipe } from 'src/app/pipes/short.pipe';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from 'src/app/app-routing.module';
import { MatToolbarModule } from '@angular/material/toolbar';

describe('ClanComponent', () => {
  let component: ClanComponent;
  let fixture: ComponentFixture<ClanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes(routes),
        TourMatMenuModule.forRoot(),
        BrowserAnimationsModule,
        MatCardModule,
        MatTableModule,
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        FormsModule,
        MatSelectModule,
        MatIconModule,
        MatChipsModule,
        MatPaginatorModule,
        MatListModule,
        MatBadgeModule,
        MatToolbarModule,
      ],
      declarations: [
        ClanComponent,
        LongPipe,
        ShortPipe,
      ],
      providers: [
        { provide: CacheService, useValue: CacheServiceStub },
        { provide: Store, useValue: StoreStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MatDialog, useValue: MatDialogStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });
});
