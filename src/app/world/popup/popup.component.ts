import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatDialog } from '@angular/material/dialog';
import { PopupType } from 'src/app/shared/type/common.type';
import { AngularFirestore } from '@angular/fire/firestore';
import { AdventureComponent } from './adventure.component';
import { DealComponent } from './deal.component';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
@UntilDestroy()
export class PopupComponent implements OnInit {

  data: any = null;
  shopContracts: any[] = [];
  shopArtifacts: any[] = [];
  shopTroops: any[] = [];
  kingdomTroops: any[] = [];
  shopCharms: any[] = [];
  questContracts: any[] = [];
  questTroops: any[] = [];
  questArtifacts: any[] = [];
  PopupType: typeof PopupType = PopupType;

  constructor(
    private angularFirestore: AngularFirestore,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    // kingdom
    if (this.data.type === PopupType.KINGDOM) {
      this.angularFirestore.collection<any>(`kingdoms/${this.data.id}/troops`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(troops => {
        this.kingdomTroops = troops;
      });
    }
    // shop
    if (this.data.type === PopupType.SHOP) {
      this.angularFirestore.collection<any>(`shops/${this.data.id}/contracts`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(contracts => {
        this.shopContracts = contracts;
      });
      this.angularFirestore.collection<any>(`shops/${this.data.id}/troops`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(troops => {
        this.shopTroops = troops;
      });
      this.angularFirestore.collection<any>(`shops/${this.data.id}/artifacts`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(artifacts => {
        this.shopArtifacts = artifacts;
      });
      this.angularFirestore.collection<any>(`shops/${this.data.id}/charms`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(charms => {
        this.shopCharms = charms;
      });
    }
    // quest
    if (this.data.type === PopupType.QUEST) {
      this.angularFirestore.collection<any>(`quests/${this.data.id}/troops`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(troops => {
        this.questTroops = troops;
      });
      this.angularFirestore.collection<any>(`quests/${this.data.id}/contracts`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(contracts => {
        this.questContracts = contracts;
      });
      this.angularFirestore.collection<any>(`quests/${this.data.id}/artifacts`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(artifacts => {
        this.questArtifacts = artifacts;
      });
    }
  }

  openDealDialog(deal: any): void {
    deal.join = deal.hero || deal.item || deal.spell || deal.unit;
    const dialogRef = this.dialog.open(DealComponent, {
      panelClass: 'dialog-responsive',
      data: deal,
    });
  }

  openAdventureDialog(adventure: any): void {
    const dialogRef = this.dialog.open(AdventureComponent, {
      panelClass: 'dialog-responsive',
      data: adventure,
    });
  }

}
