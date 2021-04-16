import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatDialog } from '@angular/material/dialog';
import { PopupType } from 'src/app/shared/type/common.type';
import { AngularFirestore } from '@angular/fire/firestore';
import { AdventureComponent } from './adventure.component';
import { DealComponent } from './deal.component';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { MapboxService } from 'src/app/services/mapbox.service';

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
  subscriptions: Subscription[] = [];

  constructor(
    private angularFirestore: AngularFirestore,
    private dialog: MatDialog,
    private store: Store,
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.store.select(AuthState.getWorldPopup).pipe(untilDestroyed(this)).subscribe(async popup => {
      // this cannot be done with untilDestroyed because we need to unsuscribe on popup closed, not on component destruction
      this.kingdomTroops = [];
      this.shopContracts = [];
      this.shopTroops = [];
      this.shopArtifacts = [];
      this.shopCharms = [];
      this.questTroops = [];
      this.questContracts = [];
      this.questArtifacts = [];
      this.subscriptions.forEach((subscription: Subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions = [];
      if (popup && popup === this.data.id) {
        // check refresh
        this.checkRefresh();
        // kingdom
        if (this.data.type === PopupType.KINGDOM) {
          this.subscriptions.push(this.angularFirestore.collection<any>(`kingdoms/${this.data.id}/troops`, ref => ref.where('assignment', '==', 2)).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(troops => {
            this.kingdomTroops = troops;
          }));
        }
        // shop
        if (this.data.type === PopupType.SHOP) {
          this.subscriptions.push(this.angularFirestore.collection<any>(`shops/${this.data.id}/contracts`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(contracts => {
            this.shopContracts = contracts;
          }));
          this.subscriptions.push(this.angularFirestore.collection<any>(`shops/${this.data.id}/troops`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(troops => {
            this.shopTroops = troops;
          }));
          this.subscriptions.push(this.angularFirestore.collection<any>(`shops/${this.data.id}/artifacts`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(artifacts => {
            this.shopArtifacts = artifacts;
          }));
          this.subscriptions.push(this.angularFirestore.collection<any>(`shops/${this.data.id}/charms`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(charms => {
            this.shopCharms = charms;
          }));
        }
        // quest
        if (this.data.type === PopupType.QUEST) {
          this.subscriptions.push(this.angularFirestore.collection<any>(`quests/${this.data.id}/troops`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(troops => {
            this.questTroops = troops;
          }));
          this.subscriptions.push(this.angularFirestore.collection<any>(`quests/${this.data.id}/contracts`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(contracts => {
            this.questContracts = contracts;
          }));
          this.subscriptions.push(this.angularFirestore.collection<any>(`quests/${this.data.id}/artifacts`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(artifacts => {
            this.questArtifacts = artifacts;
          }));
        }
      }
    });
  }

  async checkRefresh() {
    if (this.data.type !== PopupType.KINGDOM && this.data.visited && moment().isAfter(moment(this.data.visited.toMillis()))) {
      try {
        await this.data.type === PopupType.SHOP
          ? this.apiService.addShop(this.data.id, this.data.store.id)
          : this.apiService.addQuest(this.data.id, this.data.location.id);
      } catch (error) {
        console.error(error);
      }
    }
  }

  openDealDialog(deal: any): void {
    deal.join = deal.hero || deal.item || deal.spell || deal.unit;
    const dialogRef = this.dialog.open(DealComponent, {
      panelClass: 'dialog-responsive',
      data: {
        deal: deal,
        shop: this.data,
      },
    });
  }

  openAdventureDialog(adventure: any): void {
    const dialogRef = this.dialog.open(AdventureComponent, {
      panelClass: 'dialog-responsive',
      data: {
        adventure: adventure,
        quest: this.data,
      },
    });
  }

}
