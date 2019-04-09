queue()
    .defer(d3.json, "data.json")
    .await(drawAll);

function drawAll(error, dataset) {

    var width = Math.max($("#chart").width(), 350) - 20,
        height = (window.innerWidth < 768 ? width : window.innerHeight - 20);

    var centerX = width / 2,
        centerY = height / 2;

    //Create the visible canvas and context
    var canvas = d3.select("#chart").append("canvas")
        .attr("id", "canvas")
        .attr("width", width)
        .attr("height", height);
    var context = canvas.node().getContext("2d");
    context.clearRect(0, 0, width, height);

    //Create a hidden canvas in which each circle will have a different color
    //We can use this to capture the clicked on circle
    var hiddenCanvas = d3.select("#chart").append("canvas")
        .attr("id", "hiddenCanvas")
        .attr("width", width)
        .attr("height", height)
        .style("display", "none");
    var hiddenContext = hiddenCanvas.node().getContext("2d");
    hiddenContext.clearRect(0, 0, width, height);

    //Create a custom element, that will not be attached to the DOM, to which we can bind the data
    var detachedContainer = document.createElement("custom");
    var dataContainer = d3.select(detachedContainer);

    ////////////////////////////////////////////////////////////// 
    /////////////////////// Create Scales  /////////////////////// 
    ////////////////////////////////////////////////////////////// 

    var colorCircle = d3.scale.ordinal()
        .domain([0, 1, 2, 3])
        .range(['#bfbfbf', '#838383', '#4c4c4c', '#1c1c1c']);

    var diameter = Math.min(width * 0.9, height * 0.9);
    var pack = d3.layout.pack()
        .padding(1)
        .size([diameter, diameter])
        .value(function (d) { return d.size; })
        .sort(function (d) { return d.ID; });

    ////////////////////////////////////////////////////////////// 
    ////////////////// Create Circle Packing /////////////////////
    ////////////////////////////////////////////////////////////// 

    var nodes = pack.nodes(dataset),
        root = dataset,
        focus = dataset;

    //Dataset to swtich between color of a circle (in the hidden canvas) and the node data	
    var colToCircle = {};

    //Create the circle packing as if it was a normal D3 thing
    var dataBinding = dataContainer.selectAll(".node")
        .data(nodes)
        .enter().append("circle")
        .attr("id", function (d, i) { return "nodeCircle_" + i; })
        .attr("class", function (d, i) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
        .attr("r", function (d) { return d.r; })
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("fill", function (d) { return d.children ? colorCircle(d.depth) : "white"; });
    //.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });;

    //First zoom to get the circles to the right location
    zoomToCanvas(root);

    ////////////////////////////////////////////////////////////// 
    ///////////////// Canvas draw function ///////////////////////
    ////////////////////////////////////////////////////////////// 

    //The draw function of the canvas that gets called on each frame
    function drawCanvas(chosenContext, hidden) {

        //Clear canvas
        chosenContext.fillStyle = "#fff";
        chosenContext.rect(0, 0, canvas.attr("width"), canvas.attr("height"));
        chosenContext.fill();

        //Select our dummy nodes and draw the data to canvas.
        var elements = dataContainer.selectAll(".node");
        elements.each(function (d) {

            var node = d3.select(this);

            //If the hidden canvas was send into this function
            //and it does not yet have a color, generate a unique one
            if (hidden) {
                if (node.attr("color") === null) {
                    // If we have never drawn the node to the hidden canvas get a new color for it and put it in the dictionary.
                    node.attr("color", genColor());
                    colToCircle[node.attr("color")] = node;
                }//if
                // On the hidden canvas each rectangle gets a unique color.
                chosenContext.fillStyle = node.attr("color");
            } else {
                chosenContext.fillStyle = node.attr("fill");
            }//else

            //Draw each circle
            chosenContext.beginPath();
            chosenContext.arc((centerX + +node.attr("cx")), (centerY + +node.attr("cy")), node.attr("r"), 0, 2 * Math.PI, true);
            chosenContext.fill();
            chosenContext.closePath();

        })
    }//function drawCanvas

    ////////////////////////////////////////////////////////////// 
    /////////////////// Click functionality ////////////////////// 
    ////////////////////////////////////////////////////////////// 

    // Listen for clicks on the main canvas
    document.getElementById("canvas").addEventListener("click", function (e) {
       
    });

    ////////////////////////////////////////////////////////////// 
    ///////////////////// Zoom Function //////////////////////////
    ////////////////////////////////////////////////////////////// 

    //Zoom into the clicked on circle
    //Use the dataContainer to do the transition on
    //The canvas will continuously redraw whatever happens to these circles
    function zoomToCanvas(d) {
        focus = d;
        var v = [focus.x, focus.y, focus.r * 2.05],
            k = diameter / v[2];

        dataContainer.selectAll(".node")
            //.transition().duration(2000)
            .attr("cx", function (d) { return (d.x - v[0]) * k; })
            .attr("cy", function (d) { return (d.y - v[1]) * k; })
            .attr("r", function (d) { return d.r * k; });

    }//function zoomToCanvas

    ////////////////////////////////////////////////////////////// 
    /////////////////////// Initiate ///////////////////////////// 
    ////////////////////////////////////////////////////////////// 

    function animate() {
        drawCanvas(context);
        window.requestAnimationFrame(animate);
    }
    window.requestAnimationFrame(animate);

}//drawAll