import { TestBed, inject } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { NotificationService } from '../services/notification.service';
import { NotificationServiceStub, StoreStub } from 'src/stubs';
import { Store } from '@ngxs/store';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../app-routing.module';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
      ],
      providers: [
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: Store, useValue: StoreStub },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA, // ignore all
        NO_ERRORS_SCHEMA, // disqus
      ],
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('should CREATE the INSTANCE', () => {
    expect(guard).toBeTruthy();
  });

  it('should BLOCK a ROUTE', inject([Store, Router], (store: Store, router: Router) => {
    spyOn(store, 'selectSnapshot').and.returnValue(false);
    spyOn(router, 'navigate').and.stub();
    expect(guard.canActivate(new ActivatedRouteSnapshot(), { url: 'test' } as RouterStateSnapshot)).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/user/landing']);
  }));

  it('should PASS a ROUTE', inject([Store, Router], (store: Store, router: Router) => {
    spyOn(store, 'selectSnapshot').and.returnValue(true);
    spyOn(router, 'navigate').and.stub();
    expect(guard.canActivate(new ActivatedRouteSnapshot(), { url: 'test' } as RouterStateSnapshot)).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  }));

});
