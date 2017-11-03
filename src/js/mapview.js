/**
 * Created by scottfairgrieve on 3/26/16.
 */
var Focus = Focus || {};
Focus.Views = Focus.Views || {};
Focus.Models = Focus.Models || {};
Focus.Collections = Focus.Collections || {};
Focus.Events = _.extend({}, Backbone.Events);

Focus.Map = Focus.Map || {};

// Override this to change default layer style
Focus.Map.defaultOptions = Focus.Map.defaultOptions || {};

Focus.Map.Handlers = Focus.Map.Handlers || {};
Focus.Map.Handlers.Leaflet = Focus.Map.Handlers.Leaflet || {};
Focus.Map.options = Focus.Map.options || {};


var BING_MAPS_KEY = 'AgcrLvy9a1P_nNYA6Afwjmx7l9KX62qrBnb0_vFxqVyFpwJ2mGmT4IEWvjAO-w34'
Focus.Models.ProgressModel = Backbone.Model.extend({
    default: function () {
        progress: 0
    }
});

Focus.Models.MapModel = Backbone.Model.extend({

});

Focus.Models.EngineModel = Backbone.Model.extend({

});

// Layers, center, rotation, pitch, elements, actions
Focus.Models.SceneModel = Backbone.Model.extend({
    default: function () {
        return {
            baseLayer: null,
            mapStyle: {
                opacity: 1.0,
                background: '#000',
                tileStyle: {}
            },
            layers: [],
            center: [0,0],
            zoom: 12,
            rotation: 0,
            pitch: 0
        }
    }
});

Focus.Collections.SceneCollection = Backbone.Collection.extend({
   model: Focus.Models.SceneModel
});

Focus.Views.MapView = Backbone.View.extend({
    initialize: function (options) {
        this._engineClass = options.engineClass;
        this._engine = new this._engineClass({
            el: this.$el,
            model: this.model.get('initialScene')
        });

        this.listenTo(this._engine, 'layerClick', this._layerClick);

        var me = this;
        $(window).on('resize', function () {
            me._engine.resize();
        });
    },
    _layerClick: function (id) {
        Focus.Events.trigger('layerClick', id);
    },
    setCenter: function (center) {
        this._engine.setCenter(center);
        return this;
    },
    setZoom: function (zoom) {
        this._engine.setZoom(zoom);
        return this;
    },
    setFeatures: function (featureLookup) {
        this._engine.setFeatures(featureLookup);
    },
    setScene: function (sceneModel, fly) {
        this._engine.setScene(sceneModel, fly);
        Focus.Events.trigger('viewChanged', sceneModel.toJSON());
        return this;
    },
    setBaseLayers: function (baseLayers) {
        this._engine.setBaseLayers(baseLayers);
    },
    getLayerPoint: function (id) {
        return this._engine.getLayerPoint(id);
    },
    highlight: function (id) {
        this._engine.highlight(id);
        return this;
    },
    unhighlight: function (id) {
        this._engine.unhighlight(id);
        return this;
    },
    render: function () {

    },
    addLayers: function (layers) {
        this._engine._addLayers(layers);
    }
});

Focus.Views.MapEngine = Backbone.View.extend({
    initialize: function (options) {
        this._baseLayer = null;
        this._layers = {};
        this._initContainer();
        this.setScene(this.model, false);
        this._disableControls();
    },
    setFeatures: function (featureLookup) {
        this._featureLookup = featureLookup;
    },
    setScene: function (sceneModel, fly) {
        if (this._intervals) {
            _.each(this._intervals, function (value) {
                clearInterval(value);
            });

			if (this._prevLayer) {
				this._map.removeLayer(this._prevLayer);
				this._prevLayer = null;
			}
        }
        this._setBaseLayer(sceneModel.get('baseLayer'));
        this._setMapStyle(sceneModel);
        this._addLayers(sceneModel.get('layers') || []);
        this._flyTo(sceneModel, fly);
    },
    getLayerPoint: function (id) {

    },
    zoomToLayer: function (id) {

    },
    setCenter: function (center) {
    },
    setZoom: function (zoom) {
    },
    resize: function (e) {

    },
    _initContainer: function () {

    },
    _setBaseLayer: function (layer) {

    },
    _getLayer: function (layerDef) {
        // If there's an idRef attribute then get the layer definition from the feature lookup
        // and merge it with the style info. included in layer
        if (layerDef.idRef && this._featureLookup) {
            layerDef = $.extend(true, {}, this._featureLookup[layerDef.idRef], layerDef);
        }

        return this._layerDefToLayer(layerDef);
    },
    _layerDefToLayer: function (layerDef) {

    },
    setBaseLayers: function (layers) {

    },
    _setMapStyle: function (sceneModel) {

    },
    _addLayer: function (layer, id) {

    },
    _removeLayer: function (layer, id) {

    },
    _flyTo: function (sceneModel, fly) {

    },
    _layerClick: function (layer) {
        var me = this;
        return function (e) {
            me.trigger('layerClick', layer);
        };
    },
    _addLayers: function (layers) {
        var me = this;

        _.each(this._layers, function (layer, key) {
            me._removeLayer(layer, key);
        });

        this._layers = {};

        _.each(layers, function (layerDef, key) {
            var newLayer = me._getLayer(layerDef); //me._layerDefToLayer(layer);
            if (newLayer) {
                me._addLayer(newLayer, layerDef.id || layerDef.idRef);
                me._layers[layerDef.id || layerDef.idRef] = newLayer;
            }
        });
    },
    _disableControls: function () {
        // Override

    }
});

var KEY = 'AIzaSyBw665hppQIz8zlv82yGUaFSSqcp_1a4Lk';
Focus.Views.StreeviewMapEngine = Focus.Views.MapEngine.extend({
//https://maps.googleapis.com/maps/api/streetview/metadata?size=600x300&location=78.648401,14.194336&fov=90&heading=235&pitch=10&key=YOUR_API_KEY
    initialize: function (options) {
        Focus.Views.MapEngine.prototype.initialize.call(this, options);
    },
    _initContainer: function () {
        var key = 'AIzaSyCwwps8stS0eDJ4xOcvngtQYuXtPjngwTk';
        var center = this.model.get('center');
        var centerPoint = new L.LatLng(center[1], center[0]);

		var elId = L.Browser.mobile ? 'map' : 'overview-map';
		this._panId = L.Browser.mobile ? 'overview-map' : 'map';
        this._map = new google.maps.Map(document.getElementById(elId), {
			mapTypeId: 'hybrid',
            center: centerPoint,
            zoom: this.model.get('zoom'),
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: !L.Browser.mobile,
            rotateControl: false,
            fullscreenControl: false
        });

        if (!L.Browser.mobile) {
            this._panorama = new google.maps.StreetViewPanorama(
            document.getElementById(this._panId), {
                position: centerPoint,
                pov: {
                    heading: 34,
                    pitch: 10
                },
                linksControl: true,
                fullscreenControl: false,
                addressControl: false,
                enableCloseButton: false,
				motionTracking: false
            });
        this._map.setStreetView(this._panorama);
        }
        else {
            var marker = new google.maps.Marker({
                position: centerPoint,
                map: this._map,
                icon: {
                    url: this.model.get('icon'),
                    scaledSize: new google.maps.Size(24,44)
                }
            });
        }
    },
    _layerDefToLayer: function (layerDef) {
        var layer = {};
        var extent = turf.bbox(layerDef.data);

        var bounds = new L.LatLngBounds(new L.LatLng(extent[1], extent[0]), new L.LatLng(extent[3], extent[2]));

        layer._bounds = bounds;

        return layer;
    },
    _calculateBounds: function (sceneModel) {
        var bounds = new L.LatLngBounds();
        var me = this;
        var boundIds = sceneModel.get('bounds');
        _.each(this._layers, function (layer, id) {
            bounds.extend(layer._bounds);
        });

        return bounds;
    },
    _flyTo: function (sceneModel, fly) {

        var coordinates = sceneModel.get('center');
        var bounds = null;
        var me = this;

        if (!coordinates) {
            bounds = this._calculateBounds(sceneModel);
            coordinates = [bounds.getCenter().lng, bounds.getCenter().lat];
            sceneModel.set('center', coordinates);
        }
        var zoom = sceneModel.get('zoom');
        var latLng = new L.LatLng(coordinates[1], coordinates[0]);
        var path = sceneModel.get('path');
        var me = this;

		if (me._isNavigating) {
			_.each(me._timeoutIds, function (id) {
				clearTimeout(id);
			});
		}

		me._isNavigating = false;
		me._timeoutIds = [];

        var setPano = function (ll, pov) {
            return function () {
                if (!L.Browser.mobile) {
                    me._panorama.setPosition(ll);
                    me._panorama.setPov(pov);
                }
                else {
                    var marker = new google.maps.Marker({
                        position: ll,
                        map: me._map,
                        icon: {
                            url: sceneModel.get('icon'),
                            scaledSize: new google.maps.Size(24,44)
                        }
                    });
                }

		        me._map.setCenter(ll);
		        me._map.setZoom(zoom);
				me._isNavigating = true;
            }
        };

        if (path && !L.Browser.mobile) {
            _.each(path, function (point, index) {
				var ll = point.position;
				var pov = point.pov;
                me._timeoutIds.push(setTimeout(setPano(new L.LatLng(ll[1], ll[0]), pov), index * 2250));
            });

            me._timeoutIds.push(setTimeout(setPano(latLng, sceneModel.get('pov')), path.length * 2250));
        }
		else {
	        setPano(latLng, sceneModel.get('pov'))();

		}

        this._lastLocation = latLng;

    }
});

