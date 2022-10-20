---
title: Configuration - customization
nav_order: 4
layout: page
---

## Overview

You can define a `customization:` section in the config to configure some aspects of the look and feel of Turnilo.

## Visual

Can customize the header background color and logo icon by supplying a color string and SVG string respectively.

```yaml
customization:
    customLogoSvg: >
      <svg width="300" height="200"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink">
        <rect width="100%" height="100%" fill="green" />
      </svg>

    headerBackground: '#2D95CA'
```

## Url Shortener

Turnilo supports url shorteners for generating short links for current view definitions. This is done by defining function body in configuration.
Function will receive three arguments, `request` - [node request module](https://github.com/request/request-promise-native), `url` with current hash, and `context` which includes: `clientIp` (the ip of the original client, considering a possible XFF header). Function should return Promise with shortened url as string inside.



For example:

```yaml
customization:
  urlShortener: |
    return request.get('http://tinyurl.com/api-create.php?url=' + encodeURIComponent(url))
```

## CSS Variables

Turnilo allows you to override CSS variables to apply your own theming

For example:

```yaml
customization:
  cssVariables:
    brand: '#829aa3;'
    item-dimension: '#f2cee0;'
    item-dimension-text: white;
    item-measure: '#cef2e0;'
    item-measure-text: white;
    background-brand: white;
    background-brand-text: '#999;'
    background-base: '#fbfbfb;'
```

## External links

Turnilo supports defining external view links with access to `dataCube`, `filter`, `splits`, and `timezone` objects at link generation time.
This is done by defining a function body in the configuration file.

For example:

```yaml
customization:
    externalViews:
      - title: Timezone Info
        linkGenerator: >
          {
            return 'http://www.tickcounter.com/timezone/' + timezone.toString().toLowerCase().replace(/\//g, '-');
          }
```

These custom links will appear in the share menu.

By default, external views are opened in a new tab, but you can disable this by setting `sameWindow: true`

## Timezones

You can customize the timezones that appear in the header bar dropdown by providing an array of timezone strings.

For example:

```yaml
customization:
  timezones: ['Pacific/Niue', 'Pacific/Marquesas', 'America/Tijuana']
```

These timezones will appear in the dropdown instead of the default, which are

`['America/Juneau', 'America/Los_Angeles', 'America/Yellowknife', 'America/Phoenix', 'America/Denver', 'America/Mexico_City', 'America/Chicago', 'America/New_York', 'America/Argentina/Buenos_Aires', 'Etc/UTC',
'Asia/Jerusalem', 'Europe/Paris', 'Asia/Kathmandu', 'Asia/Hong_Kong', 'Asia/Seoul', 'Pacific/Guam']`

## Locale

Note: Turnilo has very basic support of locale. Right now we are working on finding places in application which should be configurable.

You can set Turnilo locale and override some settings

```yaml
locale:
  base: en-US
  overrides:
    shortMonths:
      - [J, F, M, A, M, J, J, A, S, O, N, D]
```

You need to select base locale using POSIX locale identifier. (Right now Turnilo supports only `en-US` value).
You can override following settings:

* `shortDays` - array of strings, default: `["S", "M", "T", "W", "T", "F", "S"]`

Short day names used in date picker component

* `shortMonths` - array of strings, default:  `["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]`

Short month names used in date picker component
  
* `weekStart` - number, default: 0

Index of day at which week starts. 0 is Sunday. Please note that is purely visual and does not influence #709.
  
* `exportEncoding` - string, default: `utf-8`

Encoding of files created by export function.


## Sentry DSN

Add Sentry DSN to report errors to Sentry. [Sentry documentation](https://docs.sentry.io/platforms/javascript/?platform=browsernpm)

```yaml
customization:
  sentryDSN: https://<key>@sentry.io/<project>
```

## Messages

You can customize various messages that Turnilo displays in user interface. 
All messages are optional and will be treated as markdown code.

```yaml
customization:
  messages:
    dataCubeNotFound: "**This DataCube does not exist**"
```

List of supported fields:

- `dataCubeNotFound` - message displayed when Turnilo cannot find DataCube. 
Please note that if you have `guardDataCubes` setting turn on, Turnilo will treat cubes that are not in `x-turnilo-allow-datacubes` as not existing.
