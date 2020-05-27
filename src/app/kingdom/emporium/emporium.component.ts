import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { CacheService } from 'src/app/services/cache.service';
import { MatDialog } from '@angular/material/dialog';
import { BuyComponent } from './buy.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';

@Component({
  selector: 'app-emporium',
  templateUrl: './emporium.component.html',
  styleUrls: ['./emporium.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
export class EmporiumComponent implements OnInit {

  uid: string = null;
  emporiumItems: any[] = [];
  emporiumPacks: any[] = [];

  constructor(
    private cacheService: CacheService,
    private angularFirestore: AngularFirestore,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private store: Store,
  ) { }

  async ngOnInit() {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    let items = await this.cacheService.getItems();
    this.emporiumItems = items.filter((item: any) => item.gems > 0);
    let packs = await this.cacheService.getPacks();
    this.emporiumPacks = packs;
  }

  openBuyDialog(item: any) {
    const dialogRef = this.dialog.open(BuyComponent, {
      panelClass: 'dialog-responsive',
      data: item,
    });
  }

}
