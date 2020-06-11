import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-tome',
  template: `
    <h1 mat-dialog-title>{{ tome.name | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'type.' + tome.type + '.name'  | translate }}</p>
      <mat-list dense>
        <mat-list-item [ngClass]="{ 'legendary': tome | legendary }">
          <div mat-list-avatar>
            <img mat-list-avatar [src]="tome.image">
          </div>
          <div mat-line>{{ tome.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" *ngIf="['god', 'family', 'skill', 'resource', 'category'].includes(tome.type)">{{ tome.description | translate }}</div>
          <div mat-line class="mat-card-subtitle" *ngIf="['sorcery', 'enchantment', 'instant', 'summon', 'structure', 'location', 'hero', 'item'].includes(tome.type)" [innerHTML]="tome.description | translate | icon:tome.skills:tome.categories:tome.families:tome.units:tome.resources:tome.spells:tome.adjacents:tome.opposites"></div>
          <div mat-line class="mat-card-subtitle" *ngIf="['unit'].includes(tome.type)">
            <img [title]="family.name | translate" class="icon" *ngFor="let family of tome.families" [src]="family.image">
            <img [title]="skill.name | translate" class="icon" *ngFor="let skill of tome.skills" [src]="skill.image">
            <img [title]="category.name | translate" class="icon" *ngFor="let category of tome.categories" [src]="category.image">
          </div>
          <div mat-list-avatar *ngIf="tome.join">
            <img mat-list-avatar [src]="tome.join.image">
          </div>
        </mat-list-item>
      </mat-list>
      <mat-chip-list class="attributes" *ngIf="['unit'].includes(tome.type)">
        <mat-chip color="primary" selected *ngFor="let family of tome.families"><img class="icon" [src]="family.image">{{ family.name | translate }}</mat-chip>
        <mat-chip color="primary" selected *ngFor="let skill of tome.skills"><img class="icon" [src]="skill.image">{{ skill.name | translate }}</mat-chip>
        <mat-chip color="primary" selected *ngFor="let category of tome.categories" [ngClass]="{ 'legendary' : category.id === 'legendary' }"><img class="icon" [src]="category.image">{{ category.name | translate }}</mat-chip>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/gold.png">{{ 'user.tome.goldCost' | translate:{ quantity: 12345 | long } }}</mat-chip>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/gold.png">{{ 'user.tome.goldMaintenance' | translate:{ quantity: 12345 | long } }}</mat-chip>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/gold.png">{{ 'user.tome.goldProduction' | translate:{ quantity: 12345 | long } }}</mat-chip>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/gold.png">{{ 'user.tome.goldCapacity' | translate:{ quantity: 12345 | long } }}</mat-chip>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/mana.png">{{ 'user.tome.manaCost' | translate:{ quantity: 12345 | long } }}</mat-chip>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/mana.png">{{ 'user.tome.manaMaintenance' | translate:{ quantity: 12345 | long } }}</mat-chip>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/mana.png">{{ 'user.tome.manaProduction' | translate:{ quantity: 12345 | long } }}</mat-chip>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/mana.png">{{ 'user.tome.manaCapacity' | translate:{ quantity: 12345 | long } }}</mat-chip>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/population.png">{{ 'user.tome.populationCost' | translate:{ quantity: 12345 | long } }}</mat-chip>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/population.png">{{ 'user.tome.populationMaintenance' | translate:{ quantity: 12345 | long } }}</mat-chip>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/population.png">{{ 'user.tome.populationProduction' | translate:{ quantity: 12345 | long } }}</mat-chip>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/population.png">{{ 'user.tome.populationCapacity' | translate:{ quantity: 12345 | long } }}</mat-chip>
      </mat-chip-list>
    </div>
    <div mat-dialog-actions>
      <button mat-raised-button color="primary" (click)="close()" cdkFocusInitial>{{ 'user.tome.close' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-dialog-content + .mat-dialog-content {
      margin-top: 10px;
    }
    ::ng-deep .mat-chip-list-wrapper {
      margin: 0 !important;
    }
    .attributes {
      margin-top: 10px;
      display: block;
    }
  `]
})
export class TomeComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public tome: any,
    private dialogRef: MatDialogRef<TomeComponent>,
  ) { }

  close(): void {
    this.dialogRef.close();
  }

}
