import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoadingService } from 'src/app/services/loading.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';

@Component({
  selector: 'app-discharge',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.discharge.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.discharge.description' | translate }}</p>
      <mat-list dense>
        <mat-list-item [ngClass]="[contract.join.faction, (contract.join | legendary) ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="contract.level" matBadgePosition="above before">
            <img mat-list-avatar [src]="contract.join.image">
          </div>
          <div mat-line>{{ contract.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="contract.join.description | translate | icon:contract.join"></div>
          <div mat-list-avatar [matBadge]="0" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <mat-chip-list>
        <mat-chip color="primary" selected *ngIf="contract.join.goldMaintenance > 0"><img class="icon" src="/assets/images/resources/gold.png">{{ 'user.tome.goldMaintenance' | translate:{ number: (contract.join.goldMaintenance * contract.level) | long } }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="contract.join.manaMaintenance > 0"><img class="icon" src="/assets/images/resources/mana.png">{{ 'user.tome.manaMaintenance' | translate:{ number: (contract.join.manaMaintenance * contract.level) | long } }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="contract.join.populationMaintenance > 0"><img class="icon" src="/assets/images/resources/population.png">{{ 'user.tome.populationMaintenance' | translate:{ number: (contract.join.populationMaintenance * contract.level) | long } }}</mat-chip>
      </mat-chip-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.discharge.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="discharge()" cdkFocusInitial>{{ 'kingdom.discharge.discharge' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `],
})
export class DischargeComponent {

  uid = this.store.selectSnapshot(AuthState.getUserUID);

  constructor(
    @Inject(MAT_DIALOG_DATA) public contract: any,
    private dialogRef: MatDialogRef<DischargeComponent>,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private apiService: ApiService,
    private store: Store,
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  async discharge() {
    this.loadingService.startLoading();
    try {
      const discharged = await this.apiService.dischargeContract(this.uid, this.contract.fid);
      this.notificationService.success('kingdom.discharge.success', discharged);
      this.close();
    } catch (error) {
      console.error(error);
      this.notificationService.error('kingdom.discharge.error');
    }
    this.loadingService.stopLoading();
  }

}
