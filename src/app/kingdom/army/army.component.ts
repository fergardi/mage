import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AngularFirestore } from '@angular/fire/firestore';
import { NotificationService } from 'src/app/services/notification.service';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { CacheService } from 'src/app/services/cache.service';
import { RecruitComponent } from './recruit.component';
import { DisbandComponent } from './disband.component';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';

export enum TroopAssignmentType {
  'troopNone', 'troopAttack', 'troopDefense'
}

const MAXIMUM_TROOPS = 5;

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
  recruitUnits: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private angularFirestore: AngularFirestore,
    private notificationService: NotificationService,
    private cacheService: CacheService,
    private store: Store,
    private dialog: MatDialog,
    private apiService: ApiService,
  ) {}

  async ngOnInit() {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    this.firebaseService.leftJoin(`kingdoms/${this.uid}/troops`, 'units', 'id', 'id').pipe(untilDestroyed(this)).subscribe(troops => {
      this.kingdomTroops = troops.filter(troop => troop.assignment === TroopAssignmentType.troopNone || !troop.assignment).sort((a, b) => a.sort - b.sort);
      this.attackTroops = troops.filter(troop => troop.assignment === TroopAssignmentType.troopAttack).sort((a, b) => a.sort - b.sort);
      this.defenseTroops = troops.filter(troop => troop.assignment === TroopAssignmentType.troopDefense).sort((a, b) => a.sort - b.sort);
    });
    let recruitUnits = await this.cacheService.getUnits();
    this.recruitUnits = recruitUnits.filter((unit: any) => unit.recruitable === true);
  }

  assignTroop($event: CdkDragDrop<any>) {
    if (parseInt($event.container.id) === 0 || $event.previousContainer === $event.container || $event.container.data.length < MAXIMUM_TROOPS) {
      if ($event.previousContainer === $event.container) {
        moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
      } else {
        transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
      }
      this.updateArmy();
    } else {
      this.notificationService.warning('kingdom.army.maximum')
    }
  }

  async updateArmy() {
    try {
      let army = [];
      this.kingdomTroops.forEach((kingdomTroop, index) => {
        army.push({ troopId: kingdomTroop.fid, sort: 1000 + index, assignment: TroopAssignmentType.troopNone });
      });
      this.attackTroops.forEach((attackTroop, index) => {
        army.push({ troopId: attackTroop.fid, sort: 2000 + index, assignment: TroopAssignmentType.troopAttack });
      });
      this.defenseTroops.forEach((defenseTroop, index) => {
        army.push({ troopId: defenseTroop.fid, sort: 3000 + index, assignment: TroopAssignmentType.troopDefense });
      });
      let assigned = await this.apiService.assignArmy(this.uid, army);
      this.notificationService.success('kingdom.army.success')
    } catch (error) {
      console.error(error);
      this.notificationService.error('kingdom.army.error')
    }
  }

  openRecruitDialog(unit: any): void {
    const dialogRef = this.dialog.open(RecruitComponent, {
      panelClass: 'dialog-responsive',
      data: unit,
    });
  }

  openDisbandDialog(troop: any): void {
    const dialogRef = this.dialog.open(DisbandComponent, {
      panelClass: 'dialog-responsive',
      data: troop,
    });
  }

}
