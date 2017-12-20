$(document).ready(function () {
    drawEverything();
});

window.onresize = function (event) {
    drawEverything();
};


/*************************************
 * Declaration of flavor colors      *
 *************************************/
const COLORS = {
    Body: "rgb(0, 0, 102)",
    Sweetness: "rgb(102, 102, 0)",
    Smoky: "rgb(102, 102, 153)",
    Medicinal: "rgb(255, 0, 0)",
    Tobacco: "rgb(204, 102, 0)",
    Honey: "rgb(255, 153, 0)",
    Spicy: "rgb(204, 51, 0)",
    Winey: "rgb(204, 0, 0)",
    Nutty: "rgb(102, 51, 0)",
    Malty: "rgb(153, 153, 102)",
    Fruity: "rgb(255, 255, 102)",
    Floral: "rgb(51, 204, 51)"
};

var activeFlavors = [];


// Click on a color, redraw everything
$('input[type=checkbox]').click(function () {
    var id = this.id;
    var color = eval("COLORS." + id);
    if ($(this).is(':checked')) {
        $(this).parent().css("background", color);
        activeFlavors.push(id);
    } else {
        $(this).parent().css("background", "none");
        var index = activeFlavors.indexOf(id);
        activeFlavors.splice(index, 1);
    }
    drawEverything();
});


/*************************************************
 * Create map of Scotland and their distilleries *
 *************************************************/

// Global vars
var margin;
var svg;
var x;
var y;
var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .attr("class", "tt")
    .text("-");

// Does what it says
function drawEverything() {
    scaleMap();
    drawMap();
    drawDistilleries();
    $.each(activeFlavors, function (index, flavor) {
        drawFlavors(flavor);
    });
}

// Make sure the map fits on the screen
function scaleMap() {
    if (typeof svg != "undefined") {
        d3.select("svg").remove();
    }
    margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = $(window).width() * 0.667 - margin.left - margin.right,
        height = $(window).width() * 1.325 * 0.667 - margin.top - margin.bottom;

    svg = d3.select("#scmap").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    x = d3.scaleLinear().range([0, width]);
    y = d3.scaleLinear().range([0, height]);

    x.domain([0, 267]);
    y.domain([0, 354]);
}


// Setup the map and regions
function drawMap() {
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
                d3.select(this).style('fill', "#00b300");
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
}


// Read in distilleries
function drawDistilleries() {
    d3.csv("whiskydata.csv", function (data) {
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'circle')
            .attr('r', 5)
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
                d3.select(this).style('fill', "#00b300");
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
}


function drawFlavors(flavor) {
    var color = eval("COLORS." + flavor);

    d3.csv("whiskydata.csv", function (data) {
        svg.selectAll(flavor)
            .data(data)
            .enter()
            .append('circle')
            .attr('class', flavor)
            .attr('r', function(d) {
                return 10 * eval("d." + flavor);
            })
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr('fill', color)
            .attr('fill-opacity', function(d) {
                console.log(0.25 * eval("d." + flavor))
                return 0.5 * eval("d." + flavor);
            })
            .attr('cx', function (d) {
                return x(d.x - 50);
            })
            .attr('cy', function (d) {
                return y(d.y);
            })
            .on('mouseenter', function (d, i) {
                tooltip.style("visibility", "visible");
                tooltip.text(d.Distillery);
            })
            .on('mousemove', function (d, i) {
                tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
            })
            .on('mouseleave', function (d, i) {
                tooltip.style("visibility", "hidden");
            });
    });
}