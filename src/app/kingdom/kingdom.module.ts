import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KingdomRoutingModule } from './kingdom-routing.module';
import { CityComponent } from './city/city.component';


@NgModule({
  declarations: [CityComponent],
  imports: [
    CommonModule,
    KingdomRoutingModule
  ]
})
export class KingdomModule { }
