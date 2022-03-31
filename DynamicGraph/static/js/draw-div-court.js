function draw_div_court() {
    // 清空 场地 svg 的 内容
    $('#svg_court').empty();
    // 得到这个div有多长 和多宽
    let width = $('#div_court').width() - 20,
        height = $('#div_court').height() - 20,
        margin = {left: 10, top: 10, right: 10, bottom: 10};

    // 场地视图的 宽度 和 高度
    let courtWidth = width,
        courtHeight = width * 50 / 94;

    let svg = d3.select('#svg_court')
        .style('margin-left', margin.left)
        .style('margin-top', margin.top)
        .style('margin-right', margin.right)
        .style('margin-bottom', margin.bottom)
        .style('width', courtWidth)
        .style('height', courtHeight)
        .style('opacity', 1);

    // 辅助视图 的 宽度 和 高度
    let assistantSvgWidth = width,
        assistantSvgHeight = height - 10 - courtHeight;
    let assistantSvg = d3.select('#div_court')
        .append('svg')
        .style('margin-left', margin.left)
        .attr('width', assistantSvgWidth)
        .attr('height', assistantSvgHeight)
        .style('background-color', '#ddd');

    // 取得一个回合 或者 多个 回合的 数据
    let roundList = [[0, 0]];  // 假如现在只取一个回合的
    let linkType = [0, 1, 2, 3];


    $.ajax({
        url: '/getRoundDetails/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: '0021500003',  // 比赛ID
            roundSelection: JSON.stringify(roundList),
            linkType: JSON.stringify(linkType)
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

            let jerseyMap = generateJerseyMap(result)

            // 首先是 画汇总的热力图
            // draw_total_heatmap(result.roundDataList)

            // 其次 画  带有轨迹 的 节点链接图
            draw_graph_path(result.graphList[0][11], jerseyMap)


        },
        complete: function () {
            // 做 什么 操作
            console.log('绘制 比赛图 完毕');
        }
    })
}


// 画轨迹图
function draw_graph_path(data, jerseyMap) {
    console.log(data)
    // 得到 宽度 和 高度
    // 得到这个div有多长 和多宽
    let width = $('#div_court').width() - 20,
        height = $('#div_court').height() - 20,
        margin = {left: 10, top: 10, right: 10, bottom: 10};

    // 场地视图的 宽度 和 高度
    let courtWidth = width,
        courtHeight = width * 50 / 94;
    // 设置比例尺 x y
    let x = d3.scaleLinear()
        .domain([0, 94])
        .range([0, courtWidth]);
    let y = d3.scaleLinear()
        .domain([0, 50])
        .range([0, courtHeight]);
    let speedList = [];
    data.nodes.forEach(function (d) {
        d.position.forEach(function (e) {
            speedList.push(e.s);
        })
    });
    let widthScale = d3.scaleLinear()
        .domain(d3.extent(speedList))
        .range([2, 8]);
    // 得到 svg
    let g = d3.select('#svg_court')
        .append('g')
        .attr('id', 'round');

    // 得到 节点 和 连接
    let nodes = data.nodes,
        links = data.links;

    let lineValue = d3.line()
        .x(function (d) {
            return x(d.x);
        })
        .y(function (d) {
            return y(d.y)
        })
        .curve(d3.curveCatmullRom.alpha(0.5))

    // 颜色 object
    let colorDict = {
        '1610612744': '#2c50d2',
        '1610612740': '#af3118',
        '-1': '#ae7a44'
    };

    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i],
            nodeID = node.nodeId,
            teamID = node.teamId,
            positionList = node.position;
        let speedAve = d3.mean(positionList.map(d => d.s));
        let g1 = g.append('g')
            .attr('class', 'node_move_' + nodeID + ' ' + 'node_move_' + teamID);
        g1.append('path')
            .datum(positionList)
            .attr('d', lineValue)
            .attr('stroke', colorDict[teamID.toString()])
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', widthScale(speedAve))
            .attr('fill', 'none')
            .attr('opacity', 0.5)
        // 添加 圆
        g1.append('circle')
        // .attr('')
            .attr('cx', x(positionList[0].x))
            .attr('cy', y(positionList[0].y))
            .attr('r', 10)
            .attr('fill', colorDict[teamID.toString()])
            .attr('opacity', 0.7);
        if (nodeID !== -1) {
            g1.append('text')
                .attr('x', x(positionList[0].x))
                .attr('y', y(positionList[0].y))
                .style('text-anchor', 'middle')
                .attr('font-size', 15)
                .attr('dy', 6)
                .text(jerseyMap[teamID.toString()][nodeID.toString()].jersey)
                .attr('pointer-events', 'none')
        }
    }

    console.log(links[1]);
    // 画连接
    for (let i = 0; i < links.length; i++) {
        let link = links[i],
            sid = link.sid,
            tid = link.tid,
            sPosition = link.sPosition,
            tPosition = link.tPosition;

        let g1 = g.append('g')
            .attr('class', 'link_' + sid.toString() + 'to' + tid.toString());
        g1.append('line')
            .attr('x1', x(sPosition[0].x))
            .attr('y1', y(sPosition[0].y))
            .attr('x2', x(tPosition[0].x))
            .attr('y2', y(tPosition[0].y))
            .attr("stroke", "#6a8281")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", 5)
            .attr('opacity', '0.5')
    }
}


