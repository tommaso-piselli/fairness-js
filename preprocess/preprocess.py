import json
import torch
import networkx as nx
from sklearn.preprocessing import MinMaxScaler
import random
import pandas as pd


def dict2tensor(d, fill=None):
    n = len(d.keys())
    k2i = {k: i for i, k in enumerate(d.keys())}
    res = torch.zeros(len(d.keys()), len(d.keys()), device='cpu')
    for src_node, dst_nodes in d.items():
        for dst_node, distance in dst_nodes.items():
            if fill is not None:
                res[k2i[src_node], k2i[dst_node]] = fill
            else:
                res[k2i[src_node], k2i[dst_node]] = distance
    return res, k2i


def graphToJson(G, name):
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

    D, k2i = dict2tensor(dict(nx.all_pairs_shortest_path_length(G)))
    n = len(G.nodes)
    eye = torch.eye(n)
    W = 1/(D**2+eye)

    graph = {
        'name': name,
        'nodes': [
            {
                'index': node,
                'id': str(node),
                'x': data['x'],
                'y': data['y']
            }
            for node, data in G.nodes(data=True)
        ],
        'edges': [
            {
                'source': str(e1),
                'target': str(e2)
            }
            for e1, e2 in G.edges
        ],
        'weight': W.numpy().tolist(),
        'graphDistance': D.numpy().tolist(),
    }

    # Write the graph data to a JSON file
    with open(f'../data/{name}.json', 'w') as f:
        json.dump(graph, f)


# Graphs
Graphs = [
    ('karate', nx.karate_club_graph()),
    ('path-5', nx.path_graph(5)),
    ('path-10', nx.path_graph(10)),
    ('cycle-10', nx.cycle_graph(10)),
    # ('grid-5-5', nx.grid_graph(dim=[5, 5])),
    # ('grid-10-6', nx.grid_graph(dim=[10, 6])),
    ('tree-2-3', nx.balanced_tree(2, 3)),
    ('tree-2-4', nx.balanced_tree(2, 4)),
    ('tree-2-5', nx.balanced_tree(2, 5)),
    ('k-5', nx.complete_graph(5)),
    ('k-20', nx.complete_graph(20)),
    ('bipartite-graph-3-3', nx.complete_bipartite_graph(3, 3)),
    ('bipartite-graph-5-5', nx.complete_bipartite_graph(5, 5)),
    # ('dodecahedron', nx.dodecahedral_graph()),
    # ('cube', nx.hypercube_graph(3)),
]

for name, G in Graphs:
    print(name)
    graphToJson(G, name)
