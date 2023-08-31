// !Var defition
let fileInput = d3.select("#fileInput");
let jsonPreview = d3.select("#graphJson");
let svg = d3.select("#graph");
let graphData;
let colorButton = d3.select("#colorButton");
let percentSlider = d3.select("#percentSlider");
let percentLabel = d3.select("#percentLabel");
let centerButton = d3.select("#centerButton");
let trainButton = d3.select("#trainButton");
let svgLoss;
let lossButton = d3.select("#lossButton");

let stressInitialValue, fairnessInitialValue;
let stressFinalValue, fairnessFinalValue;
let redNodes = [];
let blueNodes = [];
let dataObj;
let x;

// !SLIDER VALUE
percentSlider.on("input", function () {
  percentLabel.text(this.value + "%");
});
percentLabel.text(percentSlider.property("value") + "%");

fileInput.on("change", function () {
  let file = this.files[0];

  let reader = new FileReader();

  reader.onload = function (e) {
    try {
      graphData = JSON.parse(e.target.result);

      // !Display JSON
      let jsonStr = JSON.stringify(graphData, null, 2);
      jsonPreview.property("value", jsonStr);

      d3.select("#graph-name").text(` ${graphData.name}`);
      d3.select("#vertex-count").text(` ${graphData.nodes.length}`);
      d3.select("#edge-count").text(` ${graphData.edges.length}`);

      let coords = graphData.nodes.map((node) => [node.x, node.y]);
      x = tf.variable(tf.tensor2d(coords));

      // !COEFFICIENTS
      let niter = 1000;
      let maxIter = niter;

      let lr = 0.01;
      let momentum = 0.5;
      let optimizer = tf.train.momentum(lr, momentum, false);

      plotGraph(graphData);

      let losses = [];
      let metrics = [];

      let coef = {
        stress: 0.9,
        fairness: 0.1,
      };

      let graphDistance = graphData.shortestPath;
      let stressWeight = graphData.weight;
      let graph = graphData;

      dataObj = {
        x,
        graphDistance,
        stressWeight,
        graph,
        coef,
      };

      // !INITIAL VALUES
      let pdist = pairwiseDistance(dataObj.x);
      stressInitialValue = stress(pdist, graphDistance, stressWeight)[1];
      fairnessInitialValue = fairness(graphData, x)[1];

      d3.select("#stress-initial-value")
        .text(` ${stressInitialValue.toFixed(2)}`)
        .style("font-weight", "bold");
      d3.select("#fairness-initial-value")
        .text(` ${fairnessInitialValue.toFixed(4)}`)
        .style("font-weight", "bold");
      d3.select("#stress-coeff-value")
        .text(` ${coef.stress}`)
        .style("font-weight", "bold");
      d3.select("#fair-coeff-value")
        .text(` ${coef.fairness}`)
        .style("font-weight", "bold");
      d3.select("#learning-rate-value")
        .text(` ${lr}`)
        .style("font-weight", "bold");
      d3.select("#momentum-value")
        .text(` ${momentum}`)
        .style("font-weight", "bold");

      // !Train
      trainButton.on("click", function () {
        train(dataObj, niter, optimizer, (record) => {
          metrics.push(record.metrics);
          losses.push(record.loss);

          if (losses.length >= 10) {
            let n = losses.length;
            let firstSlice = losses.slice(
              Math.floor(n / 2),
              Math.floor((n / 4) * 3)
            );
            let secondSlice = losses.slice(Math.floor((n / 4) * 3), n);
            let avgLoss0 = math.mean(firstSlice);
            let avgLoss1 = math.mean(secondSlice);
            if (avgLoss1 > avgLoss0) {
              lr = Math.max(lr * 0.999, 0.001);
              console.log(lr);
            }
          }
          niter -= 1;
          d3.select("#currentIteration").text(`${maxIter - niter}`);
          d3.select("#maxIteration").text(`${maxIter}`);
          if (niter % 2 == 0) {
            let x_arr = postprocess(x.arraySync(), graph);
            updateNodePosition(dataObj.graph, x_arr);
            plotGraph(dataObj.graph);

            // !OUTPUT
            pdist = pairwiseDistance(dataObj.x);
            stressFinalValue = stress(pdist, graphDistance, stressWeight)[1];
            fairnessFinalValue = fairness(graphData, x)[1];

            d3.select("#stress-final-value")
              .text(` ${stressFinalValue.toFixed(2)}`)
              .style("font-weight", "bold");
            d3.select("#fairness-final-value")
              .text(` ${fairnessFinalValue.toFixed(4)}`)
              .style("font-weight", "bold");
            d3.select("#loss-value")
              .text(` ${record.loss.toFixed(2)}`)
              .style("font-weight", "bold");
          }
          if (niter == 0) {
            plotLoss(svgLoss, maxIter, losses);
            alert("TRAIN ENDED");
          }
        });
      });
    } catch (error) {
      console.error("ERROR - Reading", error);
    }
  };

  reader.onerror = function () {
    console.error("ERROR - Loading", reader.error);
  };

  reader.readAsText(file);
});

// !COLOR
colorButton.on("click", function () {
  let percent = d3.select("#percentSlider").property("value");
  colorNodes(graphData, percent);
  fairnessInitialValue = fairness(graphData, x)[1];
  d3.select("#fairness-initial-value")
    .text(` ${fairnessInitialValue.toFixed(4)}`)
    .style("font-weight", "bold");
});

// !CENTER
centerButton.on("click", function () {
  plotGraph(graphData);
});

// !RESIZE
window.onresize = function () {
  plotGraph(graphData);
};
