import { Directive, HostListener } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth'
import { auth } from 'firebase/app';

@Directive({
  selector: '[appGooglogin]'
})
export class GoogloginDirective {

  constructor(private angularFireAuth: AngularFireAuth) { }

  @HostListener('click')
  onClick() {
    this.angularFireAuth.signInWithPopup(new auth.GoogleAuthProvider());
  }
}
