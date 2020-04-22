import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorldRoutingModule } from './world-routing.module';
import { MapComponent } from './map/map.component';
import { SharedModule } from '../shared/shared.module';
import { MarkerComponent } from './marker/marker.component';


@NgModule({
  declarations: [
    MapComponent,
    MarkerComponent,
    MarkerComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    WorldRoutingModule,
  ],
  entryComponents: [
    MarkerComponent,
  ]
})
export class WorldModule { }
