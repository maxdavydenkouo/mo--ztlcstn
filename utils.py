from bs4 import BeautifulSoup
import json
import requests
 

# ===============================================================================
def get_nodes_from_soup(soup_nodes):
    nodes = []
    for node in soup_nodes:
        n_type = ""
        n_access = ""
        n_description = ""
        for param in node.find_all('attvalue'):
            if param.attrs['id'] == '0':
                n_type = param.attrs['value']
            elif param.attrs['id'] == '2':
                n_access = param.attrs['value']
            elif param.attrs['id'] == '3':
                n_description = param.attrs['value'].replace('&lt;', '<').replace('&gt;', '>')

        nodes.append({
            "id": int(node.attrs['id']),
            "name": f"{node.attrs['label'].replace('&lt;', '<').replace('&gt;', '>')} ({n_type}) [{n_access}]",
            "type": 1,
            "weight": float(node.find('viz:size').attrs['value']),
            "coord_x": 5 * float(node.find('viz:position').attrs['x']),
            "coord_y": 7 * float(node.find('viz:position').attrs['y']),
            "coord_z": float(node.find('viz:position').attrs['z']),
            "description": f"{n_description}"
        })
    return nodes


def get_links_from_soup(soup_links):
    links = []
    for link in soup_links:
        links.append({
            "id": int(link.attrs['id']),
            "type": 1,
            "weight": 1,
            "source_id": int(link.attrs['source']),
            "target_id": int(link.attrs['target']),
            "description": ""
        })
    return links


# ===============================================================================
def get_soup_graph_from_gexf(path):
    with open('path', 'r') as graph:
        soup = BeautifulSoup(graph.read(), 'xml')

        soup_nodes = soup.find_all('nodes')[0].find_all('node')
        soup_links = soup.find_all('edges')[0].find_all('edge')

        return soup_nodes, soup_links


def update_graph(soup_nodes, soup_links):
    nodes = get_nodes_from_soup(soup_nodes)
    links = get_links_from_soup(soup_links)

    r = requests.post("http://140.238.222.53/services/ztlcstn/api/nodes", json = {'nodes': nodes})
    r = requests.post("http://140.238.222.53/services/ztlcstn/api/links", json = {'links': links})