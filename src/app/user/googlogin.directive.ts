import { Directive, HostListener } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth'
import { auth } from 'firebase/app';
import { Router } from '@angular/router';

@Directive({
  selector: '[appGooglogin]'
})
export class GoogloginDirective {

  constructor(
    private angularFireAuth: AngularFireAuth,
    private router: Router,
  ) { }

  @HostListener('click')
  async onClick() {
    await this.angularFireAuth.signInWithPopup(new auth.GoogleAuthProvider());
    this.router.navigate(['/world/map']);
  }
}
