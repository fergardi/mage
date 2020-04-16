import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorldRoutingModule } from './world-routing.module';
import { MapComponent } from './map/map.component';
import { LocationComponent } from './location/location.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [MapComponent, LocationComponent],
  imports: [
    CommonModule,
    SharedModule,
    WorldRoutingModule
  ]
})
export class WorldModule { }
