function preprocess(graph, initPos) {
  graph.scalingFactor = 1.0;
  graph.snapToInt = false;
  console.log(`[w,h] = [${graph.width},${graph.height}]`);
  if (!graph.hasOwnProperty("width")) {
    graph.width = 1e6;
  }
  if (!graph.hasOwnProperty("height")) {
    graph.height = 1e6;
  }
  graph.center = [graph.width / 2 || 0, graph.height / 2 || 0];

  graph.nodes.forEach((d, i) => {
    if (!d.hasOwnProperty("index")) {
      d.index = i;
    }
  });

  if (initPos !== undefined) {
    graph.nodes.forEach((d, i) => {
      d.x = initPos[d.index][0];
      d.y = initPos[d.index][1];
    });
  }
}

function postprocess(x, graph) {
  graph.scalingFactor = 1;
  graph.snapToInt = false;

  graph.xmin = d3.min(x, (d) => d[0]);
  graph.ymin = d3.min(x, (d) => d[1]);

  let y = x.map((d) => {
    d = d.slice();
    d[0] = (d[0] - graph.xmin) * graph.scalingFactor;
    d[1] = (d[1] - graph.ymin) * graph.scalingFactor;
    if (graph.snapToInt) {
      d[0] = Math.round(d[0]);
      d[1] = Math.round(d[1]);
    }
    return d;
  });
  return y;
}

function pairwiseDistance(x) {
  return tf.tidy(() => {
    let xNormSquared = x.norm("euclidean", 1, true).pow(2);
    let pairwiseDotProduct = x.matMul(x.transpose());
    let pdistSquared = pairwiseDotProduct
      .mul(-2)
      .add(xNormSquared)
      .add(xNormSquared.transpose());

    //console.log("pdistSquared before sqrt:", pdistSquared.arraySync());
    let epsilon = 1e-16;
    let pdist = pdistSquared.clipByValue(epsilon, Infinity).sqrt();

    //console.log("pdistSquared after sqrt:", pdist.arraySync());

    return pdist;
  });
}

function stress(pdist, graph_distance, graph_weight) {
  return tf.tidy(() => {
    let n = pdist.shape[0];
    let mask = tf.scalar(1.0).sub(tf.eye(n));
    let graphDistance = tf.tensor(graph_distance);
    let weight = tf.tensor(graph_weight);

    let numerator = graphDistance.mul(pdist).mul(weight).mul(mask).sum();
    let denominator = graphDistance.square().mul(weight).mul(mask).sum();
    let optimalScaling = numerator.div(denominator);

    let stress = pdist.sub(graphDistance).square().mul(weight).sum().div(2);
    let loss = stress.div(2);

    // METRIC
    let pdist_normalized = pdist.div(optimalScaling);
    let metric = pdist_normalized
      .sub(graphDistance)
      .square()
      .mul(weight)
      .sum()
      .div(2);
    metric = metric.dataSync()[0];

    return [loss, metric, pdist_normalized.arraySync()];
  });
}

function stressNode(graphData, node) {
  return tf.tidy(() => {
    let graphDistance_node = tf.tensor(graphData.shortestPath[node]);
    let pdist_node = tf.tensor(graphData.euclideanDistance[node]);
    let weight_node = tf.tensor(graphData.weight[node]);

    let stress_node = pdist_node
      .sub(graphDistance_node)
      .square()
      .mul(weight_node)
      .sum()
      .div(2);

    return stress_node;
  });
}

// Normalized
function stressNodeNormalized(graphData, node, pdistNode) {
  return tf.tidy(() => {
    let graphDistance_node = tf.tensor(graphData.shortestPath[node]);
    let pdist_node = tf.tensor(pdistNode);
    let weight_node = tf.tensor(graphData.weight[node]);
    let n = pdist_node.shape[0];
    let mask = tf.scalar(1.0).sub(tf.eye(n));

    let numerator = graphDistance_node
      .mul(pdist_node)
      .mul(weight_node)
      .mul(mask)
      .sum();
    let denominator = graphDistance_node
      .square()
      .mul(weight_node)
      .mul(mask)
      .sum();
    let optimalScaling = numerator.div(denominator);

    let pdist_node_normalized = pdist_node.div(optimalScaling);

    let stress_node_normalized = pdist_node_normalized
      .sub(graphDistance_node)
      .square()
      .mul(weight_node)
      .sum()
      .div(2);

    return stress_node_normalized;
  });
}

