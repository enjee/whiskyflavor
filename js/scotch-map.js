var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#scmap").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


var x = d3.scaleLinear().range([0, 400]);
var y = d3.scaleLinear().range([0, 530]);

x.domain([0, 267]);
y.domain([0, 354]);




d3.json("scotland.json", function(error, data) {
    svg.selectAll("polygon")
        .data(data.regions)
        .enter().append("polygon")
        .attr("points",function(d) {
            return d.points.map(function(d) { return [x(d.x),y(d.y)].join(","); }).join(" ");})
        .attr("stroke","black")
        .attr("stroke-width",2);
});