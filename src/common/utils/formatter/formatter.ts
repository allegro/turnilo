import * as numeral from 'numeral';

export interface Formatter {
  (n: number): string;
}

var scales: Lookup<Lookup<number>> = {
  'a': {
    '': 1,
    'k': 1e3,
    'm': 1e6,
    'b': 1e9,
    't': 1e12
  },
  'b': {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024,
    'PB': 1024 * 1024 * 1024 * 1024 * 1024,
    'EB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
    'ZB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
    'YB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024
  }
};

export function getMiddleNumber(values: number[]): number {
  var filteredAbsData: number[] = [];
  for (var v of values) {
    if (v === 0 || isNaN(v) || !isFinite(v)) continue;
    filteredAbsData.push(Math.abs(v));
  }

  var n = filteredAbsData.length;
  if (n) {
    filteredAbsData.sort((a, b) => b - a);
    return filteredAbsData[Math.ceil((n - 1) / 2)];
  } else {
    return 0;
  }
}

export function formatterFromData(values: number[], format: string): Formatter {
  var match = format.match(/^(\S*)( ?)([ab])$/);
  if (match) {
    var numberFormat = match[1];
    var space = match[2];
    var formatType = match[3];
    var middle = getMiddleNumber(values);
    var formatMiddle = numeral(middle).format('0 ' + formatType);
    var unit = formatMiddle.split(' ')[1] || '';
    var scale = scales[formatType][unit];
    var append = unit ? space + unit : '';

    return (n: number) => {
      if (isNaN(n) || !isFinite(n)) return '-';
      return numeral(n / scale).format(numberFormat) + append;
    };
  } else {
    return (n: number) => {
      if (isNaN(n) || !isFinite(n)) return '-';
      return numeral(n).format(format);
    };
  }
}
