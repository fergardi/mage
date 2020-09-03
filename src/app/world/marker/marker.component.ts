import { Component } from '@angular/core';

export enum MarkerType {
  'kingdom', 'shop', 'quest',
}

@Component({
  selector: 'app-marker',
  templateUrl: './marker.component.html',
  styleUrls: ['./marker.component.scss'],
})
export class MarkerComponent {

  data: any = null;
  MarkerType: typeof MarkerType = MarkerType;

  constructor() {
  }

}
