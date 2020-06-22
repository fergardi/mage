import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-buy',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.buy.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.buy.help' | translate }}</p>
      <mat-list dense>
        <mat-list-item [ngClass]="{ 'legendary': item | legendary }">
          <div mat-list-avatar [matBadge]="1" matBadgePosition="above before">
            <img mat-list-avatar [src]="item.image">
          </div>
          <div mat-line>{{ item.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="item.description | translate | icon:item"></div>
          <div mat-list-avatar [matBadge]="item.gems | long" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/gem.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.buy.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="item.gems > kingdomGem.quantity" (click)="buy()" cdkFocusInitial>{{ 'kingdom.buy.buy' | translate }}</button>
    </div>
  `,
  styles: [`
  `]
})
export class BuyComponent {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomGem: any = this.store.selectSnapshot(AuthState.getKingdomGem);

  constructor(
    @Inject(MAT_DIALOG_DATA) public item: any,
    private dialogRef: MatDialogRef<BuyComponent>,
    private store: Store,
    private apiService: ApiService,
    private notificationService: NotificationService,
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  async buy() {
    if (this.item.gems <= this.kingdomGem.quantity) {
      try {
        let bought = await this.apiService.buyEmporium(this.uid, this.item.id);
        this.notificationService.success('kingdom.emporium.success');
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.emporium.error');
      }
    } else {
      this.notificationService.error('kingdom.emporium.error');
    }
  }

}
