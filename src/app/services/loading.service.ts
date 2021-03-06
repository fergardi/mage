import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class LoadingService {

  public loading: boolean = false; // spinner

  constructor() { }

  startLoading(): void {
    this.loading = true;
  }

  stopLoading(): void {
    this.loading = false;
  }

}
