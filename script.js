d3.json('data/karate.json').then(function(graph) {
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
  // ToDo: this is not working as intended, need to refresh the page to rescale
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
    .attr("x1", function(d) { return xScale(graph.nodes[d.source].x); }) // source node's x coordinate
    .attr("y1", function(d) { return yScale(graph.nodes[d.source].y); }) // source node's y coordinate
    .attr("x2", function(d) { return xScale(graph.nodes[d.target].x); }) // target node's x coordinate
    .attr("y2", function(d) { return yScale(graph.nodes[d.target].y); }) // target node's y coordinate
    .style("stroke", "black");

  // draw nodes
  let nodes = svg.selectAll("circle")
    .data(graph.nodes)
    .enter()
    .append("circle")
    .attr("cx", function(d) { return xScale(d.x); }) // x coordinate in the data
    .attr("cy", function(d) { return yScale(d.y); }) // y coordinate in the data
    .attr("r", 5)
    .style("fill", function(d) { return d.color; }); // color based on data
});