Focus.Views.LeafletMapEngine = Focus.Views.MapEngine.extend({
    initialize: function (options) {
        this._baseLayerIndex = {};
        Focus.Views.MapEngine.prototype.initialize.call(this, options);

    },
    _initContainer: function () {

        L.Control.CustomAttribution = L.Control.Attribution.extend({
            _update: function () {
                if (!this._map) { return; }

                var attribs = [];

                for (var i in this._attributions) {
                    if (this._attributions[i]) {
                        attribs.push(i);
                    }
                }

                var prefixAndAttribs = [];

                if (this.options.prefix) {
                    prefixAndAttribs.push(this.options.prefix);
                }
                if (attribs.length) {
                    prefixAndAttribs.push(attribs.join(', '));
                }

                $(this._container).html('<a href="" data-toggle="tooltip" title="" style="text-align: left; white-space:nowrap;"><span class="fa fa-info"></span><span class="esri-dynamic-attribution" style="display: none;"></a>');
                $(this._container).find('a').tooltip('destroy');
                $(this._container).find('a').tooltip({
                    container: 'body',
                    html: true,
                    title: '<div class="attribution">' + prefixAndAttribs.join('<span> | </span>') + '</div>',
                    placement: 'top'
                });

                $(this._container).find('a').on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
        });

        var showAttribution = 'showAttribution' in this.model.attributes ? this.model.get('showAttribution') : true;
        var mapOptions = {
            center: this.model.get('center'),
            zoom: this.model.get('zoom'),
            attributionControl: false,
            zoomControl: false,
            worldCopyJump: true,
            zoomAnimationThreshold: 3,
            markerZoomAnimation: true,
            zoomDelta: 0.5
            //renderer: L.canvas()
        };
        if (this.model.get('crs')) {
            mapOptions.crs = this.model.get('crs');
            console.log(mapOptions.crs);
        }
        if (this.model.get('renderer')) {
            mapOptions.renderer = this.model.get('renderer');
        }
        if (this.model.get('maxBounds')) {
            mapOptions.maxBounds = this.model.get('maxBounds');
        }
        if (this.model.get('zoomAnimation')) {
            mapOptions.zoomAnimation = this.model.get('zoomAnimation');
        }

        this._map = new L.Map(this.$el.attr('id'), mapOptions);

        if (showAttribution) {
            var attributionControl = new L.Control.CustomAttribution();
            attributionControl.addTo(this._map);
        }

        var me = this;
        if (Focus.Map.options.panes) {
            _.each(Focus.Map.options.panes, function (pane) {
                me._map.createPane(pane);
            });
        }

        me._map.createPane('trace');
    },
    _layerDefToLayer: function (layerDef) {
        var layer;
        var me = this;

        if (layerDef.type === 'vector') {
            var defaultParams = {
                rendererFactory: L.svg.tile,
                vectorTileLayerStyles: {
                    roads: function (properties, zoom) {
                        return {
                            weight: 2,
                            color: '#aaa',
                            fill: false
                        };
                    },
                    boundaries: [],
                    buildings: [],
                    earth: [],
                    landuse: [],
                    transit: {
                        weight: 2,
                        color: '#aaa',
                        fill: false
                    },
                    water: []
                }
            };
            layer = L.vectorGrid.protobuf(layerDef.url, $.extend(true, {}, defaultParams, layerDef.params || {}));
        }
        else if (layerDef.type === 'tile') {
            layer = new L.TileLayer(layerDef.url, $.extend(true, {}, layerDef.params, {
                detectRetina: true
            }));
        }
        else if (layerDef.type === 'mapquest') {
            layer = MQ[layerDef.url]();
        }
        else if (layerDef.type === 'wms') {
            layer = new L.TileLayer.WMS(layerDef.url, $.extend(true, {}, layerDef.params, {
                detectRetina: true
            }));
        }
        else if (layerDef.type === 'wmts') {
            layer = new L.TileLayer(layerDef.url, layerDef.params);
        }
        else if (layerDef.type === 'esri-basemap') {
            layer = L.esri.basemapLayer(layerDef.url, layerDef.options);
        }
        else if (layerDef.type === 'esri-dynamicmaplayer') {
            layer = L.esri.dynamicMapLayer(layerDef.params);
        }
        else if (layerDef.type === 'bing') {
            layer = L.tileLayer.bing($.extend(true, {
                bingMapsKey: BING_MAPS_KEY
            }, layerDef.params));
        }
        else if (layerDef.type === 'country') {
            layer = new L.ChoroplethDataLayer(_.map([layerDef.data], function (value) {
                return {code: value};
            }), {
                recordsField: null,
                locationMode: L.LocationModes.COUNTRY,
                codeField: 'code',
                tooltipOptions: {
                    iconSize: null,
                    iconAnchor: new L.Point(-5, 0)
                },
                layerOptions: layerDef.style || {}
            });

            layer._bounds = layer.getBounds();
        }
        else if (layerDef.type === 'csv') {
            var me = this;
            var resultFunc = function (layerDef) {
                return function (error, rows) {
                    var layerId = layerDef.id || layerDef.idRef;
                    var latField = layerDef.params.latitudeField;
                    var lonField = layerDef.params.longitudeField;
                    var nameField = layerDef.params.nameField;
                    var descField = layerDef.params.descriptionField;
                    var sourceField = layerDef.params.sourceField;
                    var dateField = layerDef.params.dateField;

                    layerDef.style = layerDef.style || {};
                    var style = $.extend(true, {
                        numberOfSides: 50,
                        radius: 10,
                        //dropShadow: true,
                        weight: 0.5,
                        color: 'rgb(39,171,226)',
                        fillColor: 'rgb(39,171,226)',
                        fillOpacity: 0.9
                    }, Focus.Map.defaultOptions, layerDef.style);

                    var onEachRecord = function (layerDef) {
                        return function (layer, record) {
                            layer.on('click', function (e) {
                                me.trigger('layerClick', layerDef.id);
                            });
                        };
                    };

                    var options = {
                        recordsField: null,
                        latitudeField: latField,
                        longitudeField: lonField,
                        locationMode: L.LocationModes.LATLNG,
                        layerOptions: style,
                        tooltipOptions: {
                            iconSize: null,
                            iconAnchor: new L.Point(-5, 0)
                        },
                        getMarker: function (location, options, record) {
                            var marker;
                            if (options.icon) {
                                var markerOptions = {
                                    icon: new L.DivIcon({
                                        className: options.icon.className || 'marker-text',
                                        html: options.icon.html,
                                        iconSize: options.icon.iconSize ? new L.Point(options.icon.iconSize[0], options.icon.iconSize[1]) : null,
                                        iconAnchor: options.icon.iconAnchor ? new L.Point(options.icon.iconAnchor[0], options.icon.iconAnchor[1]): null
                                    })
                                };

                                if (options.pane) {
                                    markerOptions.pane = options.pane;
                                }

                                marker = new L.Marker(location, markerOptions);
                            }
                            else {
                                marker = new L.RegularPolygonMarker(location, options);
                            }
                            return marker;
                        },
                        displayOptions: {
                        },
                        onEachRecord: onEachRecord(layerDef)
                    };

                    options.displayOptions[nameField] = {
                        displayName: 'Name',
                        displayText: function (value) {
                            return value;
                        }
                    };
                    options.displayOptions[descField] = {
                        displayName: 'Description',
                        displayText: function (value) {
                            return value;
                        }
                    };

                    if (dateField) {
                        options.displayOptions[dateField] = {
                            displayName: 'Date',
                            displayText: function (value) {
                                return value;
                            }
                        };
                    }

                    if (sourceField) {
                        options.displayOptions[sourceField] = {
                            displayName: 'Source',
                            displayText: function (value) {
                                return value;
                            }
                        };
                    }

                    layer = new L.ChoroplethDataLayer(rows, options);

                    me._addLayer(layer, layerId);
                    me._layers[layerId] = layer;
                };
            };
            d3.csv(layerDef.url).get(resultFunc(layerDef));
        }
        else if (layerDef.type === 'link') {
            layerDef.style = layerDef.style || {};
            var fromLayer = this._layers[layerDef.from];
            var toLayer = this._layers[layerDef.to];
            var fromCenter = fromLayer._bounds.getCenter();
            var toCenter = toLayer._bounds.getCenter();
            layer = new L.Graph([{
                "from": fromCenter,
                "to": toCenter
            }], {
                recordsField: null,
                fromField: 'from',
                toField: "to",
                locationMode: L.LocationModes.LATLNG,
                latitudeField: 'lat',
                longitudeField: 'lng',
                layerOptions: layerDef.style,
                tooltipOptions: {
                    iconSize: null,
                    iconAnchor: new L.Point(-5, 0)
                },
				getEdge: L.Graph.EDGESTYLE[layerDef.edgeStyle || 'STRAIGHT']
            });
        }
        else if (layerDef.type === 'geojson') {
            layerDef.style = layerDef.style || {};
            var style = $.extend(true, {
                numberOfSides: 50,
                radius: 10,
                //dropShadow: true,
                weight: 0.5,
                color: 'rgb(39,171,226)',
                fillColor: 'rgb(39,171,226)',
                fillOpacity: 0.9
            }, Focus.Map.defaultOptions, layerDef.style);

            var onEachRecord = function (layerDef) {
                return function (layer, record, location) {
                    layer.on('click', function (e) {
                        me.trigger('layerClick', layerDef.id);
                    });
					
					if (record.style && layer.setStyle) {
						layer.setStyle(record.style);
					}
					
                    if (layerDef.style && layerDef.style.animate) {
                        layer.eachLayer(function (subLayer) {
                            var updater = function (latlngs) {
                                return function (layer, points, interpolatedPoint) {
                                    var index = latlngs.indexOf(points[0]);

                                    if (layerDef.style.animate.interpolate) {
                                        layer.setLatLngs(latlngs.slice(0, index + 1).concat(new L.LatLng(interpolatedPoint.y, interpolatedPoint.x)));
                                    }
                                    else {
                                        layer.setLatLngs(latlngs.slice(0, index + 1));
                                    }
                                };
                            };

                            L.AnimationUtils.animateLine(subLayer, L.extend({}, {
                                update: updater(subLayer._latlngs.slice()),
                                duration: layerDef.style.animate.duration,
                                easing: L.AnimationUtils.easingFunctions.linear
                            }));
                        });

                    }
                };
            };

            var bounds;
            //if (layerDef.data.crs) {
            //    layer = L.Proj.geoJson(layerDef.data);
            //    bounds = new L.LatLngBounds(new L.LatLng(83, -69), new L.LatLng(83, -69));
            //}
            //else {
                layer = new L.ChoroplethDataLayer(layerDef.data.features ? layerDef.data : [layerDef.data], {
                    recordsField: layerDef.data.features ? 'features' : null,
                    geoJSONField: null,
                    locationMode: L.LocationModes.GEOJSON,
                    layerOptions: style,
                    tooltipOptions: {
                        iconSize: null,
                        iconAnchor: new L.Point(-5, 0)
                    },
                    getMarker: function (location, options, record) {
                        var marker;
                        if (options.icon) {
                            var markerOptions = {
                                icon: new L.DivIcon({
                                    className: options.icon.className || 'marker-text',
                                    html: options.icon.html,
                                    iconSize: options.icon.iconSize ? new L.Point(options.icon.iconSize[0], options.icon.iconSize[1]) : null,
                                    iconAnchor: options.icon.iconAnchor ? new L.Point(options.icon.iconAnchor[0], options.icon.iconAnchor[1]) : null
                                })
                            };

                            if (options.pane) {
                                markerOptions.pane = options.pane;
                            }

                            marker = new L.Marker(location, markerOptions);
                        }
						else if (options.iconFunction) {
							marker = options.iconFunction(location, options, record);
						}
                        else {
                            marker = new L.RegularPolygonMarker(location, options);
                        }
                        return marker;
                    },
                    displayOptions: {
                        'properties.name': {
                            displayName: 'Name',
                            displayText: function (value) {
                                return value;
                            }
                        }
                    },
                    onEachRecord: onEachRecord(layerDef)
                });

                var extent = turf.bbox(layerDef.data);

                bounds = new L.LatLngBounds(new L.LatLng(extent[1], extent[0]), new L.LatLng(extent[3], extent[2]));
            //}


            layer._bounds = bounds;
        }

        return layer;
    },
    _calculateBounds: function (sceneModel) {
        var bounds = new L.LatLngBounds();
        var me = this;
        var boundIds = sceneModel.get('bounds');
        _.each(this._layers, function (layer, id) {
            if (me._map.hasLayer(layer)) {
                var shouldInclude = boundIds ? id in boundIds : true;
                if (layer._bounds && shouldInclude) {
                    bounds.extend(layer._bounds);
                }
            }
        });

        return bounds;
    },
    _flyTo: function (sceneModel, fly) {

        var coordinates = sceneModel.get('center');
        var bounds = null;
        var me = this;

        if (!coordinates) {
            bounds = this._calculateBounds(sceneModel);
            coordinates = [bounds.getCenter().lng, bounds.getCenter().lat];
            sceneModel.set('center', coordinates);
        }
        var zoom = sceneModel.get('zoom');
        var latLng = new L.LatLng(coordinates[1], coordinates[0]);

        fly = 'fly' in sceneModel.attributes ? sceneModel.get('fly') : !L.Browser.mobile;

        if (me._lastCoordinates && coordinates && sceneModel.attributes.trace) {
            me._traceQueue = me._traceQueue || [];
            var traceLine = new L.ArcedPolyline([[this._lastCoordinates[1], this._lastCoordinates[0]], [coordinates[1], coordinates[0]]], $.extend(true, {}, {
                pane: 'trace',
                mode: 'Q',
                weight: 3,
                markers: {
                    end: {}
                }
            }, Focus.Map.traceOptions.style || {}, sceneModel.attributes.trace));
            me._map.addLayer(traceLine);

            me._traceQueue.push(traceLine);

            if (Focus.Map.traceOptions.maxLength && (me._traceQueue.length > Focus.Map.traceOptions.maxLength)) {
                var lineToRemove = me._traceQueue.shift();

                me._map.removeLayer(lineToRemove);
            }
        }

        this._lastCoordinates = coordinates;

        try {
            if (fly) {
                me._map.stop();
                if (bounds) {
                    me._map.flyToBounds(bounds, $.extend(true, sceneModel.get('panZoomOptions') || {}, {
                        maxZoom: zoom,
                        padding: [15, 15]
                    }));
                }
                else {
                    me._map.flyTo(latLng, zoom);
                }
            }
            else {
                if (bounds) {
                    me._map.fitBounds(bounds, {
                        maxZoom: zoom,
                        padding: [15, 15]
                    });
                }
                else {
                    this._map.setView(latLng, zoom, {
                        animate: true
                    });
                }
            }
        }
        catch (ex) {
            console.log(ex);
        }

        try {
            sceneModel.set('bounds', this._map.getBounds());
        }
        catch (ex) {
            console.log('Could not update scene bounds');
        }

    },
    _setMapStyle: function (sceneModel) {
        var style = sceneModel.get('style');

        if (style) {
            var filter = style.filter;
            var opacity = style.opacity;
            var background = style.background;
			var backgroundSize = style.backgroundSize;
			
            var $tileContainer = this.$el.find('.leaflet-tile-pane');
            $tileContainer.css('opacity', opacity);
            $tileContainer.css('-webkit-filter', filter);
            $tileContainer.css('-moz-filter', filter);
            $tileContainer.css('-ms-filter', filter);
            $tileContainer.css('filter', filter);

            this.$el.css('background', background);
			
			if (backgroundSize) {
				this.$el.css('background-size', backgroundSize);
			}
        }
    },
    _removeFunc: function (layerIndex) {
        var me = this;
        return function (layer, key) {
            if (!(key in layerIndex)) {
                console.log('Removing: ' + key);
                if (layer.getEvents) {
                    var events = layer.getEvents();
                    me._map.off(events, layer);
                }
                me._map.removeLayer(layer);
            }
        };
    },
	_setInterval: function (fn, interval) {
		fn();
		return setInterval(fn, interval);
	},
    _setBaseLayer: function (layerDef) {
        var me = this;
        var layerDefs = _.isArray(layerDef) ? layerDef : [layerDef];
        var layers = [];
        var layerIndex = {};

        me._lastLayer = me._lastLayer || {};
        me._intervals = me._intervals || {};
        me._intervalLayers = me._intervalLayers || {};

        _.each(layerDefs, function (layerDef) {
            try {
                if (layerDef.type === 'cycle') {
					var layerDefId = layerDef.id;
					var cycleFunction = function (layerDef) {
                        return function () {
							if (!me._prevLayer || (me._prevLayer && !me._prevLayer.isLoading())) {

                            	var newLayerDef = layerDef.layers.shift();
                            	layerDef.layers.push(newLayerDef);
                            	var newLayer = layerIndex[newLayerDef.url] || me._layerDefToLayer(newLayerDef);
                            	layerIndex[newLayerDef.url] = newLayer;
								me._intervalLayers[newLayerDef.url] = newLayer;
                            	me._map.addLayer(newLayer);

								if (me._prevLayer && me._map.hasLayer(me._prevLayer)) {
									me._map.removeLayer(me._prevLayer);
								}

								me._prevLayer = newLayer;
							}
                        };
                    };

                    me._intervals[layerDefId] = me._setInterval(cycleFunction(layerDef), layerDef.interval || 1000);
                }
                else {

                    var layer = me.addBaseLayer(layerDef); //this._baseLayerIndex[layerDef.url] || this.addBaseLayer(layerDef);

                    if (layer) {
                        if (layerDef.crs) {
                            me._map.options.crs = layerDef.crs;
                        }

                        if (!(layerDef.url in me._lastLayer)) {
                            try {
                                me._map.addLayer(layer);
                            }
                            catch (ex) {
                                console.log(ex);
                            }

                        }

                        layers.push(layer);

                        layerIndex[layerDef.url] = layer;
                    }
                }
            }
            catch (ex) {
                console.log('Could not load layer: ' + layerDef);
                console.log(ex);
            }
        });

        if (me._lastLayer) {
            _.each(me._lastLayer, me._removeFunc(layerIndex));
        }

        this._lastLayer = layerIndex;
    },
    addBaseLayer: function (layerDef) {
        var layer;

        try {
            layer = this._baseLayerIndex[layerDef.url] || this._layerDefToLayer(layerDef);
            //this._map.addLayer(layer);
            //layer.bringToBack();
            this._baseLayerIndex[layerDef.url] = layer;
        }
        catch (ex) {
            console.log(ex);
        }
        return layer;
    },
    setBaseLayers: function (layerDefs) {
        var me = this;
        this._baseLayerIndex = this._baseLayerIndex || {};
        _.each(layerDefs, function (layerDef) {
            //me.addBaseLayer(layerDef);
        });
    },
    _getLayerCenter: function (layer) {
        var center;
        try {
            if (layer.getLatLng) {
                center = layer.getLatLng();
            }
            else {
                var bounds = layer.getBounds();
                if (bounds) {
                    center = bounds.getCenter();
                }
                else {
                    center = new L.LatLng(0, 0);
                }
            }
        }
        catch (ex) {
            console.log(ex);
        }
        return center;
    },
    getLayerPoint: function (id) {
        var layer = this._layers[id];
        if (layer) {
            return this._map.latLngToContainerPoint(this._getLayerCenter(layer));
        }
    },
    highlight: function (id) {
        var layer = this._layers[id];

        if (layer) {
            var bindEvents = function (layer) {
                if (layer.eachLayer) {
                    layer.eachLayer(function (subLayer) {
                        bindEvents(subLayer);
                    });
                }
                else {
                    if (!layer._originalOptions) {
                        layer._originalOptions = $.extend(true, {}, layer.options);
                    }
                    var options = layer.options;

                    if (options.text) {
                        options.text['font-size'] = 'font-size' in options.text ? Number(options.text['font-size']) * 2 : 'inherit';
                    }
                    options.weight = layer._originalOptions.weight * 3;

                    if (!layer._animId) {
                        L.AnimationUtils.animate(layer, {
                            from: layer._originalOptions,
                            to: options
                        });
                    }
                    else {
                        L.Util.cancelAnimFrame(layer._animId);
                        layer._animId = null;
                        layer.setStyle(layer._originalOptions);
                    }
                    //layer.setStyle(options);
                }
            };

            bindEvents(layer);
        }
    },
    unhighlight: function (id) {
        var layer = this._layers[id];

        if (layer) {
            var bindEvents = function (layer) {
                if (layer.eachLayer) {
                    layer.eachLayer(function (subLayer) {
                        bindEvents(subLayer);
                    });
                }
                else {
                    if (layer._animId) {
                        L.Util.cancelAnimFrame(layer._animId);
                        layer._animId = null;
                    }
                    layer.setStyle(layer._originalOptions);
                }
            };

            bindEvents(layer);
        }
    },
    zoomToLayer: function (id) {
        var layer = this._layers[id];
        if (layer) {
            try {
                this._map.setView(this._getLayerCenter(layer), 8); //flyTo
            }
            catch (ex) {
                console.log(ex);
            }
        }
    },
    resize: function (e) {
        try {
            this._map.invalidateSize();
        }
        catch (ex) {
            console.log(ex);
        }
    },
    setZoom: function (zoom) {
        try {
            this._map.setZoom(zoom);
        }
        catch (ex) {
            console.log(ex);
        }
    },
    setCenter: function (center) {
        try {
            if (center) {
                var centerPoint = new L.LatLng(center[1], center[0]);
                this._map.setView(centerPoint);
            }
        }
        catch (ex) {
            console.log(ex);
        }
    },
    _addLayer: function (layer, id) {
        var me = this;

        try {
            layer.clickHandler = me._layerClick(layer);
            layer.on('click', layer.clickHandler);
            this._map.addLayer(layer);
        }
        catch (ex) {
            console.log('Could not add layer: ' + id + '. ' + ex);
        }
    },
    _removeLayer: function (layer, id) {
        try {
            if (id in this._layers && this._map.hasLayer(this._layers[id])) {
                this._map.removeLayer(this._layers[id]);
            }
        }
        catch (ex) {
            console.log(ex);
        }
    },
    _disableControls: function () {
        this._map.dragging.disable();
        this._map.touchZoom.disable();
        this._map.doubleClickZoom.disable();
        this._map.scrollWheelZoom.disable();
    }
});

Focus.Views.OpenLayersMapEngine = Focus.Views.MapEngine.extend({
    initialize: function (options) {
        this._baseLayerIndex = {};
        Focus.Views.MapEngine.prototype.initialize.call(this, options);
    },
    _initContainer: function () {

        this._view = new ol.View({
            // the view's initial state
            center: ol.proj.transform(this.model.get('center'), 'EPSG:4326', 'EPSG:3857'),
            zoom: this.model.get('zoom')
        });

        this._map = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    preload: 4,
                    source: new ol.source.OSM()
                })
            ],
            // Improve user experience by loading tiles while animating. Will make
            // animations stutter on mobile or slow devices.
            loadTilesWhileAnimating: true,
            interactions: [],
            target: this.$el.attr('id'),
            controls: ol.control.defaults({
                attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                    collapsible: false
                })
            }),
            view: this._view
        });

        var selectMouseMove = new ol.interaction.Select({
            condition: ol.events.condition.pointerMove
        });

        this._map.addInteraction(selectMouseMove);
    },
    _layerDefToLayer: function (layerDef) {
        var layer;
        var image = new ol.style.Circle({
            radius: 5,
            fill: null,
            stroke: new ol.style.Stroke({color: 'red', width: 1})
        });

        var styles = {
            'Point': [new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5,
                    fill: null,
                    stroke: new ol.style.Stroke({color: 'red', width: 1})
                })
            })],
            'LineString': [new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'green',
                    width: 1
                })
            })],
            'MultiLineString': [new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'green',
                    width: 1
                })
            })],
            'MultiPoint': [new ol.style.Style({
                image: image
            })],
            'MultiPolygon': [new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'yellow',
                    width: 1
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 0, 0.1)'
                })
            })],
            'Polygon': [new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'blue',
                    lineDash: [4],
                    width: 3
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.1)'
                })
            })],
            'GeometryCollection': [new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'magenta',
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: 'magenta'
                }),
                image: new ol.style.Circle({
                    radius: 10,
                    fill: null,
                    stroke: new ol.style.Stroke({
                        color: 'magenta'
                    })
                })
            })],
            'Circle': [new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'red',
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255,0,0,0.2)'
                })
            })]
        };

        var styleFunction = function(feature, resolution) {
            var styleVal = styles[feature.getGeometry().getType()];
            styleVal[0].text = new ol.style.Text({
                textAlign: 'center',
                textBaseline: 'middle',
                font: '12px helvetica,sans-serif',
                text: feature.get('name'),
                fill: new ol.style.Fill({color: '#000'}),
                stroke: new ol.style.Stroke({color: '#fff', width: 2}),
                offsetX: 0,
                offsetY: 0,
                rotation: 0
            });

            styleVal[0].text_ = styleVal[0].text;
            return styleVal;
        };
        if (layerDef.type === 'tile') {
            layer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: layerDef.url
                })
            });
        }
        else if (layerDef.type === 'wms') {
            layer = new ol.layer.Tile({
                source: new ol.source.TileWMS(/** @type {olx.source.TileWMSOptions} */ ({
                    url: layerDef.url,
                    params: {'LAYERS': layerDef.layers, 'TILED': true}
                }))
            })
        }
        else if (layerDef.type === 'geojson') {
            var geoJSON = new ol.source.GeoJSON({
                object:layerDef.data,
                projection: 'EPSG:3857'
            });
            layer = new ol.layer.Vector({
                source: geoJSON,
                style: styleFunction
            });
        }

        return layer;
    },
    _flyTo: function (sceneModel, fly) {
        var coordinates = sceneModel.get('center');
        var zoom = sceneModel.get('zoom');
        this._fly(coordinates, zoom);
    },
    _fly: function (coordinates, zoom) {
        var point = ol.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857');

        var duration = 2000;
        var start = +new Date();
        var pan = ol.animation.pan({
            duration: duration,
            source: /** @type {ol.Coordinate} */ (this._view.getCenter()),
            start: start
        });
        var bounce = ol.animation.bounce({
            duration: duration,
            resolution: 4 * this._view.getResolution(),
            start: start
        });
        this._map.beforeRender(pan, bounce);
        this._view.setCenter(point);
        this._view.setZoom(zoom);
    },
    _setMapStyle: function (sceneModel) {
        var style = sceneModel.get('style');

        if (style) {
            var filter = style.filter;
            var opacity = style.opacity;
            var background = style.background;
			var backgroundSize = style.backgroundSize;
			
            var $tileContainer = this.$el.find('.leaflet-tile-pane');
            $tileContainer.css('opacity', opacity);
            $tileContainer.css('-webkit-filter', filter);

            this.$el.css('background', background);
			
			if (backgroundSize) {
				this.$el.css('background-size', backgroundSize);
			}
        }
    },
    _setBaseLayer: function (layerDef) {
        var layer = this._baseLayerIndex[layerDef.url] || this.addBaseLayer(layerDef);
        //layer.bringToFront();
    },
    addBaseLayer: function (layerDef) {
        var layer = this._layerDefToLayer(layerDef);
        this._map.addLayer(layer);
        //layer.bringToBack();
        this._baseLayerIndex[layerDef.url] = layer;
        return layer;
    },
    setBaseLayers: function (layerDefs) {
        var me = this;
        this._baseLayerIndex = this._baseLayerIndex || {};
        _.each(layerDefs, function (layerDef) {
            me.addBaseLayer(layerDef);
        });
    },
    getLayerPoint: function (id) {
        var layer = this._layers[id];
        var mapExtent = this._map.getView().calculateExtent(this._map.getSize());
        var layerExtent = layer.getSource().getExtent();
        var centerPoint = ol.extent.getCenter(layerExtent);
        var transformed = ol.proj.transform(centerPoint, 'EPSG:4326', 'EPSG:3857')
        var point = this._map.getPixelFromCoordinate(centerPoint);

        //point = [mapExtent[2] - point[2], mapExtent[3] - point[3]];
        return {
            x: ~~point[0],
            y: ~~point[1]
        };
    },
    zoomToLayer: function (id) {
        var layer = this._layers[id];
        this._fly(ol.extent.getCenter(layer.getSource().getExtent()), 14);
    },
    resize: function (e) {
        //this._map.invalidateSize();
    },
    setZoom: function (zoom) {
        this._map.setZoom(zoom);
    },
    setCenter: function (center) {
        var centerPoint = ol.proj.transform(center, 'EPSG:4326', 'EPSG:3857');
        this._map.setView(centerPoint);
    },
    _addLayer: function (layer, id) {
        var me = this;

        layer.clickHandler = me._layerClick(layer);
        layer.on('click', layer.clickHandler);

        this._map.addLayer(layer);
    },
    _removeLayer: function (layer, id) {
        //layer.off('click', layer.clickHandler);
        //this._map.removeLayer(layer);
    },
    _disableControls: function () {

    }
});

