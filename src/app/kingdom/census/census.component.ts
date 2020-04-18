import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-census',
  templateUrl: './census.component.html',
  styleUrls: ['./census.component.scss'],
})
export class CensusComponent implements OnInit {

  columnsToDisplay = ['img', 'name', 'lands', 'power'];
  data = Array.from({ length: 10 }, _ => {
    return {
      position: 1,
      img: '/assets/badge.png',
      name: 'name',
      lands: Math.random() * 9999,
      power: Math.random() * 999999
    }
  });
  dataSource = new MatTableDataSource(this.data);

  constructor() { }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
