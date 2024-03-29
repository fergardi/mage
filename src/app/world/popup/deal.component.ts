import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Deal, Shop, Supply } from 'src/app/shared/type/interface.model';
import { StoreType } from 'src/app/shared/type/enum.type';

@Component({
  selector: 'app-deal',
  template: `
    <h1 mat-dialog-title>{{ 'world.deal.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'world.deal.description' | translate }}</p>
      <div matSubheader>{{ 'card.list.goods' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="[data.deal.join.faction.id, data.deal.join.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="data.deal.quantity | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="data.deal.join.image">
          </div>
          <div mat-line>{{ data.deal.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" *ngIf="['god', 'family', 'skill', 'resource', 'category'].includes(data.deal.join.type)">{{ data.deal.join.description | translate }}</div>
          <div mat-line class="mat-card-subtitle" *ngIf="['spell', 'structure', 'location', 'hero', 'item'].includes(data.deal.join.type)" [innerHTML]="data.deal.join.description | translate | icon:data.deal.join"></div>
          <div mat-line class="mat-card-subtitle" *ngIf="['unit'].includes(data.deal.join.type)">
            <img [title]="family.name | translate" class="icon" *ngFor="let family of data.deal.join.families" [src]="family.image">
            <img [title]="skill.name | translate" class="icon" *ngFor="let skill of data.deal.join.skills" [src]="skill.image">
            <img [title]="category.name | translate" class="icon" *ngFor="let category of data.deal.join.categories" [src]="category.image">
            <img [title]="'category.legendary.name' | translate" class="icon" *ngIf="data.deal.join.legendary" src="/assets/images/icons/legendary.png">
          </div>
          <div mat-line class="mat-card-subtitle" *ngIf="['unit'].includes(data.deal.join.type) && data.deal.join.categories && data.deal.join.categories.length">
            <img [title]="('category.resistance.name' | translate) + (category.name | translate)" class="icon grayscale" *ngFor="let category of data.deal.join.resistances" [src]="category.image">
          </div>
          <div mat-list-avatar [matBadge]="data.deal.gold | long" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/gold.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'world.deal.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="deal()" cdkFocusInitial>{{ 'world.deal.trade' | translate }}</button>
    </div>
  `,
  styles: [
  ],
})
export class DealComponent {

  kingdomGold: Supply = this.store.selectSnapshot(AuthState.getKingdomGold);
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      deal: Deal,
      shop: Shop,
    },
    private dialogRef: MatDialogRef<DealComponent>,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
    private loadingService: LoadingService,
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  getCollection(type: StoreType): string {
    switch (type) {
      case StoreType.MERCENARY:
        return 'troops';
      case StoreType.INN:
        return 'contracts';
      case StoreType.MERCHANT:
        return 'artifacts';
      case StoreType.SORCERER:
        return 'charms';
    }
  }

  async deal(): Promise<void> {
    if (this.data.deal.gold <= this.kingdomGold.quantity) {
      try {
        this.loadingService.startLoading();
        const collection = this.getCollection(this.data.shop.store.id);
        await this.apiService.tradeDeal(this.uid, this.data.shop.id, collection, this.data.deal.fid);
        this.notificationService.success('world.deal.success');
        this.close();
      } catch (error) {
        this.notificationService.error('world.deal.error', error as Error);
      } finally {
        this.loadingService.stopLoading();
      }
    } else {
      this.notificationService.error('world.deal.error');
    }
  }

}
