function draw_left_view_matrix() {
    //取得 选中的 比赛 id
    let gameID = $('#select-gameID option:selected').val();
    //首先获取svgdiv的宽度 和 长度
    let divWidth = $('#matrix-scatter').width(),
        divHeight = $('#matrix-scatter').height();
    //设置svg的长宽高
    let svg = d3.select('#svg-matrix')
        .style('height', divWidth)
        .style('width', divWidth);
    $.ajax({
        url: '/getPlayerData/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
        },
        beforeSend: function () {
            // console.log('加载数据, 这里会弹出一个 框 让用户等待');
        },
        success: function (result, error) {
            console.log('得到矩阵图数据', result)

            //  每次初始化 都把这个 svg 置空
            svg.empty();


            // 设置 球员 g 的高度 和 宽度
            let width = divWidth,
                height = divWidth,
                margin = {left: 20, top: 20, right: 20, bottom: 20};


            // 在 画布上 添加 g 容器 承载 球员
            let gPlayers = svg.append('g');
            // .append('g')
            // .attr('id', 'g-game-players')
            // .attr('viewBox', [0, 0, width, height])
            // .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

            // 要画的数据
            let homePlayers = sortPlayerListV2(result.nodes.home),
                visitorPlayers = sortPlayerListV2(result.nodes.visitor),
                links = result.links;
            // 得到球员数据
            let players = homePlayers.concat(visitorPlayers);
            console.log(players[0]);

            // 建立比例尺
            let x = d3.scaleLinear()
                .domain([0, players.length])
                .range([margin.left, width - margin.right]);
            let y = d3.scaleLinear()
                .domain([0, players.length])
                .range([margin.top, width - margin.bottom]);
            // 设置颜色 字典
            let colorDict = {
                'home': '#e6421c',
                'visitor': '#1d70fb'
            };

            // 画上 水平方向的 球员
            gPlayers.selectAll('players')
                .data(players)
                .enter()
                .append('circle')
                .attr('id', function (d) {
                    return 'left-p-h-' + d.playerid;
                })
                .attr('cx', function (d, i) {
                    return x(i + 1);
                })
                .attr('cy', y(0))
                .attr('r', 10)
                .attr('fill', d => colorDict[d.teamDes])
                .style('stroke-width', function (d) {
                    return 0;
                    if (d.isSp === 1) {
                        return 3;
                    } else {
                        return 0;
                    }
                })
                .style('stroke', '#f5ca24')
                .style('opacity', 0.8)
                .on('mouseover', playerMouseover)
                .on('mouseout', playerMouseout)
                .on('click', clickPlayers);
            // 画上 垂直方向上的 球员
            gPlayers.selectAll('players')
                .data(players)
                .enter()
                .append('circle')
                .attr('id', function (d) {
                    return 'left-p-v-' + d.playerid;
                })
                .attr('cx', x(0))
                .attr('cy', function (d, i) {
                    return y(i + 1);
                })
                .attr('r', 10)
                .attr('fill', d => colorDict[d.teamDes])
                .style('stroke-width', function (d) {
                    return 0;
                    if (d.isSp === 1) {
                        return 3;
                    } else {
                        return 0;
                    }
                })
                .style('stroke', '#f5ca24')
                .style('opacity', 0.8)
                .on('mouseover', playerMouseover)
                .on('mouseout', playerMouseout)
                .on('click', clickPlayers);

            // 画球衣
            gPlayers.selectAll('home players')
                .data(players)
                .enter()
                .append('text')
                .style('text-anchor', 'middle')
                .attr("x", function (d, i) {
                    return x(i + 1);
                })
                .attr("y", y(0))
                .attr('dy', 6)
                .attr('class', 'jersey')
                .text(d => d.jersey)
                .style('font-size', 15)
                .style('pointer-events', 'none');

            gPlayers.selectAll('home players')
                .data(players)
                .enter()
                .append('text')
                .style('text-anchor', 'middle')
                .attr("x", x(0))
                .attr("y", function (d, i) {
                    return y(i + 1);
                })
                .attr('dy', 6)
                .attr('class', 'jersey')
                .text(d => d.jersey)
                .style('pointer-events', 'none');

            // 矩阵内 表示连接的矩形的宽度
            let rect = x(1) - x(0);
            // 建立矩形宽度的比例尺
            let wScale = d3.scaleLinear()
                .domain(d3.extent(links.map(d => d.linkNum)))
                .range([5, rect - 2]);


            for (let i = 0; i < links.length; i++) {
                let link = links[i];
                let sID = link.s,
                    tID = link.t,
                    sIDStr = '#left-p-h-' + link.s,
                    tIDStr = '#left-p-v-' + link.t,
                    linkNum = link.linkNum,
                    fill_opacity = 0.3,
                    w = wScale(linkNum);

                // 设置填充颜色
                let linkColor = '#ccc';
                let sc = gPlayers.select(sIDStr).attr('fill'),
                    tc = gPlayers.select(tIDStr).attr('fill');
                if (sc === tc) {
                    linkColor = '#0a9f10'
                } else {
                    linkColor = '#e6b80e'
                }


                let sx = parseFloat(gPlayers.select(sIDStr)
                    .attr('cx')) - w / 2;
                let ty = parseFloat(gPlayers.select(tIDStr)
                    .attr('cy')) - w / 2;

                gPlayers.append('rect')
                    .datum(link)
                    .attr('class', 'x-' + parseInt(sx + w / 2) + ' y-' + parseInt(ty + w / 2) + ' left-link s-' + sID + ' t-' + tID + ' left-' + sID + 'to' + tID)
                    .attr('x', sx)
                    .attr('y', ty)
                    .attr('rx', 2)
                    .attr('ry', 2)
                    .attr('width', w)
                    .attr('height', w)
                    .attr('fill', linkColor)
                    .attr('opacity', 0.8)
                    .on('mouseover', linkMouseover)
                    .on('mouseout', linkMouseout)
                    .on('click', clickLinks);

                gPlayers.append('rect')
                    .datum(link)
                    .attr('class', 'x-' + parseInt(ty + w / 2) + ' y-' + parseInt(sx + w / 2) + ' left-link s-' + sID + ' t-' + tID + ' left-' + sID + 'to' + tID)
                    .attr('x', ty)
                    .attr('y', sx)
                    .attr('rx', 2)
                    .attr('ry', 2)
                    .attr('width', w)
                    .attr('height', w)
                    .attr('fill', linkColor)
                    .attr('opacity', 0.8)
                    .on('mouseover', linkMouseover)
                    .on('mouseout', linkMouseout)
                    .on('click', clickLinks);
            }


        }
    })
}

