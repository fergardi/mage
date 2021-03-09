import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DomService {

  constructor() { }

  public scrollToElement($element: any) {
    $element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  }

  public scrollToTop($element: any = null) {
    if ($element) {
      $element.scroll(0, 0);
    } else {
      window.scroll(0, 0);
    }
  }

}
