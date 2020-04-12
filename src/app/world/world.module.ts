import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorldRoutingModule } from './world-routing.module';
import { MapComponent } from './map/map.component';


@NgModule({
  declarations: [MapComponent],
  imports: [
    CommonModule,
    WorldRoutingModule
  ]
})
export class WorldModule { }
