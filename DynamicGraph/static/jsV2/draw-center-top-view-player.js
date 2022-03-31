// 在上侧视图 画 球员
function draw_center_top_players(result) {
    let divWidth = $('#center-top').width(),
        divHeight = $('#center-top').height();
    // margin = {left: 10, top: 10, right: 10, bottom: 10};
    //    设置svg的长宽高
    let svg = d3.select('#svg-center-top')
        .style('width', divWidth)
        .style('height', divHeight);
    // 清空画时间轴的 图
    svg.select('#g-center-top-players').remove();


    // 设置宽度
    let width = divWidth,
        r = 15,
        margin = {left: 30, top: 10, right: 30, bottom: 10};

    let gCenterTopPlayers = svg.append('g')
        .attr('id', 'g-center-top-players')
        .attr('transform', 'translate(0,' + 270 + ')');

    // 要画的数据
    let homePlayers = sortPlayerListV3(result.nodes.home),
        visitorPlayers = sortPlayerListV3(result.nodes.visitor);
    let players = homePlayers.concat(visitorPlayers);

    // 设置颜色 字典
    let colorDict = {
        'home': '#e6421c',
        'visitor': '#1d70fb'
    };


    // 建立比例尺
    let x = d3.scaleLinear()
        .domain([1, players.length])
        .range([margin.left, width - margin.right]);

    // 画上 球员
    gCenterTopPlayers.selectAll('players')
        .data(players)
        .enter()
        .append('circle')
        .attr('id', function (d) {
            return 'center-top-' + d.playerid;
        })
        .attr('cx', function (d, i) {
            return x(i + 1);
        })
        .attr('cy', 0)
        .attr('r', r)
        .attr('fill', d => colorDict[d.teamDes])
        .style('stroke-width', function (d) {
            if (d.isSp === 1) {
                return 4;
            } else {
                return 0;
            }
        })
        .style('stroke', '#f5ca24')
        .style('opacity', 0.8)
        .on('mouseover', playerMouseoverInCenterTop)
        .on('mouseout', playerMouseoutInCenterTop)
        .on('click', centerTopPlayerClick);

    // 画球衣
    gCenterTopPlayers.selectAll('home players')
        .data(players)
        .enter()
        .append('text')
        .style('text-anchor', 'middle')
        .attr("x", function (d, i) {
            return x(i + 1);
        })
        .attr("y", 0)
        .attr('dy', 8)
        .attr('font-size', 19)
        .text(d => d.jersey)
        .style('pointer-events', 'none');

    // 鼠标 移动 事件
    function playerMouseoverInCenterTop() {
        d3.select(this)
            .transition()
            .duration(50)
            .style('opacity', 0.3);
    }

    function playerMouseoutInCenterTop() {
        d3.select(this)
            .transition()
            .duration(50)
            .style('opacity', 0.8)
    }

    function centerTopPlayerClick() {
        let clicked = d3.select(this).attr('clicked');
        // console.log(clicked, typeof clicked)
        if (clicked === 'true') {
            d3.select(this).attr('clicked', false);
            console.log('球员 删除')
            // 取得 这个 id值
            d3.selectAll('.g-eventType').selectAll('g').attr('opacity', 1);
            let playerid = d3.select(this).datum().playerid;
            d3.selectAll('#center-top-player-round-' + playerid).remove();
        } else {
            d3.select(this).attr('clicked', true);
            console.log('球员 添加');
            //  取得 选中的 比赛 id
            let gameID = $('#select-gameID option:selected').val();
            // 取得 这个 球员 id值
            let playerid = d3.select(this).datum().playerid;
            d3.selectAll('.g-eventType').selectAll('g').attr('opacity', 0);
            d3.selectAll('.g-eventType-player-' + playerid).attr('opacity', 1);
            // 添加 g
            let g = d3.select('#svg-center-top').append('g').attr('id', 'center-top-player-round-' + playerid);
            // 得到 偏移坐标
            let ptx = parseFloat(d3.select('#g-center-top-players').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[0]);
            let pty = parseFloat(d3.select('#g-center-top-players').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[1]);
            let rtx = parseFloat(d3.select('#g-center-top-round').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[0]);
            let rty = parseFloat(d3.select('#g-center-top-round').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[1]);
            let px = ptx + parseFloat(d3.select(this).attr('cx'));
            let py = pty + parseFloat(d3.select(this).attr('cy'));
            // 得到 球员出现在哪一个回合
            $.ajax({
                url: '/getPlayerRoundByID/',   // 得到 散点图 数据
                method: 'GET',
                timeout: 10000,  // 设置 延时函数
                data: {
                    gameID: gameID,  // 比赛ID
                    playerid: playerid
                },
                beforeSend: function () {
                    // console.log('加载数据, 这里会弹出一个 框 让用户等待');
                },
                success: function (result, error) {
                    // 回合便宜
                    for (let roundID of result) {
                        // console.log(roundID);
                        let quarter = '#g-center-top-quarter-' + roundID.split('-')[1];
                        let rtx2 = parseFloat(d3.select(quarter).attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[0]);
                        let rty2 = parseFloat(d3.select(quarter).attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[1]);
                        let rx = rtx + rtx2 + parseFloat(d3.select('#' + roundID).attr('x'))
                            + parseFloat(d3.select('#' + roundID).attr('width')) / 2;
                        let ry = rty + rty2 + parseFloat(d3.select('#' + roundID).attr('y'));

                        // 构建 path
                        let path = d3.path();
                        // path.moveTo(sx, sy);
                        // // path.bezierCurveTo(sx, 200)
                        // path.lineTo(ex, ey);

                        path.moveTo(px, py);

                        path.lineTo(rx, ry);
                        g.append('path')
                            .attr('d', path)
                            .attr('fill', 'none')
                            .attr('stroke', '#6a8281')
                            .attr('stroke-width', 0.5)
                            .attr('opacity', 0.3)
                            .style('point-events', 'none');
                    }


                }
            })
        }

    }
}


// 对球员排序
function sortPlayerListV3(playerList) {
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