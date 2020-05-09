import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AngularFirestore } from '@angular/fire/firestore';
import { NotificationService } from 'src/app/services/notification.service';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';

export enum TroopAssignmentType {
  'troopNone', 'troopAttack', 'troopDefense'
}

@Component({
  selector: 'app-army',
  templateUrl: './army.component.html',
  styleUrls: ['./army.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class ArmyComponent implements OnInit {

  uid: string = null;

  kingdomTroops: any[] = [];
  attackTroops: any[] = [];
  defenseTroops: any[] = [];
  maximumTroops: number = 5;

  constructor(
    private firebaseService: FirebaseService,
    private angularFirestore: AngularFirestore,
    private notificationService: NotificationService,
    private store: Store,
  ) {}

  ngOnInit() {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    this.firebaseService.leftJoin(`kingdoms/${this.uid}/troops`, 'units', 'id', 'id').pipe(untilDestroyed(this)).subscribe(troops => {
      this.kingdomTroops = troops.filter(troop => troop.assignment === TroopAssignmentType.troopNone || !troop.assignment).sort((a, b) => a.sort - b.sort);
      this.attackTroops = troops.filter(troop => troop.assignment === TroopAssignmentType.troopAttack).sort((a, b) => a.sort - b.sort);
      this.defenseTroops = troops.filter(troop => troop.assignment === TroopAssignmentType.troopDefense).sort((a, b) => a.sort - b.sort);
    });
  }

  assignTroop($event: CdkDragDrop<any>) {
    if (parseInt($event.container.id) === 0 || $event.previousContainer === $event.container || $event.container.data.length < this.maximumTroops) {
      if ($event.previousContainer === $event.container) {
        moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
      } else {
        transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
      }
      this.updateTroops();
    } else {
      this.notificationService.warning('kingdom.army.maximum')
    }
  }

  async updateTroops() {
    try {
      let refs = [];
      const db = this.angularFirestore.collection(`kingdoms/${this.uid}/troops`);
      this.kingdomTroops.forEach(kingdomTroop => {
        refs.push({ ref: db.doc(kingdomTroop.fid), assignment: TroopAssignmentType.troopNone });
      });
      this.attackTroops.forEach(attackTroop => {
        refs.push({ ref: db.doc(attackTroop.fid), assignment: TroopAssignmentType.troopAttack });
      });
      this.defenseTroops.forEach(defenseTroop => {
        refs.push({ ref: db.doc(defenseTroop.fid), assignment: TroopAssignmentType.troopDefense });
      });
      const batch = this.angularFirestore.firestore.batch();
      refs.forEach((r, index) => batch.update(r.ref.ref, { sort: index, assignment: r.assignment }))
      await batch.commit();
      this.notificationService.success('kingdom.army.success')
    } catch (error) {
      console.error(error);
      this.notificationService.error('kingdom.army.error')
    }
  }

}
