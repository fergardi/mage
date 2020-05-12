import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { CacheService } from 'src/app/services/cache.service';
import { RandomService } from 'src/app/services/random.service';
import { MatDialog } from '@angular/material/dialog';
import { BuyComponent } from './buy.component';

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
    public randomService: RandomService,
    public dialog: MatDialog,
  ) {
    for (let i = 0; i < 100; i++) {
      console.log(this.randomService.kingdom());
    }
  }

  async ngOnInit() {
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
