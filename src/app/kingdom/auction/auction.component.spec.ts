import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuctionComponent } from './auction.component';
import { MatDialogStub, StoreStub, CacheServiceStub, ApiServiceStub, LoadingServiceStub, AngularFirestoreStub, EventStub } from 'src/stubs';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CacheService } from 'src/app/services/cache.service';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ShortPipe } from 'src/app/pipes/short.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatListModule } from '@angular/material/list';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from 'src/app/app-routing.module';
import { MatChipsModule } from '@angular/material/chips';
import { BidComponent } from './bid.component';
import { TomeComponent } from 'src/app/user/encyclopedia/tome.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

describe('AuctionComponent', () => {
  let component: AuctionComponent;
  let fixture: ComponentFixture<AuctionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        TourMatMenuModule.forRoot(),
        RouterTestingModule.withRoutes(routes),
        BrowserAnimationsModule,
        MatTableModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatCardModule,
        MatSelectModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        MatPaginatorModule,
        MatListModule,
        MatBadgeModule,
        MatChipsModule,
        MatSnackBarModule,
        MatToolbarModule,
      ],
      declarations: [
        AuctionComponent,
        ShortPipe,
        LongPipe,
        IconPipe,
      ],
      providers: [
        { provide: MatDialog, useValue: MatDialogStub },
        { provide: Store, useValue: StoreStub },
        { provide: CacheService, useValue: CacheServiceStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: LoadingService, useValue: LoadingServiceStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should CREATE the INSTANCE', async () => {
    spyOn(ApiServiceStub, 'refreshAuction');
    await component.refreshAuctions();
    expect(ApiServiceStub.refreshAuction).toHaveBeenCalled();
  });

  it('should OPEN the BID dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openBidDialog(null, EventStub);
    expect(MatDialogStub.open).toHaveBeenCalledWith(BidComponent, { panelClass: 'dialog-responsive', data: null });
  });

  it('should OPEN the TOME dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openTomeDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(TomeComponent, { panelClass: 'dialog-responsive', data: null });
  });

});
