"use strict";

/**
 * AngularJS directive that plots a given array of postcodes as markers on a map and auto-zooms the map view so all are
 * visible simultaneously. Clicking on a marker displays the corresponding address. This directive uses Angular Google
 * Maps directives to create the map, and geocode-service.js to obtain the latitude, longitude and address details for
 * each postcode.
 *
 * @author Daniel Lam (A533913)
 */
angular.module('postcodeMap', ['uiGmapgoogle-maps', 'postcodeMap.services']).constant('SCRIPT_URL',
    (function () {
        var scripts = document.getElementsByTagName("script");
        // The last script in the array will always be the currently executing one.
        var scriptPath = scripts[scripts.length - 1].src;
        return scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1);
    })()).constant('GMAP_DEFAULTS', {
        // Define default lat, long and zoom values that centre the map on the UK (for use on initial map loading).
        ukCenterLat: 54.559322,
        ukCenterLong: -4.174804,
        zoom: 5
    }).config(function (uiGmapGoogleMapApiProvider, SCRIPT_URL) {
        var $http = angular.injector(['ng']).get('$http');
        return $http.get(SCRIPT_URL + 'google-maps-api-key.json').then(function (response) {
            var $log = angular.injector(['ng']).get('$log');
            uiGmapGoogleMapApiProvider.configure({
                key: response.data.key,
                v: '3.26', //defaults to latest 3.X anyhow
                libraries: 'geometry,visualization'
            });
            $log.info("Configured Google Maps service");
        });
    }).directive('postcodeMap', function (SCRIPT_URL, $log, GMAP_DEFAULTS) {
        var controller = ['Geocode', function (Geocode) {
            var vm = this;

            (function init () {
                // Set the map centre and zoom to default values.
                // Note: There is a bug in the angular-google-maps library that prevents the "ui-gmap-markers" directive's
                // "fit" function from working if the longitude used for the initial map center is a float. The workaround
                // is to round to an integer. See https://github.com/angular-ui/angular-google-maps/issues/1170 and the
                // comment by "antoine64", where this issue was identified.
                vm.map = { center: { latitude: GMAP_DEFAULTS.ukCenterLat, longitude: Math.round(GMAP_DEFAULTS.ukCenterLong) },
                    zoom: GMAP_DEFAULTS.zoom, options: { maxZoom: 18 } };

                // This variable is bound to the "models" attribute of the "ui-gmap-markers" directive and must be
                // initialized, or else it results in multiple "TypeError: Cannot read property 'gManager' of undefined"
                // errors every time the map is dragged. See
                // http://stackoverflow.com/questions/30083348/typeerror-cannot-read-property-gmanager-of-undefined, in
                // particular, the last comment.
                vm.geocodes = [];
            })();

            // Call the Geocode service to obtain geocode data for the postcodes (if any).
            if (vm.postcodes) {
                Geocode.geocode(vm.postcodes).then(function (data) {
                    vm.geocodes = data;

                    // Function called when a marker is clicked, setting the model for the info window, and its
                    // visibility.
                    vm.markerClick = function (marker, eventName, model) {
                        vm.infoWindowModel = {
                            coords: model.coords,
                            addressLines: model.address.split(", ")
                        };
                        vm.infoWindow.show = true;
                    };
                });

                // Object for maintaining state of "info window" (displayed when a marker is clicked).
                vm.infoWindow = {
                    show: false,
                    closeClick: function () {
                        this.show = false;
                    },
                    template: SCRIPT_URL + "infoWindowTemplate.html"
                };
            }
        }];

        return {
            restrict: 'E',
            scope: {
                postcodes: '='
            },
            controller: controller,
            controllerAs: 'vm',
            bindToController: true, // required in 1.3+ with controllerAs
            templateUrl: SCRIPT_URL + 'postcode-map.html'
        };
    });