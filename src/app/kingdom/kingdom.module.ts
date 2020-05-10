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
import { OfferComponent } from './temple/offer.component';
import { TavernComponent } from './tavern/tavern.component';
import { AuctionComponent } from './auction/auction.component';
import { BuildComponent } from './city/build.component';
import { EmporiumComponent } from './emporium/emporium.component';
import { RecruitComponent } from './army/recruit.component';
import { DispelComponent } from './temple/dispel.component';


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
    OfferComponent,
    TavernComponent,
    AuctionComponent,
    BuildComponent,
    EmporiumComponent,
    RecruitComponent,
    DispelComponent,
  ],
  imports: [
    CommonModule,
    KingdomRoutingModule,
    SharedModule,
  ]
})
export class KingdomModule { }
