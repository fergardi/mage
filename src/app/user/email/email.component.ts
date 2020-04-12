import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html', 
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit {
  form: FormGroup;
  type: 'login' | 'signup' | 'reset' = 'signup';
  loading: boolean = false;
  message: string;

  constructor(
    private angularFireAuth: AngularFireAuth,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6), Validators.required]],
      password2: ['', []]
    });
  }

  changeType(type: 'login' | 'signup' | 'reset') {
    this.type = type;
  }

  get isLogin() {
    return this.type === 'login';
  }

  get isSignup() {
    return this.type === 'signup';
  }

  get isReset() {
    return this.type === 'reset';
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

  get match() {
    return (this.type !== 'signup')
      ? true
      : this.password.value === this.password2.value;
  }

  async onSubmit() {
    this.loading = true;
    const email = this.email.value;
    const password = this.password.value;
    try {
      if (this.isLogin) {
        await this.angularFireAuth.signInWithEmailAndPassword(email, password);
      }
      if (this.isSignup) {
        await this.angularFireAuth.createUserWithEmailAndPassword(email, password);
      }
      if (this.isReset) {
        await this.angularFireAuth.sendPasswordResetEmail(email);
        this.message = 'Check your email';
      }
    } catch (error){
      this.message = error
    }
    this.loading = false;
  }

}
