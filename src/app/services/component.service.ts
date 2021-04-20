import { Injectable, Injector, ApplicationRef, ComponentFactoryResolver, ComponentRef, Type } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';

export interface InjectableHTML {
  html: HTMLDivElement;
  ref: ComponentRef<any>;
}

@Injectable({
  providedIn: 'root',
})
export class ComponentService {

  private componentRef: ComponentRef<any>;

  constructor(
    private injector: Injector,
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef,
  ) { }

  public injectComponent<T>(component: Type<T>, propertySetter?: (type: T) => void): InjectableHTML {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    UntilDestroy()(component);
    this.componentRef = componentFactory.create(this.injector);
    if (propertySetter) propertySetter(this.componentRef.instance);
    this.applicationRef.attachView(this.componentRef.hostView);
    const div = document.createElement('div');
    div.appendChild(this.componentRef.location.nativeElement);
    return {
      html: div,
      ref: this.componentRef,
    };
  }

}
