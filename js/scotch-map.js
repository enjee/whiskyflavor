
$('input[type=checkbox]').click(function() {
    if($(this).is(':checked')) {
        console.info(this.id)
        console.info("checked")
    } else {
        console.info(this.id)
        console.info("unchecked")
    }
});







var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = $(window).width() * 0.667 - margin.left - margin.right,
    height = $(window).width() * 1.325 * 0.667 - margin.top - margin.bottom;

var svg = d3.select("#scmap").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([0, height]);

x.domain([0, 267]);
y.domain([0, 354]);

var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .attr("class", "tt")
    .text("-");


// Setup the map and regions
d3.json("scotland.json", function (error, data) {
    svg.selectAll("polygon")
        .data(data.regions)
        .enter().append("polygon")
        .attr("points", function (d) {
            return d.points.map(function (d) {
                return [x(d.x - 50), y(d.y)].join(",");
            }).join(" ");
        })
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .on('mouseenter', function (d, i) {
            d3.select(this).style('fill', "#A0998D");
            tooltip.style("visibility", "visible");
            tooltip.text(d.name);
        })
        .on('mousemove', function (d, i) {
            tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on('mouseleave', function (d, i) {
            d3.select(this).style('fill', "#626262");
            tooltip.style("visibility", "hidden");
        });
});

// Read in distilleries
var dataset = [];
d3.csv("whiskydata.csv", function (data) {
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'circle')
        .attr('r', 10)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr('fill', '#626262')
        .attr('cx', function (d) {
            return x(d.x - 50);
        })
        .attr('cy', function (d) {
            return y(d.y);
        })
        .on('mouseenter', function (d, i) {
            d3.select(this).style('fill', "#A0998D");
            tooltip.style("visibility", "visible");
            tooltip.text(d.Distillery);
        })
        .on('mousemove', function (d, i) {
            tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on('mouseleave', function (d, i) {
            d3.select(this).style('fill', "#626262");
            tooltip.style("visibility", "hidden");
        });
});