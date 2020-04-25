import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-army',
  templateUrl: './army.component.html',
  styleUrls: ['./army.component.scss']
})
export class ArmyComponent implements OnInit {

  kingdomTroops: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private angularFireAuth: AngularFireAuth,
  ) {}

  ngOnInit() {
    this.getKingdomTroops().subscribe(troops => {
      this.kingdomTroops = troops;
    });
  }

  getKingdomTroops() {
    return this.angularFireAuth.authState.pipe(
      switchMap(user => {
        return user
          ? this.firebaseService.leftJoin(`kingdoms/${user.uid}/troops`, 'units', 'id', 'id')
          : of([]);
      })
    );
  }

}
