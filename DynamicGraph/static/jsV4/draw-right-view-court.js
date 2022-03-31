// draw_node_link_court();

function draw_node_link_court(timeDataIndexList = '[[1, 2, 3], [800, 802, 804, 806, 808, 808], [60, 70, 80, 90, 100, 110, 120], [6], [6],[6],[6],[6]]') {
    // 设置一个初始值 用于实验。
    // timeDataIndexList = '[[1, 2, 3], [800, 802, 804, 806, 808, 808], [60, 70, 80, 90, 100, 110, 120], [6], [6],[6],[6],[6]]';
    let gameID = '0021500003';
    // timeDataIndexList = JSON.parse()
    console.log('画细节视图', '比赛id', gameID, '选择的时间索引', timeDataIndexList);

    $.ajax({
        url: '/ajaxGetSnapshotDetails/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
            timeDataIndexList: timeDataIndexList  // 时间序列
        },
        beforeSend: function () {
            // console.log('加载数据, 这里会弹出一个框让用户等待');
        },
        success: function (result, error) {
            console.log('得到节点链接图的数据', result);

            // 画节点连接图
            draw_node_link(result);
            // 画缩略节点连接图
            draw_mini_node_link(result);

            // 画细节视图 - 球员
            draw_details_view_players(result);

            // 画细节视图 - 指标
            draw_details_view_indicators(result);


        }
    })
}

function draw_node_link(data) {
    let details = data['details'],
        summary = data['summary'],
        playerMap = data['playerMap'];
    console.log('画大的节点链接图', details, summary, playerMap);
    // 得到 小视图的高度和宽度
    let height = $('#svg-court').height(),
        width = $('#svg-court').width();

    $('#svg-court').empty();

    console.log('横纵坐标', height, width);

    // 设置比例尺
    let x1 = d3.scaleLinear()
        .domain([0, 94])
        .range([0, width]);
    let y1 = d3.scaleLinear()
        .domain([0, 50])
        .range([height, 0]);


    details.forEach(function (snapshot, snapshotIndex) {
        // 设置g节点去承载缩略图
        let g = d3.select('#svg-court')
            .append('g')
            .attr('class', 'snapshot')
            .attr('id', 'snapshot-' + snapshotIndex)
            .attr('opacity', 0);
        let nodes = snapshot.nodes;
        let nodeStartPositionMap = drawSnapshotNode(g, nodes, x1, y1, playerMap);
        let links = snapshot.links;
        draw_snapshot_link(g, links, x1, y1, nodeStartPositionMap);
    });


    let g1 = d3.select('#svg-court')
        .append('g')
        .attr('class', 'snapshot')
        .attr('id', 'snapshot-' + 'summary')
        .attr('opacity', 0);
    let nodes = summary.nodes;
    let nodeStartPositionMap = drawSnapshotNode(g1, nodes, x1, y1, playerMap);
    let links = summary.links;
    draw_snapshot_link(g1, links, x1, y1, nodeStartPositionMap);


    d3.select('#snapshot-0')
        .attr('opacity', 1);


}


function draw_snapshot_link(g, links, x, y, nodeStartPositionMap) {
    let linkNumList = [];
    for (let link of links) {
        let s = link.s;
        let t = link.t;
        if (s === -1) {
            continue;
        }
        linkNumList.push(link['timeData'].length)
    }
    let widthScale = d3.scaleLinear()
        .domain(d3.extent(linkNumList))
        .range([2, 10]);
    for (let link of links) {
        let s = link.s;
        let t = link.t;
        if (s === -1) {
            continue;
        }
        let sPosition = nodeStartPositionMap[s.toString()];
        let tPosition = nodeStartPositionMap[t.toString()];


        // 添加连接
        g.append('line')
            .attr('class', 'court_link court_link-' + s + ' court_link-' + t)
            .attr('x1', x(sPosition[0]))
            .attr('y1', y(sPosition[1]))
            .attr('x2', x(tPosition[0]))
            .attr('y2', y(tPosition[1]))
            .style('stroke', '#535353')
            .style('stroke-width', widthScale(link.timeData.length))
            .style('stroke-dasharray', 0)
            .attr('opacity', 0.3)
            .style('pointer-events', 'none');
    }
}


