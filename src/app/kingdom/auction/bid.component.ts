import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-bid',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.bid.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.bid.help' | translate }}</p>
      <mat-list dense>
        <mat-list-item [ngClass]="[auction.join.faction.id, auction.join.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="(auction.quantity || auction.level) | short" matBadgePosition="above before">
            <img mat-list-avatar [src]="auction.join.image">
          </div>
          <div mat-line>{{ auction.join.name | translate:{name:auction.name} }}</div>
          <div mat-line class="mat-card-subtitle" *ngIf="['artifact', 'contract'].includes(auction.type)" [innerHTML]="auction.join.description | translate | icon:auction.join"></div>
          <div mat-line class="mat-card-subtitle" *ngIf="['troop'].includes(auction.type)">
            <img [title]="family.name | translate" class="icon" *ngFor="let family of auction.join.families" [src]="family.image">
            <img [title]="skill.name | translate" class="icon" *ngFor="let skill of auction.join.skills" [src]="skill.image">
            <img [title]="category.name | translate" class="icon" *ngFor="let category of auction.join.categories" [src]="category.image">
          </div>
          <div mat-line class="mat-card-subtitle" *ngIf="auction.join.resistances && auction.join.resistances.length">
            <img [title]="('category.resistance.name' | translate) + (category.name | translate)" class="icon grayscale" *ngFor="let category of auction.join.resistances" [src]="category.image">
          </div>
          <div mat-list-avatar [matBadge]="auction.gold | long" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/gold.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.gold.name' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'resource.gold.name' | translate }}" matInput formControlName="gold">
          <mat-hint>{{ 'kingdom.bid.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.bid.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.bid.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="bid()">{{ 'kingdom.bid.bid' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `],
})
export class BidComponent implements OnInit {

  form: FormGroup = null;
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomGold: any = this.store.selectSnapshot(AuthState.getKingdomGold);

  constructor(
    @Inject(MAT_DIALOG_DATA) public auction: any,
    private dialogRef: MatDialogRef<BidComponent>,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      gold: [Math.floor(this.auction.gold * 1.10), [Validators.required, Validators.min(Math.floor(this.auction.gold * 1.10)), Validators.max(this.kingdomGold.quantity)]],
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  async bid() {
    if (this.form.valid && this.form.value.gold <= this.kingdomGold.quantity) {
      this.loadingService.startLoading();
      try {
        const bidded = await this.apiService.bidAuction(this.uid, this.auction.fid, this.form.value.gold);
        this.notificationService.success('kingdom.bid.success');
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.bid.error');
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.error('kingdom.bid.error');
    }
  }

}
