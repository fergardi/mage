import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FirebaseService } from 'src/app/services/firebase.service';
import { fadeInOnEnterAnimation } from 'angular-animations';

@Component({
  selector: 'app-census',
  templateUrl: './census.component.html',
  styleUrls: ['./census.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class CensusComponent implements OnInit {

  columns = ['position', 'name', 'radius'];
  filters: any = {
    name: {
      type: 'text',
      value: '',
    }
  };
  data: MatTableDataSource<any> = null;

  constructor(
    private firebaseService: FirebaseService,
  ) { }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit() {
    this.firebaseService.leftJoin('kingdoms', 'factions', 'faction', 'id').pipe(untilDestroyed(this)).subscribe(kingdoms => {
      this.data = new MatTableDataSource(kingdoms.map((kingdom, index) => { return { ...kingdom, position: index + 1 } }));
      this.data.paginator = this.paginator;
      this.data.sort = this.sort;
      this.data.filterPredicate = this.createFilter();
      this.applyFilter();
    })
  }

  applyFilter() {
    this.data.filter = JSON.stringify({
      name: this.filters.name.value
    });
  }

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: string): boolean {
      let filters = JSON.parse(filter);
      return data.name.toLowerCase().includes(filters.name)
    }
    return filterFunction;
  }

}
