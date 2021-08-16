import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-plant',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.plant.name' | translate }}</h1>
    <div mat-dialog-content>
      <p [innerHTML]="'kingdom.plant.help' | translate | icon"></p>
      <div matSubheader>{{ 'kingdom.plant.costs' | translate }}:</div>
      <mat-list dense>
        <mat-list-item class="grey common">
          <div mat-list-avatar [matBadge]="tree.gems" matBadgePosition="above before">
            <img mat-list-avatar src="/assets/images/resources/gem.png">
          </div>
          <div mat-line>{{ 'resource.gem.name' | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="'resource.gem.description' | translate"></div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.plant.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="tree.gems > kingdomGem.quantity" (click)="plant()" cdkFocusInitial>{{ 'kingdom.plant.plant' | translate }}</button>
    </div>
  `,
  styles: [
  ]
})
export class PlantComponent {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomGem: any = this.store.selectSnapshot(AuthState.getKingdomGem);

  constructor(
    @Inject(MAT_DIALOG_DATA) public tree: any,
    private dialogRef: MatDialogRef<PlantComponent>,
    private store: Store,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
  ) { }

  close(reset: boolean = false): void {
    this.dialogRef.close(reset);
  }

  async plant(): Promise<void> {
    if (this.tree.gems <= this.kingdomGem.quantity) {
      this.loadingService.startLoading();
      try {
        const planted = await this.apiService.plantTree(this.uid, this.tree.branches, this.tree.gems);
        this.notificationService.success('kingdom.tree.success', planted);
        this.close(true);
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.tree.error');
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.error('kingdom.tree.error');
    }
  }

}
