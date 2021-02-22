import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'short',
})
export class ShortPipe implements PipeTransform {

  transform(value: number, decimals: number = 1): unknown {
    if (Number.isNaN(value)) return null;
    if (value < 1000) return value;
    const suffixes = ['K', 'M', 'G', 'T', 'P', 'E'];
    const exp = Math.floor(Math.log(value) / Math.log(1000));
    return (value / Math.pow(1000, exp)).toFixed(decimals) + suffixes[exp - 1];
  }

}
