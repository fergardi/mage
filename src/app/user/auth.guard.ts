import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from '../shared/auth/auth.state';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private notificationService: NotificationService,
    private store: Store,
    private router: Router,
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const logged = this.store.selectSnapshot(AuthState.getUserLoggedIn);
    if (!logged) {
      this.notificationService.error('user.auth.unauthorized');
      this.router.navigate(['/user/login']);
    }
    return logged;
  }

}
