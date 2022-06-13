import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { LoadingService } from 'src/app/services/loading.service';
import { Quest, Reward, Supply } from 'src/app/shared/type/interface.model';

@Component({
  selector: 'app-adventure',
  template: `
    <h1 mat-dialog-title>{{ 'world.adventure.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'world.adventure.description' | translate }}</p>
      <div matSubheader>{{ 'card.list.rewards' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="[data.reward.item.faction.id, data.reward.item.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="data.reward.quantity | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="data.reward.item.image">
          </div>
          <div mat-line>{{ data.reward.item.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="data.reward.item.description | translate | icon:data.reward.item"></div>
          <div mat-list-avatar [matBadge]="data.quest.turns | long" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'world.adventure.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="adventure()" cdkFocusInitial>{{ 'world.adventure.start' | translate }}</button>
    </div>
  `,
  styles: [
  ],
})
export class AdventureComponent implements OnInit {

  kingdomTurn: Supply = this.store.selectSnapshot(AuthState.getKingdomTurn);
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      reward: Reward,
      quest: Quest,
    },
    private dialogRef: MatDialogRef<AdventureComponent>,
    private notificationService: NotificationService,
    private apiService: ApiService,
    private store: Store,
    private loadingService: LoadingService,
  ) { }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }

  async adventure(): Promise<void> {
    if (this.data.quest.turns <= this.kingdomTurn.quantity) {
      try {
        this.loadingService.startLoading();
        await this.apiService.adventureQuest(this.uid, this.data.quest.id);
        this.notificationService.success('world.adventure.success');
        this.close();
      } catch (error) {
        this.notificationService.error('world.adventure.error', error as Error);
      } finally {
        this.loadingService.stopLoading();
      }
    } else {
      this.notificationService.error('world.adventure.error');
    }
  }

}
