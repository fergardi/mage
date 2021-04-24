import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { BuildComponent } from './build.component';
import { MatDialog } from '@angular/material/dialog';
import { Store, Select } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { TaxComponent } from './tax.component';
import { ChargeComponent } from './charge.component';
import { ExploreComponent } from './explore.component';
import { Observable, combineLatest } from 'rxjs';
import { TutorialService } from 'src/app/services/tutorial.service';

@UntilDestroy()
@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
export class CityComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  @Select(AuthState.getKingdomBuildings) kingdomBuildings$: Observable<any[]>;
  @Select(AuthState.getKingdomVillage) village$: Observable<any>;
  @Select(AuthState.getKingdomNode) node$: Observable<any>;
  @Select(AuthState.getKingdomWorkshop) workshop$: Observable<any>;
  @Select(AuthState.getKingdomLand) land$: Observable<any>;
  @Select(AuthState.getKingdomTurn) turn$: Observable<any>;
  Math: any = Math;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    public tutorialService: TutorialService,
  ) {}

  ngOnInit(): void {
    /*
    combineLatest([
      this.kingdomBuildings$,
      this.village$,
      this.node$,
      this.workshop$,
      this.land$,
      this.turn$,
    ])
    .pipe(untilDestroyed(this))
    .subscribe(() => {
      this.tutorialService.ready('city');
    });
    */
  }

  openBuildDialog(building: any): void {
    const dialogRef = this.dialog.open(BuildComponent, {
      panelClass: 'dialog-responsive',
      data: building,
    });
  }

  openTaxDialog(village$: any): void {
    const dialogRef = this.dialog.open(TaxComponent, {
      panelClass: 'dialog-responsive',
      data: village$,
    });
  }

  openChargeDialog(node$: any): void {
    const dialogRef = this.dialog.open(ChargeComponent, {
      panelClass: 'dialog-responsive',
      data: node$,
    });
  }

  openExploreDialog(land$: Observable<any>): void {
    const dialogRef = this.dialog.open(ExploreComponent, {
      panelClass: 'dialog-responsive',
      data: land$,
    });
  }

}
