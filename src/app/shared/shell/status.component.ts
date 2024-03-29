import { Component, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Supply } from '../type/interface.model';

@Component({
  selector: 'app-status',
  template: `
    <mat-list dense class="app-status">
      <div matSubheader>{{ 'card.list.resources' | translate }}:<span class="fill-space"></span>{{ 'card.list.production' | translate }}:</div>
      <ng-container *ngFor="let supply of kingdomSupplies$ | async; let i = index">
        <mat-list-item>
          <div mat-list-avatar
            [matBadge]="supply.max ? (supply.timestamp ? (supply.timestamp | turn:supply.resource.max:supply.resource.ratio | async) : (supply.quantity | short)) + ' / ' + (supply.max | short) : supply.quantity | short"
            matBadgePosition="above before">
            <img mat-list-avatar [src]="supply.resource.image" [alt]="supply.resource.name | translate">
          </div>
          <div mat-line>{{ supply.resource.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ supply.resource.description | translate }}</div>
          <div mat-line *ngIf="supply.max">
            <mat-progress-bar [value]="(supply.timestamp ? (supply.timestamp | turn:supply.resource.max:supply.resource.ratio | async) : supply.quantity) * 100 / supply.max"></mat-progress-bar>
          </div>
          <div mat-list-avatar
            [matBadge]="(supply.balance > 0 ? '+' : '') + (supply.balance | short) + ('resource.turn.ratio' | translate)"
            [matBadgeColor]="supply.balance === 0 ? 'primary' : supply.balance > 0 ? 'accent' : 'warn'"
            matBadgePosition="above after">
            <img mat-list-avatar [src]="supply.resource.status" [alt]="supply.resource.name | translate">
          </div>
        </mat-list-item>
      </ng-container>
    </mat-list>
  `,
  styles: [`
    .app-status.mat-list.mat-list-base {
      max-height: 100%;
    }
    .mat-subheader.center {
      justify-content: center;
    }
  `],
})
export class StatusComponent {

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public kingdomSupplies$: Observable<Array<Supply>>,
  ) { }

}
