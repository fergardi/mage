import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AngularFirestore } from '@angular/fire/firestore';

enum AssignmentType {
  'none', 'attack', 'defense'
}

@Component({
  selector: 'app-army',
  templateUrl: './army.component.html',
  styleUrls: ['./army.component.scss']
})
@UntilDestroy()
export class ArmyComponent implements OnInit {

  kingdomTroops: any[] = [];
  attackTroops: any[] = [];
  defenseTroops: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private angularFireAuth: AngularFireAuth,
    private angularFireStore: AngularFirestore,
  ) {}

  ngOnInit() {
    this.angularFireAuth.authState.pipe(first()).subscribe(user => {
      this.firebaseService.leftJoin(`kingdoms/${user.uid}/troops`, 'units', 'id', 'id').pipe(untilDestroyed(this)).subscribe(troops => {
        this.kingdomTroops = troops.filter(troop => troop.assignment === AssignmentType.none || !troop.assignment).sort((a, b) => a.sort - b.sort);
        this.attackTroops = troops.filter(troop => troop.assignment === AssignmentType.attack).sort((a, b) => a.sort - b.sort);
        this.defenseTroops = troops.filter(troop => troop.assignment === AssignmentType.defense).sort((a, b) => a.sort - b.sort);
      });
    });
  }

  assignTroop($event: CdkDragDrop<any>) {
    if ($event.previousContainer === $event.container) {
      moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
    } else {
      transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
    }
    this.sortTroops();
  }

  async sortTroops() {
    try {
      let refs = [];
      const db = this.angularFireStore.collection(`kingdoms/wS6oK6Epj3XvavWFtngLZkgFx263/troops`);
      this.kingdomTroops.forEach(kingdomTroop => {
        refs.push({ ref: db.doc(kingdomTroop.fid), assignment: AssignmentType.none });
      });
      this.attackTroops.forEach(attackTroop => {
        refs.push({ ref: db.doc(attackTroop.fid), assignment: AssignmentType.attack });
      });
      this.defenseTroops.forEach(defenseTroop => {
        refs.push({ ref: db.doc(defenseTroop.fid), assignment: AssignmentType.defense });
      });
      const batch = this.angularFireStore.firestore.batch();
      refs.forEach((r, index) => batch.update(r.ref.ref, { sort: index, assignment: r.assignment }))
      await batch.commit();
    } catch (error) {
      console.error(error);
    }
  }

}
