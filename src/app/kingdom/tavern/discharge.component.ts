import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoadingService } from 'src/app/services/loading.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { Contract } from 'src/app/shared/type/interface.model';

@Component({
  selector: 'app-discharge',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.discharge.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.discharge.description' | translate }}</p>
      <div matSubheader>{{ 'kingdom.discharge.contract' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="[contract.hero.faction.id, contract.hero.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="contract.level" matBadgePosition="above before">
            <img mat-list-avatar [src]="contract.hero.image">
          </div>
          <div mat-line>{{ contract.hero.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="contract.hero.description | translate | icon:contract.hero"></div>
          <div mat-list-avatar [matBadge]="0" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.discharge.maintenances' | translate }}:</div>
      <mat-chip-list>
        <mat-chip color="primary" selected *ngIf="contract.hero.goldMaintenance > 0"><img class="icon" src="/assets/images/resources/gold.png">{{ 'user.tome.goldMaintenance' | translate:{ number: (contract.hero.goldMaintenance * contract.level) | long } }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="contract.hero.manaMaintenance > 0"><img class="icon" src="/assets/images/resources/mana.png">{{ 'user.tome.manaMaintenance' | translate:{ number: (contract.hero.manaMaintenance * contract.level) | long } }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="contract.hero.populationMaintenance > 0"><img class="icon" src="/assets/images/resources/population.png">{{ 'user.tome.populationMaintenance' | translate:{ number: (contract.hero.populationMaintenance * contract.level) | long } }}</mat-chip>
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

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);

  constructor(
    @Inject(MAT_DIALOG_DATA) public contract: Contract,
    private dialogRef: MatDialogRef<DischargeComponent>,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private apiService: ApiService,
    private store: Store,
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  async discharge(): Promise<void> {
    try {
      this.loadingService.startLoading();
      const discharged = await this.apiService.dischargeContract(this.uid, this.contract.fid);
      this.notificationService.success('kingdom.discharge.success', discharged);
      this.close();
    } catch (error) {
      this.notificationService.error('kingdom.discharge.error', error as Error);
    } finally {
      this.loadingService.stopLoading();
    }
  }

}