Focus.Views.MapboxMapEngine = Focus.Views.MapEngine.extend({
    initialize: function (options) {
        Focus.Views.MapEngine.prototype.initialize.call(this, options);
    },
    _initContainer: function () {
        mapboxgl.accessToken = 'pk.eyJ1Ijoic2ZhaXJncmlldmUiLCJhIjoiY2FmNGI2OGEwZDI1YTcyMjJkNzQyY2MyMmI0NTRhMzAifQ.b03Wm6qBoeErDTg77XuvzQ';
        this._map = new mapboxgl.Map({
            container: this.$el.attr('id'), // container id
            style: 'mapbox://styles/mapbox/streets-v8', //'mapbox://styles/mapbox/satellite-v8', //this.model.get('baseLayer'), //'mapbox://styles/mapbox/streets-v8', //stylesheet location
            center: this._getCenter(this.model), // starting position
            zoom: this.model.get('zoom') // starting zoom
        });
    },
    _layerDefToLayer: function (layerDef) {
        return layerDef;
    },
    _addLayer: function (layer, id) {
        if (layer.type === 'geojson') {
            this._map.addSource(id, layer);

            this._map.addLayer({
                "id": id,
                "type": "symbol",
                "source": id,
                "layout": {
                    "icon-image": "{icon}-15",
                    "text-field": "{name}",
                    "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                    "text-offset": [0, 0.6],
                    "text-anchor": "top"
                }
            });
        }
    },
    _getCenter: function (sceneModel) {
        var center = sceneModel.get('center');

        if (center) {
            return {lat: center[1], lng: center[0]};
        }
    },
    _getLayersCenter: function (fc) {
        var center = turf.center(fc);

        return {lat: center.geometry.coordinates[1], lng: center.geometry.coordinates[0]};
    },
    _flyTo: function (sceneModel) {
        var center = this._getCenter(sceneModel);
        var me = this;
        var layers = sceneModel.get('layers');
        var fc = {
            type: 'FeatureCollection',
            features: []
        };
        _.each(layers, function (layerDef) {
            if (layerDef.idRef && me._featureLookup) {
                layerDef = $.extend(true, {}, me._featureLookup[layerDef.idRef], layerDef);
            }
            fc.features.push(layerDef.data);
        });

        center = center || this._getLayersCenter(fc);

        if (center) {
            this._map.flyTo({
                center: center,
                zoom: sceneModel.get('zoom'),
                pitch: sceneModel.get('pitch') || 60,
                bearing: sceneModel.get('rotation') || 60
            });
        }
    },
    _disableControls: function () {
        this._map.scrollZoom.disable();
        this._map.dragPan.disable();
    }
});

