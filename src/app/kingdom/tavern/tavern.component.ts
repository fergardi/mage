import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NotificationService } from 'src/app/services/notification.service';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { DischargeComponent } from './discharge.component';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AngularFirestore } from '@angular/fire/firestore';

export enum ContractAssignmentType {
  'contractNone', 'contractAttack', 'contractDefense',
}

const MAXIMUM_CONTRACTS = 3;

@Component({
  selector: 'app-tavern',
  templateUrl: './tavern.component.html',
  styleUrls: ['./tavern.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class TavernComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);

  kingdomContracts: any[] = [];
  attackContracts: any[] = [];
  defenseContracts: any[] = [];

  constructor(
    private angularFirestore: AngularFirestore,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private store: Store,
    private apiService: ApiService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.angularFirestore.collection<any>(`kingdoms/${this.uid}/contracts`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(contracts => {
      this.kingdomContracts = contracts.filter(contract => contract.assignment === ContractAssignmentType.contractNone || !contract.assignment);
      this.attackContracts = contracts.filter(contract => contract.assignment === ContractAssignmentType.contractAttack);
      this.defenseContracts = contracts.filter(contract => contract.assignment === ContractAssignmentType.contractDefense);
    });
  }

  async assignContract($event: CdkDragDrop<any>) {
    if ([0, 3].includes(Number($event.container.id)) || $event.container.data.length < MAXIMUM_CONTRACTS) {
      this.loadingService.startLoading();
      try {
        if ($event.previousContainer === $event.container) {
          // moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
        } else {
          transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
          const assigned = await this.apiService.assignContract(this.uid, $event.item.element.nativeElement.id, Number($event.container.id));
          this.notificationService.success('kingdom.tavern.success');
        }
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.tavern.error');
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.warning('kingdom.tavern.maximum');
    }
  }

  openDischargeDialog(troop: any): void {
    const dialogRef = this.dialog.open(DischargeComponent, {
      panelClass: 'dialog-responsive',
      data: troop,
    });
  }

}
