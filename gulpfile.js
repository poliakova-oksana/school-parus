const gulp = require('gulp'); // Подключаем Gulp
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const fileinclude = require('gulp-file-include'); // Для подключения файлов друг в друга
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const useref = require('gulp-useref');

// Таск для сборки HTML и шаблонов
gulp.task('html', function(callback) {
	return gulp.src('./src/html/*.html')
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'HTML include',
			        sound: false,
			        message: err.message
				}
			})
		}))
		.pipe( fileinclude({ prefix: '@@' }) )
		.pipe( gulp.dest('./build/') )
	callback();
});

// Таск для компиляции SCSS в CSS
gulp.task('scss', function(callback) {
	return gulp.src('./src/scss/style.scss')
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'Styles',
			        sound: false,
			        message: err.message
				}
			})
		}))
		.pipe( sourcemaps.init() )
		.pipe( sass() )
		.pipe( autoprefixer({
			overrideBrowserslist: ['last 4 versions']
		}) )
		.pipe( sourcemaps.write() )
		.pipe( gulp.dest('./build/css/') )
	callback();
});

// Слежение за HTML и CSS и обновление браузера
gulp.task('watch', function() {
	// Слежение за HTML и CSS и обновление браузера
	watch(['./build/*.html', './build/css/**/*.css'], gulp.parallel( browserSync.reload ));

	// Слежение за SCSS и компиляция в CSS - обычный способ
	// watch('./src/scss/**/*.scss', gulp.parallel('scss'));

	// Запуск слежения и компиляции SCSS с задержкой, для жестких дисков HDD
	watch('./src/scss/**/*.scss', function(){
		setTimeout( gulp.parallel('scss'), 1000 )
	})

	// Слежение за HTML и сборка страниц и шаблонов
	watch('./src/html/**/*.html', gulp.parallel('html'))

	// Следим за картинками и скриптами, и копируем их в build
	watch('./src/images/**/*.*', gulp.parallel('copy:img'))
	watch('./src/js/**/*.*', gulp.parallel('copy:js'))
	watch('./src/upload/**/*.*', gulp.parallel('copy:upload'))
});

// Копирование Изображений
gulp.task('copy:img', function(callback) {
	return gulp.src('./src/images/**/*.*')
	  .pipe(gulp.dest('./build/images/'))
	callback();
});

// Копирование изображений Upload

gulp.task('copy:upload', function(callback) {
	return gulp.src('./src/upload/**/*.*')
	  .pipe(gulp.dest('./build/upload/'))
	callback();
});

// Копирование Скриптов
gulp.task('copy:js', function(callback) {
	return gulp.src('./src/js/**/*.*')
	  .pipe(gulp.dest('./build/js/'))
	callback();
});

// Задача для старта сервера из папки app
gulp.task('server', function() {
	browserSync.init({
		server: {
			baseDir: "./build/"
		}
	})
});

// Дефолтный таск (задача по умолчанию)
// Запускаем одновременно задачи server и watch, scss
// gulp.task('default', gulp.parallel('server', 'watch', 'scss', 'html'));

gulp.task(
	'default', 
	gulp.series( 
		gulp.parallel('scss', 'html', 'copy:img', 'copy:js', 'copy:upload'),
		gulp.parallel('server', 'watch'), 
		)
);



// папка build будет содержать собранный проект
// папка src будет содержать все исходники проекта
// gulpfile.js - конфигурация проекта

gulp.task('imagesmin', function(){
	return gulp.src('src/images/**/*.+(png|jpg|gif|svg)')
	  .pipe(imagemin())
	  .pipe(gulp.dest('build/images'))
});

gulp.task('imagescache', function(){
	return gulp.src('src/images/**/*.+(png|jpg|jpeg|gif|svg)')
	  // Кэширование изображений, которые проходили через imagemin
	  .pipe(cache(imagemin({
		interlaced: true
	  })))
	  .pipe(gulp.dest('build/images'))
  });

  gulp.task('useref', function(){
	return gulp.src('src/*.html')
	  .pipe(useref())
	  .pipe(gulp.dest('build'))
  });

  gulp.task('fonts', function() {
	return gulp.src('src/fonts/**/*')
	  .pipe(gulp.dest('build/fonts'))
  })