import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';
import { Observable } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { Building, Supply } from 'src/app/shared/type/interface.model';

@Component({
  selector: 'app-charge',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.charge.name' | translate }}</h1>
    <div mat-dialog-content>
      <p [innerHTML]="'kingdom.charge.help' | translate | icon"></p>
      <div matSubheader>{{ 'kingdom.charge.source' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="(node$ | async)?.structure.faction.id">
          <div mat-list-avatar [matBadge]="(node$ | async)?.quantity | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="(node$ | async)?.structure.image">
          </div>
          <div mat-line>{{ (node$ | async)?.structure.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="(node$ | async)?.structure.description | translate | icon:(node$ | async)?.structure"></div>
          <div mat-list-avatar matBadge="?" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.charge.quantity' | translate }}:</div>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.turn.name' | translate }}</mat-label>
          <input currencyMask placeholder="{{ 'resource.turn.name' | translate }}" matInput formControlName="turns">
          <mat-hint>{{ 'kingdom.charge.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.charge.invalid' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.charge.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="charge()">{{ 'kingdom.charge.charge' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `],
})
export class ChargeComponent implements OnInit {

  form: FormGroup = null;
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomTurn: Supply = this.store.selectSnapshot(AuthState.getKingdomTurn);

  constructor(
    @Inject(MAT_DIALOG_DATA) public node$: Observable<Building>,
    private dialogRef: MatDialogRef<ChargeComponent>,
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

  async charge(): Promise<void> {
    if (this.form.valid && this.form.value.turns <= this.kingdomTurn.quantity) {
      try {
        this.loadingService.startLoading();
        const charged = await this.apiService.chargeMana(this.uid, this.form.value.turns);
        this.notificationService.success('kingdom.charge.success', charged);
        this.close();
      } catch (error) {
        this.notificationService.error('kingdom.charge.error', error as Error);
      } finally {
        this.loadingService.stopLoading();
      }
    } else {
      this.notificationService.error('kingdom.charge.error');
    }
  }

}
