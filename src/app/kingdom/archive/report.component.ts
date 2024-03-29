import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { Category, Contract, Family, Letter } from 'src/app/shared/type/interface.model';

@Component({
  selector: 'app-report',
  template: `
    <h1 mat-dialog-title>{{ report.subject | translate }}</h1>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.report.from' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="report.from.faction.id">
          <div mat-list-avatar>
            <img mat-list-avatar [src]="report.from.faction.image">
          </div>
          <div mat-line>{{ report.from.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ report.from.faction.name | translate }}</div>
        </mat-list-item>
      </mat-list>
    </div>
    <!-- MESSAGE -->
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.report.message' | translate }}:</div>
      <p>{{ report.message | translate }}</p>
    </div>
    <!-- ESPIONAGE -->
    <div mat-dialog-content *ngIf="report.data && report.data.intel" class="espionage">
      <!-- SUPPLIES -->
      <div matSubheader>{{ 'kingdom.report.resources' | translate }}:</div>
      <mat-list dense>
        <mat-list-item *ngFor="let supply of report.data.intel.supplies" class="common">
          <div mat-list-avatar [matBadge]="supply.quantity | short" matBadgePosition="above before">
            <img mat-list-avatar [src]="supply.resource.image">
          </div>
          <div mat-line>{{ supply.resource.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="supply.resource.description | translate | icon:supply.resource"></div>
        </mat-list-item>
      </mat-list>
      <!-- TROOPS -->
      <div matSubheader>{{ 'kingdom.report.troops' | translate }}:</div>
      <mat-list dense>
        <mat-list-item *ngFor="let troop of report.data.intel.troops" [ngClass]="[troop.unit.faction.id, troop.unit.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="troop.quantity | short" matBadgePosition="above before">
            <img mat-list-avatar [src]="troop.unit.image">
          </div>
          <div mat-line>{{ troop.unit.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">
            <img [title]="family.name | translate" class="icon" *ngFor="let family of troop.unit.families" [src]="family.image" [alt]="family.name | translate">
            <img [title]="skill.name | translate" class="icon" *ngFor="let skill of troop.unit.skills" [src]="skill.image" [alt]="skill.name | translate">
            <img [title]="category.name | translate" class="icon" *ngFor="let category of troop.unit.categories" [src]="category.image" [alt]="category.name | translate">
            <img [title]="'category.legendary.name' | translate" class="icon" *ngIf="troop.unit.legendary" src="/assets/images/icons/legendary.png" [alt]="'category.legendary.name' | translate">
          </div>
          <div mat-line class="mat-card-subtitle" *ngIf="troop.unit.resistances && troop.unit.resistances.length">
            <img [title]="('category.resistance.name' | translate) + (category.name | translate)" class="icon grayscale" *ngFor="let category of troop.unit.resistances" [src]="category.image" [alt]="'category.resistance.name' | translate">
          </div>
        </mat-list-item>
      </mat-list>
      <!-- CONTRACTS -->
      <div matSubheader>{{ 'kingdom.report.contracts' | translate }}:</div>
      <mat-list dense>
        <mat-list-item *ngFor="let contract of report.data.intel.contracts" [ngClass]="[contract.hero.faction.id, contract.hero.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="contract.level | short" matBadgePosition="above before">
            <img mat-list-avatar [src]="contract.hero.image">
          </div>
          <div mat-line>{{ contract.hero.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="contract.hero.description | translate | icon:contract.hero"></div>
        </mat-list-item>
      </mat-list>
      <!-- BUILDINGS -->
      <div matSubheader>{{ 'kingdom.report.buildings' | translate }}:</div>
      <mat-list dense>
        <mat-list-item *ngFor="let building of report.data.intel.buildings" class="common">
          <div mat-list-avatar [matBadge]="building.quantity | short" matBadgePosition="above before">
            <img mat-list-avatar [src]="building.structure.image">
          </div>
          <div mat-line>{{ building.structure.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="building.structure.description | translate | icon:building.structure"></div>
        </mat-list-item>
      </mat-list>
    </div>
    <!-- BATTLE -->
    <div mat-dialog-content *ngIf="report.data && report.data.logs">
      <div matSubheader>{{ 'kingdom.report.attacker' | translate }}:<span class="fill-space"></span>{{ 'kingdom.report.defender' | translate }}:</div>
      <mat-list dense>
        <ng-container *ngFor="let log of report.data.logs">
          <!-- ARTIFACTS -->
          <mat-list-item [ngClass]="[log.attackerArtifact.item.faction.id, log.attackerArtifact.item.legendary ? 'legendary' : 'common', 'lefted']" *ngIf="log.attackerArtifact">
            <div mat-list-avatar [matBadge]="1" matBadgePosition="above before">
              <img mat-list-avatar [src]="log.attackerArtifact.item.image">
            </div>
            <div mat-line>{{ log.attackerArtifact.item.name | translate }}</div>
            <div mat-line class="mat-card-subtitle" [innerHTML]="log.attackerArtifact.item.description | translate | icon:log.attackerArtifact.item"></div>
            <mat-icon>{{ log.success ? 'check' : 'block' }}</mat-icon>
          </mat-list-item>
          <mat-list-item [ngClass]="[log.defenderArtifact.item.faction.id, log.defenderArtifact.item.legendary ? 'legendary' : 'common', 'righted']" *ngIf="log.defenderArtifact">
            <div mat-list-avatar [matBadge]="log.defenderArtifact.level | short" matBadgePosition="above after">
              <img mat-list-avatar [src]="log.defenderArtifact.item.image">
            </div>
            <div mat-line>{{ log.defenderArtifact.item.name | translate }}</div>
            <div mat-line class="mat-card-subtitle" [innerHTML]="log.defenderArtifact.item.description | translate | icon:log.defenderArtifact.item"></div>
            <mat-icon>{{ log.success ? 'check' : 'block' }}</mat-icon>
          </mat-list-item>
          <!-- CHARMS -->
          <mat-list-item [ngClass]="[log.attackerCharm.spell.faction.id, log.attackerCharm.spell.legendary ? 'legendary' : 'common', 'lefted']" *ngIf="log.attackerCharm">
            <div mat-list-avatar [matBadge]="1" matBadgePosition="above before">
              <img mat-list-avatar [src]="log.attackerCharm.spell.image">
            </div>
            <div mat-line>{{ log.attackerCharm.spell.name | translate }}</div>
            <div mat-line class="mat-card-subtitle" [innerHTML]="log.attackerCharm.spell.description | translate | icon:log.attackerCharm.spell"></div>
            <mat-icon>{{ log.success ? 'check' : 'block' }}</mat-icon>
          </mat-list-item>
          <mat-list-item [ngClass]="[log.defenderCharm.spell.faction.id, log.defenderCharm.spell.legendary ? 'legendary' : 'common', 'righted']" *ngIf="log.defenderCharm">
            <div mat-list-avatar [matBadge]="log.defenderCharm.level | short" matBadgePosition="above after">
              <img mat-list-avatar [src]="log.defenderCharm.spell.image">
            </div>
            <div mat-line>{{ log.defenderCharm.spell.name | translate }}</div>
            <div mat-line class="mat-card-subtitle" [innerHTML]="log.defenderCharm.spell.description | translate | icon:log.defenderCharm.spell"></div>
            <mat-icon>{{ log.success ? 'check' : 'block' }}</mat-icon>
          </mat-list-item>
          <!-- CONTRACTS -->
          <mat-list-item [ngClass]="[log.attackerContract.hero.faction.id, log.attackerContract.hero.legendary ? 'legendary' : 'common', 'lefted']" *ngIf="log.attackerContract">
            <div mat-list-avatar [matBadge]="log.attackerContract.level | short" matBadgePosition="above before">
              <img mat-list-avatar [src]="log.attackerContract.hero.image">
            </div>
            <div mat-line>{{ log.attackerContract.hero.name | translate }}</div>
            <div mat-line class="mat-card-subtitle" *ngIf="!log.attackerContract.hero.battle" [innerHTML]="log.defenderContract.hero.description | translate | icon:log.defenderContract.hero"></div>
            <div mat-line class="mat-card-subtitle" *ngIf="log.attackerContract.hero.battle && log.attackerContract.hero.self" [innerHTML]="'kingdom.report.bonus' | translate:{ family: this.getFamilies(log.attackerContract), attack: log.attackerContract.hero.attackBonus * log.attackerContract.level, defense: log.attackerContract.hero.defenseBonus * log.attackerContract.level, healths: log.attackerContract.hero.healthBonus * log.attackerContract.level } | icon:log.attackerContract.hero"></div>
            <div mat-line class="mat-card-subtitle" *ngIf="log.attackerContract.hero.battle && !log.attackerContract.hero.self" [innerHTML]="'kingdom.report.damage' | translate:{ category: this.getCategories(log.attackerContract), damage: log.attackerContract.hero.attack * log.attackerContract.level, casualties: log.totalCasualties | long } | icon:log.attackerContract.hero"></div>
            <mat-icon>{{ log.attackerContract.hero.battle ? 'star' : 'star_border' }}</mat-icon>
          </mat-list-item>
          <mat-list-item [ngClass]="[log.defenderContract.hero.faction.id, log.defenderContract.hero.legendary ? 'legendary' : 'common', 'righted']" *ngIf="log.defenderContract">
            <div mat-list-avatar [matBadge]="log.defenderContract.level | short" matBadgePosition="above after">
              <img mat-list-avatar [src]="log.defenderContract.hero.image">
            </div>
            <div mat-line>{{ log.defenderContract.hero.name | translate }}</div>
            <div mat-line class="mat-card-subtitle" *ngIf="!log.defenderContract.hero.battle" [innerHTML]="log.defenderContract.hero.description | translate | icon:log.defenderContract.hero"></div>
            <div mat-line class="mat-card-subtitle" *ngIf="log.defenderContract.hero.battle && log.defenderContract.hero.self" [innerHTML]="'kingdom.report.bonus' | translate:{ family: this.getFamilies(log.defenderContract), attack: (log.defenderContract.hero.attackBonus * log.defenderContract.level) | long, defense: log.defenderContract.hero.defenseBonus * log.defenderContract.level, health: log.defenderContract.hero.healthBonus * log.defenderContract.level } | icon:log.defenderContract.hero"></div>
            <div mat-line class="mat-card-subtitle" *ngIf="log.defenderContract.hero.battle && !log.defenderContract.hero.self" [innerHTML]="'kingdom.report.damage' | translate:{ category: this.getCategories(log.defenderContract), damage: (log.defenderContract.hero.attack * log.defenderContract.level) | long, casualties: log.totalCasualties | long } | icon:log.defenderContract.hero"></div>
            <mat-icon>{{ log.defenderContract.hero.battle ? 'star' : 'star_border' }}</mat-icon>
          </mat-list-item>
          <!-- TROOPS -->
          <ng-container *ngIf="log.attackerTroop && log.defenderTroop">
            <ng-container *ngIf="log.direction === 'attacker-vs-defender'">
              <mat-list-item [ngClass]="[log.attackerTroop.unit.faction.id, log.attackerTroop.unit.legendary ? 'legendary' : 'common', 'lefted']">
                <div mat-list-avatar [matBadge]="(log.attackerTroop.quantity | long) + ' / ' + (log.attackerQuantity | long)" matBadgePosition="above before">
                  <img mat-list-avatar [src]="log.attackerTroop.unit.image">
                </div>
                <div mat-line>{{ log.attackerTroop.unit.name | translate }}</div>
                <div mat-line class="mat-card-subtitle" [innerHTML]="'kingdom.report.attack' | translate:{ category: '<'+log.attackerCategory.id+'>', quantity: log.attackerQuantity | long, initiative: log.attackerTroop.unit.initiativeWave, attack: (log.attackerTroop.unit.attackWave * log.attackerQuantity) | long, defense: (log.defenderTroop.unit.defenseWave * log.defenderQuantity) | long, health: (log.defenderTroop.unit.healthWave * log.defenderQuantity) | long, casualties: log.defenderCasualties | long } | icon:log.attackerTroop.unit"></div>
                <mat-icon style="transform: rotate(-90deg)">subdirectory_arrow_left</mat-icon>
              </mat-list-item>
              <mat-list-item [ngClass]="[log.defenderTroop.unit.faction.id, log.defenderTroop.unit.legendary ? 'legendary' : 'common', 'righted']">
                <mat-icon style="transform: rotate(90deg)">subdirectory_arrow_left</mat-icon>
                <div mat-line>{{ log.defenderTroop.unit.name | translate }}</div>
                <div mat-line class="mat-card-subtitle" [innerHTML]="'kingdom.report.counterattack' | translate:{ category: '<'+log.defenderCategory.id+'>', quantity: log.defenderTroop.quantity | long, initiative: log.defenderTroop.unit.initiativeWave, attack: (log.defenderTroop.unit.attackWave * log.defenderTroop.quantity) | long, defense: (log.attackerTroop.unit.defenseWave * log.attackerQuantity) | long, health: (log.attackerTroop.unit.healthWave * log.attackerQuantity) | long, casualties: log.attackerCasualties | long } | icon:log.defenderTroop.unit"></div>
                <div mat-list-avatar [matBadge]="(log.defenderTroop.quantity | long) + ' / ' + (log.defenderQuantity | long)" matBadgePosition="above after">
                  <img mat-list-avatar [src]="log.defenderTroop.unit.image">
                </div>
              </mat-list-item>
            </ng-container>
            <ng-container *ngIf="log.direction === 'defender-vs-attacker'">
            <mat-list-item [ngClass]="[log.defenderTroop.unit.faction.id, log.defenderTroop.unit.legendary ? 'legendary' : 'common', 'righted']">
                <div mat-list-avatar [matBadge]="(log.defenderTroop.quantity | long) + ' / ' + (log.defenderQuantity | long)" matBadgePosition="above after">
                  <img mat-list-avatar [src]="log.defenderTroop.unit.image">
                </div>
                <div mat-line>{{ log.defenderTroop.unit.name | translate }}</div>
                <div mat-line class="mat-card-subtitle" [innerHTML]="'kingdom.report.attack' | translate:{ category: '<'+log.defenderCategory.id+'>', quantity: log.defenderQuantity | long, initiative: log.defenderTroop.unit.initiativeWave, attack: (log.defenderTroop.unit.attackWave * log.defenderQuantity) | long, defense: (log.attackerTroop.unit.defenseWave * log.attackerQuantity) | long, health: (log.attackerTroop.unit.healthWave * log.attackerQuantity) | long, casualties: log.attackerCasualties | long } | icon:log.defenderTroop.unit"></div>
                <mat-icon style="transform: rotate(90deg)">subdirectory_arrow_right</mat-icon>
              </mat-list-item>
              <mat-list-item [ngClass]="[log.attackerTroop.unit.faction.id, log.attackerTroop.unit.legendary ? 'legendary' : 'common', 'lefted']">
                <mat-icon style="transform: rotate(-90deg)">subdirectory_arrow_right</mat-icon>
                <div mat-line>{{ log.attackerTroop.unit.name | translate }}</div>
                <div mat-line class="mat-card-subtitle" [innerHTML]="'kingdom.report.counterattack' | translate:{ category: '<'+log.attackerCategory.id+'>', quantity: log.attackerTroop.quantity | long, initiative: log.attackerTroop.unit.initiativeWave, attack: (log.attackerTroop.unit.attackWave * log.attackerTroop.quantity) | long, defense: (log.defenderTroop.unit.defenseWave * log.defenderQuantity) | long, health: (log.defenderTroop.unit.healthWave * log.defenderQuantity) | long, casualties: log.defenderCasualties | long } | icon:log.attackerTroop.unit"></div>
                <div mat-list-avatar [matBadge]="(log.attackerTroop.quantity | long) + ' / ' + (log.attackerQuantity | long)" matBadgePosition="above before">
                  <img mat-list-avatar [src]="log.attackerTroop.unit.image">
                </div>
              </mat-list-item>
            </ng-container>
          </ng-container>
        </ng-container>
      </mat-list>
    </div>
    <!-- ATTACHMENTS -->
    <div mat-dialog-content *ngIf="report.data && report.data.join">
      <div matSubheader>{{ 'kingdom.report.attachment' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="[report.data.join.faction.id, report.data.join.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="(report.data.quantity || report.data.level || report.data.join.level) | short" matBadgePosition="ahove before">
            <img mat-list-avatar [src]="report.data.join.image">
          </div>
          <div mat-line>{{ report.data.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" *ngIf="['spell', 'hero', 'item', 'resource'].includes(report.data.join.type)" [innerHTML]="report.data.join.description | translate | icon:report.data.join"></div>
          <div mat-line class="mat-card-subtitle" *ngIf="['unit'].includes(report.data.join.type)">
            <img [title]="family.name | translate" class="icon" *ngFor="let family of report.data.join.families" [src]="family.image">
            <img [title]="skill.name | translate" class="icon" *ngFor="let skill of report.data.join.skills" [src]="skill.image">
            <img [title]="category.name | translate" class="icon" *ngFor="let category of report.data.join.categories" [src]="category.image">
            <img [title]="'category.legendary.name' | translate" class="icon" *ngIf="report.data.join.legendary" src="/assets/images/icons/legendary.png">
          </div>
          <div mat-line class="mat-card-subtitle" *ngIf="['unit'].includes(report.data.join.type) && report.data.join.categories && report.data.join.categories.length">
            <img [title]="('category.resistance.name' | translate) + (category.name | translate)" class="icon grayscale" *ngFor="let category of report.data.join.resistances" [src]="category.image">
          </div>
          <div mat-list-avatar *ngIf="report.data.gold" [matBadge]="report.data.gold | short" matBadgePosition="ahove after">
            <img mat-list-avatar src="/assets/images/resources/gold.png">
          </div>
          <div mat-list-avatar *ngIf="report.data.gems" [matBadge]="report.data.gems | short" matBadgePosition="ahove after">
            <img mat-list-avatar src="/assets/images/resources/gem.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.report.date' | translate }}:</div>
      <mat-chip-list>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/turn.png">{{ report.timestamp.toMillis() | date:('dateformat.short' | translate) }}</mat-chip>
      </mat-chip-list>
    </div>
    <div mat-dialog-actions>
      <button mat-raised-button color="primary" (click)="close()" cdkFocusInitial>{{ 'kingdom.report.close' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
    p {
      margin: 0;
    }
    ::ng-deep .mat-list-base {
      max-height: none;
    }
    ::ng-deep .mat-dialog-content.espionage {
      max-height: 50vh !important;
    }
    ::ng-deep .mat-list-base .mat-list-item.righted .mat-list-item-content {
      flex-direction: row-reverse !important;
    }
    ::ng-deep .mat-list-base .mat-list-item.righted .mat-list-item-content .mat-list-text {
      text-align: right !important;
    }
    ::ng-deep .mat-list-base .mat-list-item .mat-list-item-content .mat-list-text {
      padding-right: 16px !important;
    }
    ::ng-deep .mat-list-base .mat-list-item .mat-list-item-content .mat-icon {
      margin: 0 16px !important;
    }
    @media screen and (max-width: 960px) {
      ::ng-deep .mat-list-base .mat-list-item .mat-list-item-content .mat-icon {
        margin: 0 !important;
      }
      ::ng-deep .mat-dialog-content.espionage {
        max-height: 35vh !important;
      }
    }
  `],
})
export class ReportComponent implements OnInit {

  uid = this.store.selectSnapshot(AuthState.getUserUID);

  constructor(
    @Inject(MAT_DIALOG_DATA) public report: Letter,
    private dialogRef: MatDialogRef<ReportComponent>,
    private apiService: ApiService,
    private store: Store,
  ) { }

  close() {
    this.dialogRef.close();
  }

  async ngOnInit(): Promise<void> {
    if (!this.report.read) {
      await this.apiService.readLetter(this.uid, this.report.fid);
    }
  }

  getFamilies(contract: Contract): string {
    return contract.hero.families.map((family: Family) => `<${family.id}>`).join(', ');
  }

  getCategories(contract: Contract): string {
    return contract.hero.categories.map((category: Category) => `<${category.id}>`).join(', ');
  }

}
