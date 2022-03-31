// function drawGameGraph(gameID) {
//     /*
//     * 画一场比赛的网络
//     * */
//     $.ajax({
//         url: '/getGameGraph/',
//
//         method: 'GET',
//         timeout: 10000,  // 设置 延时函数
//         data: {
//             gameID: '0021500142',  // 比赛ID
//             disThreshold: 1.0,
//             kThreshold: 1,
//         },
//         beforeSend: function () {
//             console.log('加载数据');
//             $('#loading-data-div').show();
//         },
//         success: function (result, error) {
//             // todo: 在这里执行关掉等待页面响应的操作
//             console.log('接收到整个比赛的图数据');
//             console.log('异常信息', error);
//             console.log(result);
//             let graphData = result.data;
//             console.log('nodes', graphData.nodes);
//             console.log(graphData.nodes[0]);
//             console.log('links', graphData.links);
//             console.log(graphData.links[0]);
//
//             // 直接使用网络来展示数据
//             // drawForce(graphData);
//
//             let width = 900,
//                 height = 600;
//             let svg = d3.select('body').append('svg')
//                 .attr('width', width)
//                 .attr('height', height)
//                 .style('background', '#ccc')
//
//
//             let step = 20;
//             let nodeIDList = {};
//             graphData.nodes.forEach(function (d, i) {
//                 nodeIDList[d.id] = i;
//             });
//             console.log(nodeIDList);
//
//
//             let colorDict = {
//                 'ball': '#734d35',
//                 'home': '#46c38c',
//                 'visitor': '#d34b17',
//             }
//
//             // 添加横向的节点
//             svg.selectAll('r-circle')
//                 .data(graphData.nodes)
//                 .enter()
//                 .append('circle')
//                 .attr('cx', function (d, i) {
//                     return step * (nodeIDList[d.id] + 2)
//                 })
//                 .attr('cy', function (d, i) {
//                     return step
//                 })
//                 .attr('r', 5)
//                 .attr('fill', function (d) {
//                     return colorDict[d.teamInfo];
//                 });
//
//             // 添加纵向的节点
//             svg.selectAll('v-circle')
//                 .data(graphData.nodes)
//                 .enter()
//                 .append('circle')
//                 .attr('cx', function (d, i) {
//                     return step
//                 })
//                 .attr('cy', function (d, i) {
//                     return step * (nodeIDList[d.id] + 2)
//                 })
//                 .attr('r', 5)
//                 .attr('fill', function (d) {
//                     return colorDict[d.teamInfo];
//                 });
//
//
//             // 画矩阵的线条
//             for (let i = 0; i <= graphData.nodes.length; i++) {
//                 console.log(i);
//                 let j = i + 1;
//                 // 横向线条
//                 svg.append('line')
//                     .style('stroke', '#7891cc')
//                     .style('stroke-width', 0.5)
//                     .style('pointer-events', 'none')
//                     .attr('x1', step + step / 2)
//                     .attr('y1', step * j + step / 2)
//                     .attr('x2', step * (graphData.nodes.length + 1) + step / 2)
//                     .attr('y2', step * j + step / 2);
//                 // 纵向线条
//                 svg.append('line')
//                     .style('stroke', '#7891cc')
//                     .style('stroke-width', 0.5)
//                     .style('pointer-events', 'none')
//                     .attr('x1', step * j + step / 2)
//                     .attr('y1', step + step / 2)
//                     .attr('x2', step * j + step / 2)
//                     .attr('y2', step * (graphData.nodes.length + 1) + step / 2)
//             }
//
//
//
//             // 画上连接
//             svg.selectAll('matrixElement')
//                 .data(graphData.links)
//                 .enter()
//                 .append('circle')
//                 .attr('cx', function (d) {
//                     let source = d.source;
//                     let target = d.target;
//                     let x = step * (nodeIDList[source] + 1) + step;
//                     let y = step * (nodeIDList[target] + 1) + step;
//                     if (x >= y){
//                         return y;
//                     }else {
//                         return x
//                     }
//                 })
//                 .attr('cy', function (d) {
//                     let source = d.source;
//                     let target = d.target;
//                     let x = step * (nodeIDList[source] + 1) + step;
//                     let y = step * (nodeIDList[target] + 1) + step;
//                     if (x >= y){
//                         return x;
//                     }else {
//                         return y
//                     }
//                 })
//                 .attr('r', 5)
//                 .attr('fill', 'black');
//
//             // 画上连接
//             // svg.selectAll('matrixElement')
//             //     .data(graphData.links)
//             //     .enter()
//             //     .append('circle')
//             //     .attr('cx', function (d) {
//             //         let target = d.target;
//             //         return step * (nodeIDList[target] + 1) + step;
//             //     })
//             //     .attr('cy', function (d) {
//             //         let source = d.source;
//             //         return step * (nodeIDList[source] + 1) + step;
//             //     })
//             //     .attr('r', 5)
//             //     .attr('fill', 'black');
//
//             // svg.selectAll('r-line')
//             //     .data(graphData.nodes)
//             //     .enter()
//             //     .append('line')
//             //     .attr('x1', function (d, i) {
//             //         return step + step / 2
//             //     })
//             //     .attr('y1', function (d, i) {
//             //         return step * (nodeIDList[d.id] + 2) + step / 2
//             //     })
//             //     .attr('x2', step * graphData.nodes.length + step)
//             //     .attr('y2', function (d) {
//             //         return step * (nodeIDList[d.id] + 2) + step / 2
//             //     })
//             //     .style('stroke', 'black')
//             //     .style('stroke-width', 1)
//
//
//             // svg.selectAll('circle')
//             //     .data(graphData.links)
//             //     .enter()
//             //     .append('circle')
//             //     .attr('cx', function (d) {
//             //         let source = d.source;
//             //         return step * nodeIDList[source] + 20;
//             //     })
//             //     .attr('cy', function (d) {
//             //         let target = d.target ;
//             //         return step * nodeIDList[target] + 20;
//             //     })
//             //     .attr('r', 5)
//             //     .attr('fill', 'black')
//
//
//         },
//         complete: function () {
//             console.log('绘制完毕');
//             $('#loading-data-div').hide();
//         }
//     })
// };

