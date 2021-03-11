import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { Observable } from 'rxjs';
import { calculateTurns } from 'src/app/pipes/turn.pipe';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-tax',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.tax.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.tax.help' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="(village$ | async)?.quantity | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="(village$ | async)?.join.image">
          </div>
          <div mat-line>{{ (village$ | async)?.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="(village$ | async)?.join.description | translate | icon:(village$ | async)?.join"></div>
          <div mat-list-avatar matBadge="?" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.turn.name' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'resource.turn.name' | translate }}" matInput formControlName="turns">
          <mat-hint>{{ 'kingdom.tax.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.tax.invalid' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.tax.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="tax()">{{ 'kingdom.tax.tax' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class TaxComponent implements OnInit {

  form: FormGroup = null;
  kingdomTurn: any = this.store.selectSnapshot(AuthState.getKingdomTurn);
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  max: number = calculateTurns(this.kingdomTurn.timestamp.seconds * 1000, Date.now(), this.kingdomTurn.join.max, this.kingdomTurn.join.ratio);

  constructor(
    @Inject(MAT_DIALOG_DATA) public village$: Observable<any>,
    private dialogRef: MatDialogRef<TaxComponent>,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      turns: [null, [Validators.required, Validators.min(1), Validators.max(this.max)]],
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  async tax() {
    if (this.form.valid && this.form.value.turns <= this.max) {
      this.loadingService.startLoading();
      try {
        let taxed = await this.apiService.taxGold(this.uid, this.form.value.turns);
        this.notificationService.success('kingdom.tax.success', taxed);
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.tax.error');
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.error('kingdom.tax.error');
    }
  }

}
