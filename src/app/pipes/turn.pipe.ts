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
      map(time => {
        return calculateTurns(timestamp.toMillis(), time, max, ratio);
      }),
    );
  }

}

export const calculateTurns = (from: any, to: any, max: number, ratio: number): number => {
  const start = moment(from);
  const end = moment(to);
  const minutes = moment.duration(end.diff(start)).asMinutes();
  return max
    ? Math.min(max, Math.floor(minutes / ratio))
    : Math.floor(minutes / ratio);
};
