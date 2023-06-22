d3.json('data/graph.json').then(function(graph) {
    let svg = d3.select("#graph");
  
    // draw nodes
    let nodes = svg.selectAll("circle")
      .data(graph.nodes)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return d.x; }) // position based on the x coordinate in the data
      .attr("cy", function(d) { return d.y; }) // position based on the y coordinate in the data
      .attr("r", 10)
      .style("fill", function(d) { return d.color; });
  
    // draw edges
    let edges = svg.selectAll("line")
      .data(graph.edges)
      .enter()
      .append("line")
      .attr("x1", function(d) { return nodes.data().find(node => node.id === d.source).x; }) // position based on the source node's x coordinate
      .attr("y1", function(d) { return nodes.data().find(node => node.id === d.source).y; }) // position based on the source node's y coordinate
      .attr("x2", function(d) { return nodes.data().find(node => node.id === d.target).x; }) // position based on the target node's x coordinate
      .attr("y2", function(d) { return nodes.data().find(node => node.id === d.target).y; }) // position based on the target node's y coordinate
      .style("stroke", "black");
  });
  