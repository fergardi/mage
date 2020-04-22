import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

interface Building {
  name: string
  image: string
  quantity: number
  uid: string
}

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements AfterViewInit {

  columns = ['name', 'quantity'];
  data: MatTableDataSource<Building>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private firebaseService: FirebaseService,
    private angularFireAuth: AngularFireAuth,
  ) {}

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.data.filter = value.trim().toLowerCase();
  }

  ngAfterViewInit() {
    this.getUserBuildings().subscribe(data => {
      this.data = new MatTableDataSource(data);
      this.data.sort = this.sort;
      this.data.paginator = this.paginator;
    });
  }

  getUserBuildings() {
    return this.angularFireAuth.authState.pipe(
      switchMap(user => {
        return user
          ? this.firebaseService.leftJoin(`kingdoms/${user.uid}/buildings`, 'buildings', 'id', 'id')
          : of([]);
      })
    );
  }

}
