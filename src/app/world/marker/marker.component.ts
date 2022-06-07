import { Component } from '@angular/core';
import { MarkerType } from 'src/app/shared/type/enum.type';

@Component({
  selector: 'app-marker',
  templateUrl: './marker.component.html',
  styleUrls: ['./marker.component.scss'],
})
export class MarkerComponent {

  data: any = null;
  MarkerType: typeof MarkerType = MarkerType;

}
