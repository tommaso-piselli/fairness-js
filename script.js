d3.json('data/balanced_tree_2_5.json').then(function(graph) {
  let svg = d3.select("#graph");

  // define dimensions
  let svgWidth = parseFloat(svg.style("width"));
  let svgHeight = parseFloat(svg.style("height"));
  //console.log(svgWidth, svgHeight)
  let margin = 20; 

  // min max of the scale
  let xExtent = d3.extent(graph.nodes, d => d.x);
  let yExtent = d3.extent(graph.nodes, d => d.y);


  // calculate scales: keep the graph's aspect ratio (?)

  // ToDo: - this is not working as intended, need to refresh the page to rescale
  //       - the refresh is working only for the vertical axe

  let xRange = xExtent[1] - xExtent[0];
  let yRange = yExtent[1] - yExtent[0];
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
});




