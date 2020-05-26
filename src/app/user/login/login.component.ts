import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { LoginWithGoogleAction } from 'src/app/shared/auth/auth.actions';
import { ApiService } from 'src/app/services/api.service';
import { CacheService } from 'src/app/services/cache.service';

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
  factions: any[] = [];

  constructor(
    public angularFireAuth: AngularFireAuth,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
    private cacheService: CacheService,
  ) { }

  async ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password2: ['', [Validators.required, Validators.minLength(6), this.matchValues('password')]],
      faction: [null, [Validators.required]]
    });
    let factions = await this.cacheService.getFactions();
    this.factions = factions.filter((faction: any) => faction.id !== 'grey');
  }

  changeType($event: MatTabChangeEvent) {
    this.type = this.types[$event.index];
    this.form.reset();
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
    this.loading = true;
    const email = this.form.value.email;
    const password = this.form.value.password;
    try {
      switch (this.type) {
        case 'login':
          await this.angularFireAuth.signInWithEmailAndPassword(email, password);
          break;
        case 'signup':
          let position: any = await this.getCurrentPosition();
          let credentials = await this.angularFireAuth.createUserWithEmailAndPassword(email, password);
          await this.apiService.create(credentials.user.uid, this.form.value.faction.id, credentials.user.email, position.coords.latitude, position.coords.longitude);
          break;
        case 'reset':
          await this.angularFireAuth.sendPasswordResetEmail(email);
          this.notificationService.warning('user.login.check');
          break;
      }
    } catch (error){
      console.error(error);
      this.notificationService.error(`user.auth.${error.code}`);
    }
    this.loading = false;
  }

  async google() {
    this.store.dispatch(new LoginWithGoogleAction())
  }

}
