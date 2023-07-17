function pairwiseDistance(x) {
  return tf.tidy(() => {
    let xNormSquared = x.pow(2).sum(1).reshape([-1, 1]);
    let pairwiseDotProduct = x.matMul(x.transpose());
    let pdistSquared = pairwiseDotProduct
      .mul(-2)
      .add(xNormSquared)
      .add(xNormSquared.transpose());
    let pdistSquaredClipped = pdistSquared.clipByValue(0, Infinity).sqrt();
    return pdistSquaredClipped;
  });
}

function stress(graph, x) {
  return tf.tidy(() => {
    let graphDistance = tf.tensor(graph.shortestPath);
    let pdist = pairwiseDistance(x);
    //console.log(pdist.print());
    let n = pdist.shape[0];
    let mask = tf.scalar(1.0).sub(tf.eye(n));
    let weight = tf.tensor(graph.weight);

    let numerator = graphDistance.mul(pdist).mul(weight).mul(mask).sum();
    let denominator = graphDistance.square().mul(weight).mul(mask).sum();
    let optimalScaling = numerator.div(denominator);

    let stress = pdist.sub(graphDistance).square().mul(weight).sum();
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

    //return [loss, stress.dataSync()[0], pdist];
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
    let metric = fairness;
    metric = metric.dataSync()[0];

    return [loss, metric];
  });
}
