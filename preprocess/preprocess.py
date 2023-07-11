import json
import torch
import networkx as nx
from sklearn.preprocessing import MinMaxScaler
import numpy as np


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
    # SVG is 500x500 --> scale from 10 to 490
    scaler = MinMaxScaler((10, 440))
    pos_array = scaler.fit_transform(list(pos.values()))

    scaled_pos = {n: pos_array[i].tolist() for i, n in enumerate(pos.keys())}

    for node, data in G.nodes(data=True):
        data['x'], data['y'] = scaled_pos[node]

    graph_dict = nx.node_link_data(G)

    D, k2i = dict2tensor(dict(nx.all_pairs_shortest_path_length(G)))
    n = len(G.nodes)
    eye = torch.eye(n)
    W = 1/(D**2+eye)

    euclideanDistance = []
    for node1 in G.nodes:
        row = []
        for node2 in G.nodes:
            dist = np.linalg.norm(pos[node1] - pos[node2])
            row.append(dist)
        euclideanDistance.append(row)

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
        'shortestPath': D.numpy().tolist(),
        'euclideanDistance': euclideanDistance,
    }

    # Write the graph data to a JSON file
    with open(f'../data/JSON/{name}.json', 'w') as f:
        json.dump(graph, f)


def txtToJson(name):
    with open(f'../data/txt/{name}.txt', 'r') as file:
        vertices = set()
        edges = []

        for line in file:
            vertices.update(map(int, line.split()))
            edges.append(tuple(map(int, line.split())))

    # Crea una matrice di adiacenza vuota di dimensione len(vertices) x len(vertices)
    adj_matrix = np.zeros((len(vertices), len(vertices)))

    # Popola la matrice di adiacenza
    for edge in edges:
        adj_matrix[edge[0]-1][edge[1]-1] = 1
        adj_matrix[edge[1]-1][edge[0]-1] = 1

    # Crea il grafo utilizzando la matrice di adiacenza
    G = nx.from_numpy_matrix(adj_matrix)

    pos = nx.spring_layout(G)

    # Scale the positions
    # SVG is 500x500 --> scale from 10 to 490
    scaler = MinMaxScaler((10, 440))
    pos_array = scaler.fit_transform(list(pos.values()))

    scaled_pos = {n: pos_array[i].tolist() for i, n in enumerate(pos.keys())}

    for node, data in G.nodes(data=True):
        data['x'], data['y'] = scaled_pos[node]

    D, k2i = dict2tensor(dict(nx.all_pairs_shortest_path_length(G)))
    n = len(G.nodes)
    eye = torch.eye(n)
    W = 1/(D**2+eye)
    euclideanDistance = []
    for node1 in G.nodes:
        row = []
        for node2 in G.nodes:
            dist = np.linalg.norm(pos[node1] - pos[node2])
            row.append(dist)
        euclideanDistance.append(row)

    graph_dict = {
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
        'shortestPath': D.numpy().tolist(),
        'euclideanDistance': euclideanDistance,
    }

    with open(f'../data/JSON/{name}.json', 'w') as f:
        json.dump(graph_dict, f)


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
    ('tree-2-6', nx.balanced_tree(2, 6)),
    ('k-5', nx.complete_graph(5)),
    ('k-20', nx.complete_graph(20)),
    ('bipartite-graph-3-3', nx.complete_bipartite_graph(3, 3)),
    ('bipartite-graph-5-5', nx.complete_bipartite_graph(5, 5)),
    # ('dodecahedron', nx.dodecahedral_graph()),
    # ('cube', nx.hypercube_graph(3)),
]

matrix = [
    'lesmis',
    'football',
    'impcol_d',
]

for name, G in Graphs:
    print(name)
    graphToJson(G, name)

for name in matrix:
    print(name)
    txtToJson(name)
