const cytoscape = require('cytoscape')
const coseBilkent = require('cytoscape-cose-bilkent')
const euler = require('cytoscape-euler')
const fetch = require('isomorphic-fetch')
const $ = require('jquery')

const Core = require('./core.js')
const Queue = require('./entities/Queue.js')

const _core = new Core()

// cytoscape.use(coseBilkent)
cytoscape.use(euler)

const dancersWithAvatar = ['06472', '06776', '04870', '06149', '06274', '06534', '05992', '06887', '06905', '06763', '06289', '06338', '00822', '08046', '04061', '09197', '00000', '05898', '07325']

const getSingleDancerImage = code => {
    return {
        selector: `#${code}`,
        style: {
            'background-image': `http://radio-hustle.com/dancers_old/pics/${code}.jpg`,
        },
    }
}

const getDancersStyles = () => {
    return dancersWithAvatar.map(getSingleDancerImage)
}

const createNode = code => {
    return {
        "data": {
            "id": code
        },
        "group": "nodes",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbed": false,
        "grabbable": true,
        "classes": dancersWithAvatar.indexOf(code) > -1 ? "" : "no-avatar"
    }
}

const createEdge = (codeA, codeB, nomination) => {
    return {
        "data": {
            id: `${codeA}_${codeB}`,
            "target": codeA,
            "source": codeB
        },
        "group": "edges",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbed": false,
        "grabbable": true,
        "classes": nomination
    }
}

