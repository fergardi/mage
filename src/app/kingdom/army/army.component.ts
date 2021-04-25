import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NotificationService } from 'src/app/services/notification.service';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { RecruitComponent } from './recruit.component';
import { DisbandComponent } from './disband.component';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { combineLatest } from 'rxjs';
import { TutorialService } from 'src/app/services/tutorial.service';

export enum TroopAssignmentType {
  NONE,
  ATTACK,
  DEFENSE,
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

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomTroops: any[] = [];
  attackTroops: any[] = [];
  defenseTroops: any[] = [];
  recruitUnits: any[] = [];

  constructor(
    private angularFirestore: AngularFirestore,
    private notificationService: NotificationService,
    private store: Store,
    private dialog: MatDialog,
    private apiService: ApiService,
    private loadingService: LoadingService,
    public tutorialService: TutorialService,
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.angularFirestore.collection<any>(`kingdoms/${this.uid}/troops`).valueChanges({ idField: 'fid' }),
      this.angularFirestore.collection<any>(`units`, ref => ref.where('recruitable', '==', true)).valueChanges({ idField: 'fid' }),
    ])
    .pipe(untilDestroyed(this))
    .subscribe(([troops, units]) => {
      this.kingdomTroops = troops.filter(troop => troop.assignment === TroopAssignmentType.NONE || !troop.assignment).sort((a, b) => a.sort - b.sort);
      this.attackTroops = troops.filter(troop => troop.assignment === TroopAssignmentType.ATTACK).sort((a, b) => a.sort - b.sort);
      this.defenseTroops = troops.filter(troop => troop.assignment === TroopAssignmentType.DEFENSE).sort((a, b) => a.sort - b.sort);
      this.recruitUnits = units.sort((a, b) => a.gold - b.gold);
    });
  }

  async assignTroop($event: CdkDragDrop<any>) {
    if ($event.container && (Number($event.container.id) === 0 || $event.previousContainer === $event.container || $event.container.data.length < MAXIMUM_TROOPS)) {
      if ($event.previousContainer === $event.container) {
        moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
      } else {
        transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
      }
      await this.updateArmy();
    } else {
      this.notificationService.warning('kingdom.army.maximum');
    }
  }

  async updateArmy() {
    this.loadingService.startLoading();
    try {
      const army = [];
      this.kingdomTroops.forEach((kingdomTroop, index) => {
        army.push({ troopId: kingdomTroop.fid, sort: 1000 + index, assignment: TroopAssignmentType.NONE });
      });
      this.attackTroops.forEach((attackTroop, index) => {
        army.push({ troopId: attackTroop.fid, sort: 2000 + index, assignment: TroopAssignmentType.ATTACK });
      });
      this.defenseTroops.forEach((defenseTroop, index) => {
        army.push({ troopId: defenseTroop.fid, sort: 3000 + index, assignment: TroopAssignmentType.DEFENSE });
      });
      const assigned = await this.apiService.assignArmy(this.uid, army);
      this.notificationService.success('kingdom.army.success');
    } catch (error) {
      console.error(error);
      this.notificationService.error('kingdom.army.error');
    }
    this.loadingService.stopLoading();
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
