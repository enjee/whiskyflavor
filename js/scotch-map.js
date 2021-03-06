// (re)draw everything when page is loaded or resized
$(document).ready(function () {
    drawEverything();
    if (localStorage.getItem("showMap")) {
        $(".welcome").hide();
    } else {
        $(".hidden").hide();
    }
});

window.onresize = function (event) {
    drawEverything();
};


/*************************************
 * Declaration of flavor colors      *
 *************************************/
const COLORS = {
    Body: "rgba(255, 204, 204, 0.5)",
    Sweetness: "rgba(102, 102, 0, 0.5)",
    Smoky: "rgba(102, 102, 153, 0.5)",
    Medicinal: "rgba(255, 0, 0, 0.5)",
    Tobacco: "rgba(204, 102, 0, 0.5)",
    Honey: "rgba(255, 153, 0, 0.5)",
    Spicy: "rgba(204, 51, 0, 0.5)",
    Winey: "rgba(204, 0, 0, 0.5)",
    Nutty: "rgba(102, 51, 0, 0.5)",
    Malty: "rgba(153, 153, 102, 0.5)",
    Fruity: "rgba(255, 255, 102, 0.5)",
    Floral: "rgba(51, 204, 51)"
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
    showTopThree(id);
});

// Show the top 3 of flavors
function showTopThree(id) {
    $(".top-5-header").html("Top 5 " + id);
    $(".top-5-item-container").html("");
    html_string = "";
    for (index in flavor_top[id]) {
        distillery_info = flavor_top[id][index];
        distillery_score = distillery_info[0];
        distillery_name = distillery_info[1];
        html_string += "\n" +
            "<div class=\"row\" onmouseenter=\"highlightDistillery('" + distillery_name.replace(/ /g, '') + "')\" onmouseleave=\"unHighlightDistillery('" + distillery_name.replace(/ /g, '') + "')\">" +
            "    <div class=\"col-sm-8 top-5-item\">" + (parseInt(index) + 1) + ". " + distillery_name + "</div>\n" +
            "    <div class=\"col-sm-4 top-5-item-value\">" + distillery_score + "/5</div>\n" +
            "</div>"

    }
    $(".top-5-item-container").html(html_string);
    $(".top-5-container").show();
}

function highlightDistillery(distillery_name) {
    $("#" + distillery_name).css("fill", "#A0CA79");
    $("#" + distillery_name).css("r", "15");
}

function unHighlightDistillery(distillery_name) {
    $("#" + distillery_name).css("fill", "#735850");
    $("#" + distillery_name).css("r", "5");
}


/*************************************************
 * Create map of Scotland and their distilleries *
 *************************************************/

// Global vars
var margin;
var svg;
var x;
var y;
var flavor_top;
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
        width = $(window).width() * 0.4 - margin.left - margin.right,
        height = $(window).width() * 1.325 * 0.4 - margin.top - margin.bottom;

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
    d3.json("data/scotland.json", function (error, data) {
        svg.selectAll("polygon")
            .data(data.regions)
            .enter().append("polygon")
            .attr("points", function (d) {
                return d.points.map(function (d) {
                    return [x(d.x * 0.7 - 120), y(d.y * 0.9 - 50)].join(",");
                }).join(" ");
            })
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .on('mouseenter', function (d, i) {
                d3.select(this).style('fill', "#A0CA79");
                tooltip.style("visibility", "visible");
                tooltip.text(d.name);
            })
            .on('mousemove', function (d, i) {
                tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
            })
            .on('mouseleave', function (d, i) {
                d3.select(this).style('fill', "#735850");
                tooltip.style("visibility", "hidden");
            });
    });
}


// Read in distilleries
function drawDistilleries() {
    d3.csv("data/whiskydata.csv", function (data) {

        // Save top5 of each flavor one time
        if (flavor_top == undefined) {
            saveFlavorTop(data);
        }
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'circle')
            .attr('r', 5)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr('fill', '#735850')
            .attr('z-index', '5000')
            .attr('id', function (d) {
                return d["Distillery"].replace(/ /g, '');
            })
            .attr('cx', function (d) {
                return x(d.x);
            })
            .attr('cy', function (d) {
                return y(d.y - 50);
            })
            .on('mouseenter', function (d, i) {
                d3.select(this).style('fill', "#735850");
                tooltip.style("visibility", "visible");
                tooltip.text(d.Distillery);
            })
            .on('mousemove', function (d, i) {
                tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
            })
            .on('mouseleave', function (d, i) {
                d3.select(this).style('fill', "#735850");
                tooltip.style("visibility", "hidden");
            });
    });
}

// Save the top5 of each flavor in a JS map.
function saveFlavorTop(data) {
    flavor_top = {};

    function process_flavor_data(flavor) {
        flavor_top[flavor] = [];
        for (index in data) {
            distillery_info = data[index];
            distillery_name = distillery_info["Distillery"];
            distillery_score = distillery_info[flavor];
            flavor_top[flavor].push([distillery_score, distillery_name]);
        }
        flavor_top[flavor] = flavor_top[flavor].sort(); // Sort flavor strengths
        flavor_top[flavor] = flavor_top[flavor].reverse().slice(0, 5); // get top 5

    }

    process_flavor_data("Body");
    process_flavor_data("Sweetness");
    process_flavor_data("Smoky");
    process_flavor_data("Medicinal");
    process_flavor_data("Tobacco");
    process_flavor_data("Honey");
    process_flavor_data("Spicy");
    process_flavor_data("Winey");
    process_flavor_data("Nutty");
    process_flavor_data("Malty");
    process_flavor_data("Fruity");
}

/***********************************
 * Finally draw in the flavors -.- *
 ***********************************/
function drawFlavors(flavor) {
    var color = eval("COLORS." + flavor);

    d3.csv("data/whiskydata.csv", function (data) {
        svg.selectAll(flavor)
            .data(data)
            .enter()
            .append('circle')
            .attr('z-index', '5000')
            .attr('class', flavor)
            .attr('r', function (d) {
                return 10 * eval("d." + flavor);
            })
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr('fill', color)
            .attr('fill-opacity', function (d) {
                return 0.4 * eval("d." + flavor);
            })
            .attr('cx', function (d) {
                return x(d.x);
            })
            .attr('cy', function (d) {
                return y(d.y - 50);
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

function showMap() {
    localStorage.setItem("showMap", true);
    $(".welcome").hide();
    $(".hidden").show(1000);
}

function resetShowMap() {
    localStorage.removeItem("showMap");
}