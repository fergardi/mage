import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { first } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
@UntilDestroy()
export class CityComponent implements OnInit {

  kingdomBuildings: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private angularFireAuth: AngularFireAuth,
  ) {}

  ngOnInit() {
    this.angularFireAuth.authState.pipe(first()).subscribe(user => {
      this.firebaseService.leftJoin(`kingdoms/${user.uid}/buildings`, 'structures', 'id', 'id').pipe(untilDestroyed(this)).subscribe(buildings => {
        this.kingdomBuildings = buildings;
      });
    });
  }

}
