var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var minifyCss = require('gulp-minify-css');
var inject = require('gulp-inject');

// Load all gulp plugins automatically
// and attach them to the `plugins` object
var plugins = require('gulp-load-plugins')();

// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
var runSequence = require('run-sequence');

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('archive:create_archive_dir', function () {
    fs.mkdirSync(path.resolve(dirs.archive), '0755');
});

gulp.task('archive:zip', function (done) {

    var archiveName = path.resolve(dirs.archive, pkg.name + '_v' + pkg.version + '.zip');
    var archiver = require('archiver')('zip');
    var files = require('glob').sync('**/*.*', {
        'cwd': dirs.dist,
        'dot': true // include hidden files
    });
    var output = fs.createWriteStream(archiveName);

    archiver.on('error', function (error) {
        done();
        throw error;
    });

    output.on('close', done);

    files.forEach(function (file) {

        var filePath = path.resolve(dirs.dist, file);

        // `archiver.bulk` does not maintain the file
        // permissions, so we need to add files individually
        archiver.append(fs.createReadStream(filePath), {
            'name': file,
            'mode': fs.statSync(filePath).mode
        });

    });

    archiver.pipe(output);
    archiver.finalize();

});

gulp.task('clean', function (done) {
    require('del')([
        dirs.archive,
        dirs.dist
    ]).then(function () {
        done();
    });
});

gulp.task('copy', [
    'copy:.htaccess',
    'copy:index.html',
    'copy:jquery',
    'copy:license',
    'copy:main.css',
    'copy:misc',
    'copy:normalize'
]);

gulp.task('copy:.htaccess', function () {
    return gulp.src('node_modules/apache-server-configs/dist/.htaccess')
               .pipe(plugins.replace(/# ErrorDocument/g, 'ErrorDocument'))
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:index.html', function () {
    return gulp.src(dirs.src + '/index.html')
               .pipe(plugins.replace(/{{JQUERY_VERSION}}/g, pkg.devDependencies.jquery))
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:jquery', function () {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js'])
               .pipe(plugins.rename('jquery-' + pkg.devDependencies.jquery + '.min.js'))
               .pipe(gulp.dest(dirs.dist + '/js/vendor'));
});