/**
 * 画力导向图
 * @param graphData
 * @param width
 * @param height
 */
// function drawForce(graphData, width, height) {
//     width = width || 900;
//     height = height || 600;
//     let svg = d3.select('#container')
//         .append('svg')
//         .attr('width', width)
//         .attr('height', height);
//     let gameGraphG = svg.append('g');
//     // 构建力
//     // const forceNodes = d3.forceManyBody();
//     // const forceLink = d3.forceLink(links).id(({index: i}) => N[i]);
//     // console.log(1);
//     //set up the simulation
//     let simulation = d3.forceSimulation()
//     // add nodes
//         .nodes(graphData.nodes);
//     let linkForce = d3.forceLink(graphData.links)
//         .id(function (d) {
//             return d.id;
//         });
//     let chargeForce = d3.forceManyBody()
//         .strength(-800);
//     let centerForce = d3.forceCenter(width / 2, height / 2);
//     simulation
//         .force('charge_force', chargeForce)
//         .force('center_force', centerForce)
//         .force('links', linkForce);
//     // let simulation = d3.forceSimulation()
//     //     .force("link", d3.forceLink().id(function (d) {
//     //         return d.playerID;
//     //     }))
//     //     .force("charge", d3.forceManyBody())
//     //     .force("center", d3.forceCenter(width / 2, height / 2));
//
//     simulation.on("tick", tickActions);
//
//     let wScale = d3.scaleLinear()
//         .domain(d3.extent(graphData.links.map(d => d.disNum)))
//         .range([1, 10]);
//     let links = svg.append("g")
//         .attr("class", "links")
//         .selectAll("line")
//         .data(graphData.links)
//         .enter()
//         .append("line")
//         .attr("stroke-width", d => wScale(d.disNum))
//         .style("stroke", '#999');
//
//     let rScale = d3.scaleLinear()
//         .domain(d3.extent(graphData.nodes.map(d => d.linksNum)))
//         .range([5, 20]);
//
//     let colorDict = {
//         'ball': '#734d35',
//         'home': '#46c38c',
//         'visitor': '#d34b17',
//     }
//     // console.log(rScale(100))
//     // console.log(rScale.range())
//     // console.log(rScale.domain())
//     let nodes = svg.append("g")
//         .attr("class", "nodes")
//         .selectAll("circle")
//         .data(graphData.nodes)
//         .enter()
//         .append("circle")
//         .attr("r", d => rScale(d.linksNum))
//         .attr("fill", d => colorDict[d.teamInfo]);
//
//
//     // simulation
//     //   .nodes(graphData.nodes)
//     //   .on("tick", tickActions);
//
//     // simulation.force("link")
//     //     .links(graphData.links);
//
//     let drag_handler = d3.drag()
//         .on("start", drag_start)
//         .on("drag", drag_drag)
//         .on("end", drag_end);
//
//     drag_handler(nodes);
//
//     function drag_start(d) {
//         if (!d3.event.active) simulation.alphaTarget(0.3).restart();
//         d.fx = d.x;
//         d.fy = d.y;
//     }
//
//     function drag_drag(d) {
//         d.fx = d3.event.x;
//         d.fy = d3.event.y;
//     }
//
//
//     function drag_end(d) {
//         if (!d3.event.active) simulation.alphaTarget(0);
//         d.fx = null;
//         d.fy = null;
//     }
//
//     function tickActions() {
//         //constrains the nodes to be within a box
//         nodes
//             .attr("transform", function (d) {
//                 return "translate(" + d.x + "," + d.y + ")";
//             });
//
//         links
//             .attr("x1", function (d) {
//                 return d.source.x;
//             })
//             .attr("y1", function (d) {
//                 return d.source.y;
//             })
//             .attr("x2", function (d) {
//                 return d.target.x;
//             })
//             .attr("y2", function (d) {
//                 return d.target.y;
//             });
//     }
//
//
// }


