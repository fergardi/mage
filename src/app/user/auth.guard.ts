import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private angularFireAuth: AngularFireAuth, private notificationService: NotificationService) {}

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const user = await this.angularFireAuth.currentUser;
    const logged = !!user;
    if (!logged) this.notificationService.authError();
    return logged;
  }
  
}
