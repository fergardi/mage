import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FirebaseService } from 'src/app/services/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { OfferComponent } from './offer.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { fadeInOnEnterAnimation } from 'angular-animations';

@Component({
  selector: 'app-temple',
  templateUrl: './temple.component.html',
  styleUrls: ['./temple.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class TempleComponent implements OnInit {

  kingdomGods: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private angularFirestore: AngularFirestore,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.firebaseService.leftJoin('gods', 'kingdoms', 'kingdom', 'id').pipe(untilDestroyed(this)).subscribe(gods => {
      this.kingdomGods = gods;
    });
  }

  openOfferDialog(god: any): void {
    const dialogRef = this.dialog.open(OfferComponent, {
      width: '33%',
      data: {
        ...god,
        offer: 0,
      }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data && data.offer > god.gold) {
        this.angularFirestore.collection('gods').doc(god.fid).update({ gold: data.offer, kingdom: 'wS6oK6Epj3XvavWFtngLZkgFx263' });
      }
    })
  }

}
