var split = require('split');
var through = require('through');
var createProcessor = require('./processor');

var processor = createProcessor();

process.stdin
    .pipe(split())
    .pipe(through(processor)).on('end', function() {
        console.log(JSON.stringify(processor.data()));
    });

