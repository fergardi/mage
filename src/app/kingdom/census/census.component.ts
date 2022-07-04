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
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DetailComponent } from './detail.component';
import { TutorialService } from 'src/app/services/tutorial.service';
import { Filter, Kingdom } from 'src/app/shared/type/interface.model';

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
  columns = [
    'name',
    'clan',
    'actions',
  ];
  filters: Filter = {
    name: {
      type: 'text',
      value: '',
    },
    clan: {
      type: 'text',
      value: '',
    },
  };
  table: MatTableDataSource<Kingdom> = new MatTableDataSource();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private angularFirestore: AngularFirestore,
    private dialog: MatDialog,
    private store: Store,
    private router: Router,
    private tutorialService: TutorialService,
  ) { }

  ngOnInit(): void {
    this.angularFirestore.collection<Kingdom>('kingdoms').valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(async kingdoms => {
      this.table = new MatTableDataSource(kingdoms.sort((a, b) => b.power - a.power).map((kingdom, index) => {
        return {
          ...kingdom,
          position: index + 1,
        };
      }));
      this.table.paginator = this.paginator;
      this.table.sortingDataAccessor = (obj, property) => property === 'name' ? obj['power'] : obj[property];
      this.table.sort = this.sort;
      this.table.filterPredicate = this.createFilter();
      this.applyFilter();
    });
  }

  applyFilter(): void {
    this.table.filter = JSON.stringify({
      name: this.filters.name.value,
      clan: this.filters.clan.value,
    });
  }

  createFilter(): (data: Kingdom, filter: string) => boolean {
    const filterFunction = (data: Kingdom, filter: string): boolean => {
      const filters = JSON.parse(filter);
      return data.name.toLowerCase().includes(filters.name)
        && (!filters.clan
          || (data.clan && data.clan.name.toLowerCase().includes(filters.clan)))
          || (data.clan && data.clan.description.toLowerCase().includes(filters.clan));
    };
    return filterFunction;
  }

  clearFilter(): void {
    this.filters.name.value = '';
    this.filters.clan.value = '';
    if (this.table.paginator) {
      this.table.paginator.pageSize = this.table.paginator.pageSizeOptions[0];
      this.table.paginator.pageIndex = 0;
    }
    if (this.table.sort) {
      if (this.table.sort.active !== 'name' && this.table.sort.direction !== 'desc') {
        this.table.sort.sort({
          id: 'name',
          start: 'desc',
          disableClear: false,
        });
      }
    }
    this.applyFilter();
  }

  openAttackDialog(kingdom: Kingdom, $event: Event): void {
    $event.stopPropagation();
    const dialogRef = this.dialog.open(BattleComponent, {
      panelClass: 'dialog-responsive',
      data: kingdom,
    });
  }

  openLetterDialog(kingdom: Kingdom, $event: Event): void {
    $event.stopPropagation();
    const dialogRef = this.dialog.open(LetterComponent, {
      panelClass: 'dialog-responsive',
      data: kingdom,
    });
  }

  openActivateDialog(kingdom: Kingdom, $event: Event): void {
    $event.stopPropagation();
    const dialogRef = this.dialog.open(ActivateComponent, {
      panelClass: 'dialog-responsive',
      data: {
        artifact: null,
        kingdom: kingdom,
      },
    });
  }

  openConjureDialog(kingdom: Kingdom, $event: Event): void {
    $event.stopPropagation();
    const dialogRef = this.dialog.open(ConjureComponent, {
      panelClass: 'dialog-responsive',
      data: {
        charm: null,
        kingdom: kingdom,
      },
    });
  }

  openDetailDialog(kingdom: Kingdom): void {
    const dialogRef = this.dialog.open(DetailComponent, {
      panelClass: 'dialog-responsive',
      data: kingdom,
    });
  }

  async showInMap(kingdom: Kingdom, $event: Event) {
    $event.stopPropagation();
    await this.router.navigate([`/world/map/${kingdom.fid}`]);
  }

  canBeAttacked(kingdom: Kingdom): boolean {
    return kingdom.attacked
      ? moment(this.clock).isAfter(moment(kingdom.attacked.toMillis()))
      : true;
  }

  startTour(step: string): void {
    this.tutorialService.start(step);
  }

}
