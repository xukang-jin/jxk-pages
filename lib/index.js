const { src, dest, parallel, series, watch } = require('gulp');
const del = require('del');
const browserSync = require('browser-sync');
const loadPlugins = require('gulp-load-plugins');
plugins = loadPlugins();
const cwd = process.cwd();
const bs = browserSync.create();
let config = {
  build: {
    src: 'src',
    dist: 'dist',
    temp: 'temp',
    public: 'public',
    paths: {
      styles: 'assets/styles/*.scss',
      scripts: 'assets/scripts/*.js',
      pages: '*.html',
      images: 'assets/images/**',
      fonts: 'assets/fonts/**'
    }
  }
};
try {
  let userConfig = require(`${cwd}\pages.config.js`);
  config = Object.assign({}, config, userConfig);
} catch (e) {
  // console.log(e)
}
const clean = () => {
  return del([config.build.dist, config.build.temp])
}
const style = () => {
  return src(config.build.paths.styles, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.sass({ outputStyle: 'expanded' }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))
}
const script = () => {
  return src(config.build.paths.scripts, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))
}
const page = () => {
  return src(config.build.paths.pages, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.swig({ data: config.data }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))
}
const image = () => {
  return src(config.build.paths.images, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}
const font = () => {
  return src(config.build.paths.fonts, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}
const extra = () => {
  return src(`${config.build.public}/**`, { base: config.build.public })
    .pipe(dest(config.build.dist))
}
const serve = () => {
  watch(config.build.paths.styles, { cwd: config.build.src }, style);
  watch(config.build.paths.scripts, { cwd: config.build.src }, script);
  watch(config.build.paths.pages, { cwd: config.build.src }, page);
  watch([
    config.build.paths.images,
    config.build.paths.fonts,
  ], { cwd: config.build.src }, bs.reload)
  watch('**', { cwd: config.build.public }, bs.reload)
  bs.init({
    notify: false,
    port: 2080,
    // open: false,
    // files: 'dist/**',
    server: {
      baseDir: [
        config.build.temp,
        config.build.src,
        config.build.public,
      ],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}
const useref = () => {
  return src(
    config.build.temp,
    { base: config.build.dist }
  )
    .pipe(plugins.useref({
      searchPath: [config.build.dist, '.'],
    }))
    //html、js、css
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(dest(config.build.dist))
}
const compile = parallel(style, script, page,);
const build = series(
  clean,
  parallel(
    series(
      compile,
      useref
    ),
    image,
    font,
    extra
  ),

);
const develop = series(compile, serve)

module.exports = {
  build,
  develop,
  clean,
}