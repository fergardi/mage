import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';

@Component({
  selector: 'app-build',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.build.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.build.description' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="building.quantity" matBadgePosition="above before">
            <img mat-list-avatar [src]="building.join.image">
          </div>
          <div mat-line>{{ building.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="building.join.description | translate | icon:building.join.skills:building.join.categories:building.join.families:building.join.units:building.join.resources:building.join.spells"></div>
          <div mat-list-avatar [matBadge]="building.join.turns" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.land.name' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'resource.land.name' | translate }}" matInput formControlName="quantity">
          <mat-hint>{{ 'kingdom.build.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.build.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.build.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="build()" cdkFocusInitial>{{ 'kingdom.build.build' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class BuildComponent implements OnInit {

  form: FormGroup = null;
  kingdomTurn: any = this.store.selectSnapshot(AuthState.getKingdomTurn);
  kingdomGold: any = this.store.selectSnapshot(AuthState.getKingdomGold);
  kingdomLand: any = this.store.selectSnapshot(AuthState.getKingdomLand);
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);

  constructor(
    @Inject(MAT_DIALOG_DATA) public building: any,
    private dialogRef: MatDialogRef<BuildComponent>,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      quantity: [null, [Validators.required, Validators.min(1), Validators.max(this.kingdomLand.quantity)]],
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  async build() {
    if (this.form.valid && this.form.value.quantity <= this.kingdomLand.quantity && (this.form.value.quantity * this.building.join.gold) <= this.kingdomGold.quantity) {
      try {
        let built = await this.apiService.buildStructure(this.uid, this.building.fid, this.form.value.quantity);
        this.notificationService.success('kingdom.build.success', built);
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.build.error');
      }
    } else {
      this.notificationService.error('kingdom.build.error');
    }
  }

}
