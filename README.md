# Angular Postcode Google Map Directive

The Angular Postcode Google Map Directive is an easy-to-use, AngularJS directive that provides a means of incorporating
a map that marks the locations of postcodes, into AngularJS applications. The map automatically zooms the view so that
all the markers are visible simultaneously.

## Getting Started

Clone this repository or download it as a ZIP file.

* If you're using Node.js, you can use `npm install angular-postcode-gmap` to install this as an npm package
* If not (or the npm installation fails), you will need to download the directive's dependencies manually. These are:
 * `angular`: version 1.2 - 1.5
 * `angular-simple-logger`: version >=0.0.1
 * `lodash`: version 3.X - 4.X
 * `angular-google-maps`: compatible with version 2.3.2
 * `jquery`: compatible with version 2.1.4
 * `less`: compatible with version 2.5.1

    Copy these libraries to suitable locations within your project, for example, subdirectories within its `lib`
    directory.

All the required code is in the `postcode-gmap` directory. Copy it to a suitable location within your project.

## Google Maps API Key Requirement

The directive uses the [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro) to
obtain information about a postcode, i.e. its latitude/longitude and address details.

As of 22 June 2016, any Google Maps application requires an API key. If you don't already have one, you will need to
obtain one by following the instructions [here](https://developers.google.com/maps/documentation/geocoding/get-api-key).
You will also need a Google Developer account to login to the Google API Console. After logging in, you will need to
create a project; the name is immaterial - it is simply required to obtain an API key.

Once you have an API key, it needs to be configured to use *server* restriction instead of browser; see
[here](https://developers.google.com/maps/faq#switch-key-type) for how to configure this.

You also need to supply your API key to this directive by opening the `google-maps-api-key.json` file in the
`postcode-gmap` directory and replacing `<INSERT_GOOGLE_MAPS_API_KEY_HERE>` with your key *between the quote (")
marks*. **Note:** Do not change or insert anything other than your API key in this file, or `geocode-service.js` will be
unable to read your key.

## Using the Directive

1. In your project's main `index.html` file, ensure all the JavaScript libraries listed as dependencies above are
referenced using `<script>` tags, for example, `<script src="lib/angular-google-maps/angular-google-maps.min.js"></script>`.
Do this also for `postcode-map.js` and `geocode-service.js` (both in the `postcode-gmap` directory).
2. In `index.html`, add a `<link>` tag referencing `postcode-map.less`, i.e.
`<link rel="stylesheet/less" href="[REFERENCE_TO_LESS_FILE]" type="text/css"/>`.
3. Add a dependency on `"postcodeMap"` to your project's main Angular module (typically in `app.js`).
4. Add `<postcode-map>` tags to whichever HTML page you want the map to appear on, and provide an array of postcodes as
the `"postcodes"` attribute value. For example, `<postcode-map postcodes="['RG41 5TS', 'NW1 3HG']"></postcode-map>`. If
you omit this attribute or provide an empty postcode array, the map will simply show a view centred on the United
Kingdom.
