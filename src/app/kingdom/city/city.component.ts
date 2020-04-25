import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements AfterViewInit {

  kingdomBuildings: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private angularFireAuth: AngularFireAuth,
  ) {}

  ngAfterViewInit() {
    this.getUserBuildings().subscribe(buildings => {
      this.kingdomBuildings = buildings;
    });
  }

  getUserBuildings() {
    return this.angularFireAuth.authState.pipe(
      switchMap(user => {
        return user
          ? this.firebaseService.leftJoin(`kingdoms/${user.uid}/buildings`, 'structures', 'id', 'id')
          : of([]);
      })
    );
  }

}
