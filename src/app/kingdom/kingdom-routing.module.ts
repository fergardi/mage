import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CityComponent } from './city/city.component';
import { CensusComponent } from './census/census.component';
import { ArmyComponent } from './army/army.component';
import { SorceryComponent } from './sorcery/sorcery.component';
import { ArchiveComponent } from './archive/archive.component';
import { TempleComponent } from './temple/temple.component';
import { TavernComponent } from './tavern/tavern.component';
import { AuctionComponent } from './auction/auction.component';

const routes: Routes = [
  { path: 'city', component: CityComponent },
  { path: 'census', component: CensusComponent },
  { path: 'army', component: ArmyComponent },
  { path: 'sorcery', component: SorceryComponent },
  { path: 'archive', component: ArchiveComponent },
  { path: 'temple', component: TempleComponent },
  { path: 'tavern', component: TavernComponent },
  { path: 'auction', component: AuctionComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KingdomRoutingModule { }
