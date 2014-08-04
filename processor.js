var formatTop = /^\s+([\d]+)\s+([\.\d]+)%\s+([\d]+)\s+([\.\d]+)%(.+)$/;
var formatBottom = /^\s+([\d]+)\s+([\.\d]+)%(.+)$/;

function processor() {
    var stackTop = [{
        children: []
    }];

    var stackBottom = [{
        children: []
    }];

    var lastDepth = 1;


    var stack;
    function next(line) {
        if (line.indexOf('[Top down (heavy) profile]') >= 0) {
            this.startConsuming = true;
            stack = stackTop;
        } else if (line.indexOf('[Bottom up (heavy) profile]') >= 0) {
            this.startConsuming = true;
            stack = stackBottom;
        }
        if (!this.startConsuming) return;

        var stats, fn;
        if (stack === stackTop) {
            var items = line.match(formatTop);
            if (items == null) return;
            stats = [].slice.call(items, 1, 5);
            fn = items[5];
        } else {
            var items = line.match(formatBottom);
            if (items == null) return;
            stats = [].slice.call(items, 1, 3);
            fn = items[3];
        }


        var item = {
            fn: fn.trimLeft(),
            stats: stats,
            children: []
        };
        var depth = ((fn.length - fn.trimLeft().length) / 2) | 0;

        var d = depth;
        while (d++ <= lastDepth && stack.length > 1) stack.pop();
        var last = stack[stack.length - 1];
        last.children.push(item);
        stack.push(item);
        lastDepth = depth;
    }
    next.data = function data() {
        return {top: stackTop[0], bottom: stackBottom[0]};
    }
    return next;
}

module.exports = processor;
