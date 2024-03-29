import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { Observable } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { Building, Supply } from 'src/app/shared/type/interface.model';

@Component({
  selector: 'app-tax',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.tax.name' | translate }}</h1>
    <div mat-dialog-content>
      <p [innerHTML]="'kingdom.tax.help' | translate | icon"></p>
      <div matSubheader>{{ 'kingdom.tax.source' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="(village$ | async)?.structure.faction.id">
          <div mat-list-avatar [matBadge]="(village$ | async)?.quantity | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="(village$ | async)?.structure.image">
          </div>
          <div mat-line>{{ (village$ | async)?.structure.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="(village$ | async)?.structure.description | translate | icon:(village$ | async)?.structure"></div>
          <div mat-list-avatar matBadge="?" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.tax.quantity' | translate }}:</div>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.turn.name' | translate }}</mat-label>
          <input currencyMask placeholder="{{ 'resource.turn.name' | translate }}" matInput formControlName="turns">
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
  `],
})
export class TaxComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomTurn: Supply = this.store.selectSnapshot(AuthState.getKingdomTurn);
  form: FormGroup = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public village$: Observable<Building>,
    private dialogRef: MatDialogRef<TaxComponent>,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      turns: [null, [Validators.required, Validators.min(1), Validators.max(this.kingdomTurn.quantity)]],
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  async tax(): Promise<void> {
    if (this.form.valid && this.form.value.turns <= this.kingdomTurn.quantity) {
      try {
        this.loadingService.startLoading();
        const taxed = await this.apiService.taxGold(this.uid, this.form.value.turns);
        this.notificationService.success('kingdom.tax.success', taxed);
        this.close();
      } catch (error) {
        this.notificationService.error('kingdom.tax.error', error as Error);
      } finally {
        this.loadingService.stopLoading();
      }
    } else {
      this.notificationService.error('kingdom.tax.error');
    }
  }

}
