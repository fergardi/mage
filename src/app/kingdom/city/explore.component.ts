import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-explore',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.explore.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.explore.help' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="(land$ | async)?.quantity | long" matBadgePosition="above before">
            <img mat-list-avatar src="/assets/images/resources/land.png">
          </div>
          <div mat-line>{{ 'resource.land.name' | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ 'resource.land.description' | translate }}</div>
          <div mat-list-avatar matBadge="?" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.turn.name' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'resource.turn.name' | translate }}" matInput formControlName="turns">
          <mat-hint>{{ 'kingdom.explore.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.explore.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.explore.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="explore()" cdkFocusInitial>{{ 'kingdom.explore.explore' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class ExploreComponent implements OnInit {

  form: FormGroup = null;
  kingdomTurn: any = this.store.selectSnapshot(AuthState.getKingdomTurn);
  uid = this.store.selectSnapshot(AuthState.getUserUID);
  @Select((state: any) => state.auth.supplies.find((supply: any) => supply.id === 'land')) land$: Observable<any>;
  @Select((state: any) => state.auth.supplies.find((supply: any) => supply.id === 'turn')) turn$: Observable<any>;

  constructor(
    private dialogRef: MatDialogRef<ExploreComponent>,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      turns: [null, [Validators.required, Validators.min(1), Validators.max(this.kingdomTurn.quantity)]],
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  async explore() {
    if (this.form.valid && this.form.value.turns <= this.kingdomTurn.quantity) {
      try {
        let explored = await this.apiService.exploreLand(this.uid, this.form.value.turns);
        this.notificationService.success('kingdom.explore.success', explored);
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.explore.error');
      }
    } else {
      this.notificationService.error('kingdom.explore.error');
    }
  }

}
