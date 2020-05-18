import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-disband',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.disband.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.disband.description' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="troop.quantity | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="troop.join.image">
          </div>
          <div mat-line>{{ troop.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">
            <img [title]="family.name | translate" class="icon" *ngFor="let family of troop.join.families" [src]="family.image"/>
            <img [title]="category.name | translate" class="icon" *ngFor="let category of troop.join.categories" [src]="category.image"/>
            <img [title]="skill.name | translate" class="icon" *ngFor="let skill of troop.join.skills" [src]="skill.image"/>
          </div>
          <div mat-list-avatar [matBadge]="0" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'kingdom.disband.quantity' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'kingdom.disband.quantity' | translate }}" matInput formControlName="quantity">
          <mat-hint>{{ 'kingdom.disband.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.disband.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.disband.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="disband()" cdkFocusInitial>{{ 'kingdom.disband.disband' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class DisbandComponent implements OnInit {

  form: FormGroup = null;

  constructor(
    public dialogRef: MatDialogRef<DisbandComponent>,
    @Inject(MAT_DIALOG_DATA) public troop: any,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      quantity: [null, [Validators.required, Validators.min(1), Validators.max(this.troop.quantity)]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  async disband() {
    let uid = this.store.selectSnapshot(AuthState.getUserUID);
    // let kingdomBarrack = this.store.selectSnapshot(AuthState.getKingdomBarrack);
    if (this.form.valid) {
      try {
        let disbanded = await this.apiService.disband(uid, this.troop.fid, this.form.value.quantity);
        this.notificationService.success('kingdom.disband.success');
        this.close();
      } catch (error) {
        console.error(error);
      }
    } else {
      this.notificationService.error('kingdom.disband.error');
    }
  }

}
