import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FirebaseService } from 'src/app/services/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { OfferingComponent } from './offering.component';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-temple',
  templateUrl: './temple.component.html',
  styleUrls: ['./temple.component.scss']
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

  openOfferingDialog(god: any): void {
    const dialogRef = this.dialog.open(OfferingComponent, {
      width: '33%',
      data: {
        ...god,
        offering: 0,
      }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data && data.offering > god.gold) {
        this.angularFirestore.collection('gods').doc(god.fid).update({ gold: data.offering, kingdom: 'wS6oK6Epj3XvavWFtngLZkgFx263' });
      }
    })
  }

}
