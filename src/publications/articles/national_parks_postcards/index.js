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
    weight: 3,
    radius: 3,
    fillOpacity: 0.8
};

var mapboxLayer = {
    type: "tile",
    url:
        "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token={accessToken}",
    params: {
        accessToken:
            "pk.eyJ1Ijoic2ZhaXJncmlldmUiLCJhIjoiY2FmNGI2OGEwZDI1YTcyMjJkNzQyY2MyMmI0NTRhMzAifQ.b03Wm6qBoeErDTg77XuvzQ",
        attribution:
            '<a href="https://www.mapbox.com/about/maps/">Mapbox©</a><a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
};

var scenes = {
    features: [
        {
            id: "parks",
            type: "geojson",
            data: PARKS,
            style: {
                fillColor: "rgba(235,75,63,0.7)",
                color: "rgba(235,10,10,0.1)"
            }
        },
        {
            id: "yellowstone",
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [-110.368728, 44.427963]
                },
                properties: {
                    name: "Yellowstone National Park"
                }
            },
            style: {
                weight: 2,
                radius: 2,
                fillOpacity: 0.8,
                fillColor: "rgba(0,0,0,0)",
                fillColor: "rgba(0,0,0,0)"
            }
        },
        {
            id: "yosemite",
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [-119.541331, 37.8575]
                },
                properties: {
                    name: "Yosemite National Park"
                }
            },
            style: {
                weight: 2,
                radius: 2,
                fillOpacity: 0.8,
                fillColor: "rgba(0,0,0,0)",
                fillColor: "rgba(0,0,0,0)"
            }
        },
        {
            id: "katmai",
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [-155.357138, 58.368718]
                },
                properties: {
                    name: "Katmai National Park"
                }
            },
            style: pointStyle
        },
        {
            id: "biscayne",
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [-80.199376, 25.446802]
                },
                properties: {
                    name: "Biscayne National Park"
                }
            },
            style: pointStyle
        },
        {
            id: "acadia",
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [-68.284319, 44.295298]
                },
                properties: {
                    name: "Acadia National Park"
                }
            },
            style: pointStyle
        },
        {
            id: "sequoia",
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [-118.761502, 36.552327]
                },
                properties: {
                    name: "Sequoia National Park"
                }
            },
            style: pointStyle
        },
        {
            id: "saguaro",
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [-111.150258, 32.271435]
                },
                properties: {
                    name: "Saguaro National Park"
                }
            },
            style: pointStyle
        },
        {
            id: "zion",
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [-113.157799, 37.423406]
                },
                properties: {
                    name: "Zion National Park: Kolob Arch"
                }
            },
            style: pointStyle
        }
    ],
    scenes: [
        {
            id: "lp1",
            baseLayer: [
                {
                    type: "esri-basemap",
                    url: "NationalGeographic"
                }
            ],
            bounds: { parks: true },
            layers: [
                { idRef: "parks" },
                { idRef: "yellowstone" },
                { idRef: "yosemite" }
            ],
            style: {
                filter: "saturate(120%) sepia(30%)",
                opacity: 1,
                background:
                    "url(http://subtlepatterns2015.subtlepatterns.netdna-cdn.com/patterns/cheap_diagonal_fabric.png)"
            }
        },
        {
            id: "lp3a",
            baseLayer: [
                {
                    type: "esri-basemap",
                    url: "NationalGeographic"
                },
                {
                    type: "imageOverlay",
                    url: "./data/katmai_1994.jpg",
                    bounds: [
                        [59.0921, -156.6268],
                        [57.9395, -154.27529]
                    ],
                    options: {
                        opacity: 0.9
                    }
                }
            ],
            layers: [{ idRef: "katmai" }],
            zoom: 9.5,
            style: {
                opacity: 1,
                background:
                    "url(http://subtlepatterns2015.subtlepatterns.netdna-cdn.com/patterns/cheap_diagonal_fabric.png)"
            }
        },
        {
            id: "lp3b",
            baseLayer: mapboxLayer,
            layers: [{ idRef: "katmai" }],
            zoom: 9.5,
            style: {
                filter: "saturate(120%)",
                opacity: 1,
                background:
                    "url(http://subtlepatterns2015.subtlepatterns.netdna-cdn.com/patterns/cheap_diagonal_fabric.png)"
            }
        },
        {
            id: "lp4a",
            baseLayer: [
                {
                    type: "esri-basemap",
                    url: "NationalGeographic"
                },
                {
                    type: "imageOverlay",
                    url: "./data/biscayne.jpg",
                    bounds: [
                        [25.62882, -80.36844],
                        [25.3642, -80.0883]
                    ],
                    options: {
                        opacity: 0.9
                    }
                }
            ],
            layers: [{ idRef: "biscayne" }],
            zoom: 12,
            style: {
                opacity: 1,
                background:
                    "url(http://subtlepatterns2015.subtlepatterns.netdna-cdn.com/patterns/cheap_diagonal_fabric.png)"
            }
        },
        {
            id: "lp4b",
            baseLayer: mapboxLayer,
            layers: [{ idRef: "biscayne" }],
            zoom: 12.5,
            style: {
                filter: "saturate(120%)",
                opacity: 1,
                background:
                    "url(http://subtlepatterns2015.subtlepatterns.netdna-cdn.com/patterns/cheap_diagonal_fabric.png)"
            }
        },
        {
            id: "lp5a",
            baseLayer: [
                {
                    type: "esri-basemap",
                    url: "NationalGeographic"
                },
                {
                    type: "imageOverlay",
                    url: "./data/acadia_1931.jpg",
                    bounds: [
                        [44.4265, -68.4779],
                        [44.2168, -68.13864]
                    ],
                    options: {
                        opacity: 0.9
                    }
                }
            ],
            layers: [{ idRef: "acadia" }],
            zoom: 12.2,
            style: {
                filter: "saturate(120%)",
                opacity: 1,
                background:
                    "url(http://subtlepatterns2015.subtlepatterns.netdna-cdn.com/patterns/cheap_diagonal_fabric.png)"
            }
        },
        {
            id: "lp5b",
            baseLayer: mapboxLayer,
            layers: [{ idRef: "acadia" }],
            zoom: 12,
            style: {
                filter: "saturate(120%)",
                opacity: 1,
                background:
                    "url(http://subtlepatterns2015.subtlepatterns.netdna-cdn.com/patterns/cheap_diagonal_fabric.png)"
            }
        },
        {
            id: "lp5c",
            baseLayer: mapboxLayer,
            layers: [{ idRef: "sequoia" }],
            zoom: 15.4,
            style: {
                filter: "saturate(120%)",
                opacity: 1,
                background:
                    "url(http://subtlepatterns2015.subtlepatterns.netdna-cdn.com/patterns/cheap_diagonal_fabric.png)"
            }
        },
        {
            id: "lp6a",
            baseLayer: mapboxLayer,
            layers: [{ idRef: "saguaro" }],
            zoom: 15,
            style: {
                opacity: 1,
                background:
                    "url(http://subtlepatterns2015.subtlepatterns.netdna-cdn.com/patterns/cheap_diagonal_fabric.png)"
            }
        },
        {
            id: "lp6b",
            baseLayer: mapboxLayer,
            layers: [{ idRef: "zion" }],
            zoom: 14,
            style: {
                filter: "saturate(120%)",
                opacity: 1,
                background:
                    "url(http://subtlepatterns2015.subtlepatterns.netdna-cdn.com/patterns/cheap_diagonal_fabric.png)"
            }
        },
        {
            id: "lp7",
            baseLayer: {
                type: "esri-basemap",
                url: "NationalGeographic"
            },
            bounds: { parks: true },
            layers: [{ idRef: "parks" }],
            style: {
                filter: "saturate(120%) sepia(30%)",
                opacity: 1,
                background:
                    "url(http://subtlepatterns2015.subtlepatterns.netdna-cdn.com/patterns/cheap_diagonal_fabric.png)"
            }
        }
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
            center: [32.646475, -125.296614],
            zoom: 3,
            zoomDelta: 1,
            markerZoomAnimation: false
        },
        navigatorClass: Focus.Views.ScrollingSceneNavigator,
        mapEngineClass: Focus.Views.LeafletMapEngine
    });

    var shareView = new Focus.Views.ShareView();
    shareView.render();
});
