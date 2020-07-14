Focus.Map.defaultOptions = {
    color: "rgb(207, 20, 43)",
    fillColor: "rgb(207, 20, 43)",
    radius: 3,
    weight: 4,
    fillOpacity: 1,
    opacity: 0.5
};

var pointStyle = {
    weight: 5,
    radius: 5,
    fillOpacity: 0.8
};

var figureStyle = {
    weight: 10,
    radius: 10,
    fillOpacity: 0.8
};

var mapboxSatelliteLayer = {
    type: "tile",
    url:
        "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/{z}/{x}/{y}?access_token={accessToken}",
    params: {
        accessToken:
            "pk.eyJ1Ijoic2ZhaXJncmlldmUiLCJhIjoiY2FmNGI2OGEwZDI1YTcyMjJkNzQyY2MyMmI0NTRhMzAifQ.b03Wm6qBoeErDTg77XuvzQ",
        attribution:
            '<a href="https://www.mapbox.com/about/maps/">Mapbox©</a><a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
};

var mapboxStreetsLayer = {
    type: "tile",
    url:
        "https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token={accessToken}",
    params: {
        accessToken:
            "pk.eyJ1Ijoic2ZhaXJncmlldmUiLCJhIjoiY2FmNGI2OGEwZDI1YTcyMjJkNzQyY2MyMmI0NTRhMzAifQ.b03Wm6qBoeErDTg77XuvzQ",
        attribution:
            '<a href="https://www.mapbox.com/about/maps/">Mapbox©</a><a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
};

var figures = [
    {
        num: 1,
        name: 'The Huawei building in Kampala',
        latlng: [0.338213, 32.587850]
    },
    {
        num: 2,
        name: 'Author 1 standing next to CCCC construction signs in Murchison Falls National Park, Uganda ',
        latlng: [2.167461, 31.805508]
    },
    {
        num: 3,
        name: 'Author 1 standing in the courtyard of Luyanzi College, Bweyogerere, decorated with Chinese lanterns. ',
        latlng: [0.370151, 32.670216]
    },
    {
        num: 5,
        name: '',
        latlng: [0.321655, 32.573101]
    },
    {
        num: 6,
        name: '',
        latlng: [0.314421, 32.576109]
    },
    {
        num: 8,
        name: '',
        latlng: [0.314647, 32.575944]
    },
    {
        num: 9,
        name: '',
        latlng: [0.314202, 32.576412]
    },
    {
        num: 10,
        name: '',
        latlng: [0.053364, 32.479409]
    },
    {
        num: 11,
        name: '',
        latlng: [.328398, 32.605968]
    },
    {
        num: 12,
        name: '',
        latlng: [0.053364, 32.479409]
    },
]

var businessFeatures = businesses.map(({Latitude, Longitude,Category,Area}) => ({
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [Longitude, Latitude]
    },
    properties: {
        name: `${Category} : ${Area}`
    }
}))

var scenes = {
    features: [
        {
            id: "kampala",
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [32.587809,0.319727]
                },
                properties: {
                    name: "Kampala"
                }
            },
            style: {
                radius: 7,
                fillOpacity: 0.8
            }
        },
        {
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
        },
        {
            id: "expressway",
            type: "geojson",
            data: expressway,
            style: {
                opacity: 0.9,
                weight: 4,
                color: 'rgba(250,121,7,0.75)',
                color: 'rgb(201,100,10)',
            }
        },
        ...figures.map(({num, name, latlng, }) => ({
            id: `figure${num}`,
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: latlng.slice().reverse()
                },
                properties: {
                    name: `Figure ${num}: ${name}`
                }
            },
            style: figureStyle
        }))

    ],
    scenes: [
        {
            id: "lp1a",
            baseLayer: {
                type: "esri-basemap",
                url: "NationalGeographic"
            },
            zoom: 7,
            layers: [{ idRef: "kampala"}]
        },
        {
            id: "lp1b",
            baseLayer: [
                {
                    type: "esri-basemap",
                    url: "ImageryLabels"
                },
                {
                    type: "esri-basemap",
                    url: "ImageryFirefly"
                },
            ],
            zoom: 12,
            center: [32.587850,0.338213]
        },
        {
            id: "lp2",
            baseLayer: {
                "type": "esri-basemap",
                "url": "ImageryClarity"
            },
            zoom: 12,
            center: [32.587850,0.338213]
        },
        {
            id: "lp3a",
            baseLayer: mapboxSatelliteLayer,
            zoom: 15,
            layers: [
                { idRef: "figure1"},
            ]
        },
        {
            id: "lp3b",
            baseLayer:  [
                {
                    type: "esri-basemap",
                    url: "ImageryTransportation"
                },
                {
                    type: "esri-basemap",
                    url: "ImageryClarity"
                },
            ],
            layers: [
                { idRef: "figure2"},
                { idRef: "kampala"},
                { idRef: "expressway"}
            ],
            bounds: { "figure2": true, "kampala": true}
        },
        {
            id: "lp3c",
            baseLayer: mapboxSatelliteLayer,
            zoom: 15,
            layers: [
                { idRef: "figure3"}
            ]
        },
        {
            id: "lp4a",
            baseLayer: mapboxStreetsLayer,
            layers: [
                { idRef: "businessAll"}
            ],
            bounds: { businessAll: true}
        },
        {
            id: "lp4b",
            baseLayer: mapboxStreetsLayer,
            zoom: 15,
            center: [32.575888, 0.314702],
            layers: [
                { idRef: "businessAll"}
            ]
        },
    ]
};

$(document).ready(function() {
    $("#nav li.previous a").on("click", function(e) {
        e.preventDefault();
        var $prev = $("#nav")
            .find(".sections li.active")
            .prev();

        if (!$prev.hasClass("previous")) {
            $prev.find("a").click();
        }
    });

    $("#nav li.next a").on("click", function(e) {
        e.preventDefault();
        var $next = $("#nav")
            .find(".sections li.active")
            .next();

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
            center: [0.338213,32.58785],
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
