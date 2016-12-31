"use strict";

/**
 * AngularJS factory that geocodes an array of postcodes and returns each with its corresponding Google Map marker.
 * (A portion loosely based on code by Nic Mitchell at
 * http://nicmitchell.com/2015/01/quickly-use-street-address-with-google-maps-in-angular/.)
 *
 * Note: This code uses the Google Maps Geocoding API and requires an API key, to be specified in the
 * google-maps-api-key.json file. The key must use Server restriction instead of Browser; see
 * https://developers.google.com/maps/faq#switch-key-type for how to configure this.
 *
 * @author Daniel Lam (A533913)
 */
angular.module('postcodeMap.services', []).constant('SCRIPT_URL',
    (function () {
        var scripts = document.getElementsByTagName("script");
        // The last script in the array will always be the currently executing one.
        var scriptPath = scripts[scripts.length - 1].src;
        return scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1);
    })()).factory('Geocode', function ($http, SCRIPT_URL, $log, $q) {
        var lookupApiKey = function () {
            return $http.get(SCRIPT_URL + 'google-maps-api-key.json').then(function (response) {
                return response.data.key;
            });
        };

        // This function takes an array of postcodes and returns geocoded data as an array of Google Map markers, each
        // containing the latitude and longitude of a postcode.
        var geocode = function (postcodes) {
            // Retrieve the API key to use with the Google Maps Geocoding API.
            return lookupApiKey().then(function (apiKey) {
                // This function calls the Geocode API with a postcode and returns a parsed JSON response.
                var getGeocodeData = function (postcode) {
                    // Note the use of $.getJSON instead of $http; a $http GET request is converted to an OPTIONS
                    // request, and this sets the request header field 'Pragma' in the Access-Control-Request-Headers
                    // header, which is not allowed at the server end (i.e. Google Maps APIs). See
                    // http://stackoverflow.com/questions/24656488/angularjs-how-to-disable-option-request for
                    // further discussion.
                    return $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address=' + postcode
                        + '&key=' + apiKey).then(function (response) {
                        var lat = response.results[0].geometry.location.lat;
                        var lng = response.results[0].geometry.location.lng;

                        return {
                            coords: {
                                latitude: lat,
                                longitude: lng
                            },
                            address: response.results[0].formatted_address
                        };
                    }, function (error) {
                        $log.error("Error geocoding postcode " + postcode.replace(/\+/g, ' ') + ": " + error);
                    });
                };

                // $q.all takes an array of promises (a mapping of async calls to their results) and resolves to an
                // array of the results. It waits until all promises have been fulfilled before moving on to the then()
                // method for any post-processing and to return an array of geocodes. For reference, see:
                // * http://stackoverflow.com/questions/24660096/correct-way-to-write-loops-for-promise
                // * http://taoofcode.net/promise-anti-patterns/ ("The Collection Kerfuffle")
                // * http://www.javascriptkit.com/javatutors/javascriptpromises.shtml
                return $q.all(postcodes.map(function (postcode) {
                    // Get the geocode data for the postcode and return marker object data.
                    return getGeocodeData(postcode.replace(/ /g, '+'));
                })).then(function (geocodes) {
                    // Use the current iteration count as the marker ID.
                    for (var i = 0; i < geocodes.length; i++) {
                        geocodes[i].id = i;
                    }

                    return geocodes;
                });
            });
        };

        // Make this function available when factory is included as dependency
        return {
            geocode: geocode
        };
    });