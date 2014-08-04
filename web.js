var React = require('react');
var _ = React.DOM;

var createProcessor = require('./processor');

var Tree = React.createClass({
    getInitialState: function() { return {expanded: false}; },
    onClick: function() {
        this.setState({expanded: !this.state.expanded});
    },

    makeChildren: function(items, depth) {
        var children = items.map(function(c) {
            return new Tree({tree: c, depth: depth});
        });
        return _.div({className: 'children'}, children);

    },
    makeInfo: function(stats, depth) {
        var statsDiv = _.div({
            className: 'stats'
        }, stats ? stats.map(function(s, k) {
            return _.div({
                className:"stat-" +k
            }, s);
        }):'');

        var labelDiv = _.div({
            className: 'label',
            style: {paddingLeft: depth + 'em'}
        }, this.props.tree.fn || 'root node, click to expand');

        return _.div({
            className: 'info',
            onClick: this.onClick
        }, statsDiv, labelDiv);

    },
    shouldComponentUpdate: function(nextProps, nextState) {
        return nextState !== this.state || nextProps !== this.props;
    },
    render: function() {
        //console.log("render", this.props.tree);

        var t = this.props.tree;
        if (!t) return _.div(null);
        var clickable = t.children.length;
        var depth = this.props.depth || 1;

        var cls = this.state.expanded ? 'expanded' : 'contracted';
        var depthcls = 'depth-'+depth;
        return _.div({
            className: ' item ' + cls + ' ' + (clickable?'clickable':'') + ' ' + depthcls
        },[
            this.makeInfo(this.props.tree.stats, depth,
                          this.props.tree.fn,
                          this.onclick),
            this.state.expanded ? this.makeChildren(
                this.props.tree.children, depth + 1) : []])
    }
});

function readAsText(file, cb) {
    var reader = new FileReader();
    reader.onload = function(upload) {
        cb(upload.target.result);
    }
    reader.readAsText(file);
}

function readProfileData(str) {
    var lines = str.split(/[\r\n]+/);
    var processor = createProcessor();
    lines.forEach(processor);
    return processor.data();
}

var profileKinds = {top: 'Top-down', bottom: 'Bottom-up'};

var App = React.createClass({
    getInitialState: function() {
        return {show: 'top', data: {}};
    },
    updateTree: function (e) {
        this.setState({show: e.target.value });
    },
    updateData: function(e) {
        var self = this;
        readAsText(e.target.files[0], function(lines) {
            self.setState({data: readProfileData(lines)});
        });
        console.log(e.target.files[0]);
    },
    render: function() {

        var file = _.input({
            type: 'file',
            onChange: this.updateData
        });

        var opts = ['top', 'bottom'].map(function(v) {
            return _.option({value: v}, profileKinds[v]);
        });
        var optionWhich = _.select({
            onChange: this.updateTree,
            defaultValue: 'top'
        }, opts);

        var tree = this.state.data[this.state.show];
        var profileTree = new Tree({tree: tree});

        var result = _.div({ className: 'main' },
                           "Output generated by node-tick-processor: ", file,
                           "Show: ", optionWhich,
                           profileTree);
        return result;
    }
});

React.renderComponent(
    new App(),
    document.getElementById('app'));