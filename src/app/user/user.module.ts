import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EncyclopediaComponent } from './encyclopedia/encyclopedia.component';
import { TomeComponent } from './encyclopedia/tome.component';
import { LandingComponent } from './landing/landing.component';

@NgModule({
  declarations: [
    LoginComponent,
    EncyclopediaComponent,
    TomeComponent,
    LandingComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    UserRoutingModule,
    ReactiveFormsModule,
  ]
})
export class UserModule { }
