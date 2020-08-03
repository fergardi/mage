import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FirebaseService } from 'src/app/services/firebase.service';
import { fadeInOnEnterAnimation, fadeOutOnLeaveAnimation } from 'angular-animations';
import { BattleComponent } from './battle.component';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import * as moment from 'moment';
import { LetterComponent } from './letter.component';
import { ActivateComponent } from '../sorcery/activate.component';
import { ConjureComponent } from '../sorcery/conjure.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-census',
  templateUrl: './census.component.html',
  styleUrls: ['./census.component.scss'],
  animations: [
    fadeInOnEnterAnimation({ duration: 250, delay: 250 }),
    fadeOutOnLeaveAnimation({ duration: 250, delay: 250 }),
  ],
})
@UntilDestroy()
export class CensusComponent implements OnInit, OnDestroy {

  uid: string = null;
  protection: number = 8;
  clock: Date = new Date();
  interval: any = null;
  columns = ['name', 'actions'];
  filters: any = {
    name: {
      type: 'text',
      value: '',
    },
  };
  data: MatTableDataSource<any> = new MatTableDataSource();

  constructor(
    private firebaseService: FirebaseService,
    private dialog: MatDialog,
    private store: Store,
    private router: Router,
  ) {
    this.interval = setInterval(() => this.clock = new Date(), 1000);
  }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit() {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    this.firebaseService.leftJoin('kingdoms', 'factions', 'faction', 'id', ref => ref.orderBy('power', 'desc')).pipe(untilDestroyed(this)).subscribe(kingdoms => {
      this.data = new MatTableDataSource(kingdoms.sort((a, b) => b.radius - a.radius).map((kingdom, index) => { return { ...kingdom, position: index + 1 } }));
      this.data.paginator = this.paginator;
      this.data.sortingDataAccessor = (obj, property) => property === 'name' ? obj['power'] : obj[property];
      this.data.sort = this.sort;
      this.data.filterPredicate = this.createFilter();
      this.applyFilter();
    });
  }

  applyFilter() {
    this.data.filter = JSON.stringify({
      name: this.filters.name.value,
    });
  }

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: string): boolean {
      let filters = JSON.parse(filter);
      return data.name.toLowerCase().includes(filters.name);
    }
    return filterFunction;
  }

  openAttackDialog(kingdom: any): void {
    const dialogRef = this.dialog.open(BattleComponent, {
      panelClass: 'dialog-responsive',
      data: kingdom,
    });
  }

  openLetterDialog(kingdom: any): void {
    const dialogRef = this.dialog.open(LetterComponent, {
      panelClass: 'dialog-responsive',
      data: kingdom,
    });
  }

  openActivateDialog(kingdom: any): void {
    const dialogRef = this.dialog.open(ActivateComponent, {
      panelClass: 'dialog-responsive',
      data: null,
    });
  }

  openConjureDialog(kingdom: any): void {
    const dialogRef = this.dialog.open(ConjureComponent, {
      panelClass: 'dialog-responsive',
      data: null,
    });
  }

  canBeAttacked(kingdom: any): boolean {
    return kingdom.lastAttacked
      ? moment(this.clock).isAfter(moment(kingdom.lastAttacked.toMillis()))
      : true;
  }

  async showInMap(kingdom: any) {
    await this.router.navigate([`/world/map/${kingdom.fid}`]);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

}
