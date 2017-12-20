var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#scmap").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


var x = d3.scaleLinear().range([0, 267]);
var y = d3.scaleLinear().range([354, 0]);

x.domain([0, 267]);
y.domain([0, 354]);


// Load local scotland.json file into regions
var regions = undefined;
var json = (function () {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "scotland.json",
        'dataType': "json",
        'success': function (data) {
            regions = data.regions;
        }
    });
    return json;
})();


$.each(regions, function (index, value) {
    var poly = value.points;
    console.log(value)

    svg.selectAll("polygon")
        .data([poly])
        .enter().append("polygon")
        .attr("points",function(d) {
            return d.map(function(d) {
                return [x(d.x),y(d.y)].join(",");
            }).join(" ");
        });
});