// 画汇总的热力图
function draw_total_heatmap(data) {
    console.log('画总的热力图', data);
    // 得到 尺寸
    let width = $('#div_court').width() - 20,
        height = $('#div_court').height() - 20,
        margin = {left: 10, top: 10, right: 10, bottom: 10};

    // 场地视图的 宽度 和 高度
    let courtWidth = width,
        courtHeight = width * 50 / 94;

    //建立比例尺
    let x = d3.scaleLinear()
        .domain([0, 94])
        .range([0, courtWidth]);
    let y = d3.scaleLinear()
        .domain([0, 50])
        .range([0, courtHeight]);

    // 颜色 字典
    let colorDict = {
        '1610612744': '#af3118',
        '1610612740': '#2c50d2',
    };


    let g_heat = d3.select('#svg_court')
        .append('g');

    // 遍历 每一个 回合
    for (let i = 0; i < data.length; i++) {
        // 得到回合
        let roundData = data[i],
            quarterIndex = data.quarterIndex,
            roundIndex = data.roundIndex;
        // 得到 回合内的节点和连接
        let nodes = roundData.nodes,
            links = roundData.links;
        console.log(nodes[1])
        // 画节点热力图
        for (let j = 0; j < nodes.length; j++) {
            // 得到节点
            let node = nodes[j];
            // 如果节点 是 球，不进行操作
            if (node.nodeId === -1) {
                continue;
            }
            // 位置节点的热力图 连接位置的 热力图
            let positionCell = node.positionCell,
                linkPositionCell = node.linkPositionCell;
            // 取得 位置节点 max值 连接位置的 max值
            let positionMax = d3.max(positionCell.map(d => d.num));
            let linkPositionMax = d3.max(linkPositionCell.map(d => d.num));
            let opacityScaleV1 = d3.scaleLinear()
                .domain([0, positionMax])
                .range([0, 0.8]);
            let linkOpacityScaleV1 = d3.scaleLinear()
                .domain([0, linkPositionMax])
                .range([0, 0.8]);
            console.log(positionMax, linkPositionMax);

            // 画 节点 位置 热力 图
            let g1 = g_heat.append('g')
                .attr('id', 'g_heat_node_' + node.nodeId)
                .attr('class', 'g_heat_team_node_' + node.teamId + ' ' + 'node_heatmap')
            // .attr('class', 'node_heatmap');

            g1.selectAll('r')
                .data(positionCell)
                .enter()
                .append('rect')
                .attr('class', 'node_position_heatmap')
                .attr('x', d => x(d.x * 9.4))
                .attr('y', d => y(d.y * 5))
                .attr('width', x(9.4))
                .attr('height', y(5))
                .attr('fill', colorDict['' + node.teamId])
                .attr('opacity', d => opacityScaleV1(d.num));

            g1.selectAll('r')
                .data(linkPositionCell)
                .enter()
                .append('rect')
                .attr('class', 'node_link_position_heatmap')
                .attr('x', d => x(d.x * 9.4))
                .attr('y', d => y(d.y * 5))
                .attr('width', x(9.4))
                .attr('height', y(5))
                .attr('fill', colorDict['' + node.teamId])
                .attr('opacity', d => linkOpacityScaleV1(d.num));
        }
        // 把所有的 节点 给 透明度 设置为 1
        d3.selectAll('.heatmap')
            .style('opacity', 0);
        // // 画连接 热力图
        // console.log(links[1])
        //  for (let j = 0; j < links.length; j++) {
        //      // 得到节点
        //      let link = links[j];
        //
        //      // 画 节点 位置 热力 图
        //     let g1 = g_heat.append('g')
        //         .attr('id', 'g_heat_link_' + node.nodeId)
        //         .attr('class', 'g_heat_team_link_' + node.teamId)
        //         .attr('class', 'link_heatmap');
        //
        //  }
    }

}


function generateJerseyMap(data) {
    let jerseyMap = {};
    let homeTeam = data.homeTeam,
        visitorTeam = data.visitorTeam;
    jerseyMap[homeTeam.teamid.toString()] = {}
    jerseyMap[visitorTeam.teamid.toString()] = {}
    homeTeam.players.forEach(function (d) {
        d.teamId = homeTeam.teamid;
        d.teamAbbr = homeTeam.abbreviation;
        jerseyMap[homeTeam.teamid.toString()][d.playerid.toString()] = d;
    })
    visitorTeam.players.forEach(function (d) {
        d.teamId = visitorTeam.teamid;
        d.teamAbbr = visitorTeam.abbreviation;
        jerseyMap[visitorTeam.teamid.toString()][d.playerid.toString()] = d;
    })
    console.log(jerseyMap)
    return jerseyMap
}