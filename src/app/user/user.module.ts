import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EncyclopediaComponent } from './encyclopedia/encyclopedia.component';
import { TomeComponent } from './encyclopedia/tome.component';
import { LandingComponent } from './landing/landing.component';
import { LegendComponent } from './legend/legend.component';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';

@NgModule({
  declarations: [
    LoginComponent,
    EncyclopediaComponent,
    TomeComponent,
    LandingComponent,
    LegendComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    UserRoutingModule,
    ReactiveFormsModule,
    TourMatMenuModule,
  ],
})
export class UserModule { }
