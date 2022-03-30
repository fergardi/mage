import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-offer',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.offer.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.offer.description' | translate }}</p>
      <div matSubheader>{{ 'kingdom.offer.god' | translate }}:</div>
      <mat-list dense>
        <mat-list-item class="grey legendary">
          <div mat-list-avatar matBadge="?" matBadgePosition="above before">
            <img mat-list-avatar class="god-avatar" [src]="god.image">
          </div>
          <div mat-line>{{ god.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="god.description | translate | icon:god"></div>
          <div mat-line>
            <mat-progress-bar [value]="god.sacrifice * 100 / (god.gold || god.mana || god.population || god.land || god.turn || god.gem)"></mat-progress-bar>
          </div>
          <div mat-list-avatar [matBadge]="(god.sacrifice | short) + ' / ' + ((god.gold || god.mana || god.population || god.land || god.turn) | short)" matBadgePosition="above after">
            <img mat-list-avatar [src]="god.gold ? '/assets/images/resources/gold.png' : god.mana ? '/assets/images/resources/mana.png' : god.population ? '/assets/images/resources/population.png' : god.land ? '/assets/images/resources/land.png' : god.turn ? '/assets/images/resources/turn.png' : '/assets/images/resources/gem.png'">
          </div>
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
        <mat-chip color="primary" selected><img class="icon" [src]="god.gold ? '/assets/images/resources/gold.png' : god.mana ? '/assets/images/resources/mana.png' : god.population ? '/assets/images/resources/population.png' : god.land ? '/assets/images/resources/land.png' : god.turn ? '/assets/images/resources/turn.png' : '/assets/images/resources/gem.png'">{{ god.increment | long }}</mat-chip>
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
})
export class OfferComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  form: FormGroup = null;
  kingdomTurn: any = this.store.selectSnapshot(AuthState.getKingdomTurn);
  kingdomGold: any = this.store.selectSnapshot(AuthState.getKingdomGold);
  kingdomMana: any = this.store.selectSnapshot(AuthState.getKingdomMana);
  kingdomPopulation: any = this.store.selectSnapshot(AuthState.getKingdomPopulation);
  kingdomLand: any = this.store.selectSnapshot(AuthState.getKingdomLand);
  kingdomGem: any = this.store.selectSnapshot(AuthState.getKingdomGem);
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public god: any,
    private dialogRef: MatDialogRef<OfferComponent>,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
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
            : this.god.turn
              ? this.kingdomTurn.quantity
              : this.kingdomGem.quantity;
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
