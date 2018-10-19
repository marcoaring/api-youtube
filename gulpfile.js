var sourcemaps = require('gulp-sourcemaps'),
    ssi = require('gulp-ssi'),
    wait = require('gulp-wait'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    pixrem = require('pixrem'),
    autoprefixer = require('autoprefixer'),
    concat = require('gulp-concat'),
    bs = require('browser-sync'),
    order = require('run-sequence'),
    imagemin = require('gulp-imagemin'),
    uglify = require('gulp-uglify');

gulp.task('styles', function(){
    return gulp.src('src/sass/**/style.scss')
    .pipe(wait(50))
    .pipe(sourcemaps.init())
    .pipe(sass({
        'outputStyle': 'expanded'
        }).on('error', sass.logError))
    .pipe(postcss([
        autoprefixer({
            browsers: ['last 5 versions']
        }),
        pixrem()
    ]))
    .pipe(sourcemaps.write())
    .pipe(concat('app.css'))
    .pipe(gulp.dest('dev/css'))
    .pipe(bs.stream());
});

gulp.task('scripts', function(){
    return gulp.src('src/js/main.js')
        .pipe(uglify())
        .pipe(gulp.dest('dev/js'))
});

gulp.task('scriptsVendor', function(){
    return gulp.src('src/assets/js/**/*.js')
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dev/assets/js'));
});

gulp.task('assets', function(){
    return gulp.src(['src/assets/**/*', '!src/assets/js/**'])
        .pipe(gulp.dest('dev/assets'));
});

gulp.task('serve-html', function(){
    return gulp.src('src/*.html')
        .pipe(ssi())
        .pipe(gulp.dest('dev'));
});

gulp.task('buildCopy', function(){
    return gulp.src('dev/**/*')
        .pipe(gulp.dest('build'))
});

gulp.task('buildImages', function(){
    return gulp.src('src/assets/images/**/*')
    .pipe(imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.svgo({ plugins: [{ removeViewBox: true }, { cleanupIDs: false }] })
    ]))
    .pipe(gulp.dest('dev/assets/images/'));
});

// Browsersyncing
gulp.task('bsync', function(){
    
    bs.init({
        server : {
            baseDir: `./dev/`,
        }
    });

    gulp.watch('src/sass/**/*.scss', ['styles']);
    gulp.watch('src/js/**/*.js', ['scripts', 'scriptsVendor']);
    gulp.watch('src/assets/**/*', ['assets']);
    gulp.watch('src/**/*.html', ['serve-html']);

    gulp.watch('dev/assets/**').on('change', bs.reload);
    gulp.watch('dev/**/*.js').on('change', bs.reload);
    gulp.watch('dev/**/*.html').on('change', bs.reload);

});

gulp.task('default', function(){
    order(['styles', 'scripts', 'scriptsVendor', 'assets', 'serve-html'], 'bsync');
});

gulp.task('build', function(){
    order(['styles', 'scripts', 'scriptsVendor', 'assets', 'serve-html', 'buildImages'], 'buildCopy');
})