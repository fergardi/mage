import { Component, ViewEncapsulation } from '@angular/core';
import { TourService } from 'ngx-ui-tour-md-menu';

@Component({
  selector: 'app-tour',
  templateUrl: './tour.component.html',
  styleUrls: ['./tour.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TourComponent {

  constructor(
    public tourService: TourService,
  ) { }

}
