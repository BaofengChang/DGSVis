// 画 矩阵 视图
function drawMatrixV2(gameID = '0021500003') {

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
                svgHeight = 1250;

            // svg 画布
            let svg = d3.select('#matrix-container')
                .append('svg')
                .attr('id', 'svg-gameGraph')
                .attr('width', svgWidth)
                .attr('height', svgHeight)
                .style('background-color', '#fafafa');
            // 比赛的 画布 便宜 5,5

            drawGameMatrixV2(svg, result.gameGraphData)

        },
        complete: function () {
            // console.log('绘制 比赛图 完毕');
        }
    })
}


// 在g上画比赛图，数据是gameGraphData
function drawGameMatrixV2(svg, gameGraphData) {
    console.log('开始画表示整场比赛的矩阵');
    // console.log('整场比赛的数据', gameGraphData);

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
            name: player.firstname + ' ' + player.lastname,
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
            teamID: gameGraphData.visitorTeam.teamid,
            teamDes: 'visitor',
            name: player.firstname + ' ' + player.lastname,
            position: player.position,
            jersey: player.jersey
        };
    }
    // console.log('得到运动员的ID', playerMap);
    // 得到节点数据和连接数据
    let nodes = gameGraphData.data.nodes,
        links = gameGraphData.data.links;

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
    })
    // 球队颜色
    let teamColor = {
        'home': '#AE4537',
        'visitor': '#0E5FAB',
        'ball': '#b8931b'
    };
    // 节点 连接数量颜色比例尺
    let nodeLinkNumScale = d3.scaleLinear()
        .domain(d3.extent(nodes.map(function (d) {
            let quarterInfo = d.quarterInfo;
            let linkNum = 0;
            for (let quarter of quarterInfo) {
                linkNum += quarter.linkNum;
            }
            return linkNum
        })))
        .range(['#fdfdfd', '#ff0305']);
    // 节点 连接距离平均值颜色比例尺
    let nodeLinkDistanceAverageScale = d3.scaleLinear()
        .domain(d3.extent(nodes.map(function (d) {
            let quarterInfo = d.quarterInfo;
            let linkDistanceAverage = 0;
            for (let quarter of quarterInfo) {
                linkDistanceAverage += quarter.linkDisInfo[4];
            }
            return linkDistanceAverage / quarterInfo.length;
        })))
        .range(['#fdfdfd', '#ff0305']);
    // 节点 连接距离方差
    let nodeLinkDistanceVarianceScale = d3.scaleLinear()
        .domain(d3.extent(nodes.map(function (d) {
            let quarterInfo = d.quarterInfo;
            let linkDistanceVariance = 0;
            for (let quarter of quarterInfo) {
                linkDistanceVariance += quarter.linkDisInfo[0];
            }
            return linkDistanceVariance / quarterInfo.length;
        })))
        .range(['#fdfdfd', '#ff0305']);


    // 设置 矩形宽度
    let rectWidth = (d3.select('#svg-gameGraph').attr('height') - 20) / (nodes.length + 1); // 设置宽度
    // 建立要画gameGraph 的 g 节点
    let g = svg.append('g')
        .attr('id', 'g-gameGraph')
        .attr('transform', 'translate(' + 10 + ',' + 10 + ')');


    console.log('开始画球员节点-球员数据', nodes[1]);
    // 遍历节点 开始画节点的位置
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];  // 得到球员
        // 得到 颜色
        let textColor = teamColor[node.teamDes];
        // 设置 这个 节点 的偏移距离
        let translateLength = (i + 1) * rectWidth;
        // 首先是 画横向的节点
        // 添加一个 承载这个节点的 g
        let g_h_node = g.append('g')
            .datum(node)
            .attr('id', 'gameNode_h_' + node.ID)
            .attr('class', 'a b')
            .attr('transform', 'translate(' + translateLength + ',' + 0 + ')');
        g_h_node.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('rx', 0.05 * rectWidth)
            .attr('ry', 0.05 * rectWidth)
            .attr('width', rectWidth)
            .attr('height', rectWidth)
            .attr('fill','none')
            .attr('stroke','#646d75')
            .attr('stroke-width',  0.5)
            .attr('opacity', '0.3')


        // 设置第一个小矩形的 偏移距离 和 宽度 ------------------------------------------
        let firstRectTranslateDis = 0.2 * rectWidth,
            firstRectWidth = 0.275 * rectWidth;
        // 画第一个小矩形 用来 表示 号码
        g_h_node.append('rect')
            .attr('x', firstRectTranslateDis)
            .attr('y', firstRectTranslateDis)
            .attr('rx', 0.2 * firstRectWidth)
            .attr('ry', 0.2 * firstRectWidth)
            .attr('width', firstRectWidth)
            .attr('height', firstRectWidth)
            .attr('fill', textColor)
            .attr('stroke', '#646d75')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.7);
        // 添加文本 表示 这个球员号码
        g_h_node.append('text')
            .style('text-anchor', 'middle')
            .attr("x", firstRectTranslateDis + firstRectWidth / 2)
            .attr("y", firstRectTranslateDis + firstRectWidth / 2)
            .attr('dy', firstRectWidth * 0.5 * 0.5)
            .attr('font-size', firstRectWidth * 0.5)
            .attr('fill', '#000')
            .text(node.jersey)
            .style('pointer-events', 'none');

        // 设置第二个小矩形的 偏移距离 和 宽度 ------------------------------------------
        let secondRectTranslateXDis = 0.525 * rectWidth,
            secondRectTranslateYDis = 0.2 * rectWidth,
            secondRectWidth = 0.275 * rectWidth;
        // 画第二个小矩形 用来 表示 连接数量 和 位置
        g_h_node.append('rect')
            .datum(node)
            .attr('x', secondRectTranslateXDis)
            .attr('y', secondRectTranslateYDis)
            .attr('rx', 0.2 * secondRectWidth)
            .attr('ry', 0.2 * secondRectWidth)
            .attr('width', secondRectWidth)
            .attr('height', secondRectWidth)
            .attr('fill', function (d) {
                let quarterInfo = d.quarterInfo;
                let linkNum = 0;
                for (let quarter of quarterInfo) {
                    linkNum += quarter.linkNum;
                }
                return nodeLinkNumScale(linkNum);
            })
            .attr('stroke', '#646d75')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.8);
        // 添加文本 表示 这个球员 在 场上的 位置
        g_h_node.append('text')
            .style('text-anchor', 'middle')
            .attr("x", secondRectTranslateXDis + secondRectWidth / 2)
            .attr("y", secondRectTranslateYDis + secondRectWidth / 2)
            .attr('dy', secondRectWidth * 0.5 * 0.5)
            .attr('font-size', secondRectWidth * 0.5)
            .attr('fill', '#000')
            .text(node.position)
            .style('pointer-events', 'none');

        // 设置第三个小矩形的 偏移距离 和 宽度 ------------------------------------------
        let thirdRectTranslateXDis = 0.2 * rectWidth,
            thirdRectTranslateYDis = 0.525 * rectWidth,
            thirdRectWidth = 0.275 * rectWidth;
        // 画第三个小矩形 用来 表示 连接平均距离
        g_h_node.append('rect')
            .datum(node)
            .attr('x', thirdRectTranslateXDis)
            .attr('y', thirdRectTranslateYDis)
            .attr('rx', 0.2 * thirdRectWidth)
            .attr('ry', 0.2 * thirdRectWidth)
            .attr('width', thirdRectWidth)
            .attr('height', thirdRectWidth)
            .attr('fill', function (d) {
                // console.log(d)
                let quarterInfo = d.quarterInfo;
                let linkDistanceAverage = 0;
                for (let quarter of quarterInfo) {
                    linkDistanceAverage += quarter.linkDisInfo[0];
                }
                return nodeLinkDistanceAverageScale(linkDistanceAverage / quarterInfo.length);
            })
            .attr('stroke', '#646d75')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.9);

        // 设置第四个小矩形的 偏移距离 和 宽度 ------------------------------------------
        let forthRectTranslateXDis = 0.525 * rectWidth,
            forthRectTranslateYDis = 0.525 * rectWidth,
            forthRectWidth = 0.275 * rectWidth;
        // 画第四个小矩形 用来 表示 链接距离方差
        g_h_node.append('rect')
            .datum(node)
            .attr('x', forthRectTranslateXDis)
            .attr('y', forthRectTranslateYDis)
            .attr('rx', 0.2 * forthRectWidth)
            .attr('ry', 0.2 * forthRectWidth)
            .attr('width', forthRectWidth)
            .attr('height', forthRectWidth)
            .attr('fill', function (d) {
                let quarterInfo = d.quarterInfo;
                let linkDistanceVariance = 0;
                for (let quarter of quarterInfo) {
                    linkDistanceVariance += quarter.linkDisInfo[1];
                }
                return nodeLinkDistanceVarianceScale(linkDistanceVariance / quarterInfo.length);
            })
            .attr('stroke', '#646d75')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.9);

        // 纵向-----------------------------------------------------------
        let g_v_node = g.append('g')
            .attr('id', 'gameNode_v_' + node.ID)
            .attr('transform', 'translate(' + 0 + ',' + translateLength + ')');

        g_v_node.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('rx', 0.05 * rectWidth)
            .attr('ry', 0.05 * rectWidth)
            .attr('width', rectWidth)
            .attr('height', rectWidth)
            .attr('fill','none')
            .attr('stroke','#646d75')
            .attr('stroke-width',  0.5)
            .attr('opacity', '0.3')


        g_v_node.append('rect')
            .attr('x', firstRectTranslateDis)
            .attr('y', firstRectTranslateDis)
            .attr('rx', 0.2 * firstRectWidth)
            .attr('ry', 0.2 * firstRectWidth)
            .attr('width', firstRectWidth)
            .attr('height', firstRectWidth)
            .attr('fill', textColor)
            .attr('stroke', '#646d75')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.5);
        g_v_node.append('text')
            .style('text-anchor', 'middle')
            .attr("x", firstRectTranslateDis + firstRectWidth / 2)
            .attr("y", firstRectTranslateDis + firstRectWidth / 2)
            .attr('dy', firstRectWidth * 0.5 * 0.5)
            .attr('font-size', firstRectWidth * 0.5)
            .attr('fill', '#000')
            .text(node.jersey)
            .style('pointer-events', 'none');
        // 设置第二个小矩形的 偏移距离 和 宽度 ------------------------------------------
        // 画第二个小矩形 用来 表示 连接数量 和 位置
        g_v_node.append('rect')
            .datum(node)
            .attr('x', secondRectTranslateXDis)
            .attr('y', secondRectTranslateYDis)
            .attr('rx', 0.2 * secondRectWidth)
            .attr('ry', 0.2 * secondRectWidth)
            .attr('width', secondRectWidth)
            .attr('height', secondRectWidth)
            .attr('fill', function (d) {
                let quarterInfo = d.quarterInfo;
                let linkNum = 0;
                for (let quarter of quarterInfo) {
                    linkNum += quarter.linkNum;
                }
                return nodeLinkNumScale(linkNum);
            })
            .attr('stroke', '#646d75')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.8);
        // 添加文本 表示 这个球员 在 场上的 位置
        g_v_node.append('text')
            .style('text-anchor', 'middle')
            .attr("x", secondRectTranslateXDis + secondRectWidth / 2)
            .attr("y", secondRectTranslateYDis + secondRectWidth / 2)
            .attr('dy', secondRectWidth * 0.5 * 0.5)
            .attr('font-size', secondRectWidth * 0.5)
            .attr('fill', '#000')
            .text(node.position)
            .style('pointer-events', 'none');
        // 设置第三个小矩形的 偏移距离 和 宽度 ------------------------------------------
        // 画第三个小矩形 用来 表示 连接平均距离
        g_v_node.append('rect')
            .datum(node)
            .attr('x', thirdRectTranslateXDis)
            .attr('y', thirdRectTranslateYDis)
            .attr('rx', 0.2 * thirdRectWidth)
            .attr('ry', 0.2 * thirdRectWidth)
            .attr('width', thirdRectWidth)
            .attr('height', thirdRectWidth)
            .attr('fill', function (d) {
                // console.log(d)
                let quarterInfo = d.quarterInfo;
                let linkDistanceAverage = 0;
                for (let quarter of quarterInfo) {
                    linkDistanceAverage += quarter.linkDisInfo[0];
                }
                return nodeLinkDistanceAverageScale(linkDistanceAverage / quarterInfo.length);
            })
            .attr('stroke', '#646d75')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.9);

        // 设置第四个小矩形的 偏移距离 和 宽度 ------------------------------------------
        // 画第四个小矩形 用来 表示 链接距离方差
        g_v_node.append('rect')
            .datum(node)
            .attr('x', forthRectTranslateXDis)
            .attr('y', forthRectTranslateYDis)
            .attr('rx', 0.2 * forthRectWidth)
            .attr('ry', 0.2 * forthRectWidth)
            .attr('width', forthRectWidth)
            .attr('height', forthRectWidth)
            .attr('fill', function (d) {
                let quarterInfo = d.quarterInfo;
                let linkDistanceVariance = 0;
                for (let quarter of quarterInfo) {
                    linkDistanceVariance += quarter.linkDisInfo[1];
                }
                return nodeLinkDistanceVarianceScale(linkDistanceVariance / quarterInfo.length);
            })
            .attr('stroke', '#646d75')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.9);
    }

    // 开始 画连接 数据
    console.log('开始 画 连接 数据', links[0]);
    // 设置 表示 连接宽度的 比例尺
    let linkNumScale = d3.scaleLinear()
        .domain(d3.extent(links.map(d => d.linkNum)))
        .range([0.1 * rectWidth, 0.6 * rectWidth]);
    let linkColor = {
        'withBall': '#ae7a44',
        'withTeam': '#0fd234',
        'withOpponent': '#cc0a0d'
    };


    // console.log(playerMap)

    for (let i = 0; i < links.length; i++) {
        // 得到 连接 以及这个连接的 起点 和 终点
        let link = links[i],
            sID = link.s,
            tID = link.t;


        // 代表连接的小方块的宽度
        let linkRectWidth = 0.6 * rectWidth;

        // 得到 横向 偏移距离 和 纵向 偏移距离
        let translateX = parseFloat(d3.select('#gameNode_h_' + sID).attr('transform').replace(/[^0-9\-,.]/g,'').split(',')[0]);
        let translateY = parseFloat(d3.select('#gameNode_v_' + tID).attr('transform').replace(/[^0-9\-,.]/g,'').split(',')[1]);

        // 画横向的 方块
        let g_v_link = g.append('g')
            .datum(link)
            .attr('id', 'gameLink_v_' + sID + 'to' + tID)
            .attr('transform', 'translate(' + translateX + ',' + translateY + ')');
        g_v_link.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('rx', 0.05 * rectWidth)
            .attr('ry', 0.05 * rectWidth)
            .attr('width', rectWidth)
            .attr('height', rectWidth)
            .attr('fill','none')
            .attr('stroke','#646d75')
            .attr('stroke-width',  0.5)
            .attr('opacity', '0.3')
        //     .on('mouseover', function (d) {
        //         $(this).toggle();
        //     })
        //     .on('mouseout', function (d) {
        //         $(this).toggle();
        //     })
        g_v_link.append('rect')
            .datum(link)
            .attr('x', function (d) {
                // return 0.2 * rectWidth
                return (rectWidth - linkNumScale(d.linkNum)) / 2
            })
            .attr('y', function (d) {
                // return 0.2 * rectWidth
                return (rectWidth - linkNumScale(d.linkNum)) / 2
            })
            .attr('rx', 0.05 * linkRectWidth)
            .attr('ry', 0.05 * linkRectWidth)
            .attr('width', function (d) {
                // return linkRectWidth;
                return linkNumScale(d.linkNum);
            })
             .attr('height', function (d) {
                 // return linkRectWidth;
                return linkNumScale(d.linkNum);
            })
            .attr('fill', function (d) {
                if (d.s === -1 || d.t === -1){
                    return linkColor['withBall'];
                } else if (playerMap[sID.toString()].teamID === playerMap[tID.toString()].teamID){
                    return linkColor['withTeam'];
                } else {
                    return linkColor['withOpponent']
                }
            })
            .attr('stroke', '#646d75')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.9);

        // 画纵向的 方块
        let g_h_link = g.append('g')
            .datum(link)
            .attr('id', 'gameLink_h_' + sID + 'to' + tID)
            .attr('transform', 'translate(' + translateY + ',' + translateX + ')');
        g_h_link.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('rx', 0.05 * rectWidth)
            .attr('ry', 0.05 * rectWidth)
            .attr('width', rectWidth)
            .attr('height', rectWidth)
            .attr('fill','none')
            .attr('stroke','#646d75')
            .attr('stroke-width',  0.5)
            .attr('opacity', '0.3')
        //     .on('mouseover', function (d) {
        //         $(this).toggle();
        //     })
        //     .on('mouseout', function (d) {
        //         $(this).toggle();
        //     })
        // 添加 方块
        g_h_link.append('rect')
            .datum(link)
            .attr('x', function (d) {
                // return 0.2 * rectWidth
                return (rectWidth - linkNumScale(d.linkNum)) / 2
            })
            .attr('y', function (d) {
                // return 0.2 * rectWidth
                return (rectWidth - linkNumScale(d.linkNum)) / 2
            })
            .attr('rx', 0.05 * linkRectWidth)
            .attr('ry', 0.05 * linkRectWidth)
            .attr('width', function (d) {
                // return linkRectWidth;
                return linkNumScale(d.linkNum);
            })
             .attr('height', function (d) {
                // return linkRectWidth;
                return linkNumScale(d.linkNum);
            })
            .attr('fill', function (d) {
                if (d.s === -1 || d.t === -1){
                    return linkColor['withBall'];
                } else if (playerMap[sID.toString()].teamID === playerMap[tID.toString()].teamID){
                    return linkColor['withTeam'];
                } else {
                    return linkColor['withOpponent']
                }
            })
            .attr('stroke', '#646d75')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.9);
    }
}

