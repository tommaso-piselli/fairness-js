let store = document.querySelector(":root");

function getColor(color) {
  let root = getComputedStyle(store);
  return root.getPropertyValue(color);
}

function plotGraph(graph) {
  svg.selectAll("*").remove(); // Clear previous selection

  let width = parseFloat(svg.style("width"));
  let height = parseFloat(svg.style("height"));

  //console.log("[w x h] : [" + width + " x " + height + "]");
  let margin = 40;

  // min max of the scale
  let xExtent = d3.extent(graph.nodes, (d) => d.x);
  let yExtent = d3.extent(graph.nodes, (d) => d.y);

  // calculate scales: keep the graph's aspect ratio (?)
  let xRange = xExtent[1] - xExtent[0];
  let yRange = yExtent[1] - yExtent[0];
  let xScale, yScale;
  if (xRange > yRange) {
    let scale = (width - 2 * margin) / xRange;
    xScale = d3
      .scaleLinear()
      .domain(xExtent)
      .range([margin, width - margin]);

    // Adjust the scale to fit - height
    yScale = d3
      .scaleLinear()
      .domain(yExtent)
      .range([
        Math.max(margin, (height - yRange * scale) / 2),
        Math.min(height - margin, (height + yRange * scale) / 2),
      ]);
  } else {
    let scale = (height - 2 * margin) / yRange;
    yScale = d3
      .scaleLinear()
      .domain(yExtent)
      .range([margin, height - margin]);

    // Adjust the scale to fit - width
    xScale = d3
      .scaleLinear()
      .domain(xExtent)
      .range([
        Math.max(margin, (width - xRange * scale) / 2),
        Math.min(width - margin, (width + xRange * scale) / 2),
      ]);
  }
  // Draw edges
  svg
    .selectAll("line")
    .data(graph.edges)
    .enter()
    .append("line")
    .attr("x1", (d) => xScale(graph.nodes[d.source].x))
    .attr("y1", (d) => yScale(graph.nodes[d.source].y))
    .attr("x2", (d) => xScale(graph.nodes[d.target].x))
    .attr("y2", (d) => yScale(graph.nodes[d.target].y))
    /* .style("stroke", "#000"); */
    .style("stroke", getColor("--COLOR-STROKE"));

  // Draw nodes
  svg
    .selectAll("circle")
    .data(graph.nodes)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.x))
    .attr("cy", (d) => yScale(d.y))
    .attr("r", 4)
    .style("fill", (d) => d.color)
    .on("mouseover", function () {
      let data = d3.select(this).data()[0];
      d3.select(this)
        .style("fill", "#03DAC5")
        .attr("r", 6)
        .append("title")
        .text(
          `id: ${data.id}\nx: ${data.x.toFixed(2)}\ny: ${data.y.toFixed(2)}`
        );
    })
    .on("mouseout", function (d) {
      d3.select(this).style("fill", this.__data__.color).attr("r", 4);
      d3.select(this).select("title").remove();
    });
}

function shuffle(array) {
  let m = array.length;
  let t;
  let i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

// Two colors Function
let redCount, blueCount;
function colorNodes(graph, percent) {
  let ratio = percent / 100;
  let nodes = shuffle(graph.nodes.slice());

  redCount = Math.round(ratio * nodes.length);
  nodes.forEach((node, i) => {
    node.color = i < redCount ? "red" : "blue";
  });

  blueCount = nodes.length - redCount;
  plotGraph(graph);
  colorDict(graph);

  updateColorInfo(graph);
  return redCount, blueCount;
}

function colorDict(graphData) {
  for (let i = 0; i < graphData.nodes.length; i++) {
    let node = graphData.nodes[i];
    node.weight = graphData.weight[i];
    node.shortestPath = graphData.shortestPath[i];
    node.euclideanDistance = graphData.euclideanDistance[i];
    node.color = graphData.nodes[i].color;

    if (node.color === "red") {
      redNodes.push(node);
    } else {
      blueNodes.push(node);
    }
  }
}

function updateColorInfo(graph) {
  let colorCounts = {};
  let nodeNumber = graph.nodes.length;
  nodeNumber;

  graph.nodes.forEach((node) => {
    if (colorCounts[node.color] === undefined) {
      colorCounts[node.color] = 1;
    } else {
      colorCounts[node.color]++;
    }
  });

  let colorInfo = d3.select("#color-info");

  colorInfo.selectAll("p").remove();

  let colorCount = Object.keys(colorCounts).length;
  colorInfo
    .append("p")
    .text("N° of different colors: ")
    .append("span")
    .text(colorCount);

  for (let color in colorCounts) {
    let nodePercentage = Math.round((colorCounts[color] / nodeNumber) * 100);
    let p = colorInfo.append("p");
    p.text("");
    p.append("text")
      /* .style("color", color) */
      .text(color)
      .style("font-weight", "bold")
      .style("text-decoration", "underline")
      .style("text-underline-offset", "0.2em")
      .style("text-decoration-color", color)
      .style("text-transform", "capitalize");
    p.append("text").text(" nodes");
    p.append("span")
      .style("font-weight", "bold")
      .text(": " + colorCounts[color] + " (" + nodePercentage + "%)");
  }
}

function plotLoss(svgLoss, maxIter, losses) {
  let margin = { top: 20, right: 20, bottom: 50, left: 70 },
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  let xScale = d3.scaleLinear().domain([0, maxIter]).range([0, width]);
  let yScale = d3
    .scaleLinear()
    .domain([d3.min(losses), d3.max(losses)])
    .range([height, 0]);

  svgLoss = d3
    .select("#svgLoss")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let line = d3
    .line()
    .x((d, i) => xScale(i))
    .y((d) => yScale(d));

  svgLoss
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));

  svgLoss.append("g").call(d3.axisLeft(yScale));

  svgLoss
    .append("path")
    .datum(losses)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2.5) // increased from 1.5 to 2.5
    .attr("d", line);
}
