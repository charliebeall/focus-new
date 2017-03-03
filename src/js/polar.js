/*
 * L.PolarMap.TileLayer is used for tile layers with custom CRS support.
 */

L.PolarMap.TileLayer = L.TileLayer.extend({});

L.PolarMap.tileLayer = function (url, options) {
    return new L.PolarMap.TileLayer(url, options);
};


/*
 * L.PolarMap.LAEATileLayer is used for tile layers with a LAEA projection.
 */

// Extent is half of the WGS84 Ellipsoid equatorial circumference.
var extent = L.Projection.Mercator.R_MAJOR * Math.PI;

L.PolarMap.LAEATileLayer = L.PolarMap.TileLayer.extend({
    options: {
        // name for searching/querying active projected tile provider. Should be
        // unique.
        name: null,
        // CRS Code for the tiles
        crs: null,
        // The Proj4 string for this projection. Alternatively, this string can be
        // defined globally in proj4js.
        // proj4def: null,
        // max zoom range from tile provider
        minZoom: 0,
        maxZoom: 18,
        // use inverse coordinates if the provider is a TMS. Mapnik is not a TMS.
        tms: false,
        // origin of the map in projected coordinates
        origin: [-extent, extent],
        // resolution of smallest zoom level tile. calculation depends on projection
        maxResolution: ((extent - -extent) / 256),
        projectedBounds: L.bounds(L.point(-extent, extent),L.point(extent, -extent)),
        // default centre when this map is loaded
        center: [90, 0],
        // default zoom level
        zoom: 4,
        continuousWorld: false,
        noWrap: true,
        // map attribution text for tiles and/or data
        attribution: 'Map &copy; <a href="http://arcticconnect.org">ArcticConnect</a>. Data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }
});

L.PolarMap.laeaTileLayer = function (url, options) {
    return new L.PolarMap.LAEATileLayer(url, options);
};


/*
 * L.PolarMap.layer3571 presets a tile layer with the EPSG:3571 settings.
 */

L.PolarMap.layer3571 = L.PolarMap.laeaTileLayer("//{s}.tiles.arcticconnect.org/osm_3571/{z}/{x}/{y}.png", {
    name: "ac_3571",
    crs: "EPSG:3571",
    proj4def: "+proj=laea +lat_0=90 +lon_0=180 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
});


/*
 * L.PolarMap.layer3572 presets a tile layer with the EPSG:3572 settings.
 */

L.PolarMap.layer3572 = L.PolarMap.laeaTileLayer("//{s}.tiles.arcticconnect.org/osm_3572/{z}/{x}/{y}.png", {
    name: "ac_3572",
    crs: "EPSG:3572",
    proj4def: "+proj=laea +lat_0=90 +lon_0=-150 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
});


/*
 * L.PolarMap.layer3573 presets a tile layer with the EPSG:3573 settings.
 */

L.PolarMap.layer3573 = L.PolarMap.laeaTileLayer("//{s}.tiles.arcticconnect.org/osm_3573/{z}/{x}/{y}.png", {
    name: "ac_3573",
    crs: "EPSG:3573",
    proj4def: "+proj=laea +lat_0=90 +lon_0=-100 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
});


/*
 * L.PolarMap.layer3574 presets a tile layer with the EPSG:3574 settings.
 */

L.PolarMap.layer3574 = L.PolarMap.laeaTileLayer("//{s}.tiles.arcticconnect.org/osm_3574/{z}/{x}/{y}.png", {
    name: "ac_3574",
    crs: "EPSG:3574",
    proj4def: "+proj=laea +lat_0=90 +lon_0=-40 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
});


/*
 * L.PolarMap.layer3575 presets a tile layer with the EPSG:3575 settings.
 */

L.PolarMap.layer3575 = L.PolarMap.laeaTileLayer("//{s}.tiles.arcticconnect.org/osm_3575/{z}/{x}/{y}.png", {
    name: "ac_3575",
    crs: "EPSG:3575",
    proj4def: "+proj=laea +lat_0=90 +lon_0=10 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
});


/*
 * L.PolarMap.layer3576 presets a tile layer with the EPSG:3576 settings.
 */

L.PolarMap.layer3576 = L.PolarMap.laeaTileLayer("//{s}.tiles.arcticconnect.org/osm_3576/{z}/{x}/{y}.png", {
    name: "ac_3576",
    crs: "EPSG:3576",
    proj4def: "+proj=laea +lat_0=90 +lon_0=90 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
});
