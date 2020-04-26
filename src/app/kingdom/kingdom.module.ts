import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KingdomRoutingModule } from './kingdom-routing.module';
import { CityComponent } from './city/city.component';
import { SharedModule } from '../shared/shared.module';
import { CensusComponent } from './census/census.component';
import { ArmyComponent } from './army/army.component';
import { SorceryComponent } from './sorcery/sorcery.component';


@NgModule({
  declarations: [CityComponent, CensusComponent, ArmyComponent, SorceryComponent],
  imports: [
    CommonModule,
    KingdomRoutingModule,
    SharedModule,
  ]
})
export class KingdomModule { }