function drawSnapshotNode(g, nodes, x, y, playerMap) {
    let fillColorMap = {
        'home': '#e6421c',
        'visitor': '#1d70fb'
    };

    // 存储链接位置
    let nodeStartPositionMap = {};

    for (let node of nodes) {
        // 节点id
        let nodeID = node['playerId'];
        let nodeTeam = 'ball';
        // if (nodeID === -1) {
        //     continue
        // }
        // 节点队伍和填充颜色

        let fillColor = '#864a06';
        let fillOpacity = 0.8;
        // 得到球衣
        let jersey = '';
        // 得到半径
        let r = 7;
        if (nodeID === -1) {
            jersey = ''
        } else {
            r = 10;
            fillOpacity = 0.3;
            nodeTeam = playerMap[nodeID.toString()]['teamDes'];
            fillColor = fillColorMap[nodeTeam];
            jersey = playerMap[nodeID.toString()]['jersey'];
        }
        // 得到时间集合数据
        let timeData = node['timeData'];
        // 计算平均位置
        // let avePosition = computeNodeAveCoordinates(timeData);
        // 不使用平均距离，使用初始距离

        // 添加节点
        g.append('circle')
            .attr('class', 'court_player ' + 'court_player-' + nodeID)
            .attr('cx', x(timeData[0].x))
            .attr('cy', y(timeData[0].y))
            .attr('r', r)
            .attr('fill', fillColor)
            .attr('opacity', 0.7)
            // .on('click', courtPlayerClick)
            .style('pointer-events', 'none');

        g.append('text')
            .style('text-anchor', 'middle')
            .attr("x", x(timeData[0].x))
            .attr("y", y(timeData[0].y))
            .attr('dy', 6)
            .attr('class', 'jersey')
            .text(jersey)
            .style('font-size', 15)
            .attr('opacity', 0.7)
            .style('pointer-events', 'none');

        if (timeData.length > 1) {
            let strokeOpacity = d3.scaleLinear()
                .domain([0, timeData.length - 2])
                .range([0.1, 1]);
            drawPath(g, timeData, x, y, nodeTeam, strokeOpacity, nodeID)
            // drawPath(g, timeData, x, y, fillColor, strokeOpacity, nodeID)
        }

        // 存储节点的初始
        nodeStartPositionMap[nodeID.toString()] = [timeData[0].x, timeData[0].y];

    }
    // 返回节点的初始位置
    return nodeStartPositionMap;

};

// 画路径
function drawPath(g, timeData, x, y, nodeTeam, strokeOpacity, nodeID) {
    let ballPathColor = d3.scaleLinear()
        .domain([0, timeData.length - 2])
        .range(['#f8e5c2', '#864a06']);
    let visitorPathColor = d3.scaleLinear()
        .domain([0, timeData.length - 2])
        .range(['#c6dbef', '#08519c']);
    let homePathColor = d3.scaleLinear()
        .domain([0, timeData.length - 2])
        .range(['#fef0d9', '#b30000']);

    let colorScale = ballPathColor;
    if (nodeTeam === 'home') {
        colorScale = homePathColor;
    } else if (nodeTeam === 'visitor') {
        colorScale = visitorPathColor;
    }


    // console.log('画路径', timeData);
    // 循环数据
    for (let i = 0; i < timeData.length - 1; i++) {
        // 得到时间数据
        let timeData1 = timeData[i],
            timeData2 = timeData[i + 1];
        // 得到 速度 宽度
        let strokeWidth = timeData1['speed'] / 2;
        // 得到线条颜色
        let opacity = strokeOpacity(i);
        opacity = 0.0;
        g.append('line')
            .attr('class', 'court_path court_path-' + nodeID)
            .attr('x1', x(timeData1.x))
            .attr('y1', y(timeData1.y))
            .attr('x2', x(timeData2.x))
            .attr('y2', y(timeData2.y))
            .style('stroke', colorScale(i))
            .style('stroke-width', strokeWidth)
            // .style('stroke-dasharray', 1)
            .attr('opacity', opacity)
            .style('pointer-events', 'none');

    }
}


// 缩略图
function draw_mini_node_link(data) {

    let details = data['details'],
        playerMap = data['playerMap'];

    console.log('画小的节点链接图', details, playerMap);

    // 得到 小视图的高度和宽度
    let height = $('#svg-court-mini').height(),
        width = height * 94 / 50;

    $('#svg-court-mini').empty();

    // console.log(height, width)

    // 设置小比例尺
    let x1 = d3.scaleLinear()
        .domain([0, 94])
        .range([5, width - 5]);
    let y1 = d3.scaleLinear()
        .domain([0, 50])
        .range([height - 5, 5]);

    // 循环节点视图
    details.forEach(function (snapshot, snapshotIndex) {
        // console.log(snapshot, snapshotIndex);
        // 设置g节点去承载缩略图
        let g = d3.select('#svg-court-mini')
            .append('g');
        // 计算g偏移位置
        let translateX = width * snapshotIndex;
        g.attr('id', 'snapshot-mini' + snapshotIndex)
            .attr('transform', 'translate(' + translateX + ',' + 0 + ')')

        d3.select('#svg-court-mini').style('width', width * (snapshotIndex + 1))

        g.append('rect')
            .attr('id', 'snapshot-miniRect-' + snapshotIndex)
            .attr('x', 2)
            .attr('y', 2)
            .attr('rx', 3)
            .attr('ry', 3)
            .attr('width', width - 4)
            .attr('height', height - 4)
            .attr('fill', '#fff')
            .style('stroke', '#000000')
            .style('stroke-width', 1)
            .style('stroke-dasharray', 2)
            .on('mouseover', snapshot_mini_mouseover)
            .on('mouseout', snapshot_mini_mouseout)
            .on('click', snapshot_mini_click);

        // 画节点，同时得到节点的平均位置
        let nodes = snapshot.nodes;
        let nodePositionMap = drawMiniNode(g, nodes, x1, y1, playerMap);
        // 画连接
        let links = snapshot.links;
        drawMiniLink(g, links, x1, y1, nodePositionMap);

    });
    // 高亮第一个方框
    d3.select('#snapshot-miniRect-0')
        .attr('clicked', true)
        .style('stroke-dasharray', 0)
        .style('stroke-width', 3);

}


