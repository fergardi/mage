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
import { MatDialog } from '@angular/material/dialog';
import { GeolocationComponent } from './geolocation.component';
import { environment } from 'src/environments/environment';
import { Faction, Position } from 'src/app/shared/type/interface.model';
import { LoginType } from 'src/app/shared/type/enum.type';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  LoginType: typeof LoginType = LoginType;
  loginTypes = [LoginType.LOGIN, LoginType.SIGNUP, LoginType.RESET] as const;
  loginType = LoginType.LOGIN;
  form: FormGroup;
  factions: Array<Faction> = [];

  constructor(
    public angularFireAuth: AngularFireAuth,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
    private cacheService: CacheService,
    private loadingService: LoadingService,
    private dialog: MatDialog,
  ) {
    this.createForm();
  }

  async ngOnInit(): Promise<void> {
    const factions = await this.cacheService.getFactions();
    this.factions = factions.filter(faction => faction.id !== 'grey');
  }

  async createForm() {
    this.form = this.formBuilder.group({
      email: ['testing@mage.com', [Validators.required, Validators.email]],
      username: ['', this.loginType === LoginType.SIGNUP ? [Validators.required, Validators.minLength(6), Validators.maxLength(18)] : []],
      password: ['t3st1ng', this.loginType !== LoginType.RESET ? [Validators.required, Validators.minLength(6), Validators.maxLength(18)] : []],
      password2: ['', this.loginType === LoginType.SIGNUP ? [Validators.required, Validators.minLength(6), Validators.maxLength(18), this.matchValues('password')] : []],
      faction: [null, this.loginType === LoginType.SIGNUP ? [Validators.required] : []],
    });
  }

  changeType($event: MatTabChangeEvent): void {
    this.loginType = this.loginTypes[$event.index];
    this.createForm();
    if (this.loginType === LoginType.SIGNUP) {
      this.dialog.open(GeolocationComponent, {
        panelClass: 'dialog-responsive',
        data: null,
      });
    }
  }

  matchValues(matchTo: string): (AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      return !!control.parent && !!control.parent.value && control.value === control.parent.controls[matchTo].value
        ? null
        : { isMatching: false };
    };
  }

  async getCurrentPosition(): Promise<Position> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
    });
  }

  random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async login(): Promise<void> {
    if (this.form.valid) {
      try {
        this.loadingService.startLoading();
        const email = this.form.value.email;
        const password = this.form.value.password;
        switch (this.loginType) {
          case LoginType.LOGIN:
            await this.angularFireAuth.signInWithEmailAndPassword(email, password);
            break;
          case LoginType.SIGNUP:
            let position: Position = null;
            try {
              position = await this.getCurrentPosition();
            } catch (error) {
              position = {
                coords: {
                  latitude: this.random(environment.mapbox.lat - 0.02, environment.mapbox.lat + 0.02),
                  longitude: this.random(environment.mapbox.lng - 0.02, environment.mapbox.lng + 0.02),
                },
              };
              this.notificationService.warning('user.login.default');
            }
            const credentials = await this.angularFireAuth.createUserWithEmailAndPassword(email, password);
            this.apiService.populateMap(position.coords.latitude, position.coords.longitude);
            await this.apiService.createKingdom(credentials.user.uid, this.form.value.faction.id, this.form.value.username, position.coords.latitude, position.coords.longitude);
            break;
          case LoginType.RESET:
            await this.angularFireAuth.sendPasswordResetEmail(email);
            this.notificationService.warning('user.login.check');
            break;
        }
      } catch (error) {
        await this.angularFireAuth.signOut();
        this.notificationService.error('user.login.error', error as Error);
      } finally {
        this.loadingService.stopLoading();
      }
    }
  }

  async google(): Promise<void> {
    this.store.dispatch(new LoginWithGoogleAction());
  }

}
