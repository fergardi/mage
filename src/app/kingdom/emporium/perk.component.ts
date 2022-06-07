import { Component, Input, ViewChildren, QueryList, Output, EventEmitter } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { Perk } from 'src/app/shared/type/interface.model';

export const PERK_COST: number = 5;

@Component({
  selector: 'app-perk',
  template: `
    <ng-container *ngTemplateOutlet="tree; context: { perk: perk, disabled: disabled }"></ng-container>
    <ng-template #tree let-perk="perk" let-disabled="disabled">
      <div class="perk" [matTooltip]="(perk.name | translate).toUpperCase() + '\n' + (perk.description | translate)" matTooltipPosition="below" #tooltip>
        <button mat-fab color="primary" [matBadge]="perk.level + '/' + perk.max" matBadgePosition="before" matBadgeColor="primary" [disabled]="disabled" (click)="increasePerk(perk)">
          <img class="perk-image" [src]="perk.image">
        </button>
      </div>
      <div *ngIf="perk.perks && perk.perks.length" class="perks">
        <ng-container *ngFor="let child of perk.perks">
          <ng-container *ngTemplateOutlet="tree; context: { perk: child, disabled: perk.level <= 0 }"></ng-container>
        </ng-container>
      </div>
    </ng-template>
  `,
  styles: [`
    .perk {
      display: inline-block;
      margin: 3px;
    }
    .perk button {
      transition: all 0.5s ease;
      width: 50px;
      height: 50px;
    }
    ::ng-deep .mat-fab .mat-button-wrapper {
      padding: 0;
      line-height: 0;
    }
    ::ng-deep .mat-fab .mat-button-wrapper .perk-image {
      width: 100%;
      height: auto;
      border-radius: 50%;
    }
    .perk button:disabled {
      filter: grayscale(100%);
    }
    .perks {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      order: 999;
      justify-content: center;
    }
  `],
})
export class PerkComponent {

  @Input() perk: Perk;
  @Input() disabled: boolean;
  @Output() increasedPerk = new EventEmitter<number>();

  @ViewChildren(MatTooltip) tooltips: QueryList<MatTooltip>;

  increasePerk(perk: Perk): void {
    if (perk.level < perk.max) {
      perk.level++;
      this.increasedPerk.emit(PERK_COST);
    }
  }

}
