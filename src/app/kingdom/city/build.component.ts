import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-build',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.build.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.build.description' | translate }}</p>
      <div matSubheader>{{ 'kingdom.build.building' | translate }}:</div>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="building.quantity" matBadgePosition="above before">
            <img mat-list-avatar [src]="building.structure.image">
          </div>
          <div mat-line>{{ building.structure.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="building.structure.description | translate | icon:building.structure"></div>
          <div mat-list-avatar [matBadge]="Math.ceil((kingdomWorkshop.quantity + 1) / building.structure.turnRatio) + ('resource.turn.ratio' | translate)" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.build.quantity' | translate }}:</div>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.land.name' | translate }}</mat-label>
          <input currencyMask placeholder="{{ 'resource.land.name' | translate }}" matInput formControlName="quantity">
          <mat-hint>{{ 'kingdom.build.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.build.invalid' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.build.costs' | translate }}:</div>
      <mat-chip-list>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/gold.png">{{ gold() | long}}</mat-chip>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/land.png">{{ land() | long }}</mat-chip>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/turn.png">{{ turn() | long }}</mat-chip>
      </mat-chip-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.build.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="demolish()">{{ 'kingdom.build.demolish' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="build()">{{ 'kingdom.build.build' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `],
})
export class BuildComponent implements OnInit {

  form: FormGroup = null;
  kingdomTurn: any = this.store.selectSnapshot(AuthState.getKingdomTurn);
  kingdomGold: any = this.store.selectSnapshot(AuthState.getKingdomGold);
  kingdomLand: any = this.store.selectSnapshot(AuthState.getKingdomLand);
  kingdomWorkshop: any = this.store.selectSnapshot(AuthState.getKingdomWorkshop);
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  Math: any = Math;

  constructor(
    @Inject(MAT_DIALOG_DATA) public building: any,
    private dialogRef: MatDialogRef<BuildComponent>,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      quantity: [null, [Validators.required, Validators.min(1), Validators.max(Math.max(this.kingdomTurn.quantity, this.kingdomLand.quantity,  this.kingdomGold.quantity))]],
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  async build() {
    if (this.form.valid && this.land() <= this.kingdomLand.quantity && this.gold() <= this.kingdomGold.quantity && this.turn() <= this.kingdomTurn.quantity) {
      this.loadingService.startLoading();
      try {
        const built = await this.apiService.buildStructure(this.uid, this.building.fid, this.form.value.quantity);
        this.notificationService.success('kingdom.build.built', built);
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.build.error');
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.error('kingdom.build.error');
    }
  }

  async demolish() {
    if (this.form.valid && this.land() <= this.building.quantity) {
      this.loadingService.startLoading();
      try {
        const demolished = await this.apiService.demolishStructure(this.uid, this.building.fid, this.form.value.quantity);
        this.notificationService.success('kingdom.build.demolished', demolished);
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.build.error');
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.error('kingdom.build.error');
    }
  }

  turn() {
    return Math.ceil(this.form.value.quantity / Math.ceil((this.kingdomWorkshop.quantity + 1) / this.building.structure.turnRatio));
  }

  gold() {
    return this.form.value.quantity * this.building.structure.goldCost;
  }

  land() {
    return this.form.value.quantity || 0;
  }

}
