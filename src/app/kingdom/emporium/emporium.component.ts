import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { CacheService } from 'src/app/services/cache.service';

@Component({
  selector: 'app-emporium',
  templateUrl: './emporium.component.html',
  styleUrls: ['./emporium.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
export class EmporiumComponent implements OnInit {

  uid: string = null;
  emporiumArtifacts: any[] = [];
  emporiumPacks: any[] = [];

  constructor(
    private cacheService: CacheService,
  ) {}

  async ngOnInit() {
    let items = await this.cacheService.getItems();
    this.emporiumArtifacts = items.filter(item => item.emporium > 0);
    let packs = await this.cacheService.getPacks();
    this.emporiumPacks = packs;
  }

}
