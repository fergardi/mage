import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';
import { TranslateService } from '@ngx-translate/core';
import { LongPipe } from 'src/app/pipes/long.pipe';

@Component({
  selector: 'app-offer',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.offer.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.offer.description' | translate }}</p>
      <mat-list dense>
        <mat-list-item class="legendary">
          <div mat-list-avatar matBadge="∞" matBadgePosition="above before">
            <img mat-list-avatar [src]="god.image">
          </div>
          <div mat-line>{{ god.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ god.description | translate }}</div>
          <div mat-list-avatar *ngIf="god.gold > 0" [matBadge]="(god.sacrifice | long) + ' / ' + (god.gold | long)" matBadgePosition="above after"><img mat-list-avatar src="/assets/images/resources/gold.png"></div>
          <div mat-list-avatar *ngIf="god.mana > 0" [matBadge]="(god.sacrifice | long) + ' / ' + (god.mana | long)" matBadgePosition="above after"><img mat-list-avatar src="/assets/images/resources/mana.png"></div>
          <div mat-list-avatar *ngIf="god.population > 0" [matBadge]="(god.sacrifice | long) + ' / ' + (god.population | long)" matBadgePosition="above after"><img mat-list-avatar src="/assets/images/resources/population.png"></div>
          <div mat-list-avatar *ngIf="god.land > 0" [matBadge]="(god.sacrifice | long) + ' / ' + (god.land | long)" matBadgePosition="above after"><img mat-list-avatar src="/assets/images/resources/land.png"></div>
          <div mat-list-avatar *ngIf="god.turn > 0" [matBadge]="(god.sacrifice | long) + ' / ' + (god.turn | long)" matBadgePosition="above after"><img mat-list-avatar src="/assets/images/resources/turn.png"></div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'kingdom.offer.sacrifice' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'kingdom.offer.sacrifice' | translate }}" matInput formControlName="sacrifice" autocomplete="off">
          <mat-hint>{{ 'kingdom.offer.hint' | translate:{ increment: god.increment | long } }}</mat-hint>
          <mat-error>{{ 'kingdom.offer.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.offer.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="offer()" cdkFocusInitial>{{ 'kingdom.offer.offer' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `],
  providers: [
    LongPipe
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
  ) { }

  ngOnInit() {
    let max = this.god.gold
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
      try {
        let offered = await this.apiService.offerGod(this.uid, this.god.fid, this.form.value.sacrifice);
        if (offered.hasOwnProperty('hero')) this.notificationService.success('kingdom.temple.hero', { hero: this.translateService.instant(offered['hero']), level: this.longPipe.transform(offered['level']) });
        if (offered.hasOwnProperty('item')) this.notificationService.success('kingdom.temple.item', { item: this.translateService.instant(offered['item']) });
        if (offered.hasOwnProperty('enchantment')) this.notificationService.success('kingdom.temple.enchantment', { enchantment: this.translateService.instant(offered['enchantment']), turns: this.longPipe.transform(offered['turns']) });
        if (offered.hasOwnProperty('unit')) this.notificationService.success('kingdom.temple.unit', { unit: this.translateService.instant(offered['unit']), quantity: this.longPipe.transform(offered['quantity']) });
        if (offered.hasOwnProperty('gold')) this.notificationService.success('kingdom.temple.gold', { gold: this.longPipe.transform(offered['gold']) });
        if (offered.hasOwnProperty('mana')) this.notificationService.success('kingdom.temple.mana', { mana: this.longPipe.transform(offered['mana']) });
        if (offered.hasOwnProperty('population')) this.notificationService.success('kingdom.temple.population', { population: this.longPipe.transform(offered['population']) });
        if (offered.hasOwnProperty('land')) this.notificationService.success('kingdom.temple.land', { land: this.longPipe.transform(offered['land']) });
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.offer.error');
      }
    } else {
      this.notificationService.error('kingdom.offer.error');
    }
  }

}
