# Description
- zettelkasten concept implementation (POC)


# principles
- graph first - text second - visualizatoin and navigation through the map
- nodes-linkes architecture - there are only nodes and links, between them
- laconic data - store only valuable and informative information
- middle field - [inner world]..............[xxxxx]..............[outer_world]


# alternatives
- obsidian with juggle add-on, but: "Warning: Juggl is not optimized for large graphs. We advise not to use the global graph if your vault
contains more than 250 notes to prevent Obsidian from freezing." from juggl github [https://github.com/HEmile/juggl/blob/main/src/ui/settings/GlobalGraphModal.svelte]
- vscode foam extention, but network manipulation functionality quite better, than in raw obsidian graph


# plan (POC)
- [x] init
- [x] back: basic structure
- [x] front: basic structure
- [x] front_d3: vue + d3 intargation with simple chart sample
- [x] front_d3: graph network implementation
- [x] front_d3: basic graph interface capabilities
    - [x] force(gravity) / collision 
    - [x] nodes drag
    - [x] canvas zoom and pane
    - [x] static coordinates
- [x] front_d3: vue reactivity (via vue data)
- [x] front_d3: crud - interface (forms)
    - [x] popup forms
        - [x] node
        - [x] link
    - [x] canvas (onclick select)
        - [x] node
        - [x] link
- [x] front_d3: crud - functionality (via form)
    - [x] delete/hide functionality (via is_active)
        - [x] node
        - [x] link
    - [x] update (via buttom only - no reactivity)
        - [x] node
        - [x] link
    - [x] create
        - [x] node
        - [x] link
- [x] front_d3: crud - global save
- [x] back: crud - multiple merge
- [ ] front: refactor
- [ ] back: testing
- [ ] back: logging
- [ ] front: wishes
    - [x] graph size limits test (10.000 nodes + 15.000 links - done (tangible but handable performance degradation))
    - [ ] nodes size via value
    - [ ] colors via types (nodes + links)
    - [ ] beautify
    - [ ] select group of nodes / links
    - [ ] nodes collapse by hierarchy
    - [ ] highlight linked nodes of selected node
    - [ ] editable popup form with node/link details
        - ref: [https://stackoverflow.com/questions/5972705]
    - [ ] minimap (additional canvas or svg for navigation) - here's what vue used for
    - [ ] back: history functionality


# ideas
- [task] concept realization
- [timeline] concept realization
- [timeframe] можно реализоваться временнУю привязку данных к нодам, сформированным во временной ряд


# notes


# references
- d3 graph network guide: [https://www.youtube.com/watch?v=y7DxbW9nwmo]
- d3-force interactive palette [https://gist.github.com/steveharoz/8c3e2524079a8c440df60c1ab72b5d03]


# core technologies
- FastAPI
- Vue3
- D3.js