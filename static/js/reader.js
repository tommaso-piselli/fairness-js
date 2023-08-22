// Var defition
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

let stressInitialValue, fairnessInitialValue;
let stressFinalValue, fairnessFinalValue;
let redNodes = [];
let blueNodes = [];
let dataObj;
let x;

/* percentSlider.on("input", function () {
  percentLabel.text(this.value + "%");
});
percentLabel.text(percentSlider.property("value") + "%"); */

fileInput.on("change", function () {
  let file = this.files[0];

  let reader = new FileReader();

  reader.onload = function (e) {
    try {
      graphData = JSON.parse(e.target.result);

      // Display JSON content
      let jsonStr = JSON.stringify(graphData, null, 2);
      jsonPreview.property("value", jsonStr);

      // Display graph details
      d3.select("#graph-name").text(` ${graphData.name}`);
      d3.select("#vertex-count").text(` ${graphData.nodes.length}`);
      d3.select("#edge-count").text(` ${graphData.edges.length}`);

      // New Coords Vect
      let coords = graphData.nodes.map((node) => [node.x, node.y]);
      x = tf.variable(tf.tensor2d(coords));

      // Init
      let niter = 1000;
      let maxIter = niter;

      let lr = 0.01;
      let momentum = 0.9;
      let optimizer = tf.train.momentum(lr, momentum, false);

      plotGraph(graphData);

      let losses = [];
      let metrics = [];

      // TODO: Aggiornare coefficienti con slider
      let coef = {
        stress: 0.5,
        fairness: 0.5,
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

      // OUTPUT
      let pdist = pairwiseDistance(dataObj.x);
      stressInitialValue = stress(pdist, graphDistance, stressWeight)[1];
      fairnessInitialValue = fairness(graphData, x)[1];

      d3.select("#stress-initial-value")
        .text(` ${stressInitialValue.toFixed(2)}`)
        .style("font-weight", "bold");
      d3.select("#fairness-initial-value")
        .text(` ${fairnessInitialValue.toFixed(3)}`)
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

      // Train
      trainButton.on("click", function () {
        //console.log(dataObj.x.print());
        /*     let result = trainOneIter(dataObj, optimizer, true);
        console.log(dataObj.x.print()); */

        train(dataObj, niter, optimizer, (record) => {
          metrics.push(record.metrics);
          losses.push(record.loss);
          /* if (losses.length > maxPlotIter) {
            losses = losses.slice(losses.length - maxPlotIter);
          } */
          /*  if (metrics.length > maxMetricSize) {
            metrics = metrics.slice(metrics.length - maxMetricSize);
          } */
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
            }
          }
          niter -= 1;
          console.log("N°iter:" + niter);
          if (niter % 2 == 0) {
            let x_arr = postprocess(x.arraySync(), graph);
            updateNodePosition(dataObj.graph, x_arr);
            plotGraph(dataObj.graph);

            // OUTPUT
            pdist = pairwiseDistance(dataObj.x);
            stressFinalValue = stress(pdist, graphDistance, stressWeight)[1];
            fairnessFinalValue = fairness(graphData, x)[1];

            //console.log("Loss: " + record.loss);

            d3.select("#stress-final-value")
              .text(` ${stressFinalValue.toFixed(2)}`)
              .style("font-weight", "bold");
            d3.select("#fairness-final-value")
              .text(` ${fairnessFinalValue.toFixed(3)}`)
              .style("font-weight", "bold");
            d3.select("#loss-value")
              .text(` ${record.loss.toFixed(2)}`)
              .style("font-weight", "bold");
          }
        });

        // Plot Loss
        plotLoss(svgLoss, maxIter, losses);
      });
    } catch (error) {
      console.error("Errore durante la lettura del file", error);
    }
  };

  reader.onerror = function () {
    console.error("Errore durante il caricamento del file", reader.error);
  };

  reader.readAsText(file);
});

colorButton.on("click", function () {
  let percent = d3.select("#percentSlider").property("value");
  colorNodes(graphData, percent);
  fairnessInitialValue = fairness(graphData, x)[1];
  d3.select("#fairness-initial-value")
    .text(` ${fairnessInitialValue.toFixed(3)}`)
    .style("font-weight", "bold");
});

centerButton.on("click", function () {
  plotGraph(graphData);
});
