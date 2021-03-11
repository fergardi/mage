import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  public loading: boolean = false;

  constructor() { }

  setLoading(state: boolean) {
    this.loading = state;
  }

  startLoading(): void {
    this.loading = true;
  }

  stopLoading(): void {
    this.loading = false;
  }

}
