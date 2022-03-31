// 画左边的视图
function init_left_view() {
    // 画视图边界
    draw_left_view_border();
    // 画 球员
    // draw_game_players_node_link();
    draw_game_players_matrix();

    // 画散点图
    draw_game_scatterplot();
}

// 画左边视图的边界
function draw_left_view_border() {
    //    首先获取svgdiv的宽度 和 长度
    let divWidth = $('#left').width(),
        divHeight = $('#left').height();

//    设置svg的长宽高
    let svg = d3.select('#svg-left')
        .style('height', divHeight)
        .style('width', divWidth);

    let rect1 = svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', divWidth)
        .attr('height', divWidth)
        .attr('rx', '10px')
        .attr('ry', '10px')
        .attr('class', 'rectBackground');

    let rect2 = svg.append('rect')
        .attr('x', 0)
        .attr('y', divWidth + 5)
        .attr('width', divWidth)
        .attr('height', divWidth - 255)
        .attr('rx', '10px')
        .attr('ry', '10px')
        .attr('class', 'rectBackground');

    let rect3 = svg.append('rect')
        .attr('x', 0)
        .attr('y', divWidth + 5 + divWidth - 250)
        .attr('width', divWidth)
        .attr('height', divWidth - 200 + 5)
        .attr('rx', '10px')
        .attr('ry', '10px')
        .attr('class', 'rectBackground');
}


function sortPlayerList(playerList) {
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
    return playerList
}

function draw_game_players_node_link() {
    //    首先获取svgdiv的宽度 和 长度
    let divWidth = $('#left').width(),
        divHeight = $('#left').height();
//    设置svg的长宽高
    let svg = d3.select('#svg-left')
        .style('height', divHeight)
        .style('width', divWidth);
//  取得 选中的 比赛 id
    let gameID = $('#select-gameID option:selected').val();
//  得到 比赛数据
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
            // $('#matrix-container').empty();
            // todo: 在这里执行关掉等待页面响应的操作
            console.log('接收到 球员 信息');
            console.log('异常信息', error, typeof error);
            console.log(result);
            let svg = d3.select('#svg-left');

            //  每次初始化 都把这个 svg 置空
            svg.select('#g-game-players').remove();

            // 设置 球员 g 的高度 和 宽度
            let width = divWidth,
                height = divHeight / 3,
                margin = {left: 20, top: 20, right: 20, bottom: 20};

            // 在 画布上 添加 g 容器 承载 球员
            let gPlayers = svg.append('g')
                .attr('id', 'g-game-players')
                .attr('viewBox', [0, 0, width, height])
                .attr('transform', 'translate(' + 0 + ',' + 0 + ')');
            // 要画的数据
            let homePlayers = sortPlayerList(result.nodes.home),
                visitorPlayers = sortPlayerList(result.nodes.visitor),
                links = result.links;

            // 设置颜色 字典
            let colorDict = {
                'home': '#e6421c',
                'visitor': '#1d70fb'

            };
            // 设置横向比例尺
            // 建立 横向的比例尺
            let x1 = d3.scaleLinear()
                .domain([0, homePlayers.length - 1])
                .range([margin.left + 20, width - margin.right - 20]);
            let x2 = d3.scaleLinear()
                .domain([0, visitorPlayers.length - 1])
                .range([margin.left + 20, width - margin.right - 20]);
            // 设置 高度
            let h1 = height / 4,
                h2 = 3 * height / 4;

            // 画球员
            gPlayers.selectAll('home players')
                .data(homePlayers)
                .enter()
                .append('circle')
                .attr('id', function (d) {
                    return 'left-p-' + d.playerid;
                })
                .attr('cx', function (d, i) {
                    return x1(i);
                })
                .attr('cy', h1)
                .attr('r', 15)
                .attr('fill', d => colorDict[d.teamDes])
                .style('stroke-width', function (d) {
                    if (d.isSp === 1) {
                        return 5;
                    } else {
                        return 0;
                    }
                })
                .style('stroke', '#f5ca24')
                .style('opacity', 0.8)
                .on('mouseover', playerMouseover)
                .on('mouseout', playerMouseout);

            // 画球员
            gPlayers.selectAll('home players')
                .data(visitorPlayers)
                .enter()
                .append('circle')
                .attr('id', function (d) {
                    return 'left-p-' + d.playerid;
                })
                .attr('cx', function (d, i) {
                    return x2(i);
                })
                .attr('cy', h2)
                .attr('r', 15)
                .attr('fill', d => colorDict[d.teamDes])
                .style('stroke-width', function (d) {
                    if (d.isSp === 1) {
                        return 5;
                    } else {
                        return 0;
                    }
                })
                .style('stroke', '#f5ca24')
                .style('opacity', 0.8)
                .on('mouseover', playerMouseover)
                .on('mouseout', playerMouseout);

            // 画球衣
            gPlayers.selectAll('home players')
                .data(homePlayers)
                .enter()
                .append('text')
                .style('text-anchor', 'middle')
                .attr("x", function (d, i) {
                    return x1(i);
                })
                .attr("y", h1)
                .attr('dy', 7)
                .attr('class', 'jersey')
                .text(d => d.jersey)
                .style('pointer-events', 'none');

            gPlayers.selectAll('home players')
                .data(visitorPlayers)
                .enter()
                .append('text')
                .style('text-anchor', 'middle')
                .attr("x", function (d, i) {
                    return x2(i);
                })
                .attr("y", h2)
                .attr('dy', 7)
                .attr('class', 'jersey')
                .text(d => d.jersey)
                .style('pointer-events', 'none');

            // 画 连接
            // 设置 连接 宽度 比例尺
            // 建立 连接宽度 比例尺
            let linkWidthScale = d3.scaleLinear()
                .domain(d3.extent(links.map(d => d.linkNum)))
                .range([0.5, 10]);

            for (let i = 0; i < links.length; i++) {
                let link = links[i];
                let sID = '#left-p-' + link.s,
                    tID = '#left-p-' + link.t,
                    linkNum = link.linkNum,
                    fill_opacity = 0.3;
                let sx = parseFloat(gPlayers.select(sID)
                    .attr('cx'));
                let sy = parseFloat(gPlayers.select(sID)
                    .attr('cy'));
                let tx = parseFloat(gPlayers.select(tID)
                    .attr('cx'));
                let ty = parseFloat(gPlayers.select(tID)
                    .attr('cy'));
            }


            console.log('home', homePlayers[0]);
            console.log('visitor', visitorPlayers[0]);
            console.log('link', links[0]);

        }
    })
}