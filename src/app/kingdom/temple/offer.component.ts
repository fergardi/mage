import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';
import { TranslateService } from '@ngx-translate/core';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-offer',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.offer.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.offer.description' | translate }}</p>
      <div matSubheader>{{ 'kingdom.offer.god' | translate }}:</div>
      <mat-list dense>
        <mat-list-item class="legendary">
          <div mat-list-avatar matBadge="∞" matBadgePosition="above before">
            <img mat-list-avatar class="god-avatar" [src]="god.image">
          </div>
          <div mat-line>{{ god.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ god.description | translate }}</div>
          <div mat-list-avatar *ngIf="god.gold > 0" [matBadge]="(god.sacrifice | short) + ' / ' + (god.gold | short)" matBadgePosition="above after"><img mat-list-avatar src="/assets/images/resources/gold.png"></div>
          <div mat-list-avatar *ngIf="god.mana > 0" [matBadge]="(god.sacrifice | short) + ' / ' + (god.mana | short)" matBadgePosition="above after"><img mat-list-avatar src="/assets/images/resources/mana.png"></div>
          <div mat-list-avatar *ngIf="god.population > 0" [matBadge]="(god.sacrifice | short) + ' / ' + (god.population | short)" matBadgePosition="above after"><img mat-list-avatar src="/assets/images/resources/population.png"></div>
          <div mat-list-avatar *ngIf="god.land > 0" [matBadge]="(god.sacrifice | short) + ' / ' + (god.land | short)" matBadgePosition="above after"><img mat-list-avatar src="/assets/images/resources/land.png"></div>
          <div mat-list-avatar *ngIf="god.turn > 0" [matBadge]="(god.sacrifice | short) + ' / ' + (god.turn | short)" matBadgePosition="above after"><img mat-list-avatar src="/assets/images/resources/turn.png"></div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.offer.quantity' | translate }}:</div>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'kingdom.offer.sacrifice' | translate }}</mat-label>
          <input currencyMask placeholder="{{ 'kingdom.offer.sacrifice' | translate }}" matInput formControlName="sacrifice">
          <mat-hint>{{ 'kingdom.offer.hint' | translate:{ increment: god.increment | long } }}</mat-hint>
          <mat-error>{{ 'kingdom.offer.invalid' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.offer.costs' | translate }}:</div>
      <mat-chip-list>
        <mat-chip color="primary" selected *ngIf="god.gold > 0"><img class="icon" src="/assets/images/resources/gold.png">{{ god.increment | long }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="god.mana > 0"><img class="icon" src="/assets/images/resources/mana.png">{{ god.increment | long }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="god.population > 0"><img class="icon" src="/assets/images/resources/population.png">{{ god.increment | long }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="god.land > 0"><img class="icon" src="/assets/images/resources/land.png">{{ god.increment | long }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="god.turn > 0"><img class="icon" src="/assets/images/resources/turn.png">{{ god.increment | long }}</mat-chip>
      </mat-chip-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.offer.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="offer()">{{ 'kingdom.offer.offer' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
    .god-avatar {
      border-radius: 4px !important;
    }
  `],
  providers: [
    LongPipe,
  ],
})
export class OfferComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  form: FormGroup = null;
  kingdomTurn: any = this.store.selectSnapshot(AuthState.getKingdomTurn);
  kingdomGold: any = this.store.selectSnapshot(AuthState.getKingdomGold);
  kingdomMana: any = this.store.selectSnapshot(AuthState.getKingdomMana);
  kingdomPopulation: any = this.store.selectSnapshot(AuthState.getKingdomPopulation);
  kingdomLand: any = this.store.selectSnapshot(AuthState.getKingdomLand);

  constructor(
    @Inject(MAT_DIALOG_DATA) public god: any,
    private dialogRef: MatDialogRef<OfferComponent>,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
    private translateService: TranslateService,
    private longPipe: LongPipe,
    private loadingService: LoadingService,
  ) { }

  ngOnInit(): void {
    const max = this.god.gold
      ? this.kingdomGold.quantity
      : this.god.mana
        ? this.kingdomMana.quantity
        : this.god.population
          ? this.kingdomPopulation.quantity
          : this.god.land
            ? this.kingdomLand.quantity
            : this.kingdomTurn.quantity;
    this.form = this.formBuilder.group({
      sacrifice: [this.god.increment, [Validators.required, Validators.min(this.god.increment), Validators.max(max)]],
    });
    this.form.markAllAsTouched();
    this.form.get('sacrifice').updateValueAndValidity();
  }

  close(): void {
    this.dialogRef.close();
  }

  async offer() {
    if (this.form.valid) {
      this.loadingService.startLoading();
      try {
        const offered = await this.apiService.offerGod(this.uid, this.god.fid, this.form.value.sacrifice);
        if (offered.hasOwnProperty('hero')) this.notificationService.success('kingdom.temple.hero', offered);
        if (offered.hasOwnProperty('item')) this.notificationService.success('kingdom.temple.item', offered);
        if (offered.hasOwnProperty('enchantment')) this.notificationService.success('kingdom.temple.enchantment', offered);
        if (offered.hasOwnProperty('unit')) this.notificationService.success('kingdom.temple.unit', offered);
        if (offered.hasOwnProperty('gold')) this.notificationService.success('kingdom.temple.gold', offered);
        if (offered.hasOwnProperty('mana')) this.notificationService.success('kingdom.temple.mana', offered);
        if (offered.hasOwnProperty('population')) this.notificationService.success('kingdom.temple.population', offered);
        if (offered.hasOwnProperty('land')) this.notificationService.success('kingdom.temple.land', offered);
        if (offered.hasOwnProperty('spell')) this.notificationService.success('kingdom.temple.spell', offered);
        if (offered.hasOwnProperty('building')) this.notificationService.success('kingdom.temple.building', offered);
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.offer.error');
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.error('kingdom.offer.error');
    }
  }

}
