import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { CacheService } from 'src/app/services/cache.service';
import { MatDialog } from '@angular/material/dialog';
import { BuyComponent } from './buy.component';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';

@Component({
  selector: 'app-emporium',
  templateUrl: './emporium.component.html',
  styleUrls: ['./emporium.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
// @UntilDestroy()
export class EmporiumComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  emporiumItems: any[] = [];
  emporiumPacks: any[] = [];

  constructor(
    private cacheService: CacheService,
    private dialog: MatDialog,
    private store: Store,
  ) { }

  async ngOnInit(): Promise<void> {
    const items = await this.cacheService.getItems();
    this.emporiumItems = items.filter((item: any) => item.gems > 0);
    const packs = await this.cacheService.getPacks();
    this.emporiumPacks = packs.sort((a, b) => a.quantity - b.quantity);
  }

  openBuyDialog(item: any): void {
    const dialogRef = this.dialog.open(BuyComponent, {
      panelClass: 'dialog-responsive',
      data: item,
    });
  }

}
