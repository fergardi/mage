import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-charge',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.charge.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.charge.help' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="node.quantity | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="node.join.image">
          </div>
          <div mat-line>{{ node.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="node.join.description | translate | icon:node.join.skills:node.join.categories:node.join.families:node.join.units:node.join.resources:node.join.spells"></div>
          <div mat-list-avatar matBadge="?" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.turn.name' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'resource.turn.name' | translate }}" matInput formControlName="turns">
          <mat-hint>{{ 'kingdom.charge.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.charge.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.charge.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="charge()" cdkFocusInitial>{{ 'kingdom.charge.charge' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class ChargeComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  form: FormGroup = null;
  kingdomTurn: any = this.store.selectSnapshot(AuthState.getKingdomTurn);

  constructor(
    @Inject(MAT_DIALOG_DATA) public node: any,
    private dialogRef: MatDialogRef<ChargeComponent>,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      turns: [null, [Validators.required, Validators.min(1), Validators.max(this.kingdomTurn.quantity)]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  async charge() {
    if (this.form.valid && this.form.value.turns <= this.kingdomTurn.quantity) {
      try {
        let charged = await this.apiService.chargeMana(this.uid, this.form.value.turns);
        this.notificationService.success('kingdom.charge.success', charged);
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.charge.error');
      }
    } else {
      this.notificationService.error('kingdom.charge.error');
    }
  }

}
