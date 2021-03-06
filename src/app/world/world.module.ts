import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldRoutingModule } from './world-routing.module';
import { MapComponent } from './map/map.component';
import { SharedModule } from '../shared/shared.module';
import { MarkerComponent } from './marker/marker.component';
import { PopupComponent } from './popup/popup.component';
import { AdventureComponent } from './popup/adventure.component';
import { DealComponent } from './popup/deal.component';

@NgModule({
  declarations: [
    MapComponent,
    MarkerComponent,
    MarkerComponent,
    PopupComponent,
    DealComponent,
    AdventureComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    WorldRoutingModule,
  ],
})
export class WorldModule { }
