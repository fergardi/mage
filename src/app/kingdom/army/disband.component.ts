import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-disband',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.disband.name' | translate }}</h1>
    <div mat-dialog-content>
      <p [innerHTML]="'kingdom.disband.description' | translate | icon"></p>
      <div matSubheader>{{ 'kingdom.disband.troop' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="[troop.unit.faction.id, troop.unit.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="troop.quantity | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="troop.unit.image">
          </div>
          <div mat-line>{{ troop.unit.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">
            <img [title]="family.name | translate" class="icon" *ngFor="let family of troop.unit.families" [src]="family.image">
            <img [title]="skill.name | translate" class="icon" *ngFor="let skill of troop.unit.skills" [src]="skill.image">
            <img [title]="category.name | translate" class="icon" *ngFor="let category of troop.unit.categories" [src]="category.image">
            <img [title]="'category.legendary.name' | translate" class="icon" *ngIf="troop.unit.legendary" src="/assets/images/icons/legendary.png">
          </div>
          <div mat-line class="mat-card-subtitle" *ngIf="troop.unit.resistances && troop.unit.resistances.length">
            <img [title]="('category.resistance.name' | translate) + (category.name | translate)" class="icon grayscale" *ngFor="let category of troop.unit.resistances" [src]="category.image">
          </div>
          <div mat-list-avatar [matBadge]="0" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.disband.platoon' | translate }}:</div>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'kingdom.disband.quantity' | translate }}</mat-label>
          <input currencyMask placeholder="{{ 'kingdom.disband.quantity' | translate }}" matInput formControlName="quantity">
          <mat-hint>{{ 'kingdom.disband.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.disband.invalid' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.disband.maintenances' | translate }}:</div>
      <mat-chip-list>
        <mat-chip color="primary" selected *ngIf="troop.unit.goldMaintenance > 0"><img class="icon" src="/assets/images/resources/gold.png">{{ 'user.tome.goldMaintenance' | translate:{ number: (troop.unit.goldMaintenance * troop.quantity) | long } }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="troop.unit.manaMaintenance > 0"><img class="icon" src="/assets/images/resources/mana.png">{{ 'user.tome.manaMaintenance' | translate:{ number: (troop.unit.manaMaintenance * troop.quantity) | long } }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="troop.unit.populationMaintenance > 0"><img class="icon" src="/assets/images/resources/population.png">{{ 'user.tome.populationMaintenance' | translate:{ number: (troop.unit.populationMaintenance * troop.quantity) | long } }}</mat-chip>
      </mat-chip-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.disband.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || troop.unit.populationMaintenance > 0" (click)="disband()">{{ 'kingdom.disband.disband' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `],
})
export class DisbandComponent implements OnInit {

  form: FormGroup = null;
  uid = this.store.selectSnapshot(AuthState.getUserUID);

  constructor(
    @Inject(MAT_DIALOG_DATA) public troop: any,
    private dialogRef: MatDialogRef<DisbandComponent>,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      quantity: [this.troop.quantity, [Validators.required, Validators.min(1), Validators.max(this.troop.quantity)]],
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  async disband() {
    if (this.form.valid) {
      this.loadingService.startLoading();
      try {
        const disbanded = await this.apiService.disbandTroop(this.uid, this.troop.fid, this.form.value.quantity);
        this.notificationService.success('kingdom.disband.success', disbanded);
        this.close();
      } catch (error) {
        this.notificationService.error('kingdom.disband.error', error as Error);
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.error('kingdom.disband.error');
    }
  }

}
