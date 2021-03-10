import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
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

export enum ContractAssignmentType {
  'contractNone', 'contractAttack', 'contractDefense',
}

const MAXIMUM_CONTRACTS = 5;

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

  constructor(
    private firebaseService: FirebaseService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private store: Store,
    private apiService: ApiService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit() {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    this.firebaseService.leftJoin(`kingdoms/${this.uid}/contracts`, 'heroes', 'id', 'id').pipe(untilDestroyed(this)).subscribe(contracts => {
      this.kingdomContracts = contracts.filter(contract => contract.assignment === ContractAssignmentType.contractNone || !contract.assignment);
      this.attackContracts = contracts.filter(contract => contract.assignment === ContractAssignmentType.contractAttack);
      this.defenseContracts = contracts.filter(contract => contract.assignment === ContractAssignmentType.contractDefense);
    });
  }

  async assignContract($event: CdkDragDrop<any>) {
    if ([0, 3].includes(parseInt($event.container.id)) || $event.container.data.length < MAXIMUM_CONTRACTS) {
      this.loadingService.setLoading(true);
      if ($event.previousContainer === $event.container) {
        moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
      } else {
        transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
      }
      try {
        let assigned = await this.apiService.assignContract(this.uid, $event.item.element.nativeElement.id, parseInt($event.container.id));
        this.notificationService.success('kingdom.tavern.success');
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.tavern.error');
      }
      this.loadingService.setLoading(false);
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
