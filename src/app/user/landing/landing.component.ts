import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {

  constructor() { }

  parallax($event: Event) {
    let top = ($event.target as HTMLDivElement).scrollTop;
    let layers: Element[] = [...Array.from(document.querySelectorAll("[data-type='parallax']"))];
    for (let layer of layers) {
      let depth = parseFloat((<Element>layer).getAttribute('data-depth'));
      let movement = -(top * depth);
      let translate3d = 'translate3d(0, ' + movement + 'px, 0)';
      layer.setAttribute('style', `['-webkit-transform']: ${translate3d}`);
      layer.setAttribute('style', `['-moz-transform']: ${translate3d}`);
      layer.setAttribute('style', `['-ms-transform']: ${translate3d}`);
      layer.setAttribute('style', `['-o-transform']: ${translate3d}`);
      layer.setAttribute('style', `transform: ${translate3d}`);
    }
  }

}
