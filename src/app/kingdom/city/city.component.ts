import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { BuildComponent } from './build.component';
import { MatDialog } from '@angular/material/dialog';
import { Store, Select } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { TaxComponent } from './tax.component';
import { ChargeComponent } from './charge.component';
import { ExploreComponent } from './explore.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class CityComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomBuildings: any[] = [];
  village: any = null;
  node: any = null;
  @Select((state: any) => state.auth.supplies.find((supply: any) => supply.id === 'land')) land$: Observable<any>;
  @Select((state: any) => state.auth.supplies.find((supply: any) => supply.id === 'turn')) turn$: Observable<any>;

  constructor(
    private firebaseService: FirebaseService,
    private dialog: MatDialog,
    private store: Store,
  ) {}

  ngOnInit() {
    this.firebaseService.leftJoin(`kingdoms/${this.uid}/buildings`, 'structures', 'id', 'id').pipe(untilDestroyed(this)).subscribe(buildings => {
      this.kingdomBuildings = buildings.sort((a, b) => b.quantity - a.quantity);
      this.village = buildings.find(building => building.join.id === 'village');
      this.node = buildings.find(building => building.join.id === 'node');
    });
  }

  openBuildDialog(building: any): void {
    const dialogRef = this.dialog.open(BuildComponent, {
      panelClass: 'dialog-responsive',
      data: building,
    });
  }

  openTaxDialog(village: any) {
    const dialogRef = this.dialog.open(TaxComponent, {
      panelClass: 'dialog-responsive',
      data: village,
    });
  }

  openChargeDialog(node: any) {
    const dialogRef = this.dialog.open(ChargeComponent, {
      panelClass: 'dialog-responsive',
      data: node,
    });
  }

  openExploreDialog(land$: Observable<any>) {
    const dialogRef = this.dialog.open(ExploreComponent, {
      panelClass: 'dialog-responsive',
      data: null,
    });
  }

}
