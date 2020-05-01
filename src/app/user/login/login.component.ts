import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { LoginWithGoogleAction } from 'src/app/shared/auth/auth.actions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  types =  ['login', 'signup', 'reset'] as const;
  type = 'login';
  loading: boolean = false;
  message: string;

  constructor(
    public angularFireAuth: AngularFireAuth,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6), Validators.required]],
      password2: ['', []]
    });
  }

  changeType($event: MatTabChangeEvent) {
    this.type = this.types[$event.index];
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  get password2() {
    return this.form.get('password2');
  }

  match() {
    return (this.type !== 'signup')
      ? true
      : this.password.value === this.password2.value;
  }

  async login() {
    this.loading = true;
    const email = this.email.value;
    const password = this.password.value;
    try {
      switch (this.type) {
        case 'login':
          await this.angularFireAuth.signInWithEmailAndPassword(email, password);
          break;
        case 'signup':
          await this.angularFireAuth.createUserWithEmailAndPassword(email, password);
          break;
        case 'reset':
          await this.angularFireAuth.sendPasswordResetEmail(email);
          this.notificationService.warning('user.login.check');
          break;
      }
    } catch (error){
      console.error(error);
      this.notificationService.error('user.login.error');
    }
    this.loading = false;
  }

  async google() {
    this.store.dispatch(new LoginWithGoogleAction())
  }

}
