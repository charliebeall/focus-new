"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

Focus.Map.defaultOptions = {
    color: "rgb(207, 20, 43)",
    fillColor: "rgb(207, 20, 43)",
    radius: 3,
    weight: 4,
    fillOpacity: 1,
    opacity: 0.5
};
var figureStyle = {
    weight: 5,
    radius: 5,
    fillOpacity: 0.7
};
var mapboxSatelliteLayer = {
    type: "tile",
    url: "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/{z}/{x}/{y}?access_token={accessToken}",
    params: {
        accessToken: "pk.eyJ1Ijoic2ZhaXJncmlldmUiLCJhIjoiY2FmNGI2OGEwZDI1YTcyMjJkNzQyY2MyMmI0NTRhMzAifQ.b03Wm6qBoeErDTg77XuvzQ",
        attribution: '<a href="https://www.mapbox.com/about/maps/">Mapbox©</a><a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
};
var mapboxStreetsLayer = {
    type: "tile",
    url: "https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token={accessToken}",
    params: {
        accessToken: "pk.eyJ1Ijoic2ZhaXJncmlldmUiLCJhIjoiY2FmNGI2OGEwZDI1YTcyMjJkNzQyY2MyMmI0NTRhMzAifQ.b03Wm6qBoeErDTg77XuvzQ",
        attribution: '<a href="https://www.mapbox.com/about/maps/">Mapbox©</a><a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
};
var figures = [{
    num: 1,
    name: 'The Huawei building in Kampala',
    latlng: [0.338213, 32.587850]
}, {
    num: 2,
    name: 'Author 1 standing next to CCCC construction signs in Murchison Falls National Park, Uganda ',
    latlng: [2.167461, 31.805508]
}, {
    num: 3,
    name: 'Author 1 standing in the courtyard of Luyanzi College, Bweyogerere, decorated with Chinese lanterns. ',
    latlng: [0.370151, 32.670216]
}, {
    num: 5,
    name: 'Author 1 standing in the courtyard of Luyanzi College, Bweyogerere',
    latlng: [0.321655, 32.573101]
}, {
    num: 6,
    name: 'Chinese-staffed stores along William Street in Kampala, Uganda',
    latlng: [0.314421, 32.576109]
}, {
    num: 8,
    name: 'Author 1 interviewing a Chinese trader on William Street.',
    latlng: [0.314647, 32.575944]
}, {
    num: 9,
    name: 'Chinese shoppers and store staff in a shop along William Street, Kampala.',
    latlng: [0.314202, 32.576412]
}, {
    num: 10,
    name: 'Entebbe',
    latlng: [0.053364, 32.479409]
}, {
    num: 11,
    name: 'Chinese participants in a boat race line up on the beach in Entebbe, Uganda',
    latlng: [.328398, 32.605968]
}, {
    num: 12,
    name: 'Chinese corporate employees participating in a soccer tournament. Kampala, Uganda',
    latlng: [0.053364, 32.479409]
}];
var businessFeatures = businesses.map(function (_ref) {
    var Latitude = _ref.Latitude,
        Longitude = _ref.Longitude,
        Category = _ref.Category,
        Area = _ref.Area;
    return {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [Longitude, Latitude]
        },
        properties: {
            name: "".concat(Category, " : ").concat(Area)
        }
    };
});

function getSpaceColors(type) {
    switch (type) {
        case 'Embassy':
            return '#d81d30';

        case 'Other':
            return '#15bafa';

        case 'Restaurant/ Hotel':
            return '#b868d9';

        case 'Stores':
            return '#f9e011';

        default:
            return '#fff';
    }
}

var spacesFeatures = spaces.map(function (_ref2, i) {
    var Latitude = _ref2.Latitude,
        Longitude = _ref2.Longitude,
        Name = _ref2.Name,
        Type = _ref2.Type;
    return {
        id: "spaces-".concat(i),
        type: "geojson",
        data: {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [Longitude, Latitude]
            },
            properties: {
                name: Name,
                type: Type
            }
        },
        style: {
            radius: 3,
            weight: 1,
            fillOpacity: 0.8,
            opacity: 0.6,
            color: '#979797',
            fillColor: getSpaceColors(Type)
        }
    };
});
var scenes = {
    features: [{
        id: "kampala",
        type: "geojson",
        data: {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [32.587809, 0.319727]
            },
            properties: {
                name: "Kampala"
            }
        },
        style: {
            radius: 7,
            fillOpacity: 0.8
        }
    }, {
        id: "businessAll",
        type: "geojson",
        data: {
            "type": "FeatureCollection",
            "features": businessFeatures
        },
        style: {
            radius: 2,
            fillOpacity: 0.7
        }
    }, {
        id: "expressway",
        type: "geojson",
        data: expressway,
        style: _defineProperty({
            opacity: 0.9,
            weight: 4,
            color: 'rgba(250,121,7,0.75)'
        }, "color", 'rgb(201,100,10)')
    }].concat(_toConsumableArray(figures.map(function (_ref3) {
        var num = _ref3.num,
            name = _ref3.name,
            latlng = _ref3.latlng;
        return {
            id: "figure".concat(num),
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: latlng.slice().reverse()
                },
                properties: {
                    name: "Figure ".concat(num, ": ").concat(name)
                }
            },
            style: figureStyle
        };
    })), _toConsumableArray(spacesFeatures)),
    scenes: [{
        id: "lp1a",
        baseLayer: {
            type: "esri-basemap",
            url: "NationalGeographic"
        },
        zoom: 7,
        layers: [{
            idRef: "kampala"
        }]
    }, {
        id: "lp1b",
        baseLayer: [{
            type: "esri-basemap",
            url: "ImageryLabels"
        }, {
            type: "esri-basemap",
            url: "ImageryFirefly"
        }],
        zoom: 12,
        center: [32.587850, 0.338213]
    }, {
        id: "lp2",
        baseLayer: {
            "type": "esri-basemap",
            "url": "ImageryClarity"
        },
        zoom: 12,
        center: [32.587850, 0.338213]
    }, {
        id: "lp3a",
        baseLayer: mapboxSatelliteLayer,
        zoom: 15,
        layers: [{
            idRef: "figure1"
        }]
    }, {
        id: "lp3b",
        baseLayer: [{
            type: "esri-basemap",
            url: "ImageryTransportation"
        }, {
            type: "esri-basemap",
            url: "ImageryClarity"
        }],
        layers: [{
            idRef: "figure2"
        }, {
            idRef: "kampala"
        }, {
            idRef: "expressway"
        }],
        bounds: {
            "figure2": true,
            "kampala": true
        }
    }, {
        id: "lp3c",
        baseLayer: mapboxStreetsLayer,
        zoom: 13.5,
        layers: [{
            idRef: "figure3"
        }]
    }, {
        id: "lp4a",
        baseLayer: mapboxStreetsLayer,
        layers: [{
            idRef: "businessAll"
        }],
        bounds: {
            businessAll: true
        }
    }, {
        id: "lp4b",
        baseLayer: mapboxStreetsLayer,
        zoom: 15,
        center: [32.575888, 0.314702],
        layers: [{
            idRef: "businessAll"
        }]
    }, {
        id: "lp4c",
        zoom: 13.7,
        baseLayer: mapboxStreetsLayer,
        layers: spacesFeatures.map(function (feature) {
            return {
                idRef: feature.id
            };
        })
    }, {
        id: "lp4d",
        baseLayer: mapboxStreetsLayer,
        layers: spacesFeatures.map(function (feature) {
            return {
                idRef: feature.id
            };
        }),
        zoom: 16,
        center: [32.575888, 0.314702]
    }, {
        id: "lp5",
        baseLayer: {
            type: "esri-basemap",
            url: "NationalGeographic"
        },
        zoom: 11.5,
        layers: [{
            idRef: "figure10"
        }, {
            idRef: 'kampala'
        }]
    }, {
        id: "lp6",
        baseLayer: [{
            type: "esri-basemap",
            url: "ImageryFirefly"
        }],
        zoom: 11.5,
        layers: [{
            idRef: "figure11"
        }, {
            idRef: "figure12"
        }]
    }, {
        id: "lp7",
        baseLayer: {
            type: "esri-basemap",
            url: "NationalGeographic"
        },
        zoom: 7,
        layers: [{
            idRef: "kampala"
        }]
    }]
};
$(document).ready(function () {
    $("#nav li.previous a").on("click", function (e) {
        e.preventDefault();
        var $prev = $("#nav").find(".sections li.active").prev();

        if (!$prev.hasClass("previous")) {
            $prev.find("a").click();
        }
    });
    $("#nav li.next a").on("click", function (e) {
        e.preventDefault();
        var $next = $("#nav").find(".sections li.active").next();

        if (!$next.hasClass("next")) {
            $next.find("a").click();
        }
    });
    var overviewMap = new Focus.Views.OverviewMapView({
        model: new Backbone.Model({
            initialScene: new Focus.Models.SceneModel({
                baseLayer: {
                    type: "esri-basemap",
                    url: "NationalGeographic",
                    options: {
                        detectRetina: true
                    }
                },
                center: [32.646475, -125.296614],
                zoom: 2.5,
                showAttribution: false
            })
        }),
        showCenterPoint: true
    });
    var sceneManager = new Focus.Views.SceneManagerView({
        el: $("body"),
        initialScene: {
            baseLayer: {
                type: "esri-basemap",
                url: "NationalGeographic"
            },
            center: [0.338213, 32.58785],
            zoom: 5,
            zoomDelta: 1,
            markerZoomAnimation: false
        },
        navigatorClass: Focus.Views.ScrollingSceneNavigator,
        mapEngineClass: Focus.Views.LeafletMapEngine
    });
    var shareView = new Focus.Views.ShareView();
    shareView.render();
});
