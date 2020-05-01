import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { take } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { BuildComponent } from './build.component';
import { MatDialog } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class CityComponent implements OnInit {

  kingdomBuildings: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private angularFireAuth: AngularFireAuth,
    private angularFirestore: AngularFirestore,
    private notificationService: NotificationService,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.angularFireAuth.authState.pipe(take(1)).subscribe(user => {
      this.firebaseService.leftJoin(`kingdoms/${user.uid}/buildings`, 'structures', 'id', 'id').pipe(untilDestroyed(this)).subscribe(buildings => {
        this.kingdomBuildings = buildings;
      });
    });
  }

  openBuildDialog(building: any): void {
    const dialogRef = this.dialog.open(BuildComponent, {
      minWidth: '20%',
      maxWidth: '80%',
      data: {
        building: building,
        lands: 0,
      }
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          const batch = this.angularFirestore.firestore.batch();
          const buildingRef = this.angularFirestore.collection(`kingdoms/wS6oK6Epj3XvavWFtngLZkgFx263/buildings/`).doc(building.fid);
          const landsRef = this.angularFirestore.collection(`kingdoms/wS6oK6Epj3XvavWFtngLZkgFx263/supplies/`).doc('iH6DURLEckp4wffrzryK');
          batch.update(buildingRef.ref, { quantity: firestore.FieldValue.increment(result) });
          batch.update(landsRef.ref, { quantity: firestore.FieldValue.increment(-result) });
          await batch.commit();
          this.notificationService.success('');
        } catch(error) {
          console.error(error);
          this.notificationService.error('');
        }
      }
    })
  }

}
