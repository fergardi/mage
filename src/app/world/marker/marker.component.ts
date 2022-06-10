import { Component } from '@angular/core';
import { MarkerType } from 'src/app/shared/type/enum.type';
import { Marker } from 'src/app/shared/type/interface.model';

@Component({
  selector: 'app-marker',
  templateUrl: './marker.component.html',
  styleUrls: ['./marker.component.scss'],
})
export class MarkerComponent {

  data: Marker = null;
  MarkerType: typeof MarkerType = MarkerType;

}