// 画 矩阵 视图
function drawMatrix(gameID = '0021500003') {

    // $('#container').append('p')

    $.ajax({
        url: '/getGameGraph/',   // 得到图的数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
            disThreshold: 2.2,
            kThreshold: 1,
        },
        beforeSend: function () {
            console.log('加载数据, 这里会弹出一个 框 让用户等待');

        },
        success: function (result, error) {
            // $('#matrix-container').empty();
            // todo: 在这里执行关掉等待页面响应的操作
            console.log('接收到整个比赛的图数据');
            console.log('异常信息', error, typeof error);
            console.log(result);
            // svg 画布 的 宽度 和 高度
            let svgWidth = 2000,
                svgHeight = 1000;

            let zoom = d3.zoom()
            // .scaleExtent([0.5, 16])
            // .extent([[0, 0], [svgWidth, svgHeight]])
            // .on('zoom', zoomed);
                .scaleExtent([0.4, 3])
                .translateExtent([
                    [0, 0],
                    [svgWidth, svgHeight],
                ])
                .on("zoom", zoomed);

            // svg 画布
            let svg = d3.select('#matrix-container')
                .append('svg')
                .attr('width', svgWidth)
                .attr('height', svgHeight)
                .style('background-color', '#fafafa')
            // .call(zoom)
            // .call(d3.zoom().on("zoom", function () {
            //     svg.attr("transform", d3.event.transform)
            // }))
            // .append('g')
            // 比赛的 画布 便宜 5,5
            let gGameMatrix = svg.append('g')
                .attr('transform', 'translate(5, 5)')
                .call(d3.zoom().on("zoom", function () {
                    svg.attr("transform", d3.event.transform)
                }));
            // drawGameMatrix(svg, result.gameGraphData)
            drawGameMatrix(gGameMatrix, result.gameGraphData)


            // zoom的功能
            // 重要的地方
            function zoomed() {
                // change = d3.event.transform;
                // recover the new scale
                // let newX = d3.event.transform;
                // let newY = d3.event.transform;
                d3.select('#matrix-container')
                    .select('svg')
                    // .selectAll('g')
                    .attr('transform', d3.event.transform)

                // .attr('transform', function (d) {
                //     return 'translate(' + newX + ',' + newY + ')';
                // })
                // .attr('transform', function (d) {
                //     let change = d3.event.transform;
                //     return "translate(" +
                //         [change.x, change.y] + ")scale(" +
                //         change.k + ")"
                // })
            }


        },
        complete: function () {
            // console.log('绘制 比赛图 完毕');
        }
    })


}


