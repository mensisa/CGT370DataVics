var tip = d3.tip().attr('class', 'd3-tip').html(function (d) {
    return "<strong>County: </strong> <span class='details'> "
        + d.properties.NAME + "<br></span>";
});

var width = 800,
    height = 750,
    centered;

var color = ["#084594", "#2b8cbe", "#74a9cf", "#cccccc", "#969696"];

var projection = d3.geoAlbers()
    .scale(10000)
    .translate([- width / 0.89, height / 1.2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#svg").append("svg")
    .attr("width", width)
    .attr("height", height);

var list = 1;

var changeArr = [];

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height);

svg.call(tip);

legend(600, 625, "More than 6% (3)", color[0]);
legend(600, 650, "3% to 6% (8)", color[1]);
legend(600, 675, "0% to 3% (39)", color[2]);
legend(600, 700, "-3% to 0% (33)", color[3]);
legend(600, 725, "More than -3% (9)", color[4]);

function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

function click2012() {
    mouseOut();
    list = 1;
    document.getElementById("year").innerHTML = "in Indiana by County, 2012 to 2016";
    d3.select("#counties").remove();
    queue()
        .defer(d3.json, "indiana.json")
        .defer(d3.csv, "movein.csv")
        .await(makeMap);
}
function click2015() {
    mouseOut();
    list = 2;
    document.getElementById("year").innerHTML = "in Indiana by County, 2013 to 2016";
    d3.select("#counties").remove();
    queue()
        .defer(d3.json, "indiana.json")
        .defer(d3.csv, "movein.csv")
        .await(makeMap);
}
// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

var g = svg.append("g");

queue()
    .defer(d3.json, "indiana.json")
    .defer(d3.csv, "movein.csv")
    .await(makeMap);

function makeMap(error, IN, data) {
    if (error) throw error;

    g.append("g")
        .attr("id", "counties")
        .selectAll("path")
        .data(topojson.feature(IN, IN.objects.cb_2015_indiana_county_20m).features)
        .enter().append("path")
        .attr("id", function (d) { return "id" + d.properties.GEOID; })
        .attr("d", path)
        .on('mouseover', function (d) {
            tip.show(d)
        })
        .on('mouseout', function (d) {
            tip.hide(d)
        })
        .on("click", function (d) {
            mouseOut();
            barChart(d);
            var est1 = d.properties.EST12;
            var est2 = d.properties.EST16;
            var changeRate = d.properties.CHANGE;
            var name = d.properties.NAME;
            if (list == 1) {
                est1 = d.properties.EST12;
                g.append("text")
                    .attr("id", "text")
                    .attr("x", 0)
                    .attr("y", 305)
                    .text("2012 Estimation: " + est1);
            } else {
                est1 = d.properties.EST13;
                g.append("text")
                    .attr("id", "text")
                    .attr("x", 0)
                    .attr("y", 305)
                    .text("2013 Estimation: " + est1);
            }

            g.append("text")
                .attr("id", "text")
                .attr("x", 0)
                .attr("y", 280)
                .attr("font-weight", "bold")
                .text(name);

            g.append("text")
                .attr("id", "text")
                .attr("x", 0)
                .attr("y", 330)
                .text("2016 Estimation: " + est2);

            g.append("text")
                .attr("id", "text")
                .attr("x", 0)
                .attr("y", 355)
                .text("Changed Ratio: " + Math.round(changeRate * 10000) / 100 + "%");
        })
        .on("dblclick", mouseOut);

    g.append("path")
        .datum(topojson.mesh(IN, IN.objects.cb_2015_indiana_county_20m, function (a, b) { return a !== b; }))
        .attr("id", "county-borders")
        .attr("d", path);
    for (var i = 0; i < data.length; i++) {
        //get all counties id
        var geoid = data[i].geoid;
        var est_12 = data[i].est_12;
        var est_13 = data[i].est_13;
        var est_14 = data[i].est_14;
        var est_15 = data[i].est_15;
        var est_16 = data[i].est_16;
        //get all counties population movein change rate
        var change1216 = (est_16 - est_12) / est_12;
        var change1316 = (est_16 - est_13) / est_13;
        var change = change1216;
        if (list == 1) {
            change = change1216;
        }
        else {
            change = change1316;
        }

        for (var j = 0; j < IN.objects.cb_2015_indiana_county_20m.geometries.length; j++) {
            var geoid_json = IN.objects.cb_2015_indiana_county_20m.geometries[j].properties.GEOID;
            // assign change rate to the json file
            if (geoid_json == geoid) {
                //console.log("geoid: "+geoid);
                changeArr[j] = { "geoid": parseInt(geoid), "change": change };
                IN.objects.cb_2015_indiana_county_20m.geometries[j].properties.CHANGE = change
                IN.objects.cb_2015_indiana_county_20m.geometries[j].properties.EST12 = est_12;
                IN.objects.cb_2015_indiana_county_20m.geometries[j].properties.EST13 = est_13;
                IN.objects.cb_2015_indiana_county_20m.geometries[j].properties.EST14 = est_14;
                IN.objects.cb_2015_indiana_county_20m.geometries[j].properties.EST15 = est_15;
                IN.objects.cb_2015_indiana_county_20m.geometries[j].properties.EST16 = est_16;
                if (change >= 0.06) {
                    d3.select("#id" + geoid)
                        .attr("fill", color[0]);
                } else if (change > 0.03 && change <= 0.06) {
                    d3.select("#id" + geoid)
                        .attr("fill", color[1]);
                } else if (change > 0 && change <= 0.03) {
                    d3.select("#id" + geoid)
                        .attr("fill", color[2]);
                } else if (change > -0.03 && change <= 0) {
                    d3.select("#id" + geoid)
                        .attr("fill", color[3]);
                } else {
                    d3.select("#id" + geoid)
                        .attr("fill", color[4]);
                }
                break;
            }
        }
    }
}

function mouseOut(d, i) {
    d3.selectAll("#text").remove();
    d3.selectAll("#bar").remove();
}

function legend(x, y, text, color) {
    svg.append("rect")
        .attr("class", "legend")
        .attr("x", x)
        .attr("y", y)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color);
    svg.append("text")
        .attr("class", "legend")
        .attr("dy", "0.71em")
        .attr("x", x + 25)
        .attr("y", y + 2)
        .style("text-anchor", "right")
        .text(text);
}

