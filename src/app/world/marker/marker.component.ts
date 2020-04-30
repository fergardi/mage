import { Component } from '@angular/core';

@Component({
  selector: 'app-marker',
  templateUrl: './marker.component.html',
  styleUrls: ['./marker.component.scss']
})
export class MarkerComponent {

  data: any = null;
  animationDelay: number = 0;

  constructor() {
    this.animationDelay = Math.random() + 1;
  }

}
