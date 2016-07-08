import { firstUp } from '../string/string';

export class ImmutableUtils {
  public static setProperty(instance: any, path: string, newValue: any): any {
    var bits = path.split('.');
    var lastObject = newValue;
    var currentObject: any;

    var getLastObject = () => {
      let o: any = instance;

      for (let i = 0; i < bits.length; i++) {
        o = o[bits[i]];
      }

      return o;
    };

    while (bits.length) {
      let bit = bits.pop();

      currentObject = getLastObject();
      lastObject = currentObject.change(bit, lastObject);
    }

    return lastObject;
  }

  public static getProperty(instance: any, path: string): any {
    var value = instance;
    var bits = path.split('.');
    var bit: string;
    while (bit = bits.shift()) value = value[bit];

    return value as any;
  }
}
