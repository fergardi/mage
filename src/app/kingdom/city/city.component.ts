import { Component, OnInit } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { BuildComponent } from './build.component';
import { MatDialog } from '@angular/material/dialog';
import { Store, Select } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { TaxComponent } from './tax.component';
import { ChargeComponent } from './charge.component';
import { ExploreComponent } from './explore.component';
import { Observable } from 'rxjs';
import { CacheService } from 'src/app/services/cache.service';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class CityComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  @Select((state: any) => state.auth.buildings) kingdomBuildings$: Observable<any[]>;
  @Select((state: any) => state.auth.buildings.find((building: any) => building.id === 'village')) village$: Observable<any>;
  @Select((state: any) => state.auth.buildings.find((building: any) => building.id === 'node')) node$: Observable<any>;
  @Select((state: any) => state.auth.buildings.find((building: any) => building.id === 'workshop')) workshop$: Observable<any>;
  @Select((state: any) => state.auth.supplies.find((supply: any) => supply.id === 'land')) land$: Observable<any>;
  @Select((state: any) => state.auth.supplies.find((supply: any) => supply.id === 'turn')) turn$: Observable<any>;
  kingdomGuilds: any[] = [];
  kingdomGuild: any = this.store.selectSnapshot(AuthState.getKingdom);
  selectedGuild: any = null;
  Math: any = Math;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    private cacheService: CacheService,
  ) {}

  async ngOnInit() {
    let guilds = await this.cacheService.getGuilds();
    this.kingdomGuilds = guilds;
  }

  openBuildDialog(building: any): void {
    const dialogRef = this.dialog.open(BuildComponent, {
      panelClass: 'dialog-responsive',
      data: building,
    });
  }

  openTaxDialog(village$: any) {
    const dialogRef = this.dialog.open(TaxComponent, {
      panelClass: 'dialog-responsive',
      data: village$,
    });
  }

  openChargeDialog(node$: any) {
    const dialogRef = this.dialog.open(ChargeComponent, {
      panelClass: 'dialog-responsive',
      data: node$,
    });
  }

  openExploreDialog(land$: Observable<any>) {
    const dialogRef = this.dialog.open(ExploreComponent, {
      panelClass: 'dialog-responsive',
      data: land$,
    });
  }

}
