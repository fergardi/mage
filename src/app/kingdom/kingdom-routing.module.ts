import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CityComponent } from './city/city.component';
import { CensusComponent } from './census/census.component';

const routes: Routes = [
  { path: 'city', component: CityComponent },
  { path: 'census', component: CensusComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KingdomRoutingModule { }
