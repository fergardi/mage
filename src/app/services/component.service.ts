import { Injectable, Injector, ApplicationRef, ComponentFactoryResolver, ComponentRef, Type } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class ComponentService {

  private compRef: ComponentRef<any>;

  constructor(
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    private appRef: ApplicationRef
  ) { }

  public injectComponent<T>(component: Type<T>, propertySetter?: (type: T) => void): HTMLDivElement {

    if (this.compRef) this.compRef.destroy();
    const compFactory = this.resolver.resolveComponentFactory(component);
    this.compRef = compFactory.create(this.injector);
    if (propertySetter) propertySetter(this.compRef.instance);
    this.appRef.attachView(this.compRef.hostView);
    let div = document.createElement('div');
    div.appendChild(this.compRef.location.nativeElement);

    return div;
  }

}
