import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-recruit',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.recruit.name' | translate }}</h1>
    <div mat-dialog-content>
      <p [innerHTML]="'kingdom.recruit.help' | translate | icon"></p>
      <div matSubheader>{{ 'kingdom.recruit.troop' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="[unit.faction.id, unit.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar matBadge="?" matBadgePosition="above before">
            <img mat-list-avatar [src]="unit.image">
          </div>
          <div mat-line>{{ unit.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">
            <img [title]="family.name | translate" class="icon" *ngFor="let family of unit.families" [src]="family.image">
            <img [title]="skill.name | translate" class="icon" *ngFor="let skill of unit.skills" [src]="skill.image">
            <img [title]="category.name | translate" class="icon" *ngFor="let category of unit.categories" [src]="category.image">
            <img [title]="'category.legendary.name' | translate" class="icon" *ngIf="unit.legendary" src="/assets/images/icons/legendary.png">
          </div>
          <div mat-line class="mat-card-subtitle" *ngIf="unit.resistances && unit.resistances.length">
            <img [title]="('category.resistance.name' | translate) + (category.name | translate)" class="icon grayscale" *ngFor="let category of unit.resistances" [src]="category.image">
          </div>
          <div mat-list-avatar [matBadge]="unit.gold | long" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/gold.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.recruit.platoon' | translate }}:</div>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'kingdom.recruit.quantity' | translate }}</mat-label>
          <input currencyMask placeholder="{{ 'kingdom.recruit.quantity' | translate }}" matInput formControlName="quantity">
          <mat-hint>{{ 'kingdom.recruit.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.recruit.invalid' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.recruit.costs' | translate }}:</div>
      <mat-chip-list>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/gold.png">{{ gold() | long}}</mat-chip>
      </mat-chip-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.recruit.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="recruit()">{{ 'kingdom.recruit.recruit' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `],
})
export class RecruitComponent implements OnInit {

  form: FormGroup = null;
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomGold: any = this.store.selectSnapshot(AuthState.getKingdomGold);

  constructor(
    @Inject(MAT_DIALOG_DATA) public unit: any,
    private dialogRef: MatDialogRef<RecruitComponent>,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      quantity: [null, [Validators.required, Validators.min(1), Validators.max(Math.floor(this.kingdomGold.quantity / this.unit.gold))]],
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  gold(): number {
    return this.form.value.quantity * this.unit.gold;
  }

  async recruit() {
    if (this.form.valid && this.gold() <= this.kingdomGold.quantity) {
      this.loadingService.startLoading();
      try {
        const recruited = await this.apiService.recruitUnit(this.uid, this.unit.id, this.form.value.quantity);
        this.notificationService.success('kingdom.recruit.success', recruited);
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.recruit.error');
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.error('kingdom.recruit.error');
    }
  }

}