// 在g上画比赛图，数据是gameGraphData
function drawGameMatrix(g, gameGraphData) {
    console.log('开始画表示整场比赛的矩阵');
    console.log('整场比赛的数据', gameGraphData);
    var teamColor = {
        'home': '#1d70fb',
        'visitor': '#d34b17',
        'ball': '#b8931b'
    };
    // 建立运动员的Map,涉及一些号码之类的信息
    let playerMap = {};
    for (let player of gameGraphData.homeTeam.players) {
        // console.log(player)
        playerMap[player.playerid + ''] = {
            // gameID: player.gameID,
            playerID: player.playerid,
            teamName: gameGraphData.homeTeam.abbreviation,
            teamID: gameGraphData.homeTeam.teamid,
            teamDes: 'home',
            name: player.firstnzame + ' ' + player.lastname,
            position: player.position,
            jersey: player.jersey
        };
    }
    for (let player of gameGraphData.visitorTeam.players) {
        // console.log(player)
        playerMap[player.playerid + ''] = {
            // gameID: player.gameID,
            playerID: player.playerid,
            teamName: gameGraphData.visitorTeam.abbreviation,
            teamID: gameGraphData.homeTeam.teamid,
            teamDes: 'visitor',
            name: player.firstnzame + ' ' + player.lastname,
            position: player.position,
            jersey: player.jersey
        };
    }
    console.log('得到运动员的ID', playerMap);
    // 得到节点数据和连接数据
    let nodes = gameGraphData.data.nodes,
        links = gameGraphData.data.links;
    let rectWidth = 40; // 设置宽度
    // 为 节点球员 添加 基础信息 如 位置 队伍缩写 名字 球衣号码
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i],  // 节点
            nodeID = node.ID;  // 节点ID
        if (nodeID === -1) {
            node.teamName = 'Ball';
            node.teamDes = 'ball';
            node.name = 'ball';
            node.position = 'b';
            node.jersey = -1;
        } else {
            let nodeObj = playerMap[nodeID.toString()];
            node.teamName = nodeObj.teamName;
            node.teamDes = nodeObj.teamDes;
            node.name = nodeObj.name;
            node.position = nodeObj.position;
            node.jersey = nodeObj.jersey;
        }
        nodes[i] = node;
    }
    // 对节点球员 进行排序，方便确认球员节点放在哪个位置
    let positionString = 'b G G-F F F-C C';
    nodes = nodes.sort(function (a, b) {
        let aTeamDes = a.teamDes,
            bTeamDes = b.teamDes,
            aPosition = positionString.indexOf(a.position),
            bPosition = positionString.indexOf(b.position),
            aID = a.ID,
            bID = b.ID;
        if (aTeamDes < bTeamDes) {
            return -1;
        } else if (aTeamDes > bTeamDes) {
            return 1;
        } else {
            if (aPosition.length === bPosition.length) {
                if (aPosition < bPosition) {
                    return -1;
                } else if (aPosition > bPosition) {
                    return 1;
                } else {
                    if (aID < bID) {
                        return -1
                    } else {
                        return 1;
                    }
                }
            }
        }
    });
    // 球队颜色

    // 遍历节点 开始画节点的位置
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];  // 得到球员
        console.log('开始画球员节点-球员数据', node);
        // 便宜 距离
        let translateLength = (i + 1) * rectWidth;
        // 首先是 画横向的节点
        let g_h_node = g.append('g')
            .attr('id', 'gameNode_h_' + node.ID)
            .attr('transform', 'translate(' + translateLength + ',' + 0 + ')');
        // 得到 颜色
        let textColor = teamColor[node.teamDes]
        g_h_node.append('rect')
            .datum(node)
            .attr('id', 'game_h_node' + node.ID)
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', rectWidth)
            .attr('height', rectWidth)
            // .attr('fill', textColor)
            .attr('fill', 'none')
            // .attr('opacity', 0.5)
            .attr('stroke', '#646d75')
            .attr('opacity', 0.5);
        g_h_node.append('text')
            .style('text-anchor', 'middle')
            .attr("x", rectWidth / 2)
            .attr("y", rectWidth / 2)
            .attr('dy', rectWidth * 0.5 * 0.5)
            .attr('font-size', rectWidth * 0.5)
            .attr('fill', textColor)
            .attr('opacity', '0.3')
            .text(node.jersey)
            .style('pointer-events', 'none');

        let g_v_node = g.append('g')
            .attr('id', 'gameNode_v_' + node.ID)
            .attr('transform', 'translate(' + 0 + ',' + translateLength + ')');
        g_v_node.append('rect')
            .datum(node)
            .attr('id', 'game_v_node' + node.ID)
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', rectWidth)
            .attr('height', rectWidth)
            .attr('fill', '#a8aa71')
            .attr('stroke', '#646d75')
            .attr('opacity', 0.5);
        g_v_node.append('text')
            .style('text-anchor', 'middle')
            .attr("x", rectWidth / 2)
            .attr("y", rectWidth / 2)
            .attr('dy', rectWidth * 0.5 * 0.5)
            .attr('font-size', rectWidth * 0.5)
            .attr('fill', 'black')
            .text(node.jersey);

        // 添加球员节点
        // let nodeWidth = 0.8 * rectWidth,
        // let nodeWidth = 0.85 * rectWidth,
        //     nodeInfoWidth = 0.24 * rectWidth;
        // 添加一个代表球员的矩形所在的g节点
        // let g_node_rect = g_node.append('g')
        // .attr('id', 'gameNode_h_g_node_rect' + node.ID)
        // .attr('transform', 'translate(' + 0.075 * rectWidth + ',' + 0.075 * rectWidth + ')');
        // .attr('transform', 'translate(' + 0.1 * rectWidth + ',' + 0.1 * rectWidth + ')');
        // g_node_rect.append('rect')
        //     .attr('x', 0)
        //     .attr('y', 0)
        //     .attr('width', nodeWidth)
        //     .attr('height', nodeWidth)
        //     .attr('rx', 0.1 * nodeWidth)
        //     .attr('ry', 0.1 * nodeWidth)
        //     .attr('fill', '#4652aa')
        //     .attr('opacity', 0.5);
        // 添加这个球员的号码
        // g_node_rect.append('rect')
        // 四个小方块的宽度
        // 添加
        // let jerseyRectWidth = 0.48 * nodeWidth;
        // let jerseyRect = g_node_rect.append('g')
        // jerseyRect.append('rect')
        //     .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
        //     .attr('rx', 0.1 * jerseyRectWidth)
        //     .attr('ry', 0.1 * jerseyRectWidth)
        //     .attr('x', 0)
        //     .attr('y', 0)
        //     .attr('width', jerseyRectWidth)
        //     .attr('height', jerseyRectWidth)
        //     .attr('fill', '#ccc');
        //
        // jerseyRect.append('text')
        // // .attr('transform', 'translate(' + 0.5 * jerseyRectWidth + ',' + 0.5 * jerseyRectWidth + ')')
        //     .attr("x", jerseyRectWidth / 2)
        //     .attr("y", jerseyRectWidth / 2)
        //     // .attr("font-family", "Arial Black")
        //     .style('text-anchor', 'middle')
        //     // .attr("dy", )
        //     .style('font-size', 0.5 * jerseyRectWidth)
        //     .attr('fill', 'white')
        //     .text(node.jersey + '');
        // break


        console.log(1)

    }
}