function fairness(graphData, x) {
  return tf.tidy(() => {
    let nodes = graphData.nodes;
    let nodeStress;
    let redStress = 0;
    let blueStress = 0;
    let redCount = 0;
    let blueCount = 0;

    let pdist = pairwiseDistance(x);

    for (let index in nodes) {
      let pdistNode = pdist.arraySync()[index];
      nodeStress = stressNodeNormalized(graphData, index, pdistNode);
      if (nodes[index].color === "red") {
        redStress += nodeStress.dataSync()[0];
        redCount++;
      } else {
        blueStress += nodeStress.dataSync()[0];
        blueCount++;
      }
    }

    let fairness = redStress / redCount - blueStress / blueCount;
    fairness = tf.scalar(fairness);
    let fairnessSquared = fairness.square();

    let loss = fairnessSquared.div(2);
    let metric = fairnessSquared;
    metric = metric.dataSync()[0];

    return [loss, metric];
  });
}

function center_loss(x, center) {
  return tf.tidy(() => {
    center = tf.tensor(center);
    return x.mean(0).sub(center).div(center).pow(2).sum();
  });
}

function trainOneIter(dataObj, optimizer, computeMetric = true) {
  let x = dataObj.x;
  // let x_array = x.arraySync();
  let graphDistance = dataObj.graphDistance;
  let stressWeight = dataObj.stressWeight;
  let graph = dataObj.graph;
  if (!graph.hasOwnProperty("width")) {
    graph.width = 1e6;
  }
  if (!graph.hasOwnProperty("height")) {
    graph.height = 1e6;
  }
  let center = [graph.width / 2 || 0, graph.height / 2 || 0];
  //console.log("Center: " + center);
  let coef = dataObj.coef;
  let metrics = {};
  let loss = optimizer.minimize(
    () => {
      let pdist = pairwiseDistance(x);
      let loss = tf.tidy(() => {
        let vmin = [0, 0];
        let vmax = [dataObj.graph.width, dataObj.graph.height];
        let l = center_loss(x, center);
        //console.log("Graph Center: " + l);

        if (coef.stress > 0) {
          let [st, m_st, pdist_normalized] = stress(
            pdist,
            graphDistance,
            stressWeight
          );
          metrics.stress = m_st;
          //console.log("(1.a)m_st: " + m_st);
          metrics.pdist = pdist_normalized;
          l = l.add(st.mul(coef.stress));
          //console.log("(1)l: " + l);
        } else if (computeMetric) {
          let [st, m_st, pdist_normalized] = stress(
            graphDistance,
            stressWeight,
            x
          );
          metrics.stress = m_st;
          //console.log("(1.b)m_st: " + m_st);
          metrics.pdist = pdist_normalized;
        }

        if (coef.fairness > 0) {
          let [fair, m_fair] = fairness(graph, x);
          metrics.fairness = m_fair;
          l = l.add(fair.mul(coef.fairness));
          //console.log("(2)l: " + l);
        }
        return l;
      });
      return loss;
    },
    true,
    [x]
  );
  return { loss, metrics };
}

function train(dataObj, remainingIter, optimizer, callback) {
  if (remainingIter <= 0) {
    console.log(
      "Max iteration reached, please double click the play button to restart"
    );
  } else {
    let computeMetric = true; //remainingIter % 50 == 0;
    let { loss, metrics } = trainOneIter(dataObj, optimizer, computeMetric);
    if (callback) {
      callback({
        remainingIter,
        loss: loss.dataSync()[0],
        metrics,
      });
    }
    train(dataObj, remainingIter - 1, optimizer, callback);
  }
}

function updateNodePosition(graph, x_arr) {
  graph.nodes.forEach((node, i) => {
    node.x = x_arr[i][0];
    node.y = x_arr[i][1];
    //console.log("Update");
  });
}