function clickPlayers() {
    console.log('点击矩阵视图球员');
    // console.log(d3.select(this).datum())
    // console.log(d3.select(this).attr('clicked'))
    let clicked = d3.select(this).attr('clicked');
    // console.log(clicked, typeof clicked)

    let svg = d3.select('#svg-scatter');
    svg.selectAll('circle')
        .classed('selected', false)
        .style('r', 1);


    if (clicked === 'true') {
        d3.select('#svg-matrix')
            .selectAll('circle')
            .attr('clicked', false)
            .style('stroke-width', 0);
        d3.select('#svg-matrix')
            .selectAll('rect')
            .attr('clicked', false)
            .style('stroke-width', 0);
        d3.select(this).attr('clicked', false);
        console.log('点击之后')
        // 取得 这个 id值
        // let playerid = d3.select(this).datum().playerid;
        // d3.select(this)
        //     .style('stroke-width', 0);

    } else {

        d3.select('#svg-matrix')
            .selectAll('circle')
            .attr('clicked', false)
            .style('stroke-width', 0);
        d3.select('#svg-matrix')
            .selectAll('rect')
            .attr('clicked', false)
            .style('stroke-width', 0);

        d3.select(this).attr('clicked', true);
        // console.log('点击')

        // d3.select('#svg-scatter')
        //     .selectAll('circle')
        //     .classed('selected', false)
        //     .attr('r', 1);


        //  取得 选中的 比赛 id
        let gameID = $('#select-gameID option:selected').val();
        // 取得 这个 球员 id值
        let playerID = d3.select(this).datum().playerid;
        let playerCircleID = '#' + d3.select(this).attr('id');
        d3.select(this)
            .transition()
            .duration(200)
            .style('stroke', '#000')
            .style('stroke-width', 3);
        // 高亮节点
        highlight_time_by_player(gameID, playerID, playerCircleID);
    }
    // let gameID = $('#select-gameID option:selected').val();
    // // 取得 这个 球员 id值
    // let playerID = d3.select(this).datum().playerid;
    // let playerCircleID = '#' + d3.select(this).attr('id');
    // // 高亮节点
    // highlight_time_by_player(gameID, playerID, playerCircleID);

}

function highlight_time_by_player(gameID, playerID, playerCircleID) {
    $.ajax({
        url: '/getPlayerTimeByID/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
            playerid: playerID
        },
        beforeSend: function () {
            // console.log('加载数据, 这里会弹出一个 框 让用户等待');
        },
        success: function (result, error) {
            // console.log(result);
            let svg = d3.select('#svg-scatter');
            result.forEach(function (d) {
                let timeNodeID = '#q-' + d[1] + '-r-' + d[3] + '-t-' + d[5];
                svg.select(timeNodeID)
                    .classed('selected', true)
                    .transition()
                    .duration(200)
                    .style('r', 3);
            })
        }
    })
}

