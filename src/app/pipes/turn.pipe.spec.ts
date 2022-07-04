import { TurnPipe, calculate } from './turn.pipe';
import { of } from 'rxjs';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';

describe('TurnPipe', () => {
  let pipe: TurnPipe;
  const timestamp = firebase.firestore.Timestamp.now();

  beforeEach(() => {
    pipe = new TurnPipe();
  });

  it('should CREATE the INSTANCE', () => {
    expect(pipe).toBeTruthy();
  });

  it('should TRANSFORM', () => {
    Object.defineProperty(pipe, 'clock$', { writable: true });
    pipe.clock$ = of(new Date());
    (pipe.transform(timestamp, 300, 3) as Observable<number>).subscribe(turns => {
      expect(turns).toBe(0);
    });
  });

  it('should CALCULATE the TURNS since TIMESTAMP', () => {
    const now = moment.now();
    const oneMinuteAgo = moment().subtract(1, 'minute').subtract(1, 'second');
    expect(calculate(oneMinuteAgo, now, 300, 3)).toBe(0);
    const oneHourAgo = moment().subtract(1, 'hour').subtract(1, 'second');
    expect(calculate(oneHourAgo, now, 300, 3)).toBe(20);
    const oneDayAgo = moment().subtract(1, 'day').subtract(1, 'second');
    expect(calculate(oneDayAgo, now, 300, 3)).toBe(300);
    const oneWeekAgo = moment().subtract(1, 'week').subtract(1, 'second');
    expect(calculate(oneWeekAgo, now, 300, 3)).toBe(300);
  });

});
