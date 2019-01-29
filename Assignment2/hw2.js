var svg = d3.select(".canvas").append("svg"),
    width = 800,
    height = 200;

svg.attr("width", width)
    .attr("height", height);
    
var group = svg.append("g");

var data = {
    "Report": 26,
    "Death": 6,
    "Country": "South Africa"
};
create_graph(data);

//This function create the graph based on the given data
function create_graph(dist) {
    var report = dist["Report"];
    var death = dist["Death"];
    var sur = report - death;
    var row = 3;
    var x = 0;
    var n = parseInt(report / 9);
    width = Math.ceil(report / 9) * 120;
    svg.attr("width", width)
        .attr("height", height);
    for (var i = 0; i <= n; i++) {
        if (sur >= 9) {
            console.log(x);
            console.log(report);
            sur -= 9;
            create_diamond(row, 9, x);
        } else {
            sur %= 9;
            console.log(x);
            console.log(report);
            create_diamond(row, sur, x, report);
            sur = 0;
        }
        report -= 9;
        x += 120;
    }

    function text() {
        d3.select(".survival")
            .append("text")
            .text(dist["Report"] - dist["Death"]);
        d3.select(".death")
            .append("text")
            .text(dist["Death"]);
        d3.select(".country")
            .append("text")
            .text(dist["Country"]);
    }
    text();
}
/* //This is the function that create a pyramid shape.
function create_pyramid(n, sur, cx, re) {
    var counter = 0;
    var y = 0;
    for (var i = 0; i < n; i++) {
        group.attr("class", "unit" + i);
        var x = cx;
        y += 30;
        // This loop is for creating empty space
        for (var j = 1; j < n - i; j++) {
            x += 20;
        }
        // This loop is for creating colored dots
        for (var k = 1; k <= 2 * i + 1; k++) {
            x += 20;
            if (k % 2 != 0) {
                counter += 1;
                re--;
                if (counter <= sur) {
                    group.append("circle")
                        .attr("cx", x)
                        .attr("cy", y)
                        .attr("r", 10)
                        .style("fill", "#23cba7");
                } else if (re >= 0) {
                    group.append("circle")
                        .attr("cx", x)
                        .attr("cy", y)
                        .attr("r", 10)
                        .style("fill", "#67809f");
                }
            }
        }
    }
}
*/
//This is the function that create a diamond shape
function create_diamond(n, sur, cx, re) {
    var counter = 0;
    var y = 0;
    for (var i = 0; i < n; i++) {
        group.attr("class", "unit" + i);
        var x = cx;
        y += 30;
        // This loop is for creating empty space
        for (var j = 1; j < n - i; j++) {
            x += 20;
        }
        // This loop is for creating colored dots
        for (var k = 1; k <= 2 * i + 1; k++) {
            x += 20;
            if (k % 2 != 0) {
                counter += 1;
                re--;
                if (counter <= sur) {
                    group.append("circle")
                        .attr("cx", x)
                        .attr("cy", y)
                        .attr("r", 10)
                        .style("fill", "#23cba7");
                } else if (re >= 0) {
                    group.append("circle")
                        .attr("cx", x)
                        .attr("cy", y)
                        .attr("r", 10)
                        .style("fill", "#67809f");
                }
            }
        }
    }
    for (var i = n - 1; i > 0; i--) {
        group.attr("class", "unit" + i);
        var x = cx;
        y += 30;
        // This loop is for creating empty space
        for (var j = 0; j < n - i; j++) {
            x += 20;
        }
        // This loop is for creating colored dots
        for (var k = 1; k < 2 * i + 1; k++) {
            x += 20;
            if (k % 2 != 0) {
                counter += 1;
                re--;
                if (counter <= sur) {
                    group.append("circle")
                        .attr("cx", x)
                        .attr("cy", y)
                        .attr("r", 10)
                        .style("fill", "#23cba7");
                } else if (re >= 0) {
                    group.append("circle")
                        .attr("cx", x)
                        .attr("cy", y)
                        .attr("r", 10)
                        .style("fill", "#67809f");
                }
            }
        }
    }
}