function drawMiniLink(g, links, x, y, nodePositionMap) {
    for (let link of links) {
        let s = link.s;
        let t = link.t;
        if (s === -1) {
            continue;
        }
        let sPosition = nodePositionMap[s.toString()];
        let tPosition = nodePositionMap[t.toString()];
        // 添加连接
        g.append('line')
            .attr('x1', x(sPosition[0]))
            .attr('y1', y(sPosition[1]))
            .attr('x2', x(tPosition[0]))
            .attr('y2', y(tPosition[1]))
            .style('stroke', '#000000')
            .style('stroke-width', 1)
            .style('stroke-dasharray', 1)
            .attr('opacity', 0.5)
            .style('pointer-events', 'none');
    }
}


// 画节点
function drawMiniNode(g, nodes, x, y, playerMap, snapshotIndex) {
    let fillColorMap = {
        'home': '#e6421c',
        'visitor': '#1d70fb'
    };
    let nodePositionMap = {}
    for (let node of nodes) {
        // 节点id
        let nodeID = node['playerId'];
        if (nodeID === -1) {
            continue
        }
        // 节点队伍和填充颜色
        let nodeTeam = playerMap[nodeID.toString()]['teamDes'];
        let fillColor = fillColorMap[nodeTeam];
        // 得到时间集合数据
        let timeData = node['timeData'];
        // 计算平均位置
        // let avePosition = computeNodeAveCoordinates(timeData);
        // 不使用平均距离
        nodePositionMap[nodeID.toString()] = [timeData[0].x, timeData[0].y];
        // 添加节点
        g.append('circle')
            .attr('cx', x(timeData[0].x))
            .attr('cy', y(timeData[0].y))
            .attr('r', 2)
            .attr('fill', fillColor)
            .attr('opacity', 0.5)
            .style('pointer-events', 'none');
    }
    return nodePositionMap;
}


// 计算 平均 位置 信息
function computeNodeAveCoordinates(timeData) {
    let x = 0;
    let y = 0;
    for (let timestamp of timeData) {
        x += timestamp.x;
        y += timestamp.y;
    }
    x = x / timeData.length;
    y = y / timeData.length;
    return [x, y];
}


function snapshot_mini_mouseover() {
    d3.select(this)
        .transition()
        .duration(50)
        .style('opacity', 0.2);
}

function snapshot_mini_mouseout() {
    d3.select(this)
        .transition()
        .duration(50)
        .style('opacity', 1);
}

function snapshot_mini_click() {
    // 得到 id
    let gID = d3.select(this).attr('id').split('-')[2];
    let g = d3.select('#snapshot-' + gID);
    let clicked = d3.select(this).attr('clicked');



    // console.log(clicked)
    // if (clicked === 'true') {
    //     // 取消选中
    //     console.log('取消选中 snapshot mini')
    //     d3.select(this).attr('clicked', false);
    //     d3.select(this)
    //     // .transition()
    //     // .duration(200)
    //         .style('stroke-dasharray', 2)
    //         .style('stroke-width', 1);
    // } else {
    // 选中
    console.log('选中 snapshot mini');
    d3.select('#svg-court-mini').selectAll('rect')
        .attr('clicked', false)
        .style('stroke-dasharray', 2)
        .style('stroke-width', 1);
    d3.select(this).attr('clicked', true);
    d3.select('#svg-court')
        .selectAll('.snapshot')
        .attr('opacity', 0);
    // .transition()
    // .duration(300)
    d3.select(this)
        .style('stroke-dasharray', 0)
        .style('stroke-width', 3);
    g.transition()
        .duration(300)
        .attr('opacity', 1);

    d3.select('#svg-details')
        .selectAll('rect')
        .attr('clicked', false)
        .style('stroke-dasharray', 2)
        .style('stroke-width', 0.2);

    d3.select('#snapshot-border-' + gID)
        .attr('clicked', true)
        .transition()
        .duration(300)
        .style('stroke-dasharray', 0)
        .style('stroke-width', 3);
    // }
}