//http://bl.ocks.org/mapsam/6090056 make a map
//
var width = 800,
    height = 750,
    centered;

var color = ["#084594","#2b8cbe","#74a9cf","#cccccc","#969696"];

var projection = d3.geoAlbers()
    .scale(10000)
    .translate([- width / 0.83, height / 1.2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("div").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height);

legend(600,625,"More than 6% (3)",color[0]);
legend(600,650,"3% to 6% (8)",color[1]);
legend(600,675,"0% to 3% (39)",color[2]);
legend(600,700,"-3% to 0% (33)",color[3]);
legend(600,725,"More than -3% (9)",color[4]);


var g = svg.append("g");

queue()
    .defer(d3.json,"indiana.json")
    .defer(d3.csv, "movein.csv")
    .await(makeMap);

function makeMap (error, IN, data) {
    if (error) throw error;

    g.append("g")
        .attr("id", "counties")
        .selectAll("path")
        .data(topojson.feature(IN, IN.objects.cb_2015_indiana_county_20m).features)
        .enter().append("path")
        .attr("id", function(d) { return "id"+d.properties.GEOID; })
        .attr("d", path)
        .on("mouseover", function (d) {
            var name = d.properties.NAME;
            var est16 = d.properties.EST16;
            var est12 = d.properties.EST12;
            var changeRate = d.properties.CHANGE;

            g.append("text")
                .attr("id", "text")
                .attr("x", 0)
                .attr("y", 320)
                .attr("font-weight","bold")
                .text(name);

            g.append("text")
                .attr("id", "text")
                .attr("x", 0)
                .attr("y", 345)
                .text("2012 Estimation: " + est12);

            g.append("text")
                .attr("id", "text")
                .attr("x", 0)
                .attr("y", 370)
                .text("2016 Estimation: " + est16);

            g.append("text")
                .attr("id", "text")
                .attr("x", 0)
                .attr("y", 395)
                .text("Changed Ratio: " + Math.round(changeRate * 10000) / 100 + "%");
        })
        .on("mouseout", mouseOut);;
    
    g.append("path")
        .datum(topojson.mesh(IN, IN.objects.cb_2015_indiana_county_20m, function (a, b) { return a !== b; }))
        .attr("id", "county-borders")
        .attr("d", path);
    for (var i = 0; i < data.length; i++) {
        //get all counties id
        var geoid = data[i].geoid;
        var est_12 = data[i].est_12;
        var est_16 = data[i].est_16;
        //get all counties population movein change rate
        var change = data[i].rate12_16;

        for (var j = 0; j < IN.objects.cb_2015_indiana_county_20m.geometries.length; j++) {
            var geoid_json = IN.objects.cb_2015_indiana_county_20m.geometries[j].properties.GEOID;
            // assign change rate to the json file
            if (geoid_json == geoid) {
                IN.objects.cb_2015_indiana_county_20m.geometries[j].properties.CHANGE = change;
                IN.objects.cb_2015_indiana_county_20m.geometries[j].properties.EST12 = est_12;
                IN.objects.cb_2015_indiana_county_20m.geometries[j].properties.EST16 = est_16;
                if (change >= 0.06) {
                    d3.select("#id"+geoid)
                        .style("fill",color[0]);
                } else if ( change > 0.03 && change <= 0.06) {
                    d3.select("#id"+geoid)
                        .style("fill",color[1]);
                } else if ( change > 0 && change <= 0.03) {
                    d3.select("#id"+geoid)
                        .style("fill",color[2]);
                }else if ( change > -0.03 && change <= 0) {
                    d3.select("#id"+geoid)
                        .style("fill",color[3]);
                } else {
                    d3.select("#id"+geoid)
                        .style("fill",color[4]);
                }
                console.log(geoid + ", " + IN.objects.cb_2015_indiana_county_20m.geometries[j].properties.CHANGE);
                break;
            } 
        }
    }
}

function mouseOut(d, i) {
    d3.selectAll("#text").remove();
}

function legend(x,y,text,color) {
    svg.append("rect")
        .attr("class","legend")
        .attr("x",x)
        .attr("y",y)
        .attr("width",15)
        .attr("height",15)
        .attr("fill",color);
    svg.append("text")
        .attr("class","legend")
        .attr("dy","0.71em")
        .attr("x",x + 25)
        .attr("y",y + 2)
        .style("text-anchor","right")
        .text(text);
}

