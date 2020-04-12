import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KingdomRoutingModule } from './kingdom-routing.module';
import { CityComponent } from './city/city.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [CityComponent],
  imports: [
    CommonModule,
    KingdomRoutingModule,
    SharedModule,
  ]
})
export class KingdomModule { }
