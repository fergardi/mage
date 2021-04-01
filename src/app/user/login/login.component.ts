import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { LoginWithGoogleAction } from 'src/app/shared/auth/auth.actions';
import { ApiService } from 'src/app/services/api.service';
import { CacheService } from 'src/app/services/cache.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  types =  ['login', 'signup', 'reset'] as const;
  type = 'login';
  message: string;
  factions: any[] = [];

  constructor(
    public angularFireAuth: AngularFireAuth,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
    private cacheService: CacheService,
    private loadingService: LoadingService,
  ) {
    this.createForm();
  }

  async ngOnInit(): Promise<void> {
    const factions = await this.cacheService.getFactions();
    this.factions = factions.filter((faction: any) => faction.id !== 'grey');
  }

  async createForm() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.type !== 'reset' ? [Validators.required, Validators.minLength(6)] : []],
      password2: ['', this.type === 'signup' ? [Validators.required, Validators.minLength(6), this.matchValues('password')] : []],
      faction: [null, this.type === 'signup' ? [Validators.required] : []],
    });
  }

  changeType($event: MatTabChangeEvent) {
    this.type = this.types[$event.index];
    this.createForm();
  }

  matchValues(matchTo: string): (AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      return !!control.parent && !!control.parent.value && control.value === control.parent.controls[matchTo].value
        ? null
        : { isMatching: false };
    };
  }

  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
    });
  }

  async login() {
    const email = this.form.value.email;
    const password = this.form.value.password;
    this.loadingService.startLoading();
    try {
      switch (this.type) {
        case 'login':
          await this.angularFireAuth.signInWithEmailAndPassword(email, password);
          break;
        case 'signup':
          const position: any = await this.getCurrentPosition();
          const credentials = await this.angularFireAuth.createUserWithEmailAndPassword(email, password);
          await this.apiService.createKingdom(credentials.user.uid, this.form.value.faction.id, credentials.user.email, position.coords.latitude, position.coords.longitude);
          break;
        case 'reset':
          await this.angularFireAuth.sendPasswordResetEmail(email);
          this.notificationService.warning('user.login.check');
          break;
      }
    } catch (error){
      await this.angularFireAuth.signOut();
      console.error(error);
      this.notificationService.error('user.login.error');
    }
    this.loadingService.stopLoading();
  }

  async google() {
    this.store.dispatch(new LoginWithGoogleAction());
  }

}
