import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit {

  kingdomBuildings: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private angularFireAuth: AngularFireAuth,
  ) {}

  ngOnInit() {
    this.getKingdomBuildings().subscribe(buildings => {
      this.kingdomBuildings = buildings;
    });
  }

  getKingdomBuildings() {
    return this.angularFireAuth.authState.pipe(
      switchMap(user => {
        return user
          ? this.firebaseService.leftJoin(`kingdoms/${user.uid}/buildings`, 'structures', 'id', 'id')
          : of([]);
      })
    );
  }

}