Focus.Views.SceneNavigator = Backbone.View.extend({
    initialize: function (options) {
        this._$scenes = this.$el.find('section.scene');

        this._sceneIndex = 0;
        this._sceneCount = this._$scenes.length;

        var $sections = $('#nav ul.sections');
        $sections.empty();
        this._$scenes.each(function (index) {
           var $this = $(this);

            var id = $this.attr('id');
            var text = $this.attr('title') || ($this.find('p').text().substring(0, 50) + '...');
            var $li = $('<li><a href="#' + id + '" data-toggle="tooltip" title="' + text  + '" data-placement="auto left" style="white-space: nowrap;"><span class="fa fa-circle-o"></span></a></li>');

            if (index === 0) {
                $li.addClass('active');
            }

            $li.find('a').tooltip({
                container: 'body'
            });

            $sections.append($li);
        });

        this.options = options;
    },
    _sceneChange: function (sceneIndex) {

    },
    changeScene: function (sceneIndex) {
        this._sceneChange(sceneIndex);
        this.trigger('sceneChanged', {sceneIndex: sceneIndex, nextSceneIndex: sceneIndex + 1, sceneId: $(this._$scenes.get(sceneIndex)).attr('data-scene-id'), nextSceneId: $(this._$scenes.get(sceneIndex + 1)).attr('data-scene-id')});
    }
});

