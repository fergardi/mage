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
import { ReportComponent } from './archive/report.component';
import { TempleComponent } from './temple/temple.component';
import { OfferComponent } from './temple/offer.component';
import { TavernComponent } from './tavern/tavern.component';
import { AuctionComponent } from './auction/auction.component';
import { BuildComponent } from './city/build.component';
import { EmporiumComponent } from './emporium/emporium.component';
import { RecruitComponent } from './army/recruit.component';
import { DispelComponent } from './temple/dispel.component';
import { ActivateComponent } from './sorcery/activate.component';
import { ConjureComponent } from './sorcery/conjure.component';
import { BattleComponent } from './census/battle.component';
import { BidComponent } from './auction/bid.component';
import { TaxComponent } from './city/tax.component';
import { ChargeComponent } from './city/charge.component';
import { ExploreComponent } from './city/explore.component';
import { BuyComponent } from './emporium/buy.component';
import { DisbandComponent } from './army/disband.component';
import { DischargeComponent } from './tavern/discharge.component';
import { LetterComponent } from './census/letter.component';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import { ClanComponent } from './clan/clan.component';
import { NgxCurrencyModule } from 'ngx-currency';
import { FoundationComponent } from './clan/foundation.component';
import { ManifestComponent } from './clan/manifest.component';
import { DetailComponent } from './census/detail.component';
import { BreakComponent } from './temple/break.component';
import { PerkComponent } from './emporium/perk.component';
import { PlantComponent } from './emporium/plant.component';

@NgModule({
  declarations: [
    CityComponent,
    CensusComponent,
    ArmyComponent,
    SorceryComponent,
    ResearchComponent,
    ArchiveComponent,
    ReportComponent,
    TempleComponent,
    OfferComponent,
    TavernComponent,
    AuctionComponent,
    BuildComponent,
    EmporiumComponent,
    RecruitComponent,
    DispelComponent,
    ActivateComponent,
    ConjureComponent,
    BattleComponent,
    BidComponent,
    TaxComponent,
    ChargeComponent,
    ExploreComponent,
    BuyComponent,
    DisbandComponent,
    DischargeComponent,
    LetterComponent,
    ClanComponent,
    FoundationComponent,
    ManifestComponent,
    DetailComponent,
    BreakComponent,
    PerkComponent,
    PlantComponent,
  ],
  imports: [
    CommonModule,
    KingdomRoutingModule,
    SharedModule,
    TourMatMenuModule,
    NgxCurrencyModule,
  ],
})
export class KingdomModule { }
