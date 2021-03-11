import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'legendary',
})
export class LegendaryPipe implements PipeTransform {

  transform(object: any): boolean {
    // return object && object.categories && object.categories.length && object.categories.find((category: any) => category.id === 'legendary') !== undefined;
    return object && object.legendary;
  }

}
