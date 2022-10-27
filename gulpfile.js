const yargs = require('yargs')

const gulp = require('gulp')
const zip = require('gulp-zip')
const connect = require('gulp-connect')
const eslint = require('gulp-eslint');

const root = yargs.argv.root || '.'
const port = yargs.argv.port || 8000
const host = yargs.argv.host || 'localhost'


// Prevents warnings from opening too many test pages
process.setMaxListeners(20);

const babelConfig = {
    babelHelpers: 'bundled',
    ignore: ['node_modules'],
    compact: false,
    extensions: ['.js', '.html'],
    plugins: [
        'transform-html-import-to-string'
    ],
    presets: [[
        '@babel/preset-env',
        {
            corejs: 3,
            useBuiltIns: 'usage',
            modules: false
        }
    ]]
};

// Our ES module bundle only targets newer browsers with
// module support. Browsers are targeted explicitly instead
// of using the "esmodule: true" target since that leads to
// polyfilling older browsers and a larger bundle.
const babelConfigESM = JSON.parse( JSON.stringify( babelConfig ) );
babelConfigESM.presets[0][1].targets = { browsers: [
    'last 2 Chrome versions',
    'last 2 Safari versions',
    'last 2 iOS versions',
    'last 2 Firefox versions',
    'last 2 Edge versions',
] };

gulp.task('eslint', () => gulp.src(['./js/**', 'gulpfile.js'])
        .pipe(eslint())
        .pipe(eslint.format()))


gulp.task('package', gulp.series(() =>

    gulp.src(
        [
            './index.html',
            './dist/**',
            './lib/**',
            './images/**',
            './plugin/**',
            './**.md'
        ],
        { base: './' }
    )
    .pipe(zip('reveal-js-presentation.zip')).pipe(gulp.dest('./'))

))

gulp.task('reload', () => gulp.src(['*.html', '*.md'])
    .pipe(connect.reload()));

gulp.task('serve', () => {

    connect.server({
        root: root,
        port: port,
        host: host,
        livereload: true
    })

    gulp.watch(['*.html', '*.md', 'images/**'], gulp.series('reload'))

    gulp.watch(['js/**'], gulp.series('reload', 'eslint'))

    gulp.watch(['plugin/**/plugin.js', 'plugin/**/*.html'], gulp.series('reload'))

})