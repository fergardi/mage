import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-recruit',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.recruit.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.recruit.help' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar matBadge="?" matBadgePosition="above before">
            <img mat-list-avatar [src]="unit.image">
          </div>
          <div mat-line>{{ unit.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">
            <img [title]="family.name | translate" class="icon" *ngFor="let family of unit.families" [src]="family.image"/>
            <img [title]="category.name | translate" class="icon" *ngFor="let category of unit.categories" [src]="category.image"/>
            <img [title]="skill.name | translate" class="icon" *ngFor="let skill of unit.skills" [src]="skill.image"/>
          </div>
          <div mat-list-avatar [matBadge]="unit.gold | long" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/gold.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'kingdom.recruit.quantity' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'kingdom.recruit.quantity' | translate }}" matInput formControlName="quantity">
          <mat-hint>{{ 'kingdom.recruit.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.recruit.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.recruit.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="recruit()" cdkFocusInitial>{{ 'kingdom.recruit.recruit' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class RecruitComponent implements OnInit {

  form: FormGroup = null;
  kingdomGold: any = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public unit: any,
    private dialogRef: MatDialogRef<RecruitComponent>,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
  ) { }

  ngOnInit() {
    this.kingdomGold = this.store.selectSnapshot(AuthState.getKingdomGold);
    this.form = this.formBuilder.group({
      quantity: [null, [Validators.required, Validators.min(1), Validators.max(Math.floor(this.kingdomGold.quantity / this.unit.gold))]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  async recruit() {
    let uid = this.store.selectSnapshot(AuthState.getUserUID);
    // let kingdomBarrack = this.store.selectSnapshot(AuthState.getKingdomBarrack);
    if (this.form.valid && this.form.value.quantity * this.unit.gold <= this.kingdomGold.quantity) {
      try {
        let recruited = await this.apiService.recruitUnit(uid, this.unit.id, this.form.value.quantity);
        this.notificationService.success('kingdom.recruit.success', recruited);
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.recruit.error');
      }
    } else {
      this.notificationService.error('kingdom.recruit.error');
    }
  }

}
