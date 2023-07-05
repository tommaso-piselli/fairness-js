let fileInput = d3.select("#file-input");
console.log(fileInput);

fileInput.on('change', function() {
  let file = this.files[0];
  if (!file) return;

  let reader = new FileReader();
  reader.onload = function(e) {
    let graph = JSON.parse(e.target.result);

    let svg = d3.select("#graph");

    // define dimensions
    let svgWidth = parseFloat(svg.style("width"));
    let svgHeight = parseFloat(svg.style("height"));
    let margin = 20;

    // min max of the scale
    let xExtent = d3.extent(graph.nodes, d => d.x);
    let yExtent = d3.extent(graph.nodes, d => d.y);

    // calculate scales: keep the graph's aspect ratio (?)
    let xRange = xExtent[1] - xExtent[0];
    let yRange = yExtent[1] - yExtent[0];
    let xScale, yScale;
    if (xRange > yRange) {
      let scale = (svgWidth - 2 * margin) / xRange;
      xScale = d3.scaleLinear()
          .domain(xExtent)
          .range([margin, svgWidth - margin]);
      yScale = d3.scaleLinear()
          .domain(yExtent)
          .range([(svgHeight - yRange * scale) / 2, (svgHeight + yRange * scale) / 2]);
    } else {
      let scale = (svgHeight - 2 * margin) / yRange;
      yScale = d3.scaleLinear()
          .domain(yExtent)
          .range([margin, svgHeight - margin]);
      xScale = d3.scaleLinear()
          .domain(xExtent)
          .range([(svgWidth - xRange * scale) / 2, (svgWidth + xRange * scale) / 2]);
    }

    // draw edges
    let links = svg.selectAll("line")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("x1", (d) => xScale(graph.nodes[d.source].x))
        .attr("y1", (d) => yScale(graph.nodes[d.source].y))
        .attr("x2", (d) => xScale(graph.nodes[d.target].x))
        .attr("y2", (d) => yScale(graph.nodes[d.target].y))
        .style("stroke", "black");

    // draw nodes
    let nodes = svg.selectAll("circle")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d.x))
        .attr("cy", (d) => yScale(d.y))
        .attr("r", 4)
        .style("fill", (d) => d.color); // ToDo: cambiare? Non nel json?

    // Add interactions to nodes
    nodes.on("mouseover", function(d) {
      d3.select(this)
          .attr("r", 8); // increase radius

      // Add a tooltip or additional information about the node
      svg.append("text")
          .attr("id", "tooltip")
          .attr("x", xScale(d.x))
          .attr("y", yScale(d.y) - 10) // position above the node
          .text(d.name); // assuming each node object has a name property
    });

    nodes.on("mouseout", function() {
      d3.select(this)
          .attr("r", 4); // reset to original radius

      // Remove the tooltip
      svg.select("#tooltip").remove();
    });
  }
  reader.readAsText(file);
});
