import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { switchMap, map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(
    private angularFireAuth: AngularFireAuth,
    private angularFirestore: AngularFirestore,
  ) {}

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.data.filter = value.trim().toLowerCase();
  }

  ngAfterViewInit() {
    this.getUserBuildings().subscribe(data => {
      this.data = new MatTableDataSource(data);
      this.data.sort = this.sort;
      this.data.paginator = this.paginator;
    })
  }

  getUserBuildings() {
    return this.angularFireAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return combineLatest([
            this.angularFirestore.collection<Building>(`users/${user.uid}/buildings`).valueChanges(),
            this.angularFirestore.collection<Building>(`buildings`).valueChanges(),
          ]).pipe(
            map(([
              userBuildings,
              buildings,
            ]) => {
              return userBuildings.map(userBuilding => {
                return {
                  ...userBuilding,
                  ...buildings.find(b => b.uid === userBuilding.uid)
                }
              })
            })
          )
        }
      })
    )
  }

}