function barChart(d) {
    var svg2 = d3.select("#chart").append("svg")
        .attr("id", "bar")
        .attr("width", 200)
        .attr("height", 200);
    var data = [
        { "year": 2012, "value": d.properties.EST12 },
        { "year": 2013, "value": d.properties.EST13 },
        { "year": 2014, "value": d.properties.EST14 },
        { "year": 2015, "value": d.properties.EST15 },
        { "year": 2016, "value": d.properties.EST16 }];
    var margin = ({ top: 30, right: 0, bottom: 10, left: 30 });
    var x = d3.scaleLinear()
        .domain([d3.min(data, d => d.value) - 900, d3.max(data, d => d.value)])
        .range([margin.left, 200 - margin.right]);
    var y = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([margin.top, 200 - margin.bottom])
        .padding(0.1);
    var yAxis = g => g
        .attr("id", "bar")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickSizeOuter(0));

    g.append("g")
        .attr("x", 0)
        .attr("y", 120)
        .attr("fill", "steelblue")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("id", "bar")
        .attr("x", x(d3.min(data, d => d.value) - 900))
        .attr("y", d => y(d.year))
        .attr("width", d => x(d.value) - x(d3.min(data, d => d.value) - 900))
        .attr("height", y.bandwidth());

    g.append("g")
        .attr("x", 0)
        .attr("y", 120)
        .attr("fill", "white")
        .attr("text-anchor", "end")
        .style("font", "12px sans-serif")
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("id", "bar")
        .attr("y", d => y(d.year) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .text(d => d3.format(d.value));

    g.append("g")
        .attr("x", 0)
        .attr("y", 120)
        .call(yAxis);
}

