import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { BuildComponent } from './build.component';
import { MatDialog } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { TaxComponent } from './tax.component';
import { ChargeComponent } from './charge.component';
import { ExploreComponent } from './explore.component';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class CityComponent implements OnInit {

  uid: string = null;
  kingdomBuildings: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private angularFirestore: AngularFirestore,
    private notificationService: NotificationService,
    public dialog: MatDialog,
    private store: Store,
  ) {}

  ngOnInit() {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    this.firebaseService.leftJoin(`kingdoms/${this.uid}/buildings`, 'structures', 'id', 'id').pipe(untilDestroyed(this)).subscribe(buildings => {
      this.kingdomBuildings = buildings;
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
          const buildingRef = this.angularFirestore.collection(`kingdoms/${this.uid}/buildings/`).doc(building.fid);
          const landsRef = this.angularFirestore.collection(`kingdoms/${this.uid}/supplies/`).doc('iH6DURLEckp4wffrzryK');
          batch.update(buildingRef.ref, { quantity: firestore.FieldValue.increment(result) });
          batch.update(landsRef.ref, { quantity: firestore.FieldValue.increment(-result) });
          await batch.commit();
          this.notificationService.success('kingdom.city.success');
        } catch(error) {
          console.error(error);
          this.notificationService.error('kingdom.city.error');
        }
      }
    })
  }

  openTaxDialog() {
    const dialogRef = this.dialog.open(TaxComponent, {
      minWidth: '20%',
      maxWidth: '80%',
      data: null,
    });
  }

  openChargeDialog() {
    const dialogRef = this.dialog.open(ChargeComponent, {
      minWidth: '20%',
      maxWidth: '80%',
      data: null,
    });
  }

  openExploreDialog() {
    const dialogRef = this.dialog.open(ExploreComponent, {
      minWidth: '20%',
      maxWidth: '80%',
      data: null,
    });
  }

}