const initGraph = ({
    dancersMap
}) => {
    fetch('./assets/data.json')
        .then(r => r.json())
        .then(data => {
            const nodes = []
            const nodesMap = {}

            data.forEach(({
                code,
                partnerCode
            }) => {
                if (!nodesMap[code]) {
                    const node = createNode(code)

                    nodes.push(node)

                    nodesMap[code] = node
                }

                if (!nodesMap[partnerCode]) {
                    const node = createNode(partnerCode)

                    nodes.push(node)

                    nodesMap[partnerCode] = node
                }
            })

            const edges = []
            const edgesMap = {}

            data.forEach(({
                code,
                partnerCode,
                nomination
            }, i) => {
                const codeA = String.min(code, partnerCode)
                const codeB = String.max(code, partnerCode)

                if (!edgesMap[`${codeA}_${codeB}`]) {
                    const edge = createEdge(codeA, codeB, nomination)

                    edges.push(edge)

                    edgesMap[`${codeA}_${codeB}`] = edge
                }
            })

            const graph = cytoscape({
                container: document.getElementById('root'),

                boxSelectionEnabled: false,
                autounselectify: true,
                style: [{
                    selector: 'node',
                    style: {
                        'height': 40,
                        'width': 40,
                        'background-fit': 'cover',
                        'background-color': '#aaaaaa',
                    }
                }, {
                    selector: 'edge',
                    style: {
                        'curve-style': 'haystack',
                        'width': 1,
                        'line-color': '#dddddd',
                        'opacity': 0.75,
                    }
                }, {
                    selector: '.no-avatar',
                    style: {
                        'content': 'data(id)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'font-size': 10,
                    }
                }, {
                    selector: '.dnd',
                    style: {
                        'line-color': 'green',
                    }
                }, {
                    selector: '.classic',
                    style: {
                        'line-color': 'blue',
                    }
                }, ...getDancersStyles()],

                // elements: [...nodes, ...edges],

                elements: []
            })

            const addedNodesMap = {}

            const animatedNodesMap = {}

            const layoutParams = {
                name: 'grid',
                animate: true,
                animationDuration: 50,
                padding: 30,
                animateFilter: (node, i) => {
                    if (!animatedNodesMap[node._private.data.id]) {
                        animatedNodesMap[node._private.data.id] = true

                        return true
                    }

                    return false
                }
            }

            let layout = graph.layout(layoutParams)

            const rerunLayout = async(params) => {
                const defaultParams = {
                    name: 'grid',
                    animate: true,
                    animationDuration: 50,
                    padding: 30,
                    animateFilter: (node, i) => {
                        if (!animatedNodesMap[node._private.data.id]) {
                            animatedNodesMap[node._private.data.id] = true

                            return true
                        }

                        return false
                    }
                }

                const newParams = {
                    ...defaultParams,
                    ...params
                }

                layout.stop()

                layout = graph.layout(newParams)

                layout.run()

                await Core.sleep(layoutParams.animationDuration)
            }

            let k = 0
            const step = 2500

            const add = array => {
                if (k > array.length) {
                    return false
                }

                const forAddArray = array.slice(k, k + step)

                for (const node of forAddArray) {
                    graph.add(node)

                    addedNodesMap[node.data.id] = true
                }

                k += step

                rerunLayout()

                return true
            }

            const addAll = array => {
                if (add(array)) {
                    setTimeout(() => {
                        addAll(array)
                    }, layoutParams.animationDuration + 250)
                } else {
                    console.log('addAll done')
                }
            }

            console.log(nodes.length, edges.length)

            const getNodeByCode = code => nodesMap[code]

            const addTree = async({
                code,
                graph
            }) => {
                const queue = new Queue()
                const _edges = []
                const map = {}

                queue.push({
                    ...getNodeByCode(code),
                    depth: 0
                })

                map[code] = true

                let isRealtimeUpdate = true
                let countAdded = 0

                while (!queue.isEmpty()) {
                    const node = queue.pop()
                    const {
                        depth
                    } = node

                    console.log(depth)

                    graph.add(node)

                    countAdded++

                    if (countAdded > 50) {
                        isRealtimeUpdate = false
                    }

                    if (isRealtimeUpdate) {
                        await rerunLayout({
                            name: 'breadthfirst',
                            circle: true,
                            spacingFactor: 3,
                            roots: `#${code}`,
                            // concentric: node => {
                            // return node.degree()
                            // }
                        })
                    }

                    const _nodes = []

                    Object.keys(edgesMap).forEach(key => {
                        if (!map[key] && key.indexOf(node.data.id) > -1) {
                            _edges.push(edgesMap[key])

                            map[key] = true
                        }
                    })

                    _edges.forEach(edge => {
                        const {
                            data
                        } = edge
                        const {
                            source,
                            target
                        } = data

                        if (!map[source]) {
                            _nodes.push(nodesMap[source])

                            map[source] = true
                        }

                        if (!map[target]) {
                            _nodes.push(nodesMap[target])

                            map[target] = true
                        }
                    })

                    _nodes.forEach(node => {
                        depth < 5 && queue.push({
                            ...node,
                            depth: depth + 1
                        })
                    })

                    console.log('queue.size', queue.size())
                }

                // await rerunLayout({
                // 	name: 'grid'
                // })

                // return true

                console.log('edges', _edges.length)

                graph.add(_edges)

                await rerunLayout({
                    name: 'breadthfirst',
                    circle: true,
                    spacingFactor: 25,
                    roots: `#${code}`,
                    // concentric: node => {
                    // return node.degree()
                    // }
                })

                console.log('addTree done')
            }

            const addTree1 = async(code, map = {}, deep = 0) => {
                if (deep > 1) {
                    return []
                }

                const _edges = []
                const _nodes = []

                map[code] = true

                Object.keys(edgesMap).forEach(key => {
                    if (key.indexOf(code) > -1 && !map[key]) {
                        _edges.push(edgesMap[key])

                        map[key] = true
                    }
                })

                _edges.forEach(edge => {
                    const {
                        data
                    } = edge
                    const {
                        source,
                        target
                    } = data

                    if (!map[source]) {
                        _nodes.push(nodesMap[source])

                        map[source] = true
                    }

                    if (!map[target]) {
                        _nodes.push(nodesMap[target])

                        map[target] = true
                    }
                })

                const rest = []

                _nodes.forEach(node => {
                    const {
                        data
                    } = node
                    const {
                        id
                    } = data

                    rest.push(...addTree(node.data.id, map, deep + 1))
                })

                return [nodesMap[code], ..._edges, ..._nodes, ...rest]
            }

            window.addTree = async() => {
                await addTree({
                    code: '06472',
                    graph,
                })

                rerunLayout()
            }

            $('#add-tree-button').on('click', () => {
                let code = $('#code-input').val()

                while (code.length < 5) {
                    code = `0${code}`
                }

                addTree({
                    code,
                    graph,
                })
            })

            $('#zoom-dancer-button').on('click', () => {
                let code = $('#code-input').val()

                while (code.length < 5) {
                    code = `0${code}`
                }

                graph.center(graph.$(`#${code}`))
                graph.zoom(3)
            })
        })
}

fetch('http://data.radio-hustle.com/db/getDancersAll/')
    .then(r => r.json())
    .then(dancersMap => {
        initGraph({
            dancersMap
        })
    })

// fetch('./assets/data.json')
// 	.then(r => r.json())
// 	.then(data => {

// 	})