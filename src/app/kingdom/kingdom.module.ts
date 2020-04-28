import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KingdomRoutingModule } from './kingdom-routing.module';
import { CityComponent } from './city/city.component';
import { SharedModule } from '../shared/shared.module';
import { CensusComponent } from './census/census.component';
import { ArmyComponent } from './army/army.component';
import { SorceryComponent } from './sorcery/sorcery.component';
import { ResearchComponent } from './sorcery/research.component';
import { ArchiveComponent } from './archive/archive.component';
import { LetterComponent } from './archive/letter.component';
import { TempleComponent } from './temple/temple.component';
import { OfferingComponent } from './temple/offering.component';


@NgModule({
  declarations: [
    CityComponent,
    CensusComponent,
    ArmyComponent,
    SorceryComponent,
    ResearchComponent,
    ArchiveComponent,
    LetterComponent,
    TempleComponent,
    OfferingComponent,
  ],
  imports: [
    CommonModule,
    KingdomRoutingModule,
    SharedModule,
  ],
  entryComponents: [
    ResearchComponent,
    LetterComponent,
    OfferingComponent,
  ]
})
export class KingdomModule { }
