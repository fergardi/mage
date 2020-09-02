import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'turn',
})
export class TurnPipe implements PipeTransform {

  @Select((state: any) => state.auth.clock) clock$: Observable<Date>;

  transform(timestamp: any, max: number, ratio: number): Observable<number> {
    return this.clock$.pipe(
      map((time => {
        const start = moment(timestamp.toMillis());
        const end = moment(time);
        const minutes = moment.duration(end.diff(start)).asMinutes();
        return Math.min(max, Math.floor(minutes / ratio));
      })));
  }

}
