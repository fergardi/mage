import { Component, Inject, OnInit } from '@angular/core';
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
      <div matSubheader>{{ 'kingdom.dispel.enchantment' | translate }}:</div>
      <mat-list dense>
        <mat-list-item (click)="dispel()" [ngClass]="[enchantment.spell.faction.id, enchantment.spell.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="enchantment.spell.level" matBadgePosition="above before" [matBadgeColor]="enchantment.from === uid ? 'accent' : 'warn'">
            <img mat-list-avatar [src]="enchantment.spell.image">
          </div>
          <div mat-line>{{ enchantment.spell.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="enchantment.spell.description | translate | icon:enchantment.spell"></div>
          <div mat-line>
            <mat-progress-bar [color]="enchantment.from === uid ? 'accent' : 'warn'" [value]="enchantment.turns * 100 / enchantment.spell.turnDuration"></mat-progress-bar>
          </div>
          <div mat-list-avatar [matBadge]="enchantment.turns" matBadgePosition="above after" [matBadgeColor]="enchantment.from === uid ? 'accent' : 'warn'">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.dispel.costs' | translate }}:</div>
      <mat-chip-list>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/mana.png">{{ 20000 | long }}</mat-chip>
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
export class DispelComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomMana: any = this.store.selectSnapshot(AuthState.getKingdomMana);

  constructor(
    @Inject(MAT_DIALOG_DATA) public enchantment: any,
    private dialogRef: MatDialogRef<DispelComponent>,
    private notificationService: NotificationService,
    private store: Store,
    private loadingService: LoadingService,
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }

  async dispel() {
    if (this.enchantment.spell.manaCost <= this.kingdomMana.quantity) {
      this.loadingService.startLoading();
      try {
        const dispelled = await this.apiService.dispelEnchantment(this.uid, this.enchantment.fid);
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
