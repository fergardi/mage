import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { LoadingService } from 'src/app/services/loading.service';

const CLAN_COST = 1000000;

@Component({
  selector: 'app-foundation',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.foundation.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.foundation.description' | translate}}</p>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.foundation.information' | translate }}:</div>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'kingdom.foundation.image' | translate }}</mat-label>
          <mat-select formControlName="image">
            <mat-select-trigger>
              <mat-list dense>
                <mat-list-item class="common">
                  <div mat-list-avatar>
                    <img mat-list-avatar [src]="form.value.image">
                  </div>
                  <div mat-line>{{ form.value.name }}</div>
                  <div mat-line class="mat-card-subtitle">{{ form.value.description }}</div>
                </mat-list-item>
              </mat-list>
            </mat-select-trigger>
            <mat-option *ngFor="let image of images" [value]="image">
              <mat-list dense>
                <mat-list-item class="common">
                  <div mat-list-avatar>
                    <img mat-list-avatar [src]="image">
                  </div>
                  <div mat-line>{{ form.value.name }}</div>
                  <div mat-line class="mat-card-subtitle">{{ form.value.description }}</div>
                </mat-list-item>
              </mat-list>
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>{{ 'kingdom.foundation.rubric' | translate }}</mat-label>
          <input placeholder="{{ 'kingdom.foundation.rubric' | translate }}" matInput formControlName="name">
          <mat-error>{{ 'kingdom.foundation.invalid' | translate }}</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>{{ 'kingdom.foundation.motto' | translate }}</mat-label>
          <textarea placeholder="{{ 'kingdom.foundation.motto' | translate }}" matInput rows="2" formControlName="description"></textarea>
          <mat-error>{{ 'kingdom.foundation.invalid' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.foundation.costs' | translate }}:</div>
      <mat-chip-list>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/gold.png">{{ CLAN_COST | long}}</mat-chip>
      </mat-chip-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.foundation.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="foundation()">{{ 'kingdom.foundation.found' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `],
})
export class FoundationComponent implements OnInit {

  form: FormGroup = null;
  kingdomGold: any = this.store.selectSnapshot(AuthState.getKingdomGold);
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  images: string[] = [];
  CLAN_COST = CLAN_COST;

  constructor(
    private dialogRef: MatDialogRef<FoundationComponent>,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit(): void {
    this.images = [
      '/assets/images/clans/crow.png',
      '/assets/images/clans/axe.png',
      '/assets/images/clans/hat.png',
      '/assets/images/clans/helmet.png',
      '/assets/images/clans/rip.png',
    ];
    this.form = this.formBuilder.group({
      image: [this.images[0], [Validators.required]],
      name: [null, [Validators.required, Validators.maxLength(50)]],
      description: [null, [Validators.required, Validators.maxLength(100)]],
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  async foundation() {
    if (this.form.valid && CLAN_COST <= this.kingdomGold.quantity) {
      this.loadingService.startLoading();
      try {
        const founded = await this.apiService.foundateClan(this.uid, this.form.value.name, this.form.value.description, this.form.value.image);
        this.notificationService.success('kingdom.foundation.success');
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.foundation.error');
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.error('kingdom.foundation.error');
    }
  }

}
