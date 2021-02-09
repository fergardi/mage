import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
// import * as moment from 'moment';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})
@UntilDestroy()
export class LegendComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  columns = ['name', /*'clan',*/ 'timestamp'];
  filters: any = {
    name: {
      type: 'text',
      value: '',
    },
    /*
    clan: {
      type: 'text',
      value: '',
    },
    */
    timestamp: {
      type: 'timestamp',
      value: null,
    }
  };
  data: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private store: Store,
    private firebaseService: FirebaseService,
  ) { }

  ngOnInit() {
    this.firebaseService.leftJoin('legends', 'factions', 'faction', 'id', ref => ref.orderBy('power', 'desc')).pipe(untilDestroyed(this)).subscribe(async legends => {
      this.data = new MatTableDataSource(legends);
      this.data.paginator = this.paginator;
      // this.data.sortingDataAccessor = (obj, property) => property === 'name' ? obj['power'] : obj[property];
      this.data.sort = this.sort;
      this.data.filterPredicate = this.createFilter();
      this.applyFilter();
    });
  }

  applyFilter() {
    this.data.filter = JSON.stringify({
      name: this.filters.name.value,
      // clan: this.filters.clan.value,
    });
  }

  createFilter(): (data: any, filter: string) => boolean {
    const filterFunction = (data: any, filter: string): boolean => {
      const filters = JSON.parse(filter);
      return data.name.toLowerCase().includes(filters.name)
        // && (!filters.timestamp || moment(data.timestamp.toMillis()).isBetween(moment(filters.timestamp).startOf('day'), moment(filters.timestamp).endOf('day'), 'days', '[]'))
        && (!filters.clan || (data.clan && data.clan.name.toLowerCase().includes(filters.clan))); // clan can be null
    };
    return filterFunction;
  }

}