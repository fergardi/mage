import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './user/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'user/landing', pathMatch: 'full' },
  { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule) },
  { path: 'world', loadChildren: () => import('./world/world.module').then(m => m.WorldModule), canActivate: [AuthGuard] },
  { path: 'kingdom', loadChildren: () => import('./kingdom/kingdom.module').then(m => m.KingdomModule), canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', relativeLinkResolution: 'legacy' } )],
  exports: [RouterModule],
})
export class AppRoutingModule { }
