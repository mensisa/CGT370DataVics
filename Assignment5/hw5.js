var width = 960,
    height = 600;

var svg = d3.select("#us-chart").append("svg")
    .attr("width", width)
    .attr("height", height);

var path = d3.geoPath();

d3.json("10m.json", function (error, us) {
    if (error) throw error;
    svg.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .on("click", function (d) {
            d3.selectAll("#smallState").remove();

            createState(d.id);
        });

    svg.append("path")
        .attr("class", "state-borders")
        .attr("d", path(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; })));
});

function createState(stateID) {
    var svgS = d3.select("#state-chart").append("svg")
        .attr("id", "smallState")
        .attr("width", width)
        .attr("height", height);

    var pathS = d3.geoPath();

    d3.json("10m.json", function (error, us) {
        if (error) throw error;

        var state = topojson.feature(us, us.objects.states).features.filter(function (d) {
            return d.id.substring(0, 2) == stateID
        })[0];

        var bounds = pathS.bounds(state);

        dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = .7 / Math.max(dx / width, dy / height),
            translate = [width / 2 - scale * x, height / 2 - scale * y];

        svgS.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features.filter(function (d) {
                return d.id.substring(0, 2) == stateID
            }))
            .enter().append("path")
            .attr("d", pathS)
            .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

        svgS.append("path")
            .attr("class", "county-borders")
            .attr("d", path(topojson.mesh(us, us.objects.counties, function (a, b) { return a !== b; })))
            .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
    });
}

