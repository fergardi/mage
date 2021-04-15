import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { LoadingService } from 'src/app/services/loading.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-dispel',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.dispel.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.dispel.help' | translate }}</p>
      <div matSubheader>{{ 'kingdom.dispel.to' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="[incantation.to.faction.id, incantation.to.id === uid ? 'legendary' : 'common']">
          <div mat-list-avatar matBadge="?" matBadgePosition="above before">
            <img mat-list-avatar [src]="incantation.to.faction.image">
          </div>
          <div mat-line>{{ incantation.to.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ incantation.to.faction.name | translate }}</div>
        </mat-list-item>
      </mat-list>
      <div matSubheader>{{ 'kingdom.dispel.incantation' | translate }}:</div>
      <mat-list dense>
        <mat-list-item (click)="dispel()" [ngClass]="[incantation.spell.faction.id, incantation.spell.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="incantation.spell.level" matBadgePosition="above before" [matBadgeColor]="incantation.to.id === uid ? 'accent' : 'warn'">
            <img mat-list-avatar [src]="incantation.spell.image">
          </div>
          <div mat-line>{{ incantation.spell.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="incantation.spell.description | translate | icon:incantation.spell"></div>
          <div mat-line>
            <mat-progress-bar [color]="incantation.to.id === uid ? 'accent' : 'warn'" [value]="incantation.turns * 100 / incantation.spell.turnDuration"></mat-progress-bar>
          </div>
          <div mat-list-avatar [matBadge]="incantation.turns" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.dispel.maintenances' | translate }}:</div>
      <mat-chip-list>
        <mat-chip color="primary" selected *ngIf="incantation.spell.goldMaintenance > 0"><img class="icon" src="/assets/images/resources/gold.png">{{ 'user.tome.goldMaintenance' | translate:{ number: incantation.spell.goldMaintenance | long } }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="incantation.spell.manaMaintenance > 0"><img class="icon" src="/assets/images/resources/mana.png">{{ 'user.tome.manaMaintenance' | translate:{ number: incantation.spell.manaMaintenance | long } }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="incantation.spell.populationMaintenance > 0"><img class="icon" src="/assets/images/resources/population.png">{{ 'user.tome.populationMaintenance' | translate:{ number: incantation.spell.populationMaintenance | long } }}</mat-chip>
      </mat-chip-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.dispel.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="dispel()" cdkFocusInitial>{{ 'kingdom.dispel.dispel' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `],
})
export class DispelComponent {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomMana: any = this.store.selectSnapshot(AuthState.getKingdomMana);

  constructor(
    @Inject(MAT_DIALOG_DATA) public incantation: any,
    private dialogRef: MatDialogRef<DispelComponent>,
    private notificationService: NotificationService,
    private store: Store,
    private loadingService: LoadingService,
    private apiService: ApiService,
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  async dispel() {
    if (this.incantation.spell.manaCost <= this.kingdomMana.quantity) {
      this.loadingService.startLoading();
      try {
        const dispelled = await this.apiService.dispelIncantation(this.uid, this.incantation.fid);
        this.notificationService.success('kingdom.dispel.success');
        // this.notificationService.success('kingdom.dispel.failure');
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.dispel.error');
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.error('kingdom.dispel.error');
    }
  }

}
