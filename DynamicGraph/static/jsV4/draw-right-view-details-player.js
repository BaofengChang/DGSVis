// 画细节视图里的球员
function draw_details_view_players(result) {

    console.log('画细节视图内的球员', result);

    // 得到 细节视图 的 svg
    let svg = d3.select('#svg-details');

    $('#svg-details').empty();
    svg.style('width', $('#div-details').width())
        .style('height', $('#div-details').height() - $('#details-diagram-name').height());

    // 获取宽度和高度
    let width = $('#svg-details').width(),
        height = $('#svg-details').height(),
        margin = {left: 10, top: 10, right: 10, bottom: 10};


    // 取得 细节 数据 和 汇总 数据
    let summary = result.summary,
        playerMap = result['playerMap'];

    // 设置承载 球员的 g节点
    let g = svg.append('g')
        .attr('id', 'details-player');

    let players = summary.nodes;

    // 设置基础元素
    let x = 30;

    let r = 15;
    let fillColorMap = {
        'home': '#e6421c',
        'visitor': '#1d70fb'
    };

    let nodes = [];
    // 画球员
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        if (player['playerId'] === -1) {
            continue;
        }
        nodes.push(player);
    }
    let yStep = height / (nodes.length + 1);
    nodes.forEach(function (node, i) {
        let y = yStep * (i + 1);
        let nodeID = node['playerId'];
        let nodeColor = fillColorMap[playerMap[nodeID.toString()]['teamDes']];
        let jersey = playerMap[nodeID.toString()]['jersey'];
        g.append('circle')
            .datum(node)
            .attr('class', 'details-player')
            .attr('id', 'details-player-' + nodeID)
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', r)
            .attr('fill', nodeColor)
            .style('stroke', '#000')
            .style('stroke-width', 0)
            .attr('opacity', 0.7)
            .on('click', playerClickInDetails)
            .on('mouseover', playerMouseoverInDetails)
            .on('mouseout', playerMouseoutInDetails);

        g.append('text')
            .style('text-anchor', 'middle')
            .attr("x", x)
            .attr("y", y)
            .attr('dy', 8)
            .attr('class', 'jersey')
            .text(jersey)
            .style('font-size', 20)
            .attr('opacity', 0.7)
            .style('pointer-events', 'none');

    })
}


// 球员的鼠标事件
function playerClickInDetails() {
    console.log('在细节视图，点击球员');
    let clicked = d3.select(this).attr('clicked');
    d3.selectAll('.details-line').style('opacity', 0);
    d3.selectAll('.details-link').style('opacity', 0);
    // 得到球员id
    let pid = d3.select(this).attr('id').split('-')[2];
    d3.select('#svg-court').selectAll('.court_player')
        .style('opacity', 0.2);
    d3.select('#svg-court').selectAll('.court_link')
        .style('opacity', 0.0);
    d3.select('#svg-court').selectAll('.court_path')
        .style('opacity', 0.0);


    // console.log(clicked)
    if (clicked === 'true') {
        // 执行 消除 事件
        d3.select(this).attr('clicked', 'false');
        d3.select(this)
            .style('stroke-width', 0);
        d3.selectAll('.details-line').style('opacity', 1);

        d3.select('#svg-court').selectAll('.court_player')
            .style('opacity', 0.7);
        d3.select('#svg-court').selectAll('.court_link')
            .style('opacity', 0.3);
        d3.select('#svg-court').selectAll('.court_path')
            .style('opacity', 0.0);


    } else {
        d3.select(this).attr('clicked', 'true');
        d3.select(this)
            .style('stroke-width', 3);
        // 执行操作
        d3.selectAll('.details-player').each(function (d, i) {
            console.log(d, i);
            let playerID = d['playerId'];
            let playerCircleID = '#details-player-' + d['playerId'];
            let isClicked = d3.select(playerCircleID).attr('clicked');
            if (isClicked === 'true') {
                d3.selectAll('.speed-' + playerID).transition().duration(500).style('opacity', 1);
                d3.selectAll('.degree-' + playerID).transition().duration(500).style('opacity', 1);
                d3.selectAll('.link-' + playerID).transition().duration(500).style('opacity', 1);
                d3.selectAll('.player-speed-' + playerID).transition().duration(500).style('opacity', 1);
                d3.selectAll('.speed-degree-' + playerID).transition().duration(500).style('opacity', 1);
                d3.selectAll('.degree-link-' + playerID).transition().duration(500).style('opacity', 1);

                d3.selectAll('.summary-speed-' + playerID).transition().duration(500).style('opacity', 1);
                d3.selectAll('.summary-degree-' + playerID).transition().duration(500).style('opacity', 1);
                d3.selectAll('.summary-link-' + playerID).transition().duration(500).style('opacity', 1);

                d3.selectAll('.player-speed-' + playerID).transition().duration(500).style('opacity', 1);
                d3.selectAll('.player-degree-' + playerID).transition().duration(500).style('opacity', 1);
                d3.selectAll('.player-link-' + playerID).transition().duration(500).style('opacity', 1);

                d3.select('#svg-court').selectAll('.court_player-' + playerID)
                    .transition().duration(500)
                    .style('opacity', 0.7);
                d3.select('#svg-court').selectAll('.court_path-' + playerID)
                    .transition().duration(500)
                    .style('opacity', 1);
                d3.select('#svg-court').selectAll('.court_link-' + playerID)
                    .transition().duration(500)
                    .style('opacity', 0.3);
            }
        });
    }
}


function playerMouseoverInDetails() {
    d3.select(this)
        .transition()
        .duration(50)
        .style('opacity', 0.2);

}

function playerMouseoutInDetails() {
    d3.select(this)
        .transition()
        .duration(50)
        .style('opacity', 0.7)
}


// 得到某一个属性的取值范围
function getExtentValue(data, key) {
    let dataList = [];
    for (let e of data) {
        // 过滤篮球数据
        if (e['teamId'] === -1) {
            continue;
        }
        let timeData = e['timeData'];
        for (let t of timeData) {
            dataList.push(t[key]);
        }
    }
    return d3.extent(dataList);
}

// 得到 度 的 范围
function getDegreeExtent(data, key) {
    let dataList = [];
    for (let e of data) {
        // 过滤篮球数据
        if (e['teamId'] === -1) {
            continue;
        }
        let timeData = e['timeData'];
        for (let t of timeData) {
            // console.log(t[key]);
            dataList.push(t[key].length);
        }
    }
    return d3.extent(dataList);
}

function getLinkDisExtentValue(data, key) {
    let dataList = [];
    for (let e of data) {
        // 过滤篮球数据
        if (e['s'] === -1) {
            continue;
        }
        let timeData = e['timeData'];
        for (let t of timeData) {
            dataList.push(t[key]);
        }
    }
    return d3.extent(dataList);
}