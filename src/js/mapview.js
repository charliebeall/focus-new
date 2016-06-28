/**
 * Created by scottfairgrieve on 3/26/16.
 */
var Focus = Focus || {};
Focus.Views = Focus.Views || {};
Focus.Models = Focus.Models || {};
Focus.Collections = Focus.Collections || {};
Focus.Events = _.extend({}, Backbone.Events);

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
    setBaseLayers: function (layers) {

    },
    _setMapStyle: function (sceneModel) {

    },
    _addLayer: function (layer) {

    },
    _removeLayer: function (layer) {

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
            me._removeLayer(key);
        });

        this._layers = {};

        _.each(layers, function (layer, key) {
            var newLayer = me._layerDefToLayer(layer);
            me._addLayer(newLayer);
            me._layers[layer.id || layer.idRef] = newLayer;
        });
    },
    _disableControls: function () {
        // Override

    }
});

Focus.Views.LeafletMapEngine = Focus.Views.MapEngine.extend({
    initialize: function (options) {
        this._baseLayerIndex = {};
        Focus.Views.MapEngine.prototype.initialize.call(this, options);

    },
    _initContainer: function () {
        this._map = new L.Map(this.$el.attr('id'), {
            center: this.model.get('center'),
            zoom: this.model.get('zoom'),
            zoomControl: false,
            worldCopyJump: true,
            zoomAnimationThreshold: 3,
            markerZoomAnimation: false,
            zoomDelta: 0.5,
            //renderer: L.canvas()
        });
    },
    _layerDefToLayer: function (layerDef) {
        var layer;
        var me = this;

        // If there's an idRef attribute then get the layer definition from the feature lookup
        // and merge it with the style info. included in layer
        if (layerDef.idRef && this._featureLookup) {
            layerDef = $.extend(true, {}, this._featureLookup[layerDef.idRef], layerDef);
        }

        if (layerDef.type === 'vector') {
            var colors = {
                base: '#f7ecdc',
                land: '#f7ecdc',
                water: 'rgba(0,0,0,0.2)', //'#357abf',
                //coastline: '#000',
                grass: '#E6F2C1',
                beach: '#FFEEC7',
                park: '#a5af6e',
                cemetery: '#D6DED2',
                wooded: '#C3D9AD',
                agriculture: '#F2E8B6',
                building: '#b3bdc4',
                hospital: 'rgb(229,198,195)',
                school: '#FFF5CC',
                sports: '#B8E6B8',
                residential: '#f7ecdc',
                commercial: '#f7ecdc',
                industrial: '#f7ecdc',
                parking: '#EEE',
                big_road: '#673919',
                little_road: '#b29176',
                railway: '#ef7369'
            };

            layer = L.tileLayer.hoverboard(layerDef.url, {hidpiPolyfill: true});
            layer
                .render('landuse')
                .minZoom(9)
                .fillBy('kind', {
                    allotments: colors.base,
                    apron: colors.base,
                    cemetery: colors.cemetery,
                    cinema: colors.base,
                    college: colors.school,
                    //coastline: colors.coastline,
                    commercial: colors.industrial,
                    common: colors.residential,
                    farm: colors.park,
                    farmland: colors.park,
                    farmyard: colors.park,
                    footway: colors.little_road,
                    forest: colors.park,
                    fuel: colors.base,
                    garden: colors.park,
                    glacier: colors.water,
                    golf_course: colors.sports,
                    grass: colors.park,
                    hospital: colors.hospital,
                    industrial: colors.industrial,
                    land: colors.land,
                    library: colors.school,
                    meadow: colors.park,
                    nature_reserve: colors.park,
                    park: colors.park,
                    parking: colors.parking,
                    pedestrian: colors.little_road,
                    pitch: colors.base,
                    place_of_worship: colors.base,
                    playground: colors.sports,
                    quarry: colors.industrial,
                    railway: colors.railway,
                    recreation_ground: colors.park,
                    residential: colors.residential,
                    retail: colors.industrial,
                    runway: colors.base,
                    school: colors.school,
                    scrub: colors.park,
                    sports_centre: colors.sports,
                    stadium: colors.sports,
                    taxiway: colors.little_road,
                    theatre: colors.industrial,
                    university: colors.school,
                    village_green: colors.park,
                    wetland: colors.water,
                    conservation: colors.park,
                    wood: colors.wooded,
                    urban_area: colors.residential,
                    park: colors.park,
                    brownfield: colors.park,
                    protected: colors.park,
                    protected_area: colors.park,
                    //maritime: '#ff0000'
                })

                .render('roads')
                .minZoom(7)
                .where('kind', ['minor_road', 'path'])
                .stroke(2, 'rgba(255, 255, 255, 0.5)')
                .stroke(0.5, colors.little_road)

                .render('buildings')
                .fill('#888896')
                .stroke(0.5, 'rgba(0,0,0,0.4)')

                .render('water')
                .where('kind', ['ocean', 'water'])
                .whereNot('boundary', ['yes'])
                .fill(colors.water)
                .stroke(0.5, colors.water)

                .render('water')
                .where('kind', ['river', 'stream', 'canal'])
                .stroke(0.5, colors.water)

                .render('water')
                .where('kind', ['riverbank'])
                .whereNot('boundary', ['yes'])
                .fill(colors.water)

                .render('roads')
                .where('kind', ['major_road', 'highway', 'rail'])
                .stroke(3.75, 'rgba(255, 255, 255, 0.5)')
                .stroke(0.75, colors.big_road)
        }
        else if (layerDef.type === 'tile') {
            layer = new L.TileLayer(layerDef.url, $.extend(true, {}, layerDef, {
                detectRetina: true
            }));
        }
        else if (layerDef.type === 'wms') {
            layer = new L.TileLayer.WMS(layerDef.url, $.extend(true, layerDef.params, {
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
            }, layerDef.style);

            var onEachRecord = function (layerDef) {
                return function (layer, record) {
                    layer.on('click', function (e) {
                        me.trigger('layerClick', layerDef.id);
                    });
                };
            };
            layer = new L.ChoroplethDataLayer([layerDef.data], {
                recordsField: null,
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
                        marker = new L.Marker(location, {
                            icon: new L.DivIcon({
                                className: options.icon.className,
                                html: options.icon.html,
                                iconSize: new L.Point(options.icon.iconSize[0], options.icon.iconSize[1]),
                                iconAnchor: new L.Point(options.icon.iconAnchor[0], options.icon.iconAnchor[1])
                            })
                        });
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

            var extent = turf.extent(layerDef.data);

            var bounds = new L.LatLngBounds(new L.LatLng(extent[1], extent[0]), new L.LatLng(extent[3], extent[2]));

            layer._bounds = bounds;
        }

        return layer;
    },
    _calculateBounds: function () {
        var bounds = new L.LatLngBounds();
        var me = this;

        _.each(this._layers, function (layer) {
            if (me._map.hasLayer(layer)) {
                /*if (layer.getLatLng) {
                    bounds.extend(layer.getLatLng());
                }
                else if (layer.getBounds) {
                    bounds.extend(layer.getBounds());
                }*/
                if (layer._bounds) {
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
            bounds = this._calculateBounds();
            coordinates = [bounds.getCenter().lng, bounds.getCenter().lat];
            sceneModel.set('center', coordinates);
        }
        var zoom = sceneModel.get('zoom');
        var latLng = new L.LatLng(coordinates[1], coordinates[0]);

        fly = 'fly' in sceneModel.attributes ? sceneModel.get('fly') : true;
        if (fly) {
            if (bounds) {
                me._map.flyToBounds(bounds, $.extend(true, sceneModel.get('panZoomOptions') || {}, {
                    maxZoom: zoom
                }));
            }
            else {
                me._map.flyTo(latLng, zoom);
            }
        }
        else {
            if (bounds) {
                me._map.fitBounds(bounds, {
                    maxZoom: zoom
                });
            }
            else {
                this._map.setView(latLng, zoom);
            }
        }

        sceneModel.set('bounds', this._map.getBounds());

    },
    _setMapStyle: function (sceneModel) {
        var style = sceneModel.get('style');

        if (style) {
            var filter = style.filter;
            var opacity = style.opacity;
            var background = style.background;

            var $tileContainer = this.$el.find('.leaflet-tile-pane');
            $tileContainer.css('opacity', opacity);
            $tileContainer.css('-webkit-filter', filter);
            $tileContainer.css('-moz-filter', filter);
            $tileContainer.css('-ms-filter', filter);
            $tileContainer.css('filter', filter);

            this.$el.css('background', background);
        }
    },
    _setBaseLayer: function (layerDef) {
        var me = this;
        var layerDefs = _.isArray(layerDef) ? layerDef : [layerDef];
        var layers = [];
        var layerIndex = {};

        me._lastLayer = me._lastLayer || {};

        _.each(layerDefs, function (layerDef) {
            var layer = me.addBaseLayer(layerDef); //this._baseLayerIndex[layerDef.url] || this.addBaseLayer(layerDef);

            if (!(layerDef.url in me._lastLayer)) {
                me._map.addLayer(layer);
                console.log('Added: ' + layerDef.url);
            }

            layers.push(layer);

            layerIndex[layerDef.url] = layer;
        });

        if (this._lastLayer) {
            var removeFunc = function (layerIndex) {
                return function (layer, key) {
                    if (!(key in layerIndex)) {
                        me._map.removeLayer(layer);
                        console.log('Removed: ' + key);
                    }
                };
            };
            _.each(this._lastLayer, removeFunc(layerIndex));
        }

        this._lastLayer = layerIndex;
    },
    addBaseLayer: function (layerDef) {
        var layer = this._baseLayerIndex[layerDef.url] || this._layerDefToLayer(layerDef);
        //this._map.addLayer(layer);
        //layer.bringToBack();
        this._baseLayerIndex[layerDef.url] = layer;
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
        if (layer.getLatLng) {
            center = layer.getLatLng();
        }
        else {
            var bounds = layer.getBounds();
            if (bounds) {
                center = bounds.getCenter();
            }
            else {
                center = new L.LatLng(0,0);
            }
        }
        return center;
    },
    getLayerPoint: function (id) {
        var layer = this._layers[id];
        return this._map.latLngToContainerPoint(this._getLayerCenter(layer));
    },
    highlight: function (id) {
        var layer = this._layers[id];
        layer.fire('mouseover');
    },
    unhighlight: function (id) {
        var layer = this._layers[id];
        layer.fire('mouseout');
    },
    zoomToLayer: function (id) {
        var layer = this._layers[id];
        this._map.setView(this._getLayerCenter(layer), 8); //flyTo
    },
    resize: function (e) {
        this._map.invalidateSize();
    },
    setZoom: function (zoom) {
        this._map.setZoom(zoom);
    },
    setCenter: function (center) {
        var centerPoint = new L.LatLng(center[1], center[0]);
        this._map.setView(centerPoint);
    },
    _addLayer: function (layer) {
        var me = this;

        layer.clickHandler = me._layerClick(layer);
        layer.on('click', layer.clickHandler);

        this._map.addLayer(layer);
    },
    _removeLayer: function (layer) {
        this._map.removeLayer(this._layers[layer]);
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

            var $tileContainer = this.$el.find('.leaflet-tile-pane');
            $tileContainer.css('opacity', opacity);
            $tileContainer.css('-webkit-filter', filter);

            this.$el.css('background', background);
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
    _addLayer: function (layer) {
        var me = this;

        layer.clickHandler = me._layerClick(layer);
        layer.on('click', layer.clickHandler);

        this._map.addLayer(layer);
    },
    _removeLayer: function (layer) {
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
            style: this.model.get('baseLayer'), //'mapbox://styles/mapbox/streets-v8', //stylesheet location
            center: this.model.get('center'), // starting position
            zoom: this.model.get('zoom') // starting zoom
        });
    },
    _flyTo: function (sceneModel) {
        this._map.flyTo({
            center: sceneModel.get('center'),
            zoom: sceneModel.get('zoom'),
            pitch: sceneModel.get('pitch'),
            bearing: sceneModel.get('rotation')
        });
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

        $('#nav ul.sections').empty();
        this._$scenes.each(function () {
           var $this = $(this);

            var id = $this.attr('id');

            $('#nav ul.sections').append('<li><a href="#' + id + '"><span class="fa fa-circle-o"></span></a></li>');
        });


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
        'click ul>li.previous>a': 'previous',
        'click ul>li.next>a': 'next'
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

        var i = 0;
        var lasti = 0;
        var me = this;
        this.$el.scrollex({
            top: '400px',
            bottom: '400px',
            scroll: function (progress) {

                if (progress > 0.01) {
                    //$('body').addClass('scrolled');
                }
                else {
                    //$('body').removeClass('scrolled');
                }

                setTimeout(function () {
                    i = ~~(progress * me._sceneCount) % me._sceneCount;

                    if (i !== lasti) {
                        me.changeScene(i);
                    }

                    lasti = i;

                    me.trigger('progressChanged', progress);
                }, 0);
            }
        });
    }
});

Focus.Views.ButtonSceneNavigator = Focus.Views.SceneNavigator.extend({
    events: {
        'click .previous': 'previous',
        'click .next': 'next'
    },
    initialize: function (options) {
        Focus.Views.SceneNavigator.prototype.initialize.call(this, options);
        this._$scenes.hide();
        this._sceneChange(0);
    },
    _sceneChange: function (sceneIndex) {
        if (this._lastScene) {
            this._lastScene.hide();
        }

        this._lastScene = $(this._$scenes[sceneIndex]);
        this._lastScene.show();
    },
    previous: function (e) {
        e.preventDefault();
        this._sceneIndex -= 1;
        this.changeScene(this._sceneIndex);
    },
    next: function (e) {
        e.preventDefault();
        this._sceneIndex += 1;
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
        var x1 = point.x + mapView.$el.offset().left;
        var y1 = point.y + mapView.$el.offset().top;
        var x2 = offset.left;
        var y2 = offset.top;

        var bezierLine = d3.svg.line()
            .x(function(d) { return d[0]; })
            .y(function(d) { return d[1]; })
            .interpolate("basis");

        var svg = d3.select(document.createElement('div'))
            .append("svg")
            .attr('class', 'line')
            .attr('id', layerId + '-line')
            .attr('style', 'z-index:9;position:absolute;top:' + ~~(y2 + $target.outerHeight()/2) + 'px;left:' + ~~(x2 + $target.outerWidth()/2) + 'px;');

        var defs = svg.append('defs');
        var marker = defs.append('marker')
            .attr('id','marker')
            .attr("viewBox","0 0 10 10")
            .attr('refX', '9')
            .attr('refY', '5')
            .attr('markerWidth', '6')
            .attr('markerHeight', '6')
            .attr('orient', 'auto');
        var markerPath = marker.append('path')
            .attr('d','M 0 0 L 10 5 L 0 10 z')
            .attr('stroke', 'darkgreen')
            .attr('stroke-width', '0.1px')
            .attr('fill', 'darkgreen');

        var anchorX = (x1 - x2 - ($target.outerWidth()/2))/2;
        var anchorY = 0;
        drawStyle = drawStyle || 'hv';
        if (drawStyle === 'c') {
            anchorY = (y1 - y2 - ($target.outerHeight()/2))/2;
        }
        else if (drawStyle === 'vh') {
            anchorY = y1 - y2 - ($target.outerHeight()/2);
            anchorX = 0
        }

        var path = svg.append('path')
            .attr("d", bezierLine([[0, 0], [anchorX, anchorY], [x1 - x2 - ($target.outerWidth()/2),y1 - y2 - ($target.outerHeight()/2)]]))
            .attr("stroke", "darkgreen")
            .attr("stroke-width", 3)
            .attr("fill", "none")
            .attr('marker-end', 'url(#marker)')
            .transition()
            .duration(500)
            .attrTween("stroke-dasharray", function() {
                var len = this.getTotalLength();
                return function(t) { return (d3.interpolateString("0," + len, len + ",0"))(t) };
            });

        return $(svg.node());
    }
};

Focus.Views.ShareView = Backbone.View.extend({
    el: $('ul.share'),
    render: function () {
        this.$el.find('a').each(function () {
            var $this = $(this);
            var href = $this.attr('href');

            href = href.replace(/\[TITLE\]/gi, 'Focus on Geography - ' + $('h2.title').text());
            href = href.replace(/\[URL\]/gi, window.location.href);

            $this.attr('href', href);
        });
        return this;
    }
});

Focus.Views.SceneManagerView = Backbone.View.extend({
    initialize: function (options) {
        this._scenes = new Focus.Collections.SceneCollection();

        this._sceneNavigator = options.navigator;
        this._navigatorClass = options.navigatorClass;
        this._mapEngineClass = options.mapEngineClass;

        this.listenTo(Focus.Events, 'drawLine', this.drawLine);

        this.setupProgress();
        this.setupMap();
        this.setupScenes();

        this.loadScenes();

        $(document).ready(function () {
            // bind click event to all internal page anchors
            $('a[href*="#"]').on('click', function (e) {
                // prevent default action and bubbling
                e.preventDefault();
                e.stopPropagation();
                // set target to anchor's "href" attribute
                var target = $(this).attr('href');
                // scroll to each target
                $(target).velocity('scroll', {
                    duration: 500,
                    //offset: 40,
                    offset: 0,
                    easing: 'ease-in-out'
                });
            });
        });

        var me = this;
        this.$el.find('a.location').each(function () {
            var textClick = function () {
                $('#text').removeClass('transparent');
            };

            var mouseover = _.throttle(function (e) {
                e.preventDefault();
                var offset = $(this).offset();
                var id = $(this).attr('data-layer-id');
                var point = me._mapView0.getLayerPoint(id);
                me._mapView0.highlight(id);
                var x1 = point.x + me._mapView0.$el.offset().left;
                var y1 = point.y + me._mapView0.$el.offset().top;
                var x2 = offset.left;
                var y2 = offset.top;

                var bezierLine = d3.svg.line()
                    .x(function(d) { return d[0]; })
                    .y(function(d) { return d[1]; })
                    .interpolate("basis");

                var svg = d3.select(me.$el[0])
                    .append("svg")
                    .attr('id', id + '-line')
                    .attr('style', 'z-index:100000;position:absolute;top:' + ~~(y2 + $(this).outerHeight()/2) + 'px;left:' + ~~x2 + 'px;');

                var defs = svg.append('defs');
                var marker = defs.append('marker')
                    .attr('id','marker')
                    .attr("viewBox","0 0 10 10")
                    .attr('refX', '9')
                    .attr('refY', '5')
                    .attr('markerWidth', '6')
                    .attr('markerHeight', '6')
                    .attr('orient', 'auto');
                var markerPath = marker.append('path')
                    .attr('d','M 0 0 L 10 5 L 0 10 z')
                    .attr('stroke', 'darkgreen')
                    .attr('stroke-width', '0.1px')
                    .attr('fill', 'darkgreen');

                var path = svg.append('path')
                    .attr("d", bezierLine([[0, 0], [(x1 - x2)/2, 0], [x1 - x2,y1 - y2 - ($(this).outerHeight()/2)]]))
                    .attr("stroke", "darkgreen")
                    .attr("stroke-width", 3)
                    .attr("fill", "none")
                    .attr('marker-end', 'url(#marker)')
                    .transition()
                    .duration(500)
                    .attrTween("stroke-dasharray", function() {
                        var len = this.getTotalLength();
                        return function(t) { return (d3.interpolateString("0," + len, len + ",0"))(t) };
                    });
                $('#text').addClass('transparent');
                $('#text').on('click', textClick);
                $(this).addClass('selected-link');

            }, 10);
            $(this).on('mouseover', mouseover).on('mouseout', function (e) {
                e.preventDefault();
                var id = $(this).attr('data-layer-id');
                me._mapView0.unhighlight(id);
                me.$el.find('#' + id + '-line').remove();
                $('#text').removeClass('transparent');
                $('#text').off('click', textClick);
                $(this).removeClass('selected-link');
            }).on('click', function (e) {
                e.preventDefault();
                var id = $(this).attr('data-layer-id');
                //me._mapView0._engine.zoomToLayer(id);
            });
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
        this._sceneNavigator = this._sceneNavigator || new this._navigatorClass({
            el: this.$el.find('.scenes')
        });
        this.listenTo(this._sceneNavigator, 'sceneChanged', this.changeScene);
        this.listenTo(this._sceneNavigator, 'progressChanged', this.changeProgress);

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
        /*
        $.ajax({
            url: 'scenes.json',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                me._scenesLoaded(data.scenes);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
        */
        me._loadFeatures(scenes.features);
        me._scenesLoaded(scenes.scenes);

    },
    setupMap: function () {
        this._mapView0 = new Focus.Views.MapView({
            el: this.$el.find('#map'),
            engineClass: this._mapEngineClass,
            model: new Backbone.Model({
                initialScene: new Focus.Models.SceneModel({
                    baseLayer: {
                        type: 'tile',
                        url: 'http://otile4.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png' //'https://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', ''https://a.tile.thunderforest.com/cycle/{z}/{x}/{y}.png' //
                    },
                    center: [0,0],
                    zoom: 4,
                    style: {
                        filter: 'sepia(0%)',
                        opacity: 0.8
                    }
                })
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

            $(this).on('mouseover', function (e) {
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
            $(this).on('mouseout', function (e) {
                $map.css('opacity',1);
                $overviewMap.css('opacity',1);
            });
            $(this).on('mousemove', function (e) {
                var $this = $(this);
                var offset = $this.offset();
                var distance = e.clientX - offset.left;
                $photos.css('left', -1 * distance);
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
        this._centerPoint = new L.RegularPolygonMarker(new L.LatLng(0,0), {
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
    },
    viewChanged: function (view) {
        this.setCenter(view.center);
        this.setZoom(3);
        this._centerPoint.setLatLng(new L.LatLng(view.center[1], view.center[0]));
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