// 单击左侧视图的连接
function clickLinks() {
    let clicked = d3.select(this).attr('clicked');
    let svg = d3.select('#svg-scatter');
    svg.selectAll('circle')
        .classed('selected', false)
        .style('r', 1);
    // console.log(clicked, typeof clicked)
    if (clicked === 'true') {
        d3.select(this).attr('clicked', false);
        d3.select('#svg-matrix')
            .selectAll('circle')
            .attr('clicked', false)
            .style('stroke-width', 0);
        d3.select('#svg-matrix')
            .selectAll('rect')
            .attr('clicked', false)
            .style('stroke-width', 0);
        d3.select(this).attr('clicked', false);
    } else {
        d3.select('#svg-matrix')
            .selectAll('circle')
            .attr('clicked', false)
            .style('stroke-width', 0);
        d3.select('#svg-matrix')
            .selectAll('rect')
            .attr('clicked', false)
            .style('stroke-width', 0);

        d3.select(this).attr('clicked', true);
        // console.log('点击')
        //  取得 选中的 比赛 id
        let gameID = $('#select-gameID option:selected').val();
        // 取得 这个 球员 id值
        let sid = d3.select(this).datum().s;
        let tid = d3.select(this).datum().t;
        let linkx = parseFloat(d3.select(this).attr('x')) + parseFloat(d3.select(this).attr('width')) / 2;
        let linky = parseFloat(d3.select(this).attr('y')) + parseFloat(d3.select(this).attr('width')) / 2;
        let playerCircleID = '#' + d3.select(this).attr('id');

        d3.select(this)
            .transition()
            .duration(200)
            .style('stroke', '#000')
            .style('stroke-width', 3);

        // 画回合到节点的连线
        highlight_line_from_link_to_time(gameID, sid, tid, linkx, linky)

    }
}


function highlight_line_from_link_to_time(gameID, sid, tid, linkx, linky) {
    // console.log(gameID, typeof gameID, playerid, typeof playerid)
    $.ajax({
        url: '/getLinkTimeByID/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
            sid: sid,
            tid: tid
        },
        beforeSend: function () {
            // console.log('加载数据, 这里会弹出一个 框 让用户等待');
        },
        success: function (result, error) {
            // $('#matrix-container').empty();
            // todo: 在这里执行关掉等待页面响应的操作
            let svg = d3.select('#svg-scatter');
            result.forEach(function (d) {
                let timeNodeID = '#q-' + d[1] + '-r-' + d[3] + '-t-' + d[5];
                svg.select(timeNodeID)
                    .classed('selected', true)
                    .transition()
                    .duration(200)
                    .style('r', 3);
            })
        }
    })
}


// 连接的鼠标事件
function linkMouseover() {
    d3.select(this)
    // .transition()
    // .duration(50)
        .style('opacity', 0.2);
    let x = parseFloat(d3.select(this).attr('x'));
    let y = parseFloat(d3.select(this).attr('y'));
    let w = parseFloat(d3.select(this).attr('width'));
    d3.selectAll('.left-link')
        .transition()
        .duration(200)
        .style('opacity', 0.2);
    d3.selectAll('.x-' + parseInt(x + w / 2))
        .transition()
        .duration(200)
        .style('opacity', 0.8)
    d3.selectAll('.y-' + parseInt(y + w / 2))
        .transition()
        .duration(200)
        .style('opacity', 0.8)
}

function linkMouseout() {
    d3.selectAll('.left-link')
        .transition()
        .duration(200)
        .style('opacity', 0.8)
}

// 球员的鼠标事件
function playerMouseover() {
    d3.select(this)
        .transition()
        .duration(50)
        .style('opacity', 0.3);
    let id = d3.select(this).datum().playerid;
    d3.selectAll('.left-link')
        .transition()
        .duration(50)
        .style('opacity', 0.3)
    d3.selectAll('.s-' + id)
        .transition()
        .duration(50)
        .style('opacity', 0.8)
    d3.selectAll('.t-' + id)
        .transition()
        .duration(50)
        .style('opacity', 0.8)

}

function playerMouseout() {
    d3.select(this)
        .transition()
        .duration(50)
        .style('opacity', 0.8)
    d3.selectAll('.left-link')
        .transition()
        .duration(50)
        .style('opacity', 0.8)
}


function sortPlayerListV2(playerList) {
    let positionString = 'b G G-F F F-C C';
    playerList = playerList.sort(function (a, b) {
        let aisSp = a.isSp,
            bisSp = b.isSp,
            aTeamDes = a.teamDes,
            bTeamDes = b.teamDes,
            aPosition = positionString.indexOf(a.position),
            bPosition = positionString.indexOf(b.position),
            aID = a.playerid,
            bID = b.playerid;

        if (aisSp < bisSp) {
            return 1;
        } else if (aisSp > bisSp) {
            return -1;
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
    return playerList
}