import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { EncyclopediaComponent } from './encyclopedia/encyclopedia.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'encyclopedia', component: EncyclopediaComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
