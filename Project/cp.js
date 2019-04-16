google.charts.load('current', { 'packages': ['corechart'], 'callback': drawDashboard });
var svg = d3.select("svg"),
  margin = 20,
  diameter = +svg.attr("width"),
  g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var color = d3.scaleLinear()
  .domain([-1, 5])
  .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
  .interpolate(d3.interpolateHcl);

var pack = d3.pack()
  .size([diameter - margin, diameter - margin])
  .padding(2);

function on(id) {
  console.log(id);
  
  document.getElementById("overlay").style.display = "block";
  g.selectAll("circle").remove();
  g.selectAll("text").remove();
  drawDashboard(id);
  if(d3.event !== null)
    d3.event.stopPropagation();
}

function off() {
  if(d3.event !== null)
    d3.event.stopPropagation();
  document.getElementById("overlay").style.display = "none";
  location.reload();
}

drawPacking();

function drawPacking() {
  d3.json("ab.json", function (error, root) {
    if (error) throw error;

    root = d3.hierarchy(root)
      .sum(function (d) { return d.size; })
      .sort(function (a, b) { return b.value - a.value; });

    var focus = root,
      nodes = pack(root).descendants(),
      view;
    var circle = g.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("class", function (d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .attr("id", function (d) { return d.parent ? d.children ? d.data.name.replace(/\s+/g, '-') : "a" + d.data.data.ID : d.data.name.replace(/\s+/g, '-'); })
      .attr("onclick", function (d) { return d.parent ? d.children ? "" : "on('" + d.data.data.ID + "')" : ""; })
      .style("fill", function (d) { return d.children ? color(d.depth) : null; })
      .on("click", function (d) { console.log("focus");console.log(focus);console.log("d");console.log(d); if (focus !== d) {zoom(d)} d3.event.stopPropagation(); });

    var text = g.selectAll("text")
      .data(nodes)
      .enter().append("text")
      .attr("class", "label")
      .style("fill-opacity", function (d) { return d.parent === root ? 1 : 0; })
      .style("display", function (d) { return d.parent === root ? "inline" : "none"; })
      .text(function (d) { return d.data.name; });

    var node = g.selectAll("circle,text");

    svg
      .style("background", color(-100))
      .on("click", function () { zoom(root); });

    zoomTo([root.x, root.y, root.r * 2 + margin]);

    function zoom(d) {
      var focus0 = focus; focus = d;
      
      var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function (d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function (t) { zoomTo(i(t)); };
        });
        
      transition.selectAll("text")
        .filter(function (d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function (d) { return d.parent === focus ? 1 : 0; })
        .on("start", function (d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function (d) { if (d.parent !== focus) this.style.display = "none"; });
    }

    function zoomTo(v) {
      var k = diameter / v[2]; view = v;
      node.attr("transform", function (d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
      circle.attr("r", function (d) { return d.r * k; });
    }
  });
}

function drawDashboard(id) {
  var row;
  d3.csv("data.csv", function (error, d) {
    if (error) throw error;
    for (var i = 0; i < d.length; i++) {
      if (d[i].ID == id) {
        row = d[i];
        //console.log(row);
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Year');
        data.addColumn('number', 'Coverage');
        data.addRows([["True", parseInt(row['2017'])]]);
        data.addRows([["False", 100 - parseInt(row['2017'])]]);

        var data1 = new google.visualization.DataTable();
        data1.addColumn('string', 'Year');
        data1.addColumn('number', 'Coverage');
        for (var j = 1980; j <= 2017; j++) {
          //console.log(row[""+j]);
          data1.addRows([[""+j, parseInt(row["" + j.toString(10)])]]);
        }
        
        var title = document.getElementById('title');
        title.innerText = "Measles Immunization Coverage from 1980 to 2017 in " + row['Country'];

        var options1 = {
          hAxis: {
            title: 'Year'
          },
          vAxis: {
            title: 'Coverage'
          },
          pointsVisible: true
        };

        var options = {
          pieHole: 0.5,
          pieSliceTextStyle: {
            color: 'black',
          },
          legend: 'none'
        };
        
        var pie = new google.visualization.PieChart(document.getElementById('pie_div'));
        var line = new google.visualization.LineChart(document.getElementById('line_div'));

        google.visualization.events.addListener(line, 'select', function () {
          var selection = line.getSelection();
          console.log(selection);
          var temData = new google.visualization.DataTable();
          temData.addColumn('string', 'Year');
          temData.addColumn('number', 'Coverage');
          temData.addRows([["True", parseInt(row['2017'])]]);
          temData.addRows([["False", 100 - parseInt(row['2017'])]]);
      });
        
        pie.draw(data,options);
        line.draw(data1, options1);
        break;
      }
    }
  });


}
