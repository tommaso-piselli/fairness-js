import json
import networkx as nx
from sklearn.preprocessing import MinMaxScaler
import random

# Load the Karate Club graph
#G = nx.karate_club_graph()
G = nx.complete_bipartite_graph(5, 5)
#G = nx.hypercube_graph(3)

# Compute the layout
pos = nx.spring_layout(G)

# Scale the positions to range between 10 and 490 (to fit a 500x500 SVG element with a little margin)
scaler = MinMaxScaler((10, 490))
pos_array = scaler.fit_transform(list(pos.values()))

# Convert the positions back to a dictionary
scaled_pos = {n: pos_array[i].tolist() for i, n in enumerate(pos.keys())}

# Assign the positions and colors to the nodes in the graph
for node, data in G.nodes(data=True):
    data['x'], data['y'] = scaled_pos[node]
    data['color'] = 'blue' if random.random() < 0.7 else 'red'  # assign color with 80% chance for blue

# Convert the graph to a dictionary
graph_dict = nx.node_link_data(G)

# Write the graph data to a JSON file
with open('data/graph.json', 'w') as f:
    json.dump(graph_dict, f)
