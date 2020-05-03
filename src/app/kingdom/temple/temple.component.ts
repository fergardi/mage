import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FirebaseService } from 'src/app/services/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { OfferComponent } from './offer.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';

@Component({
  selector: 'app-temple',
  templateUrl: './temple.component.html',
  styleUrls: ['./temple.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class TempleComponent implements OnInit {

  uid: string = null;
  kingdomGods: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private angularFirestore: AngularFirestore,
    public dialog: MatDialog,
    private store: Store,
  ) {}

  ngOnInit() {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    this.firebaseService.leftJoin('gods', 'kingdoms', 'kingdom', 'id').pipe(untilDestroyed(this)).subscribe(gods => {
      this.kingdomGods = gods;
    });
  }

  openOfferDialog(god: any): void {
    const dialogRef = this.dialog.open(OfferComponent, {
      minWidth: '20%',
      maxWidth: '80%',
      data: {
        god: god,
        offer: 0,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.angularFirestore.collection('gods').doc(god.fid).update({ gold: result, kingdom: this.uid });
      }
    })
  }

}