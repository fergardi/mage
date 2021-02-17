import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, NavigationEnd } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from '../shared/auth/auth.state';
import { filter } from 'rxjs/operators';

const LANDING_ROUTE: string = '/user/landing';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(
    private notificationService: NotificationService,
    private store: Store,
    private router: Router,
  ) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      if (event.url !== LANDING_ROUTE) localStorage.setItem('route', event.url);
    });
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const logged = this.store.selectSnapshot(AuthState.getUserLoggedIn);
    if (!logged) {
      this.notificationService.error('user.auth.unauthorized');
      this.router.navigate([LANDING_ROUTE]);
    }
    return logged;
  }

}