Focus.Views.NavigationView = Backbone.View.extend({
    events: {
        'click .previous a': 'previous',
        'click .next a': 'next'
    },
    previous: function (e) {
        e.preventDefault();
        var $prev = this.$el.find('li.active').previousSibling();
        $prev.click();
    },
    next: function (e) {
        e.preventDefault();
        var $next = this.$el.find('li.active').nextSibling();
        $next.click();
    }
});


Focus.Views.ScrollingSceneNavigator = Focus.Views.SceneNavigator.extend({

    initialize: function (options) {
        Focus.Views.SceneNavigator.prototype.initialize.call(this, options);

        $('body').scrollspy({
            target: '#nav'
        });

        var i = 0;
        var me = this;

        me._lasti = 0;

        this._$scenes.each(function (index) {
            var $this = $(this);
            $this.scrollex({
                mode: $this.hasClass('photo-scene') ? 'middle' : 'top',
                enter: function () {
                    me.trigger('sceneChanged', {sceneIndex: index, nextSceneIndex: index + 1, sceneId: $this.attr('data-scene-id')});
                }
           });
        });

        this.$el.find('.figure').each(function (index) {
            var $this = $(this);
            $this.append('<div class="helper"><span class="fa fa-hand-pointer-o helper-icon element-animation"></span><span class="helper-text">Hover to view larger</span></div>');
            $this.on('mouseenter', function (e) {
                $(this).removeClass('help');
            });
            $this.scrollex({
                mode: 'middle',
                enter: function () {
                    $(this).addClass('help');
                },
                leave: function () {
                    $(this).removeClass('help');
                }
            });
        });

        $(document).ready(function() {

            var getMax = function(){
                return $(document).height() - $(window).height();
            }

            var getValue = function(){
                return $(window).scrollTop();
            }

            if ('max' in document.createElement('progress')) {
                // Browser supports progress element
                var progressBar = $('progress');

                // Set the Max attr for the first time
                progressBar.attr({ max: getMax() });

                $(document).on('scroll', _.throttle(function(){
                    // On scroll only Value attr needs to be calculated
                    progressBar.attr({ value: getValue() });
                }, 300));

                $(window).resize(function(){
                    // On resize, both Max/Value attr needs to be calculated
                    progressBar.attr({ max: getMax(), value: getValue() });
                });

            } else {

                var progressBar = $('.progress-bar'),
                    max = getMax(),
                    value, width;

                var getWidth = function() {
                    // Calculate width in percentage
                    value = getValue();
                    width = (value/max) * 100;
                    width = width + '%';
                    return width;
                }

                var setWidth = _.throttle(function(){
                    progressBar.css({ width: getWidth() });
                }, 300);

                $(document).on('scroll', setWidth);
                $(window).on('resize', function(){
                    // Need to reset the Max attr
                    max = getMax();
                    setWidth();
                });
            }

            $(document).trigger('scroll');
        });
    }
});

