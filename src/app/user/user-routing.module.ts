import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { EncyclopediaComponent } from './encyclopedia/encyclopedia.component';
import { LandingComponent } from './landing/landing.component';


const routes: Routes = [
  { path: 'landing', component: LandingComponent },
  { path: 'encyclopedia', component: EncyclopediaComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