function clickButton1() {
    console.log('给节点添加 属性')
    $.ajax({
        url: '/getGameGraph/',   // 得到图的数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: '0021500003',  // 比赛ID
            disThreshold: 2.2,
            kThreshold: 1,
        },
        beforeSend: function () {
            console.log('加载数据, 这里会弹出一个 框 让用户等待');

        },
        success: function (result, error) {
            // $('#matrix-container').empty();
            // todo: 在这里执行关掉等待页面响应的操作
            console.log('接收到整个比赛的图数据');
            console.log('异常信息', error, typeof error);
            console.log(result);
            // 给节点添加属性
            // 得到节点
            let nodes = result.gameGraphData.data.nodes;
            console.log(nodes[0]);

            // 代表连接的小方块的宽度
            // 设置 矩形宽度
            let rectWidth = (d3.select('#svg-gameGraph').attr('height') - 20) / (nodes.length + 1); // 设置宽度
            let nodeRectWidth = 0.6 * rectWidth;


            // 设置节点的各种比例尺
            // 连接距离平均值比例尺
            let linkDistanceList = [];
            nodes.forEach(function (node) {
                node.quarterInfo.forEach(function (d) {
                    linkDistanceList.push(d.linkDisInfo[0])
                })
            });
            // console.log(linkDistanceList)
            // console.log(d3.extent(linkDistanceList))
            // let linkDistanceScale = d3.scaleLinear()
            //     .domain(d3.extent(linkDistanceList))
            //     .range([0.2 * rectWidth, 0.05 * rectWidth]);

            // 设置高度比例尺 为 连接距离 的平均比例尺
            // heightScale = linkDistanceScale;
            // 设置 x 的比例尺
            // let xScale = quarterTimeScale;

            // 删掉 所有的 之前画上去的点
            d3.selectAll('.gameNodeSupplementary').remove();

            // 遍历节点
            for (let i = 0; i < nodes.length; i++) {
                // 获得节点 节点数据  小节数据
                let node = nodes[i],
                    nodeId = node.ID,
                    quarterList = node.quarterInfo;
                // 取得 表示这个节点的 g 元素
                let g_h_node = d3.select('#gameNode_h_' + nodeId);
                let g_v_node = d3.select('#gameNode_v_' + nodeId);
                // 遍历 小节数据
                for (let j = 0; j < quarterList.length; j++) {
                    let quarter = quarterList[j];
                    if (j === 0) {
                        // 在小方块的上方画图。
                        // 横向 坐标轴 比例尺
                        let xScale = d3.scaleLinear()
                            .domain([720, 0])
                            .range([0, nodeRectWidth]);
                        let yScale = d3.scaleLinear()
                            .domain(d3.extent(linkDistanceList))
                            .range([0.18 * rectWidth, 0.05 * rectWidth]);

                        let translateX = 0.2 * rectWidth;
                        let translateY = 0;

                        g_h_node.append('g')
                            .attr('class', 'gameNodeSupplementary')
                            .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                            .append('rect')
                            .attr('x', 0.1 * nodeRectWidth)
                            .attr('y', yScale(quarter.linkDisInfo[0]))
                            .attr('rx', 0.03 * 0.8 * nodeRectWidth)
                            .attr('ry', 0.03 * 0.8 * nodeRectWidth)
                            .attr('width', 0.8 * nodeRectWidth)
                            .attr('height', 0.19 * rectWidth - yScale(quarter.linkDisInfo[0]))
                            .attr('fill', '#7891cc');

                        g_v_node.append('g')
                            .attr('class', 'gameNodeSupplementary')
                            .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                            .append('rect')
                            .attr('x', 0.1 * nodeRectWidth)
                            .attr('y', yScale(quarter.linkDisInfo[0]))
                            .attr('rx', 0.03 * 0.8 * nodeRectWidth)
                            .attr('ry', 0.03 * 0.8 * nodeRectWidth)
                            .attr('width', 0.8 * nodeRectWidth)
                            .attr('height', 0.19 * rectWidth - yScale(quarter.linkDisInfo[0]))
                            .attr('fill', '#7891cc');
                    } else if (j === 1) {
                        let xScale = d3.scaleLinear()
                            .domain(d3.extent(linkDistanceList))
                            .range([0.05 * rectWidth, 0.18 * rectWidth]);
                        let yScale = d3.scaleLinear()
                            .domain([720, 0])
                            .range([0, nodeRectWidth]);

                        let translateX = 0.8 * rectWidth;
                        let translateY = 0.2 * rectWidth;

                        g_h_node.append('g')
                            .attr('class', 'gameNodeSupplementary')
                            .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                            .append('rect')
                            .attr('y', 0.1 * nodeRectWidth)
                            .attr('x', 0.01 * rectWidth)
                            .attr('rx', 0.03 * 0.8 * nodeRectWidth)
                            .attr('ry', 0.03 * 0.8 * nodeRectWidth)
                            .attr('height', 0.8 * nodeRectWidth)
                            .attr('width', xScale(quarter.linkDisInfo[0]))
                            .attr('fill', '#7891cc');

                        g_v_node.append('g')
                            .attr('class', 'gameNodeSupplementary')
                            .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                            .append('rect')
                            .attr('y', 0.1 * nodeRectWidth)
                            .attr('x', 0.01 * rectWidth)
                            .attr('rx', 0.03 * 0.8 * nodeRectWidth)
                            .attr('ry', 0.03 * 0.8 * nodeRectWidth)
                            .attr('height', 0.8 * nodeRectWidth)
                            .attr('width', xScale(quarter.linkDisInfo[0]))
                            .attr('fill', '#7891cc');

                    }else if (j === 2) {
                        let xScale = d3.scaleLinear()
                            .domain([720, 0])
                            .range([0, nodeRectWidth]);
                        let yScale = d3.scaleLinear()
                            .domain(d3.extent(linkDistanceList))
                            .range([0.05 * rectWidth, 0.18 * rectWidth]);

                        let translateX = 0.2 * rectWidth;
                        let translateY = 0.8 * rectWidth;

                        g_h_node.append('g')
                            .attr('class', 'gameNodeSupplementary')
                            .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                            .append('rect')
                            .attr('x', 0.1 * nodeRectWidth)
                            .attr('y', 0.01 * rectWidth)
                            .attr('rx', 0.03 * 0.8 * nodeRectWidth)
                            .attr('ry', 0.03 * 0.8 * nodeRectWidth)
                            .attr('width', 0.8 * nodeRectWidth)
                            .attr('height', yScale(quarter.linkDisInfo[0]))
                            .attr('fill', '#7891cc');

                        g_v_node.append('g')
                            .attr('class', 'gameNodeSupplementary')
                            .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                            .append('rect')
                            .attr('x', 0.1 * nodeRectWidth)
                            .attr('y', 0.01 * rectWidth)
                            .attr('rx', 0.03 * 0.8 * nodeRectWidth)
                            .attr('ry', 0.03 * 0.8 * nodeRectWidth)
                            .attr('width', 0.8 * nodeRectWidth)
                            .attr('height', yScale(quarter.linkDisInfo[0]))
                            .attr('fill', '#7891cc');

                    } else if (j === 3) {
                        let xScale = d3.scaleLinear()
                            .domain(d3.extent(linkDistanceList))
                            .range([0.05 * rectWidth, 0.18 * rectWidth]);
                        let yScale = d3.scaleLinear()
                            .domain([720, 0])
                            .range([0, nodeRectWidth]);

                        let translateX = 0;
                        let translateY = 0.2 * rectWidth;

                        g_h_node.append('g')
                            .attr('class', 'gameNodeSupplementary')
                            .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                            .append('rect')
                            .attr('y', 0.1 * nodeRectWidth)
                            .attr('x', xScale(quarter.linkDisInfo[0]))
                            .attr('rx', 0.03 * 0.8 * nodeRectWidth)
                            .attr('ry', 0.03 * 0.8 * nodeRectWidth)
                            .attr('height', 0.8 * nodeRectWidth)
                            .attr('width', 0.19 *rectWidth - xScale(quarter.linkDisInfo[0]))
                            .attr('fill', '#7891cc');

                        g_v_node.append('g')
                            .attr('class', 'gameNodeSupplementary')
                            .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                            .append('rect')
                            .attr('y', 0.1 * nodeRectWidth)
                            .attr('x', xScale(quarter.linkDisInfo[0]))
                            .attr('rx', 0.03 * 0.8 * nodeRectWidth)
                            .attr('ry', 0.03 * 0.8 * nodeRectWidth)
                            .attr('height', 0.8 * nodeRectWidth)
                            .attr('width', 0.19 *rectWidth - xScale(quarter.linkDisInfo[0]))
                            .attr('fill', '#7891cc');
                    }

                }
            }
        },
        complete: function () {
            // console.log('绘制 比赛图 完毕');

        }
    })
}