gulp.task('copy:license', function () {
    return gulp.src('LICENSE.txt')
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:main.css', function () {

    var banner = '/*! HTML5 Boilerplate v' + pkg.version +
                    ' | ' + pkg.license.type + ' License' +
                    ' | ' + pkg.homepage + ' */\n\n';

    return gulp.src(dirs.src + '/css/main.css')
               .pipe(plugins.header(banner))
               .pipe(plugins.autoprefixer({
                   browsers: ['last 2 versions', 'ie >= 8', '> 1%'],
                   cascade: false
               }))
               .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('copy:misc', function () {
    return gulp.src([

        // Copy all files
        dirs.src + '/**/*',

        // Exclude the following files
        // (other tasks will handle the copying of these files)
        '!' + dirs.src + '/css/main.css',
        '!' + dirs.src + '/index.html'

    ], {

        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:normalize', function () {
    return gulp.src('node_modules/normalize.css/normalize.css')
               .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('lint:js', function () {
    return gulp.src([
        'gulpfile.js',
        dirs.src + '/js/*.js',
        dirs.test + '/*.js'
    ]).pipe(plugins.jscs())
      .pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.jshint.reporter('fail'));
});


// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('archive', function (done) {
    runSequence(
        'build',
        'archive:create_archive_dir',
        'archive:zip',
    done);
});

gulp.task('build', function (done) {
    runSequence(
        ['clean', 'lint:js'],
        'copy',
    done);
});

gulp.task('default', ['build']);

gulp.task('concat', function () {
    return gulp.src([
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/underscore/underscore-min.js',
            'bower_components/backbone/backbone-min.js',
            'node_modules/leaflet/dist/leaflet.js',
            'bower_components/flowtype/flowtype.js',
            'bower_components/d3/d3.min.js',
            'bower_components/topojson/topojson.js',
            'bower_components/velocity/velocity.min.js',
            'bower_components/velocity/velocity.ui.min.js',
            'bower_components/bootstrap/dist/js/bootstrap.min.js',
            'bower_components/jquery.scrollex/jquery.scrollex.min.js',
            'node_modules/esri-leaflet/dist/esri-leaflet.js',
            'bower_components/leaflet-dvf/dist/leaflet-dvf.js',
            'bower_components/vanilla-lazyload/dist/lazyload.min.js',
            'node_modules/leaflet-tilelayer-wmts/src/leaflet-tilelayer-wmts.js',
            'node_modules/leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.js',
            'node_modules/leaflet-bing-layer/leaflet-bing-layer.min.js',
            'node_modules/clipboard/dist/clipboard.js',
            'src/js/vendor/*.js',
            'src/js/publications.js',
            'src/js/menu.js',
            'src/js/mapview.js',
            'src/js/quizview.js'])
        .pipe(concat('combined.js'))
        .pipe(gulp.dest('src/js'));
});

gulp.task('minify', function () {
    return gulp.src([
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/underscore/underscore-min.js',
        'bower_components/backbone/backbone-min.js',
        //'bower_components/hidpi-canvas/dist/hidpi-canvas.min.js',
        'node_modules/leaflet/dist/leaflet.js',
        'bower_components/flowtype/flowtype.js',
        'bower_components/d3/d3.min.js',
        'bower_components/topojson/topojson.js',
        'bower_components/velocity/velocity.min.js',
        'bower_components/velocity/velocity.ui.min.js',
        'bower_components/bootstrap/dist/js/bootstrap.min.js',
        'bower_components/jquery.scrollex/jquery.scrollex.min.js',
        'bower_components/leaflet-dvf/dist/leaflet-dvf.min.js',
        'node_modules/leaflet-tilelayer-wmts/src/leaflet-tilelayer-wmts.js',
        'node_modules/leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.js',
        'node_modules/leaflet-bing-layer/leaflet-bing-layer.min.js',
        'node_modules/clipboard/dist/clipboard.js',
        'src/js/vendor/*.js',
        'src/js/publications.js',
        'src/js/menu.js',
        'src/js/mapview.js',
        'src/js/quizview.js'])
        .pipe(concat('combined.js'))
        .pipe(gulp.dest('src/js'))
        .pipe(uglify())
        .pipe(gulp.dest('src/js'));
});

gulp.task('concatcss', function () {
   return gulp.src([
       'bower_components/fontawesome/css/font-awesome.min.css',
       'bower_components/bootstrap/dist/css/bootstrap.min.css',
       //'node_modules/mapbox-gl/dist/mapbox-gl.css',
       'src/css/normalize.css',
       'bower_components/leaflet/dist/leaflet.css',
       'bower_components/leaflet-dvf/dist/css/dvf.css',
       'src/css/main.css',
       'src/css/index.css'
   ])
       .pipe(concat('combined.css'))
       .pipe(gulp.dest('src/css'));
});

gulp.task('copyfonts', function() {
    gulp.src('bower_components/fontawesome/fonts/**/*.{ttf,woff,woff2,eof,svg}')
        .pipe(gulp.dest('dist/fonts'))
        .pipe(gulp.dest('src/fonts'));
});

gulp.task('copy2020', function() {
    gulp.src('bower_components/twentytwenty/**/*')
        .pipe(gulp.dest('dist/js/twentytwenty'))
        .pipe(gulp.dest('src/js/twentytwenty'));
});

gulp.task('html', function () {
    return gulp.src([
        'src/**/*.html',
        'src/**/*.{png,jpg,jpeg,svg,ico,mp4,webm,ogg,csv,json}',
        'src/**/combined.js',
        'src/**/combined.css',
        'src/**/*.js'
    ])
        .pipe(gulpif('*.html', useref()))
        .pipe(gulpif('*.html', inject(gulp.src(['./src/templates.html']), {
            starttag: '<!-- inject:templates:{{ext}} -->',
            transform: function (filePath, file) {
                return file.contents.toString('utf8');
            }
        })))
        //.pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest('dist'));
});

gulp.task('build:dev', function (done) {runSequence('copy2020', 'copyfonts','concatcss','concat', 'html', done)});
gulp.task('build:prod', function (done) {runSequence('copy2020', 'copyfonts', 'concatcss', 'minify', 'html', done)});
