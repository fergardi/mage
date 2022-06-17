import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { TutorialService } from 'src/app/services/tutorial.service';
import * as moment from 'moment';
import { Filter, Legend } from 'src/app/shared/type/interface.model';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
})
@UntilDestroy()
export class LegendComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  columns = [
    'name',
    'clan',
    'timestamp',
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
    timestamp: {
      type: 'timestamp',
      value: null,
    },
  };
  data: MatTableDataSource<Legend> = new MatTableDataSource();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private store: Store,
    private angularFirestore: AngularFirestore,
    public tutorialService: TutorialService,
  ) { }

  ngOnInit(): void {
    this.angularFirestore.collection<Legend>('legends').valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(legends => {
      this.data = new MatTableDataSource(legends);
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

  createFilter(): (data: Legend, filter: string) => boolean {
    const filterFunction = (data: Legend, filter: string): boolean => {
      const filters = JSON.parse(filter);
      return data.name.toLowerCase().includes(filters.name)
        && (!filters.timestamp || moment(data.timestamp.toMillis()).isBetween(moment(filters.timestamp).startOf('day'), moment(filters.timestamp).endOf('day'), 'days', '[]'))
        && (!filters.clan || (data.clan && data.clan.name.toLowerCase().includes(filters.clan))); // clan can be null
    };
    return filterFunction;
  }

  startTour(step: string): void {
    this.tutorialService.start(step);
  }

}