function clickButton2() {
    console.log('给节点添加 属性');
    $.ajax({
        url: '/getGameGraph/',   // 得到图的数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: '0021500003',  // 比赛ID
            disThreshold: 2.2,
            kThreshold: 1,
        },
        beforeSend: function () {
            console.log('加载数据, 这里会弹出一个 框 让用户等待');

        },
        success: function (result, error) {
            // $('#matrix-container').empty();
            // todo: 在这里执行关掉等待页面响应的操作
            console.log('接收到整个比赛的图数据');
            console.log('异常信息', error, typeof error);
            console.log(result);
            // 给节点添加属性
            // 得到节点
            let links = result.gameGraphData.data.links;
            console.log(links[0]);

            // 代表连接的小方块的宽度
            // 设置 矩形宽度
            let rectWidth = (d3.select('#svg-gameGraph').attr('height') - 20) / (result.gameGraphData.data.nodes.length + 1); // 设置宽度
            let nodeRectWidth = 0.6 * rectWidth;


            // 设置节点的各种比例尺
            // 连接距离平均值比例尺
            let linkDistanceList = [];
            links.forEach(function (link) {
                link.quarterInfo.forEach(function (d) {
                    linkDistanceList.push(d.disInfo[0])
                })
            });


            // 删掉 所有的 之前画上去的点
            d3.selectAll('.gameLinkSupplementary').remove();

            // 遍历节点
            for (let i = 0; i < links.length; i++) {
                // 获得连接 节点数据  小节数据
                let link = links[i],
                    linkId = link.s + 'to' + link.t,
                    // linkId2 = link.t + 'to' + link.s,
                    quarterList = link.quarterInfo;
                // 取得 表示这个节点的 g 元素
                let g_h_node = d3.select('#gameLink_h_' + linkId);
                let g_v_node = d3.select('#gameLink_v_' + linkId);
                // 遍历 小节数据
                for (let j = 0; j < quarterList.length; j++) {
                    let quarter = quarterList[j];
                    if (j === 0) {
                        // 在小方块的上方画图。
                        // 横向 坐标轴 比例尺
                        let xScale = d3.scaleLinear()
                            .domain([720, 0])
                            .range([0, nodeRectWidth]);
                        let yScale = d3.scaleLinear()
                            .domain(d3.extent(linkDistanceList))
                            .range([0.18 * rectWidth, 0.05 * rectWidth]);

                        let translateX = 0.2 * rectWidth;
                        let translateY = 0;

                        g_h_node.append('g')
                            .attr('class', 'gameLinkSupplementary')
                            .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                            .append('rect')
                            .attr('x', 0.1 * nodeRectWidth)
                            .attr('y', yScale(quarter.disInfo[0]))
                            .attr('rx', 0.03 * 0.8 * nodeRectWidth)
                            .attr('ry', 0.03 * 0.8 * nodeRectWidth)
                            .attr('width', 0.8 * nodeRectWidth)
                            .attr('height', 0.19 * rectWidth - yScale(quarter.disInfo[0]))
                            .attr('fill', '#7891cc');

                        g_v_node.append('g')
                            .attr('class', 'gameLinkSupplementary')
                            .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                            .append('rect')
                            .attr('x', 0.1 * nodeRectWidth)
                            .attr('y', yScale(quarter.disInfo[0]))
                            .attr('rx', 0.03 * 0.8 * nodeRectWidth)
                            .attr('ry', 0.03 * 0.8 * nodeRectWidth)
                            .attr('width', 0.8 * nodeRectWidth)
                            .attr('height', 0.19 * rectWidth - yScale(quarter.disInfo[0]))
                            .attr('fill', '#7891cc');
                    } else if (j === 1) {
                        let xScale = d3.scaleLinear()
                            .domain(d3.extent(linkDistanceList))
                            .range([0.05 * rectWidth, 0.18 * rectWidth]);
                        let yScale = d3.scaleLinear()
                            .domain([720, 0])
                            .range([0, nodeRectWidth]);

                        let translateX = 0.8 * rectWidth;
                        let translateY = 0.2 * rectWidth;

                        g_h_node.append('g')
                            .attr('class', 'gameLinkSupplementary')
                            .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                            .append('rect')
                            .attr('y', 0.1 * nodeRectWidth)
                            .attr('x', 0.01 * rectWidth)
                            .attr('rx', 0.03 * 0.8 * nodeRectWidth)
                            .attr('ry', 0.03 * 0.8 * nodeRectWidth)
                            .attr('height', 0.8 * nodeRectWidth)
                            .attr('width', xScale(quarter.disInfo[0]))
                            .attr('fill', '#7891cc');

                        g_v_node.append('g')
                            .attr('class', 'gameLinkSupplementary')
                            .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                            .append('rect')
                            .attr('y', 0.1 * nodeRectWidth)
                            .attr('x', 0.01 * rectWidth)
                            .attr('rx', 0.03 * 0.8 * nodeRectWidth)
                            .attr('ry', 0.03 * 0.8 * nodeRectWidth)
                            .attr('height', 0.8 * nodeRectWidth)
                            .attr('width', xScale(quarter.disInfo[0]))
                            .attr('fill', '#7891cc');

                    }else if (j === 2) {
                        let xScale = d3.scaleLinear()
                            .domain([720, 0])
                            .range([0, nodeRectWidth]);
                        let yScale = d3.scaleLinear()
                            .domain(d3.extent(linkDistanceList))
                            .range([0.05 * rectWidth, 0.18 * rectWidth]);

                        let translateX = 0.2 * rectWidth;
                        let translateY = 0.8 * rectWidth;

                        g_h_node.append('g')
                            .attr('class', 'gameLinkSupplementary')
                            .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                            .append('rect')
                            .attr('x', 0.1 * nodeRectWidth)
                            .attr('y', 0.01 * rectWidth)
                            .attr('rx', 0.03 * 0.8 * nodeRectWidth)
                            .attr('ry', 0.03 * 0.8 * nodeRectWidth)
                            .attr('width', 0.8 * nodeRectWidth)
                            .attr('height', yScale(quarter.disInfo[0]))
                            .attr('fill', '#7891cc');

                        g_v_node.append('g')
                            .attr('class', 'gameLinkSupplementary')
                            .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                            .append('rect')
                            .attr('x', 0.1 * nodeRectWidth)
                            .attr('y', 0.01 * rectWidth)
                            .attr('rx', 0.03 * 0.8 * nodeRectWidth)
                            .attr('ry', 0.03 * 0.8 * nodeRectWidth)
                            .attr('width', 0.8 * nodeRectWidth)
                            .attr('height', yScale(quarter.disInfo[0]))
                            .attr('fill', '#7891cc');

                    } else if (j === 3) {
                        let xScale = d3.scaleLinear()
                            .domain(d3.extent(linkDistanceList))
                            .range([0.05 * rectWidth, 0.18 * rectWidth]);
                        let yScale = d3.scaleLinear()
                            .domain([720, 0])
                            .range([0, nodeRectWidth]);

                        let translateX = 0;
                        let translateY = 0.2 * rectWidth;

                        g_h_node.append('g')
                            .attr('class', 'gameLinkSupplementary')
                            .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                            .append('rect')
                            .attr('y', 0.1 * nodeRectWidth)
                            .attr('x', xScale(quarter.disInfo[0]))
                            .attr('rx', 0.03 * 0.8 * nodeRectWidth)
                            .attr('ry', 0.03 * 0.8 * nodeRectWidth)
                            .attr('height', 0.8 * nodeRectWidth)
                            .attr('width', 0.19 *rectWidth - xScale(quarter.disInfo[0]))
                            .attr('fill', '#7891cc');

                        g_v_node.append('g')
                            .attr('class', 'gameLinkSupplementary')
                            .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                            .append('rect')
                            .attr('y', 0.1 * nodeRectWidth)
                            .attr('x', xScale(quarter.disInfo[0]))
                            .attr('rx', 0.03 * 0.8 * nodeRectWidth)
                            .attr('ry', 0.03 * 0.8 * nodeRectWidth)
                            .attr('height', 0.8 * nodeRectWidth)
                            .attr('width', 0.19 *rectWidth - xScale(quarter.disInfo[0]))
                            .attr('fill', '#7891cc');
                    }

                }
            }
        },
        complete: function () {
            // console.log('绘制 比赛图 完毕');

        }
    })
}

