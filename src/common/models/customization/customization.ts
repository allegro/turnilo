import { Class, Instance, isInstanceOf, isImmutableClass, immutableArraysEqual } from 'immutable-class';
import { ExternalView, ExternalViewValue} from '../external-view/external-view';

export interface CustomizationValue {
  headerBackground?: string;
  customLogoSvg?: string;
  externalViews?: ExternalView[];
}

export interface CustomizationJS {
  headerBackground?: string;
  customLogoSvg?: string;
  externalViews?: ExternalViewValue[];
}

var check: Class<CustomizationValue, CustomizationJS>;
export class Customization implements Instance<CustomizationValue, CustomizationJS> {

  static isCustomization(candidate: any): candidate is Customization {
    return isInstanceOf(candidate, Customization);
  }

  static fromJS(parameters: CustomizationJS): Customization {
    var value: CustomizationValue = {
      headerBackground: parameters.headerBackground,
      customLogoSvg: parameters.customLogoSvg
    };
    var paramViewsJS = parameters.externalViews;
    var externalViews: ExternalView[] = null;
    if (Array.isArray(paramViewsJS)) {
      externalViews = paramViewsJS.map((view, i) => ExternalView.fromJS(view));
      value.externalViews = externalViews;
    }
    return new Customization(value);
  }

  public headerBackground: string;
  public customLogoSvg: string;
  public externalViews: ExternalView[];

  constructor(parameters: CustomizationValue) {
    this.headerBackground = parameters.headerBackground || null;
    this.customLogoSvg = parameters.customLogoSvg || null;
    if (parameters.externalViews) this.externalViews = parameters.externalViews;
  }


  public valueOf(): CustomizationValue {
    return {
      headerBackground: this.headerBackground,
      customLogoSvg: this.customLogoSvg,
      externalViews: this.externalViews
    };
  }

  public toJS(): CustomizationJS {
    var js: CustomizationJS = {};
    if (this.headerBackground) js.headerBackground = this.headerBackground;
    if (this.customLogoSvg) js.customLogoSvg = this.customLogoSvg;
    if (this.externalViews) {
      js.externalViews = this.externalViews.map(view => view.toJS());
    }
    return js;
  }

  public toJSON(): CustomizationJS {
    return this.toJS();
  }

  public toString(): string {
    return `[custom: headerBackground: ${this.headerBackground}, logo: ${Boolean(this.customLogoSvg)},
    externalViews: ${Boolean(this.externalViews)}]`;
  }

  public equals(other: Customization): boolean {
    return Customization.isCustomization(other) &&
      this.headerBackground === other.headerBackground &&
      this.customLogoSvg === other.customLogoSvg &&
      immutableArraysEqual(this.externalViews, other.externalViews);
  }
}

check = Customization;
