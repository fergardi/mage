import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AngularFirestore } from '@angular/fire/firestore';
import { NotificationService } from 'src/app/services/notification.service';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';

export enum ContractAssignmentType {
  'contractNone', 'contractAttack', 'contractDefense',
}

@Component({
  selector: 'app-tavern',
  templateUrl: './tavern.component.html',
  styleUrls: ['./tavern.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class TavernComponent implements OnInit {

  uid: string = null;

  kingdomContracts: any[] = [];
  attackContracts: any[] = [];
  defenseContracts: any[] = [];
  maximumContracts: number = 5;

  constructor(
    private firebaseService: FirebaseService,
    private angularFirestore: AngularFirestore,
    private notificationService: NotificationService,
    private store: Store,
  ) {}

  ngOnInit() {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    this.firebaseService.leftJoin(`kingdoms/${this.uid}/contracts`, 'heroes', 'id', 'id').pipe(untilDestroyed(this)).subscribe(contracts => {
      this.kingdomContracts = contracts.filter(contract => contract.assignment === ContractAssignmentType.contractNone || !contract.assignment);
      this.attackContracts = contracts.filter(contract => contract.assignment === ContractAssignmentType.contractAttack);
      this.defenseContracts = contracts.filter(contract => contract.assignment === ContractAssignmentType.contractDefense);
    });
  }

  assignContract($event: CdkDragDrop<any>) {
    if ([0,3].includes(parseInt($event.container.id)) || $event.container.data.length < this.maximumContracts) {
      if ($event.previousContainer === $event.container) {
        moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
      } else {
        transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
      }
      this.angularFirestore.collection(`kingdoms/${this.uid}/contracts`).doc($event.item.element.nativeElement.id).update({ assignment: parseInt($event.container.id) });
      this.notificationService.success('kingdom.tavern.success');
    } else {
      this.notificationService.warning('kingdom.tavern.maximum');
    }
  }

}
