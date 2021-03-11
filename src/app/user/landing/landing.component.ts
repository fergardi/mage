import { Component } from '@angular/core';
import { DomService } from 'src/app/services/dom.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {

  constructor(
    public domService: DomService,
  ) { }

}
