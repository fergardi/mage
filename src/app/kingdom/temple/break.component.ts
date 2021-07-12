import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { LoadingService } from 'src/app/services/loading.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-break',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.break.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.break.help' | translate }}</p>
      <div matSubheader>{{ 'kingdom.break.from' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="[enchantment.from.faction.id, enchantment.from.fid === uid ? 'legendary' : 'common']">
          <div mat-list-avatar matBadge="?" matBadgePosition="above before">
            <img mat-list-avatar [src]="enchantment.from.faction.image">
          </div>
          <div mat-line>{{ enchantment.from.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ enchantment.from.faction.name | translate }}</div>
        </mat-list-item>
      </mat-list>
      <div matSubheader>{{ 'kingdom.break.enchantment' | translate }}:</div>
      <mat-list dense>
        <mat-list-item (click)="break()" [ngClass]="[enchantment.spell.faction.id, enchantment.spell.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="enchantment.spell.level" matBadgePosition="above before" [matBadgeColor]="enchantment.from.id === uid ? 'accent' : 'warn'">
            <img mat-list-avatar [src]="enchantment.spell.image">
          </div>
          <div mat-line>{{ enchantment.spell.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="enchantment.spell.description | translate | icon:enchantment.spell"></div>
          <div mat-line>
            <mat-progress-bar [color]="enchantment.from.id === uid ? 'accent' : 'warn'" [value]="enchantment.turns * 100 / enchantment.spell.turnDuration"></mat-progress-bar>
          </div>
          <div mat-list-avatar [matBadge]="enchantment.turns" matBadgePosition="above after" [matBadgeColor]="enchantment.from.id === uid ? 'accent' : 'warn'">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.break.costs' | translate }}:</div>
      <mat-chip-list>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/mana.png">{{ enchantment.spell.manaCost | long }}</mat-chip>
      </mat-chip-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.break.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="break()" cdkFocusInitial>{{ 'kingdom.break.break' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `],
})
export class BreakComponent {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomMana: any = this.store.selectSnapshot(AuthState.getKingdomMana);

  constructor(
    @Inject(MAT_DIALOG_DATA) public enchantment: any,
    private dialogRef: MatDialogRef<BreakComponent>,
    private notificationService: NotificationService,
    private store: Store,
    private loadingService: LoadingService,
    private apiService: ApiService,
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  async break() {
    if (this.enchantment.spell.manaCost <= this.kingdomMana.quantity) {
      this.loadingService.startLoading();
      try {
        const broken = await this.apiService.breakEnchantment(this.uid, this.enchantment.fid);
        this.notificationService.success('kingdom.break.success');
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.break.error');
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.error('kingdom.break.error');
    }
  }

}
