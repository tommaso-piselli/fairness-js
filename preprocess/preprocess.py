import json
import networkx as nx
from sklearn.preprocessing import MinMaxScaler
import random

# Loading
G = nx.karate_club_graph()
#G = nx.complete_bipartite_graph(3, 3)
#G = nx.hypercube_graph(3)
#G = nx.balanced_tree(2, 5)

# Compute the layout
pos = nx.spring_layout(G)

# Scale the positions
# SVG is 756 x 457 --> scale from 10 to 440
scaler = MinMaxScaler((10, 440))
pos_array = scaler.fit_transform(list(pos.values()))

# Convert the positions back to a dictionary
scaled_pos = {n: pos_array[i].tolist() for i, n in enumerate(pos.keys())}

# Assign the positions and colors to the nodes in the graph
for node, data in G.nodes(data=True):
    data['x'], data['y'] = scaled_pos[node]
#     data['color'] = 'blue' if random.random() < 0.8 else 'red'  # assign color with 80% chance for blue

# Convert the graph to a dictionary
graph_dict = nx.node_link_data(G)

# Write the graph data to a JSON file
with open('../data/karate.json', 'w') as f:
    json.dump(graph_dict, f)
