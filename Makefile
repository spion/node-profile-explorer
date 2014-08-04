all: web.js
	browserify web.js -o bundle.js
	uglifyjs bundle.js -o bundle.min.js
	rm bundle.js
