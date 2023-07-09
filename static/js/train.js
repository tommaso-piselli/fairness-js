// Initialize Tensors
// convert initial positions to tensors
let xInit = graph.nodes.map((node) => node.x);
let yInit = graph.nodes.map((node) => node.y);

//console.log("Initial X coordinates: ", xInit);
//console.log("Initial Y coordinates: ", yInit);

// create tf.Variables for SGD
let xs = tf.variable(tf.tensor1d(xInit));
let ys = tf.variable(tf.tensor1d(yInit));

// debug for tf tensors
//xs.print();
//ys.print();

// calculate ideal distances
let idealDistances = [];
for (let i = 0; i < graph.nodes.length; i++) {
  let row = [];
  for (let j = 0; j < graph.nodes.length; j++) {
    let dx = graph.nodes[i].x - graph.nodes[j].x;
    let dy = graph.nodes[i].y - graph.nodes[j].y;
    row.push(Math.sqrt(dx * dx + dy * dy));
  }
  idealDistances.push(row);
}

//console.log("Ideal distances: ", idealDistances);

// Get the stress container element
let stressContainer = d3.select("#stress-container");

// define the loss function
function loss() {
  return tf.tidy(() => {
    // calculate the stress
    let stress = tf
      .sum(
        tf.pow(
          tf
            .sqrt(
              tf
                .pow(tf.sub(xs, tf.transpose(xs)), 2)
                .add(tf.pow(tf.sub(ys, tf.transpose(ys)), 2))
            )
            .sub(idealDistances),
          2
        )
      )
      .div(tf.sum(tf.pow(idealDistances, 2)));

    let sqrtStress = tf.sqrt(stress);

    // Print the value of stress to the stress container
    stress.data().then((stressValue) => {
      stressContainer.text(`Current stress: ${stressValue[0]}`);
    });

    return sqrtStress;
  });
}

// Calculate initial loss
loss()
  .data()
  .then((lossValue) => {
    console.log("Initial loss: ", lossValue[0]);
  });

// Set the maximum number of iterations
let maxIterations = 1000;
let iterationCount = 0;
let learningRate = 0.01;
let optimizer = tf.train.sgd(learningRate);

// Run the training loop
function train() {
  // Perform one step of SGD
  optimizer.minimize(loss);

  let xsArray = xs.arraySync();
  let ysArray = ys.arraySync();

  // Update the positions of the nodes
  d3.selectAll("circle")
    .attr("cx", (d, i) => xScale.invert(xsArray[i]) * svgWidth)
    .attr("cy", (d, i) => yScale.invert(ysArray[i]) * svgHeight);

  // Update the positions of the edges
  d3.selectAll("line")
    .attr("x1", (d) => xScale.invert(xsArray[d.source.index]) * svgWidth)
    .attr("y1", (d) => yScale.invert(ysArray[d.source.index]) * svgHeight)
    .attr("x2", (d) => xScale.invert(xsArray[d.target.index]) * svgWidth)
    .attr("y2", (d) => yScale.invert(ysArray[d.target.index]) * svgHeight);

  // Check if we've reached the maximum number of iterations
  if (++iterationCount < maxIterations) {
    // Request the next frame
    requestAnimationFrame(train);
  }
}

// Start the training automatically
train();
