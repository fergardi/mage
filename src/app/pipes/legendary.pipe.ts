import { Pipe, PipeTransform } from '@angular/core';
import { Tome } from '../shared/type/interface.model';

@Pipe({
  name: 'legendary',
})
export class LegendaryPipe implements PipeTransform {

  transform(object: Tome): boolean {
    return object && object.legendary;
  }

}
