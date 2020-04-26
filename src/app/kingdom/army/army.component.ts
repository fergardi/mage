import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-army',
  templateUrl: './army.component.html',
  styleUrls: ['./army.component.scss']
})
@UntilDestroy()
export class ArmyComponent implements OnInit {

  kingdomTroops: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private angularFireAuth: AngularFireAuth,
  ) {}

  ngOnInit() {
    this.angularFireAuth.authState.pipe(first()).subscribe(user => {
      this.firebaseService.leftJoin(`kingdoms/${user.uid}/troops`, 'units', 'id', 'id').pipe(untilDestroyed(this)).subscribe(troops => {
        this.kingdomTroops = troops;
      });
    });
  }

}