Focus.Views.ButtonSceneNavigator = Focus.Views.SceneNavigator.extend({
    events: {
        'click li.previous a': 'previous',
        'click li.next a': 'next',
        'click a.next-scene': 'next'
    },
    initialize: function (options) {
        Focus.Views.SceneNavigator.prototype.initialize.call(this, options);
        this._$scenes.hide();
        this._sceneChange(0);
    },
    _hideScene: function ($scene) {
        this.options.hideScene ? this.options.hideScene($scene) : $scene.hide();
    },
    _showScene: function ($scene) {
        this.options.showScene ? this.options.showScene($scene) : $scene.show();
    },
    _sceneChange: function (sceneIndex) {
        if (this._lastScene) {
            if (sceneIndex === 0) {
                this._lastScene.hide();
            }
            else {
                this._hideScene(this._lastScene);
            }
        }

        this._lastScene = $(this._$scenes[sceneIndex]);
        if (sceneIndex === 0) {
            this._lastScene.show();
        }
        else {
            this._showScene(this._lastScene);
        }
    },
    previous: function (e) {
        e.preventDefault();
        this._sceneIndex -= 1;
        this._sceneIndex = Math.max(0, this._sceneIndex);
        this.changeScene(this._sceneIndex);
    },
    next: function (e) {
        e.preventDefault();
        this._sceneIndex += 1;
        this._sceneIndex = this._sceneIndex % this._$scenes.size();
        this.changeScene(this._sceneIndex);
    }
});

Focus.Views.ProgressView = Backbone.View.extend({
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    updateProgress: function (progress) {
        this.model.set('progress', progress);
    },
    render: function () {
        this.$el.find('#bar').css('width', (this.model.get('progress') * 100) + '%');
        return this;
    }
});

Focus.Util = {
    getLine: function (mapView, $target, layerId, drawStyle) {
        var offset = $target.offset();
        var point = mapView.getLayerPoint(layerId);

        if (point) {
            var x1 = point.x + mapView.$el.offset().left;
            var y1 = point.y + mapView.$el.offset().top;
            var x2 = offset.left;
            var y2 = offset.top;

            var bezierLine = d3.svg.line()
                .x(function (d) {
                    return d[0];
                })
                .y(function (d) {
                    return d[1];
                })
                .interpolate("basis");

            var svg = d3.select(document.createElement('div'))
                .append("svg")
                .attr('class', 'line')
                .attr('id', layerId + '-line')
                .attr('style', 'z-index:9;position:absolute;top:' + ~~(y2 + $target.outerHeight() / 2) + 'px;left:' + ~~(x2 + $target.outerWidth() / 2) + 'px;');

            var defs = svg.append('defs');
            var marker = defs.append('marker')
                .attr('id', 'marker')
                .attr("viewBox", "0 0 10 10")
                .attr('refX', '9')
                .attr('refY', '5')
                .attr('markerWidth', '6')
                .attr('markerHeight', '6')
                .attr('orient', 'auto');
            var markerPath = marker.append('path')
                .attr('class', 'marker-path')
                .attr('d', 'M 0 0 L 10 5 L 0 10 z')
                .attr('stroke', 'rgb(0, 123, 71)')
                .attr('stroke-width', '0.1px')
                .attr('fill', 'rgb(0, 123, 71)');

            var anchorX = (x1 - x2 - ($target.outerWidth() / 2)) / 2;
            var anchorY = 0;
            drawStyle = drawStyle || 'hv';
            if (drawStyle === 'c') {
                anchorY = (y1 - y2 - ($target.outerHeight() / 2)) / 2;
            }
            else if (drawStyle === 'vh') {
                anchorY = y1 - y2 - ($target.outerHeight() / 2);
                anchorX = 0
            }

            var path = svg.append('path')
                .attr('class', 'line')
                .attr("d", bezierLine([[0, 0], [anchorX, anchorY], [x1 - x2 - ($target.outerWidth() / 2), y1 - y2 - ($target.outerHeight() / 2)]]))
                .attr("stroke", "rgb(0, 123, 71)")
                .attr("stroke-width", 3)
                .attr("fill", "none")
                .attr('marker-end', 'url(#marker)')
                .transition()
                .duration(500)
                .attrTween("stroke-dasharray", function () {
                    var len = this.getTotalLength();
                    return function (t) {
                        return (d3.interpolateString("0," + len, len + ",0"))(t)
                    };
                });

            return $(svg.node());
        }
    }
};

