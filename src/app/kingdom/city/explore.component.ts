import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Observable } from 'rxjs';
import { Building, Supply } from 'src/app/shared/type/interface.model';

@Component({
  selector: 'app-explore',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.explore.name' | translate }}</h1>
    <div mat-dialog-content>
      <p [innerHTML]="'kingdom.explore.help' | translate | icon"></p>
      <div matSubheader>{{ 'kingdom.explore.discovery' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="(land$ | async).resource.faction.id">
          <div mat-list-avatar [matBadge]="(land$ | async).quantity | long" matBadgePosition="above before">
            <img mat-list-avatar src="/assets/images/resources/land.png">
          </div>
          <div mat-line>{{ 'resource.land.name' | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ 'resource.land.description' | translate }}</div>
          <div mat-list-avatar matBadge="?" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.explore.quantity' | translate }}:</div>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.turn.name' | translate }}</mat-label>
          <input currencyMask placeholder="{{ 'resource.turn.name' | translate }}" matInput formControlName="turns">
          <mat-hint>{{ 'kingdom.explore.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.explore.invalid' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.explore.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="explore()">{{ 'kingdom.explore.explore' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `],
})
export class ExploreComponent implements OnInit {

  form: FormGroup = null;
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomTurn: Supply = this.store.selectSnapshot(AuthState.getKingdomTurn);

  constructor(
    @Inject(MAT_DIALOG_DATA) public land$: Observable<Supply>,
    private dialogRef: MatDialogRef<ExploreComponent>,
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

  async explore(): Promise<void> {
    if (this.form.valid && this.form.value.turns <= this.kingdomTurn.quantity) {
      try {
        this.loadingService.startLoading();
        const explored = await this.apiService.exploreLand(this.uid, this.form.value.turns);
        this.notificationService.success('kingdom.explore.success', explored);
        this.close();
      } catch (error) {
        this.notificationService.error('kingdom.explore.error', error as Error);
      } finally {
        this.loadingService.stopLoading();
      }
    } else {
      this.notificationService.error('kingdom.explore.error');
    }
  }

}
