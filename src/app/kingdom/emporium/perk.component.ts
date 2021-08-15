import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-perk',
  template: `
    <ng-container *ngTemplateOutlet="tree; context: { perk: perk, disabled: disabled, points: points }"></ng-container>
    <ng-template #tree let-perk="perk" let-disabled="disabled">
      <div class="perk" [matTooltip]="(perk.name | translate).toUpperCase() + '\n' + (perk.description | translate:bonuses(perk))" matTooltipPosition="below" #tooltip>
        <button mat-fab color="primary" [matBadge]="perk.level + '/' + perk.max" matBadgePosition="before" matBadgeColor="primary" [disabled]="disabled" (click)="increasePerk(perk)">
          <img class="perk-image" [src]="perk.image">
        </button>
      </div>
      <div *ngIf="perk.perks && perk.perks.length" class="perks">
        <ng-container *ngFor="let child of perk.perks">
          <ng-container *ngTemplateOutlet="tree; context: { perk: child, disabled: perk.level <= 0, points: points }"></ng-container>
        </ng-container>
      </div>
    </ng-template>
  `,
  styles: [`
    .perk {
      display: inline-block;
      margin: 10px 5px;
    }
    .perk button {
      transition: all 0.5s ease;
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
export class PerkComponent implements OnInit {

  @Input() perk: any;
  @Input() disabled: boolean;
  @Input() points: number;
  @ViewChildren(MatTooltip) tooltips: QueryList<MatTooltip>;

  ngOnInit(): void {
    if (this.perk.id === 'strategy') {
      // setTimeout(() => this.tooltips[0].show(), 1000);
    }
  }

  increasePerk(perk: any): void {
    if (perk.level < perk.max && this.points > 0) {
      perk.level++;
      this.points--;
    }
    // setTimeout(() => this.tooltip.show(), 0);
  }

  bonuses(perk: any): any {
    return {
      recruitBonus: perk.recruitBonus * perk.level,
      goldBonus: perk.goldBonus * perk.level,
      manaBonus: perk.manaBonus * perk.level,
      populationBonus: perk.populationBonus * perk.level,
      constructionBonus: perk.constructionBonus * perk.level,
      godBonus: perk.godBonus * perk.level,
      landBonus: perk.landBonus * perk.level,
      attackBonus: perk.attackBonus * perk.level,
      defenseBonus: perk.defenseBonus * perk.level,
      healthBonus: perk.healthBonus * perk.level,
      researchBonus: perk.researchBonus * perk.level,
      magicalDefenseBonus: perk.magicalDefenseBonus * perk.level,
      physicalDefenseBonus: perk.physicalDefenseBonus * perk.level,
    };
  }

}
