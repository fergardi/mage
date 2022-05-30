import { ComponentFixture, TestBed, waitForAsync, inject, fakeAsync } from '@angular/core/testing';
import { ShellComponent } from './shell.component';
import { TranslateModule } from '@ngx-translate/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireAuthStub, StoreStub, MapboxServiceStub, AngularFirestoreStub, NotificationServiceStub, MatBottomSheetStub } from 'src/stubs';
import { Store } from '@ngxs/store';
import { MapboxService } from 'src/app/services/mapbox.service';
import { NotificationService } from 'src/app/services/notification.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from 'src/app/services/loading.service';
import { DomService } from 'src/app/services/dom.service';
import { TourService } from 'ngx-ui-tour-md-menu';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from 'src/app/app-routing.module';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { of } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { MatBottomSheetModule, MatBottomSheet } from '@angular/material/bottom-sheet';
import { StatusComponent } from './status.component';
import { MatExpansionModule } from '@angular/material/expansion';

describe('ShellComponent', () => {
  let component: ShellComponent;
  let fixture: ComponentFixture<ShellComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes(routes),
        TourMatMenuModule.forRoot(),
        MatMenuModule,
        BrowserAnimationsModule,
        MatBadgeModule,
        MatListModule,
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatBottomSheetModule,
        MatExpansionModule,
      ],
      declarations: [
        ShellComponent,
      ],
      providers: [
        LoadingService,
        DomService,
        TourService,
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: AngularFireAuth, useValue: AngularFireAuthStub },
        { provide: Store, useValue: StoreStub },
        { provide: MapboxService, useValue: MapboxServiceStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: MatBottomSheet, useValue: MatBottomSheetStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
    Object.defineProperty(component, 'kingdomSupplies$', { writable: true });
    Object.defineProperty(component, 'isHandset$', { writable: true });
    component.kingdomSupplies$ = of([]);
    component.isHandset$ = of(true);
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should TOGGLE the DRAWER', async () => {
    const opened = component.drawer.opened;
    await component.toggle();
    expect(component.drawer.opened).toBe(!opened);
  });

  it('should CLOSE the DRAWER', () => {
    component.close();
    expect(component.drawer.opened).toBe(false);
  });

  it('should LOGIN in the APP', inject([Router], (router: Router) => {
    spyOn(router, 'navigate').and.stub();
    component.login(null);
    expect(router.navigate).toHaveBeenCalledWith(['/user/landing']);
  }));

  it('should LOGOUT from the APP', inject([Store], (store: Store) => {
    spyOn(store, 'dispatch').and.stub();
    component.logout();
    expect(store.dispatch).toHaveBeenCalled();
  }));

  it('should START the TOUR', () => {
    component.tour();
  });

  it('should OPEN the STATUS sheet', async () => {
    spyOn(MatBottomSheetStub, 'open');
    component.openStatusSheet();
    expect(MatBottomSheetStub.open).toHaveBeenCalledWith(StatusComponent, { data: component.kingdomSupplies$ });
  });

});
