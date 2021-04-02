import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
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
import { AngularFirestore } from '@angular/fire/firestore';
import { DetailComponent } from './detail.component';

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
export class CensusComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  clock: Date = this.store.selectSnapshot(AuthState.getClock);
  protection: number = 8;
  columns = ['name', 'clan', 'actions'];
  filters: any = {
    name: {
      type: 'text',
      value: '',
    },
    clan: {
      type: 'text',
      value: '',
    },
  };
  data: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private angularFirestore: AngularFirestore,
    private dialog: MatDialog,
    private store: Store,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.angularFirestore.collection<any>('kingdoms', ref => ref.where('player', '==', true)).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(async kingdoms => {
      this.data = new MatTableDataSource(kingdoms.sort((a, b) => b.radius - a.radius).map((kingdom, index) => {
        return {
          ...kingdom,
          position: index + 1,
        };
      }));
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
      clan: this.filters.clan.value,
    });
  }

  createFilter(): (data: any, filter: string) => boolean {
    const filterFunction = (data: any, filter: string): boolean => {
      const filters = JSON.parse(filter);
      return data.name.toLowerCase().includes(filters.name)
        && (!filters.clan
          || (data.clan && data.clan.name.toLowerCase().includes(filters.clan)))
          || (data.clan && data.clan.description.toLowerCase().includes(filters.clan));
    };
    return filterFunction;
  }

  openAttackDialog(kingdom: any, $event: Event): void {
    $event.stopPropagation();
    const dialogRef = this.dialog.open(BattleComponent, {
      panelClass: 'dialog-responsive',
      data: kingdom,
    });
  }

  openLetterDialog(kingdom: any, $event: Event): void {
    $event.stopPropagation();
    const dialogRef = this.dialog.open(LetterComponent, {
      panelClass: 'dialog-responsive',
      data: kingdom,
    });
  }

  openActivateDialog(kingdom: any, $event: Event): void {
    $event.stopPropagation();
    const dialogRef = this.dialog.open(ActivateComponent, {
      panelClass: 'dialog-responsive',
      data: {
        artifact: null,
        kingdom: kingdom,
      },
    });
  }

  openConjureDialog(kingdom: any, $event: Event): void {
    $event.stopPropagation();
    const dialogRef = this.dialog.open(ConjureComponent, {
      panelClass: 'dialog-responsive',
      data: {
        charm: null,
        kingdom: kingdom,
      },
    });
  }

  openDetailDialog(kingdom: any): void {
    const dialogRef = this.dialog.open(DetailComponent, {
      panelClass: 'dialog-responsive',
      data: kingdom,
    });
  }

  async showInMap(kingdom: any, $event: Event) {
    $event.stopPropagation();
    await this.router.navigate([`/world/map/${kingdom.fid}`]);
  }

  canBeAttacked(kingdom: any): boolean {
    return kingdom.attacked
      ? moment(this.clock).isAfter(moment(kingdom.attacked.toMillis()))
      : true;
  }

}
