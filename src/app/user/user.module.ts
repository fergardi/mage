import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { GoogloginDirective } from './googlogin.directive';
import { ReactiveFormsModule } from '@angular/forms';
import { EncyclopediaComponent } from './encyclopedia/encyclopedia.component';

@NgModule({
  declarations: [
    LoginComponent,
    GoogloginDirective,
    EncyclopediaComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    UserRoutingModule,
    ReactiveFormsModule
  ]
})
export class UserModule { }