Focus.Views.ShareView = Backbone.View.extend({
    el: $('ul.share'),
    render: function () {
        this.$el.find('a').each(function () {
            var $this = $(this);
            var href = $this.attr('href');

            href = href.replace(/\[TITLE\]/gi, 'Focus on Geography - ' + (document.title.length > 0 ? document.title : $('h2.title').text()));
            href = href.replace(/\[URL\]/gi, window.location.href);

            $this.attr('href', href);

            $this.tooltip({
                container: 'body',
                placement: 'auto left'
            });
        });

        return this;
    }
});

Focus.Views.AudioView = Backbone.View.extend({
    events: {
        'click .play-button': 'play'
    },
    initialize: function (options) {
        var $wavesurfer = this.$el.find('.wavesurfer');
        $wavesurfer.empty();
        this._wavesurfer = WaveSurfer.create(_.extend({
            container: $wavesurfer[0]
        }, {
            height: this.$el.height()
        }, options.createOptions));
        this._isPlaying = false;
        this.setButton();
        this._wavesurfer.load(options.audio);

        var me = this;
        var $playButton = me.$el.find('.play-button');
        $playButton.attr('disabled', true);

        this._wavesurfer.on('ready', function (e) {
            $playButton.attr('disabled', false);
        });


    },
    stop: function () {
        this._wavesurfer.stop();
        this._isPlaying = false;
        this.setButton();
    },
    clear: function () {
        this._wavesurfer.empty();
    },
    setButton: function () {
        var removeClass, addClass;
        if (this._isPlaying) {
            removeClass = 'play';
            addClass = 'pause';
        }
        else {
            removeClass = 'pause';
            addClass = 'play';
        }

        this.$el.find('span.fa').removeClass('fa-' + removeClass).addClass('fa-' + addClass);
    },
    play: function (e) {
        e.preventDefault();
        this._isPlaying ? this._wavesurfer.pause() : this._wavesurfer.play();
        this._isPlaying = !this._isPlaying;
        this.setButton();
    }
});

Focus.Views.SceneManagerView = Backbone.View.extend({
    initialize: function (options) {
        this._scenes = new Focus.Collections.SceneCollection();

        this._sceneNavigator = options.navigator;
        this._navigatorClass = options.navigatorClass;
        this._mapEngineClass = options.mapEngineClass;
        this.options = options;
        this.listenTo(Focus.Events, 'drawLine', this.drawLine);

        this.setupProgress();
        this.setupMap();
        this.setupScenes();

        this.loadScenes();

        if (!options.preventLinkBind) {
        $(document).ready(function () {
            var $mainNav = $('#main-nav');
            // bind click event to all internal page anchors
            $('a:not(.location)[href*="#"]').on('click', function (e) {
                // prevent default action and bubbling
                e.preventDefault();
                e.stopPropagation();
                // set target to anchor's "href" attribute
                var target = $(this).attr('href');
                // scroll to each target
                $(target).velocity('scroll', {
                    duration: 500,
                    //offset: 40,
                    offset: L.Browser.mobile ? -1 * $mainNav.outerHeight() : 0,
                    easing: 'ease-in-out'
                });
            });
        });
        }
        var me = this;
        this.$el.find('a.location').each(function () {
            var textClick = function () {
                $('#text').removeClass('transparent');
                $('#overview-map').addClass('transparent');
            };

            var mouseover = _.throttle(function (e) {
                var $this = $(this);
                $this.tooltip('hide');
                e.preventDefault();
                e.stopPropagation();
                var offset = $this.offset();
                var id = $this.attr('data-layer-id');
                var point = me._mapView0.getLayerPoint(id);
                if (point) {
                    try {
                        me._mapView0.highlight(id);
                    }
                    catch (ex) {
                        console.log(ex);
                    }
                    var x1 = point.x + me._mapView0.$el.offset().left;
                    var y1 = point.y + me._mapView0.$el.offset().top;
                    var x2 = offset.left;
                    var y2 = offset.top;

                    var bezierLine = d3.svg.line()
                        .x(function (d) {
                            return d[0];
                        })
                        .y(function (d) {
                            return d[1];
                        })
                        .interpolate("basis");

                    var svg = d3.select(me.$el[0])
                        .append("svg")
                        .attr('class', 'line')
                        .attr('id', id + '-line')
                        .attr('style', 'z-index:100000;position:absolute;top:' + ~~(y2 + $(this).outerHeight() / 2) + 'px;left:' + ~~x2 + 'px;');

                    var defs = svg.append('defs');
                    var marker = defs.append('marker')
                        .attr('id', 'marker')
                        .attr("viewBox", "0 0 10 10")
                        .attr('refX', '9')
                        .attr('refY', '5')
                        .attr('markerWidth', '6')
                        .attr('markerHeight', '6')
                        .attr('orient', 'auto');
                    var markerPath = marker.append('path')
                        .attr('class', 'marker-path')
                        .attr('d', 'M 0 0 L 10 5 L 0 10 z')
                        .attr('stroke', 'rgb(0, 123, 71)')
                        .attr('stroke-width', '0.1px')
                        .attr('fill', 'rgb(0, 123, 71)');

                    var path = svg.append('path')
                        .attr("class", "line")
                        .attr("d", bezierLine([[0, 0], [(x1 - x2) / 2, 0], [x1 - x2, y1 - y2 - ($(this).outerHeight() / 2)]]))
                        .attr("stroke", "rgb(0, 123, 71)")
                        .attr("stroke-width", 3)
                        .attr("fill", "none")
                        .attr('marker-end', 'url(#marker)')
                        .transition()
                        .duration(500)
                        .attrTween("stroke-dasharray", function () {
                            var len = this.getTotalLength();
                            return function (t) {
                                return (d3.interpolateString("0," + len, len + ",0"))(t)
                            };
                        });
                    var $text = $('#text');
                    $text.addClass('transparent');
                    $('#overview-map').removeClass('transparent');
                    $text.on('click', textClick);
                    $this.addClass('selected-link');
                }
            }, 10);

            var mouseleave = _.throttle(function (e) {
                var $this = $(this);
                $this.tooltip('hide');
                e.preventDefault();
                e.stopPropagation();
                var id = $this.attr('data-layer-id');
                try {
                    me._mapView0.unhighlight(id);
                }
                catch (ex) {
                    console.log(ex);
                }
                me.$el.find('#' + id + '-line').remove();

                var $text = $('#text');
                $text.removeClass('transparent');
                $('#overview-map').addClass('transparent');
                $text.off('click', textClick);
                $this.removeClass('selected-link');
            }, 10);

            $(this).on('mouseenter touchstart', mouseover).on('mouseleave touchend click', mouseleave);
        });
    },
    drawLine: function (event) {
        var $el = Focus.Util.getLine(this._mapView0, event.$target, event.layerId, event.drawStyle);
        $('body').prepend($el);
    },
    _loadFeatures: function (features) {
        var me = this;
        me._featureLookup = {};

        if (features) {
            _.each(features, function (feature) {
                me._featureLookup[feature.id] = feature;
            });

            me._mapView0.setFeatures(me._featureLookup);
        }
    },
    _scenesLoaded: function (scenes) {
        this._scenes.add(scenes);

        if (this._sceneNavigator || this._navigatorClass) {
        this._sceneNavigator = this._sceneNavigator || new this._navigatorClass({
            el: this.$el.find('.scenes')
        });
        this.listenTo(this._sceneNavigator, 'sceneChanged', this.changeScene);
        this.listenTo(this._sceneNavigator, 'progressChanged', this.changeProgress);
        }

        this._mapView0.setBaseLayers(_.map(scenes, function (scene) {
            return scene.baseLayer;
        }));

        this.changeScene({
            sceneIndex: 0,
            nextSceneIndex: 1
        });
    },
    loadScenes: function () {
        var me = this;
        me._loadFeatures(scenes.features);
        me._scenesLoaded(scenes.scenes);

    },
    setupMap: function () {
        console.log(this.options.initialScene);
        this._mapView0 = new Focus.Views.MapView({
            el: this.$el.find('#map'),
            engineClass: this._mapEngineClass,
            model: new Backbone.Model({
                initialScene: new Focus.Models.SceneModel($.extend(true, {}, {
                    baseLayer: {
                        type: 'tile',
                        url: 'https://a.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=b57289fed78a44df8828d53a3e03de00' //'https://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', ''https://a.tile.thunderforest.com/cycle/{z}/{x}/{y}.png' //
                    },
                    center: [0,0],
                    zoom: 4,
                    style: {
                        filter: 'sepia(0%)',
                        opacity: 0.8
                    }
                }, this.options.initialScene))
            })
        });
    },
    setupProgress: function () {
        this._progressModel = new Focus.Models.ProgressModel();

        this._progressView = new Focus.Views.ProgressView({
            el: this.$el.find('#progress'),
            model: this._progressModel
        });

        this.$el.append(this._progressView.render().el);
    },
    setupScenes: function () {
        var me = this;
        var $photos = this.$el.find('#photos');
        var $map = this.$el.find('#map');
        var $overviewMap = this.$el.find('#overview-map');
        var $text = this.$el.find('#text');
        this.$el.find('.scene:not(.photo-scene) .figure').each(function () {
            var $next = $(this).next();
            var caption = '';
            if ($next.hasClass('caption')) {
                caption = $next.html();
            }

            $(this).on('mouseover touchstart', function (e) {
                $photos.css('background-image',$(this).css('background-image'));
                if ($(this).hasClass('contain')) {
                    $photos.addClass('contain');
                }
                else {
                    $photos.removeClass('contain');
                }
                $map.css('opacity',0);
                $overviewMap.css('opacity',0);
                $photos.find('#photo-caption').html(caption);
            });
            $(this).on('mouseout touchend', function (e) {
                $map.css('opacity',1);
                $overviewMap.css('opacity',1);
            });
            $(this).on('mousemove touchmove', function (e) {
                var $this = $(this);
                var height = $this.height();
                var width = $this.width();
                var x = e.offsetX==undefined?e.layerX:e.offsetX;
                var y = e.offsetY==undefined?e.layerY:e.offsetY;
                $photos.css('left', -1 * x);
                $photos.css('background-position', '50% ' + (y/height * 100) + '%')
            });
        });
    },
    changeScene: function (sceneInfo) {
        var sceneModels = [this._scenes.findWhere({
            id: sceneInfo.sceneId
        }), this._scenes.findWhere({
            id: sceneInfo.nextSceneId
        })];

        this._i = this._i || 0;
        this._i += 1;
        var index0 = this._i % 2;
        var index1 = (this._i + 1) % 2;

        if (sceneInfo.sceneIndex < this._scenes.models.length) {
            this._mapView0.setScene(this._scenes.models[sceneInfo.sceneIndex], this._i > 1); //index0 === 0);
        }
    },
    changeProgress: function (progress) {
        this._progressModel.set('progress', progress);
    },
    render: function () {

    }
});

