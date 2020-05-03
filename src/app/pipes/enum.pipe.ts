import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enum'
})
export class EnumPipe implements PipeTransform {

  transform(value: any): unknown {
    return Object.keys(value).filter(e => !isNaN(+e)).map(object => { return { index: +object, name: value[object] }});
  }

}
