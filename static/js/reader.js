// Var defition
let fileInput = d3.select("#fileInput");
let jsonPreview = d3.select("#graphJson");
let svg = d3.select("#graph");
let graphData;
let colorButton = d3.select("#colorButton");
let percentSlider = d3.select("#percentSlider");
let percentLabel = d3.select("#percentLabel");
let plotButton = d3.select("#press-plot");
let stressInitialValue, fairnessInitialValue;
let redNodes = [];
let blueNodes = [];

let x;

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

      // Display JSON content
      let jsonStr = JSON.stringify(graphData, null, 2);
      jsonPreview.property("value", jsonStr);

      // Display graph details
      d3.select("#graph-name").text(` ${graphData.name}`);
      d3.select("#vertex-count").text(` ${graphData.nodes.length}`);
      d3.select("#edge-count").text(` ${graphData.edges.length}`);

      // New Coords Vect
      let coords = graphData.nodes.map((node) => [node.x, node.y]);
      x = tf.tensor2d(coords);

      // Plot graph (see below)
      plotGraph(graphData);

      // OUTPUT
      stressInitialValue = stress(graphData, x)[1];
      fairnessInitialValue = fairness(graphData, x)[1];

      d3.select("#stress-initial-value")
        .text(` ${stressInitialValue.toFixed(2)}`)
        .style("font-weight", "bold");
      d3.select("#fairness-initial-value")
        .text(` ${fairnessInitialValue.toFixed(2)}`)
        .style("font-weight", "bold");
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
    .text(` ${fairnessInitialValue.toFixed(2)}`)
    .style("font-weight", "bold");
});

plotButton.on("click", function () {
  plotGraph(graphData);
});
