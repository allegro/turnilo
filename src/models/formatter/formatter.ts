'use strict';

import { $, Expression } from 'plywood';

interface Template {
  small: number;
  large: number;
  template: number;
}

var onlyZero = /^[0.]+$/;

export class Formatter {

  constructor() {

  }
}

/*
module Facet {
  export module Helper {

    function getScale(n: number, small: boolean): number {
      n = Math.abs(n);
      if (small) {
        if (n < 1e-6) return 1e-9;
        if (n < 1e-3) return 1e-6;
        if (n < 1e-1) return 1e-3;
      }
      if (n < 1e3)  return 1;
      if (n < 1e6)  return 1e3;
      if (n < 1e9)  return 1e6;
      if (n < 1e12) return 1e9;
      if (n < 1e15) return 1e12;
      if (n < 1e18) return 1e15;
      if (n < 1e21) return 1e18;
      if (n < 1e24) return 1e21;
      return 1e24;
    }

    function getUnits(n: number, small: boolean): string {
      n = Math.abs(n);
      if (small) {
        if (n < 1e-6) return "n";
        if (n < 1e-3) return "μ";
        if (n < 1e-1) return "m";
      }
      if (n < 1e3)  return " ";
      if (n < 1e6)  return "k";
      if (n < 1e9)  return "M";
      if (n < 1e12) return "B";
      if (n < 1e15) return "T";
      if (n < 1e18) return "P";
      if (n < 1e21) return "E";
      if (n < 1e24) return "Z";
      return "Y";
    }

    function humanizeNumberWithScale(n: number, precision: number, scale: number, integer: boolean, plus: boolean): string {
      var sign = n < 0 ? "-" : (plus ? "+" : "");
      n = Math.abs(n) / scale;
      var d = 0;
      var out = n.toFixed(d);
      if (!(integer && scale === 1)) {
        var digits = out.length;
        while (digits < precision) {
          out = n.toFixed(++d);
          digits = out.length - 1;
        }
      }

      return sign + out;
    }

    export function humanizeNumber(n: number, precision: number = 3, percent: boolean = false, plus: boolean = false, integer: boolean = false, small: boolean = false): string {
      if (!n) {
        return "0";
      }
      var scale: number;
      var units: string;
      if (percent) {
        scale = 1;
        units = "%";
      } else {
        scale = getScale(n, small);
        units = getUnits(n, small);
      }

      return humanizeNumberWithScale(n, precision, scale, integer, plus) + units;
    }

    function add_separators_to_number(num: string): string {
      var di = num.indexOf(".");
      var pre: string;
      var post: string;
      if (di !== -1) {
        num.substr(0, di);
        post = num.substr(di);
      } else {
        pre = num;
        post = '';
      }
      var parts: string[] = [];
      var n = pre.length;
      var i = n - Math.ceil(n / 3) * 3;
      while (i < n) {
        parts.push(pre.substring(Math.max(0, i), i += 3));
      }

      return parts.join(",") + post;
    }

    function make_humanizer(scale: number, units: string, precision: number, afterDecimal: number, showPlus: boolean, forceFill: boolean, constrain: number) {
      return (input: number) => {
        if (isNaN(input)) {
          return {
            title: "insufficient data",
            classStr: "empty-value",
            parts: [
              { v: "-", classStr: "significant" }
            ]
          };
        }

        var sign: string;
        var classStr: string;
        if (input === 0) {
          sign = "";
          classStr = "zero";
        } else if (input > 0) {
          sign = showPlus ? "+" : "";
          classStr = "positive";
        } else {
          sign = "-";
          classStr = "negative";
        }

        var scaledInput = input / scale;
        var x = Math.abs(scaledInput);

        if (constrain > 0 && x > constrain) {
          x = constrain;
          sign = sign === "-" ? "<-" : ">";
        }

        var numStr = x.toFixed(afterDecimal);

        if (onlyZero.test(numStr) && input !== 0) {
          sign = "~";
          classStr += " tiny";
        }

        var full_x = add_separators_to_number(numStr);

        var before = "";
        var significant = "";
        var insignificant = "";
        var after = "";
        var padding = "";

        if (x === 0) {
          var sp = full_x.split(".");
          significant = sp[0];
          insignificant = "";
          after = sp[1] != null ? "." : "";
          padding = sp[1] || "";
        } else {
          var seenPeriod = false;
          var i = 0;
          var len = full_x.length;
          var after_left = afterDecimal;
          var c: string;
          while (i < len && ((c = full_x[i]) === "0" || c === ".")) {
            before += c;
            seenPeriod || (seenPeriod = c === ".");
            if (seenPeriod) {
              after_left--;
            }
            i++;
          }

          var signif_count = 0;
          while (i < len && (forceFill || signif_count < precision)) {
            c = full_x[i];
            significant += c;
            if (c !== ",") {
              if (c === ".") {
                seenPeriod = true;
              } else {
                signif_count++;
                if (seenPeriod) {
                  after_left--;
                }
              }
            }
            i++;
          }

          if (!seenPeriod) {
            while (i < len) {
              c = full_x[i];
              insignificant += c;
              i++;
              if (c === ".") {
                seenPeriod = true;
                break;
              }
            }
          }

          while (i < len && after_left > 0) {
            c = full_x[i];
            after += c;
            after_left--;
            i++;
          }

          while (i < len && after_left > 0) {
            c = full_x[i];
            padding += c;
            after_left--;
            i++;
          }
        }

        var title = scaledInput.toPrecision(precision) + units;
        if (scale !== 1) {
          title += "  (" + input + ")";
        }

        return {
          title: title,
          classStr: classStr,
          parts: [
            { v: sign, classStr: "sign" },
            { v: before, classStr: "before" },
            { v: significant, classStr: "significant" },
            { v: insignificant, classStr: "insignificant" },
            { v: after, classStr: "after" },
            { v: padding, classStr: "padding" },
            { v: units, classStr: "units" }
          ]
        };
      };
    }

    function get_small_large_template(dataRaw: number[]): Template {
      var data: number[] = [];
      for (var _i = 0, _len = dataRaw.length; _i < _len; _i++) {
        var d = dataRaw[_i];
        if (d === 0 || isNaN(d)) {
          continue;
        }
        data.push(Math.abs(d));
      }

      var len = data.length;
      var large: number;
      var template: number;
      var small: number;
      if (len > 0) {
        data.sort((a, b) => b - a);
        large = data[0];
        template = data[Math.ceil((len - 1) / 2)];
        small = data[len - 1];
      } else {
        large = 0;
        template = 0;
        small = 0;
      }

      return {
        small: small,
        large: large,
        template: template
      };
    }

    function after_decimal_point_at_precision(x: number, n: number): number {
      var str = x.toPrecision(n);
      var parts = str.split(/e/i);
      if (parts.length > 1) {
        var e = parseInt(parts[1], 10);
        if (e > 0) {
          return 0;
        }
        return (parts[0].split(".")[1] || "").length - e;
      } else {
        return (str.split(".")[1] || "").length;
      }
    }

    function get_after_decimal(scale: number, large: number, small: number, precision: number, maxAfterScaled: number, maxAfterUnscaled: number, minAfterScaled: number, minAfterUnscaled: number) {
      large = large / scale;
      var large_digits_after_decimal = after_decimal_point_at_precision(large, precision);

      small = small / scale;
      var small_digits_after_decimal = after_decimal_point_at_precision(small, precision);

      var maxDigits = scale > 1 ? maxAfterScaled : maxAfterUnscaled;
      var minDigits = scale > 1 ? minAfterScaled : minAfterUnscaled;
      var digits_after_decimal = Math.min(Math.max(large_digits_after_decimal, small_digits_after_decimal - (precision - 1)), Math.max(maxDigits, 0))
      digits_after_decimal = Math.max(digits_after_decimal, minDigits);
      return digits_after_decimal;
    }

    export function humanizerFromData(_arg) {
      var data = _arg.data;
      var precision = _arg.precision;
      if (precision == null) precision = 3;

      var _ref = get_small_large_template(data);
      var large = _ref.large;
      var small = _ref.small;
      var template = _ref.template;

      var scale = getScale(template);
      var units = getUnits(template);

      var _maxAfterScaled = 3;
      var _maxAfterUnscaled = 2;
      var _minAfterScaled = 0; //type === "fixed" ? 2 : 0;
      var _minAfterUnscaled = 0; //type === "fixed" ? 2 : 0;

      var afterDecimal = get_after_decimal(scale, large, small, precision, _maxAfterScaled, _maxAfterUnscaled, _minAfterScaled, _minAfterUnscaled)
      var forceFill = _minAfterUnscaled === _maxAfterUnscaled;

      return make_humanizer(scale, units, precision, afterDecimal, false, forceFill, -1);
    }

    export function humanizeNumbers(_arg) {
      var data = _arg.data;
      var precision = _arg.precision;
      var integer = _arg.integer;
      if (precision == null) {
        precision = 3;
      }
      var template = get_small_large_template(data).template;

      var scale = getScale(template);
      var units = getUnits(template);

      return (n: number) => {
        if (!n) {
          return "0";
        }
        return humanizeNumberWithScale(n, precision, scale, integer, false) + units;
      };
    }
  }
}
*/