Focus.Views.OverviewMapView = Focus.Views.MapView.extend({
    el: $('#overview-map'),
    initialize: function (options) {
        options = options || {};
        options.engineClass = options.engineClass || Focus.Views.LeafletMapEngine;
        Focus.Views.MapView.prototype.initialize.call(this, options);
        this.listenTo(Focus.Events, 'viewChanged', this.viewChanged);

        if (options.showCenterPoint) {
            this._centerPoint = new L.RegularPolygonMarker(new L.LatLng(0, 0), {
                radius: 30,
                color: '#333',
                numberOfSides: 4,
                rotation: 45,
                fill: false,
                gradient: false,
                weight: 1,
                opacity: 1
            });
            this._engine._map.addLayer(this._centerPoint);
        }
    },
    toggle: function () {
        this.$el.toggleClass('transparent');
    },
    viewChanged: function (view) {
        if (view.center) {
            this.setCenter(view.center);
            this.setZoom(3);

            if (this._centerPoint) {
                this._centerPoint.setLatLng(new L.LatLng(view.center[1], view.center[0]));
            }
        }
    }
});

Focus.Models.ModalModel = Backbone.Model.extend({
    defaults: function () {
        return {
            title: '',
            content: '',
            showFooter: true
        };
    }
});

Focus.Views.ModalView = Backbone.View.extend({
    events: {
        'click .btn': 'go'
    },
    className: 'modal fade',
    template: _.template($('#modal-template').html()),
    initialize: function (options) {
        this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
        this.$el.html(this.template(this.model.attributes));
        this.$el.modal({
            backdrop: 'static',
            keyboard: false
        });
        return this;
    },
    show: function () {
        this.$el.modal('show');
        return this;
    },
    hide: function () {
        this.$el.modal('hide');
        return this;
    },
    go: function (e) {
        e.preventDefault();

        Focus.Events.trigger('next');
        this.hide();
    }
});

Focus.Views.LazyLoader = Backbone.View.extend({
    el: $('#text'),
    initialize: function (options) {
        this.options = options || {};
        this.options.imgSelector = this.options.imgSelector || 'img';
        this.options.divSelector = this.options.divSelector || 'div.figure';
    },
    render: function () {
        var $text = this.$el;
        var location = '' + window.location;
        var me = this;
        location = location.replace('index.html','');

        $text.find(this.options.imgSelector).each(function () {
            var $this = $(this);
            $this.attr('data-original', $(this).attr('src'));
            $this.removeAttr('src');

        });
        $text.find(this.options.divSelector).each(function () {
            var $this = $(this);
            var backgroundImage = $this.css('background-image');

            if (backgroundImage !== 'none') {
                backgroundImage = backgroundImage.replace(/url\(/g, '').replace(/\)/g, '').replace(location, '').replace(/['"]/g, '');

                $this.attr('data-original', backgroundImage);
                $this.css('background-image', 'url(' + me.options.loadingImage || '../../../img/focus-logo-notext.svg' + ')');
            }
        });
        var lazyLoad = new LazyLoad({
            elements_selector: [this.options.imgSelector, this.options.divSelector].join(', ')
        });
        return this;
    }
});

Focus.Views.LegendView = Backbone.View.extend({
    initialize: function (options) {
        this.options = options || {};
    },
    _success: function (data) {
        var layers = data.layers;
        var me = this;
        var template = _.template('<div class="legend-line"><img class="legend-key" src="data:<%= contentType %>;base64,<%= imageData %>" style="width: <%= width %>px; height: <%= height %>px;"/><span class="legend-label"><%= label %></span></div>');

        me.$el.addClass('legend');
        _.each(layers, function (layer) {
			var include = me.options.text ? me.options.text[layer.layerName] : true;

			if (include) {
				var title = me.options.text && me.options.text[layer.layerName] ? me.options.text[layer.layerName] : layer.layerName;
            	me.$el.append('<h4 class="legend-title">' + title + '</h4>');
            	if (layer.legend) {
               		_.each(layer.legend, function (legend) {
                		me.$el.append(template(legend));
               		});
            	}
			}
        });
    },
    render: function () {
        var me = this;
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: this.options.url,
            success: function (data) {
                me._success(data);
            }
        });
    }
});


$(document).ready(function () {
    $('#toggle-map').on('click', function (e) {
      $('#text').toggleClass('shifted');
    });

    $('a.location:first').tooltip({
        //container: '#text',
        container: 'body',
        html: true,
        template: '<div class="tooltip helper-tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        title: '<a class="location">Text with a dotted underline</a> indicates a place mention. Hover over any place mention to see the associated place on the map.',
		placement: 'bottom'
    })
        .on('shown.bs.tooltip', function () {
            $(this).append('<span class="fa fa-hand-pointer-o helper-icon element-animation1"></span>');
        })
        .on('hidden.bs.tooltip', function () {
            $(this).find('span').remove();
            $(this).tooltip('destroy');
        }).tooltip('show');
});
