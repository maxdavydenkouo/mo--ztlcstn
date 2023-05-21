# Description
- zettelkasten concept implementation


# principles
- graph first - text second - visualizatoin and navigation through the map
- nodes-linkes architecture - there are only nodes and links, between them
- laconic data - store only valuable and informative information
- middle field - [[inner world]]..............[xxxxx]..............[[outer_world]]


# alternatives
- obsidian with juggle add-on, but: "Warning: Juggl is not optimized for large graphs. We advise not to use the global graph if your vault
contains more than 250 notes to prevent Obsidian from freezing." from juggl github [https://github.com/HEmile/juggl/blob/main/src/ui/settings/GlobalGraphModal.svelte]
- vscode foam extention, but network manipulation functionality quite better, than in raw obsidian graph


# plan (MVP)
- [x] init
- [x] back: basic structure
- [x] front: basic structure
- [x] front_d3: vue + d3 intargation with simple chart sample
- [ ] front_d3: graph network implementation
- [ ] front_d3: basic graph interface interactions
    - [x] force(gravity) / collision 
    - [x] nodes drag
    - [ ] nodes highlight
    - [ ] nodes size via value
    - [ ] colors via types (nodes + links)
    - [ ] map scale
- [ ] front_d3: set graph network reactive via vue
- [ ] front_d3: basic crud functionality via vue form + server requests
    - [ ] create
        - [ ] nodes
        - [ ] links
    - [ ] delete
        - [ ] nodes
        - [ ] links
    - [ ] update
        - [ ] nodes
        - [ ] links
- [ ] back: add testing
- [ ] back: add logging
- [ ] back: nodes and links crud functionality
    - [ ] add
    - [ ] delete
    - [ ] update
- [ ] front: basic interface functoinality
    - [ ] canvas scaling
    - [ ] node description popup
    - [ ] node description edit
    - [ ] change coordinates
- [ ] front: wishes
    - [ ] nodes collapse by hierarchy
    - [ ] nodes highlighting
    - [ ] editable popup form with node/link details
        - ref: [https://stackoverflow.com/questions/5972705]
    - [ ] minimap (additional canvas or svg for navigation) - here's what vue used for


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