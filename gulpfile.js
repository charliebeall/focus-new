var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var concat = require('gulp-concat');
// var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var minifyCss = require('gulp-minify-css');
var inject = require('gulp-inject');

// Load all gulp plugins automatically
// and attach them to the `plugins` object
var plugins = require('gulp-load-plugins')();

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('archive:create_archive_dir', function (done) {
    fs.mkdirSync(path.resolve(dirs.archive), '0755');
    done();
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


//copy task

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

gulp.task('copy', gulp.parallel(
    'copy:.htaccess',
    'copy:index.html',
    'copy:jquery',
    'copy:license',
    'copy:main.css',
    'copy:misc',
    'copy:normalize'
));

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

gulp.task('build', gulp.series('clean','lint:js','copy'));
//gulp.task('default', ['build']);

gulp.task('archive',gulp.series('build','archive:create_archive_dir','archive:zip'));

var srcFiles = [
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/lodash/lodash.min.js',
    'node_modules/backbone/backbone-min.js',
    'node_modules/leaflet/dist/leaflet.js',
    'node_modules/d3/d3.min.js',
    'node_modules/topojson/dist/topojson.js',
    'node_modules/velocity-animate/velocity.min.js',
    'node_modules/velocity-animate/velocity.ui.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/jquery.scrollex/jquery.scrollex.min.js',
    'node_modules/esri-leaflet/dist/esri-leaflet.js',
	'node_modules/esri-leaflet-vector/dist/esri-leaflet-vector.js',
    'node_modules/proj4/dist/proj4.js',
    'node_modules/proj4leaflet/src/proj4leaflet.js',
    'node_modules/leaflet-dvf/dist/leaflet-dvf.js',
    'node_modules/vanilla-lazyload/dist/lazyload.min.js',
    // 'node_modules/leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.js',
    // 'node_modules/clipboard/dist/clipboard.js',
    'node_modules/wavesurfer.js/dist/wavesurfer.min.js',
    'src/js/vendor/*.js',
    'src/js/publications.js',
    'src/js/menu.js',
    'src/js/mapview.js',
	'src/js/quizview.js'];
	
gulp.task('concat', function () {
    return gulp.src(srcFiles)
        .pipe(concat('combined.js'))
        .pipe(gulp.dest('src/js'));
});

gulp.task('minify', function () {
    return gulp.src(srcFiles)
        .pipe(concat('combined.js'))
        .pipe(gulp.dest('src/js'))
        .pipe(uglify({ mangle: false }))
        .pipe(gulp.dest('src/js'));
});

gulp.task('concatcss', function () {
   return gulp.src([
       'node_modules/font-awesome/css/font-awesome.min.css',
	   'src/css/bootstrap.min.css',
       'src/css/normalize.css',
       'node_modules/leaflet/dist/leaflet.css',
       'node_modules/leaflet-dvf/dist/css/dvf.css',
       'src/css/main.css',
       'src/css/index.css'
   ])
       .pipe(concat('combined.css'))
       .pipe(gulp.dest('src/css'));
});

gulp.task('copyfonts', function() {
    return gulp.src('node_modules/font-awesome/fonts/**/*.{ttf,woff,woff2,eof,svg}')
        .pipe(gulp.dest('dist/fonts'))
        .pipe(gulp.dest('src/fonts'));
});

gulp.task('copy2020', function() {
    return gulp.src([
		'bower_components/twentytwenty/**/*'
	])
        .pipe(gulp.dest('dist/js/twentytwenty'))
        .pipe(gulp.dest('src/js/twentytwenty'));
});

gulp.task('copyleafletplugins', function() {
    return gulp.src([
		'node_modules/leaflet-plugins/layer/tile/*'
	])
        .pipe(gulp.dest('dist/js/leaflet-plugins'))
        .pipe(gulp.dest('src/js/leaflet-plugins'));
});

gulp.task('html', function () {
    return gulp.src([
        'src/**/*.html',
        'src/**/*.{png,jpg,jpeg,svg,ico,mp4,m4v,mp3,webm,ogg,csv,json,gif,otf,ttf,woff,woff2,eof}',
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

gulp.task('default', gulp.series('copyleafletplugins', 'copy2020', 'copyfonts','concatcss','concat', 'html'));

gulp.task('build:minify', gulp.series('copyleafletplugins', 'copy2020', 'copyfonts', 'concatcss', 'minify', 'html'));