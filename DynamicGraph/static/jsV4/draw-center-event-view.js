function init_center_top_view() {
    // console.log('初始化 左侧视图函数');
    draw_event_view();

    // draw_time_data_view();

}

function draw_time_data_view() {
    //取得 选中的 比赛 id
    let gameID = $('#select-gameID option:selected').val();
    //首先获取svgdiv的宽度 和 长度
    let divWidth = $('#div-event').width(),
        divHeight = $('#div-event').height();
    //设置svg的长宽高
    let svg = d3.select('#svg-event')
        .style('height', divHeight)
        .style('width', divWidth);

    $.ajax({
        url: '/getTimeLineData/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
        },
        beforeSend: function () {
            // console.log('加载数据, 这里会弹出一个 框 让用户等待');
        },
        success: function (result, error) {
            console.log('得到时间点数据', result[0]);
            let width = divWidth,
                height = 80,
                margin = {left: 10, top: 10, right: 10, bottom: 10};

            let dataLength = result.length;

            let xScale = d3.scaleLinear()
                .domain([0, dataLength])
                .range([margin.left, width - margin.right]);
            let nodeNumExtent = d3.extent(result.map(d => d[3]));
            let linkNumExtent = d3.extent(result.map(d => d[4]));
            let nodeSpeedExtent = d3.extent(result.map(d => d[5]));
            let nodeDegreeExtent = d3.extent(result.map(d => d[6]));
            let linkDisAveExtent = d3.extent(result.map(d => d[7]));
            console.log(nodeNumExtent)
            console.log(linkNumExtent)
            let y1 = d3.scaleLinear()
                .domain(nodeNumExtent)
                .range([height - 10, 0]);
            let y2 = d3.scaleLinear()
                .domain(linkNumExtent)
                .range([height - 10, 0]);
            let y3 = d3.scaleLinear()
                .domain(nodeSpeedExtent)
                .range([height, 0]);
            let y4 = d3.scaleLinear()
                .domain(nodeDegreeExtent)
                .range([height, 0]);
            let y5 = d3.scaleLinear()
                .domain(linkDisAveExtent)
                .range([height, 0]);

            let g = svg.append('g')
                .attr('id', 'g-time-line')
                .attr('transform', 'translate(0,' + (divHeight - 220) + ')');

            let line1 = d3.line()
                .x(function (d, i) {
                    return xScale(i);
                })
                .y(function (d) {
                    return y1(d[3])
                })
                .curve(d3.curveMonotoneX);
            let line2 = d3.line()
                .x(function (d, i) {
                    return xScale(i);
                })
                .y(function (d) {
                    return y2(d[4])
                })
                .curve(d3.curveMonotoneX);
            let line3 = d3.line()
                .x(function (d, i) {
                    return xScale(i);
                })
                .y(function (d) {
                    return y3(d[5])
                })
                .curve(d3.curveMonotoneX);
            let line4 = d3.line()
                .x(function (d, i) {
                    return xScale(i);
                })
                .y(function (d) {
                    return y4(d[6])
                })
                .curve(d3.curveMonotoneX);
            let line5 = d3.line()
                .x(function (d, i) {
                    return xScale(i);
                })
                .y(function (d) {
                    return y5(d[7])
                })
                .curve(d3.curveMonotoneX);

            let color = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00'];

            g.append('path')
                .attr('class', 'time-line-indicator')
                .attr('id', 'path-nodeNum')
                .attr('d', line1(result))
                .attr('fill', 'none')
                .style('stroke', color[0])
                .style('stroke-width', 2)
                .style('opacity', 0.0);
            g.append('path')
                .attr('class', 'time-line-indicator')
                .attr('id', 'path-linkNum')
                .attr('d', line2(result))
                .attr('fill', 'none')
                .style('stroke', color[1])
                .style('stroke-width', 2)
                .style('opacity', 0.0);
            g.append('path')
                .attr('class', 'time-line-indicator')
                .attr('id', 'path-nodeSpeed')
                .attr('d', line3(result))
                .attr('fill', 'none')
                .style('stroke', color[2])
                .style('stroke-width', 2)
                .style('opacity', 0.7);
            g.append('path')
                .attr('class', 'time-line-indicator')
                .attr('id', 'path-nodeDegree')
                .attr('d', line4(result))
                .attr('fill', 'none')
                .style('stroke', color[3])
                .style('stroke-width', 2)
                .style('opacity', 0.0);
            g.append('path')
                .attr('class', 'time-line-indicator')
                .attr('id', 'path-linkDis')
                .attr('d', line5(result))
                .attr('fill', 'none')
                .style('stroke', color[4])
                .style('stroke-width', 2)
                .style('opacity', 0.0);


            g.append('line')
                .attr('class', 'axis')
                .attr('x1', margin.left)
                .attr('y1', height)
                .attr('x2', width - margin.left + 5)
                .attr('y2', height)
                .style('stroke-width', 1)
                .attr('stroke', '#000000')
                .style('pointer-events', 'none');
            g.append('line')
                .attr('class', 'axis')
                .attr('x1', margin.left)
                .attr('y1', 0)
                .attr('x2', margin.left)
                .attr('y2', height)
                .style('stroke-width', 1)
                .attr('stroke', '#000000')
                .style('pointer-events', 'none');
            g.append('path')
                .attr('class', 'axis')
                .attr('d', generateArrowHorizontal(width - margin.left + 5, height))
                .style('stroke-width', 1)
                .attr('stroke', '#000000')
                .style('pointer-events', 'none')
                .attr('fill', 'none');
            g.append('path')
                .attr('class', 'axis')
                .attr('d', generateArrowVertical(margin.left, 0))
                .style('stroke-width', 1)
                .attr('stroke', '#000000')
                .style('pointer-events', 'none')
                .attr('fill', 'none');
            g.append('text')
                .attr('class', 'axis')
                .style('text-anchor', 'start')
                .attr('x', margin.left + 10)
                .attr('y', 5)
                .attr('font-size', 15)
                .attr('dy', 7)
                .style('pointer-events', 'none');
            g.append('text')
                .attr('class', 'axis')
                .style('text-anchor', 'end')
                .attr('x', width - margin.left)
                .attr('y', height + 10)
                .text('time')
                .attr('font-size', 15)
                .attr('dy', 7)
                .style('pointer-events', 'none');

            // 添加最后的小方块
            g.append('rect')
                .attr('id', 'button_path-nodeNum')
                .attr('x', width / 10)
                .attr('y', height + 10)
                .attr('rx', 5)
                .attr('ry', 5)
                .attr('width', 30)
                .attr('height', 20)
                .attr('fill', color[0])
                .attr('clicked', 'false')
                .style('stroke', '#314544')
                .style('stroke-width', '0')
                .on('mouseover', playerMouseoverInCenterTop)
                .on('mouseout', playerMouseoutInCenterTop)
                .on('click', score_button_click);
            g.append('text')
                .style('text-anchor', 'start')
                .attr('x', width / 10 + 35)
                .attr('y', height + 17)
                .text('Node Number')
                .attr('font-size', 15)
                .attr('dy', 8)
                .style('pointer-events', 'none');
            g.append('rect')
                .attr('id', 'button_path-linkNum')
                .attr('x', width / 10 * 3 - 70)
                .attr('y', height + 10)
                .attr('rx', 5)
                .attr('ry', 5)
                .attr('width', 30)
                .attr('height', 20)
                .attr('fill', color[1])
                .attr('clicked', 'false')
                .style('stroke', '#314544')
                .style('stroke-width', '0')
                .on('mouseover', playerMouseoverInCenterTop)
                .on('mouseout', playerMouseoutInCenterTop)
                .on('click', score_button_click);
            g.append('text')
                .style('text-anchor', 'start')
                .attr('x', width / 10 * 3 + 35 - 70)
                .attr('y', height + 17)
                .text('Link Number')
                .attr('font-size', 15)
                .attr('dy', 8)
                .style('pointer-events', 'none');
            g.append('rect')
                .attr('id', 'button_path-nodeSpeed')
                .attr('x', width / 10 * 5 - 140)
                .attr('y', height + 10)
                .attr('rx', 5)
                .attr('ry', 5)
                .attr('width', 30)
                .attr('height', 20)
                .attr('fill', color[2])
                .attr('clicked', 'true')
                .style('stroke', '#314544')
                .style('stroke-width', '4')
                .on('mouseover', playerMouseoverInCenterTop)
                .on('mouseout', playerMouseoutInCenterTop)
                .on('click', score_button_click);
            g.append('text')
                .style('text-anchor', 'start')
                .attr('x', width / 10 * 5 + 35 - 140)
                .attr('y', height + 17)
                .text('Node Average Speed')
                .attr('font-size', 15)
                .attr('dy', 8)
                .style('pointer-events', 'none');
            g.append('rect')
                .attr('id', 'button_path-nodeDegree')
                .attr('x', width / 10 * 7 - 150)
                .attr('y', height + 10)
                .attr('rx', 5)
                .attr('ry', 5)
                .attr('width', 30)
                .attr('height', 20)
                .attr('fill', color[3])
                .attr('clicked', 'false')
                .style('stroke', '#314544')
                .style('stroke-width', '0')
                .on('mouseover', playerMouseoverInCenterTop)
                .on('mouseout', playerMouseoutInCenterTop)
                .on('click', score_button_click);
            g.append('text')
                .style('text-anchor', 'start')
                .attr('x', width / 10 * 7 + 35 - 150)
                .attr('y', height + 17)
                .text('Node Average Degree')
                .attr('font-size', 15)
                .attr('dy', 8)
                .style('pointer-events', 'none');
            g.append('rect')
                .attr('id', 'button_path-linkDis')
                .attr('x', width / 10 * 9 - 150)
                .attr('y', height + 10)
                .attr('rx', 5)
                .attr('ry', 5)
                .attr('width', 30)
                .attr('height', 20)
                .attr('fill', color[4])
                .attr('clicked', 'false')
                .style('stroke', '#314544')
                .style('stroke-width', '0')
                .on('mouseover', playerMouseoverInCenterTop)
                .on('mouseout', playerMouseoutInCenterTop)
                .on('click', score_button_click);
            g.append('text')
                .style('text-anchor', 'start')
                .attr('x', width / 10 * 9 + 35 - 150)
                .attr('y', height + 17)
                .text('Link Average Distance')
                .attr('font-size', 15)
                .attr('dy', 8)
                .style('pointer-events', 'none');


            // const zoom = d3.zoom()
            //     .scaleExtent([1, 8])
            //     .extent([[0, divHeight - 120], [width, height]])
            //     .on("zoom", zoomed);
            // g.call(zoom);
            //
            // function zoomed() {
            //     let  transform = d3.event.transform;
            //
            //     // Zoom the circles
            //     let  xNewScale = transform.rescaleX(xScale);
            //     d3.select('#g-time-line')
            //         .selectAll('path')
            //         .attr('d', d3.line()
            //             .x(function (d, i) {
            //                 return xNewScale(i);
            //             }))
            // }

        }
    })
}


function draw_event_view() {
    console.log('画比分数据');
    //取得 选中的 比赛 id
    let gameID = $('#select-gameID option:selected').val();
    //首先获取svgdiv的宽度 和 长度
    let divWidth = $('#div-event').width(),
        divHeight = $('#div-event').height();
    //设置svg的长宽高
    let svg = d3.select('#svg-event')
        .style('height', divHeight)
        .style('width', divWidth);
    $.ajax({
        url: '/getScoreData/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
        },
        beforeSend: function () {
            console.log('加载数据, 这里会弹出一个 框 让用户等待');

        },
        success: function (result, error) {
            console.log('得到时间条数据');
            // $('#svg-event').empty();
            // // 得到 数据
            // let data = result.data;
            // console.log(result)
            // 画上 比分
            draw_game_score_event(result);

            // 画上 比赛类型
            draw_game_event_type(result);

            // 画上球员
            draw_game_player(result);

            // 画事件之间的连线
            draw_event_link_line(result)

        }
    })

}


// 画事件的连接线条
function draw_event_link_line(result) {
    console.log('事件数据', result);
    // 事件序列
    let eventList = result.data;

    let svg = d3.select('#svg-event');
    let g = svg.append('g');
    // 画线
    console.log(eventList[9]);
    eventList.forEach(function (event) {
        let eventType = event['eventType'];
        let majorPlayerID = event['majorPlayerID'];
        let majorPlayerTeamID = event['majorPlayerTeamID'];
        let secondPlayerID = event['secondPlayerID'];
        let secondPlayerTeamID = event['secondPlayerTeamID'];
        // 事件类型的id
        let eventTypeID = '#g-eventType-' + event['eventType'];
        // 球员id
        let mpID = '#center-top-' + event['majorPlayerID'],
            spID = '#center-top-' + event['secondPlayerID'];
        // 具体事件的wizhi
        let classLabel = '.e' + event.eventType + '.m' + event.majorPlayerID + '.s'
            + event.secondPlayerID + '.p' + event.period + '.pt' + event.periodTime;

        // 得到 时间轴上的偏移数据
        let stx = parseFloat(d3.select('#gGameScoreBox').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[0]);
        let sty = parseFloat(d3.select('#gGameScoreBox').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[1]);
        let etx = parseFloat(d3.select('#gGameEventType').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[0]);
        let ety = parseFloat(d3.select('#gGameEventType').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[1]);
        let ptx = parseFloat(d3.select('#g-center-top-players').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[0]);
        let pty = parseFloat(d3.select('#g-center-top-players').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[1]);

        // 得到得分数据
        let sx = stx + parseFloat(d3.select(classLabel).attr('cx'));
        let sy = sty + parseFloat(d3.select(classLabel).attr('cy'));
        // 得到 事件类型 的坐标
        let ex = etx + parseFloat(d3.select(eventTypeID).attr('x'));
        let ey = ety + parseFloat(d3.select(eventTypeID).attr('y'));
        let rectWidth = parseFloat(d3.select(eventTypeID).attr('width'));
        let rectHeight = parseFloat(d3.select(eventTypeID).attr('height'));
        // console.log('位置坐标', sx, sy, ex, ey, rectWidth, rectHeight)
        let path = bzpathV3(sx, sy, ex + rectWidth / 2, ey);
        g.append('path')
            .attr('d', path)
            .attr('class', 'eventLink eventType-' + eventType + ' majorPlayer-' + majorPlayerID + ' secondPlayerID-' + secondPlayerID)
            .style('fill', 'none')
            .style('stroke', '#3e3e3e')
            .style('stroke-width', 1)
            .attr('opacity', 0);

        if ($(mpID).length > 0) {
            // console.log(1)
            let cx = ptx + parseFloat(d3.select(mpID).attr('cx'));
            let cy = pty + parseFloat(d3.select(mpID).attr('cy'));
            let r = parseFloat(d3.select(mpID).attr('r'));
            let path1 = bzpathV3(ex + rectWidth / 2, ey + rectHeight, cx, cy - r);
            g.append('path')
                .attr('d', path1)
                .attr('class', 'eventLink eventType-' + eventType + ' majorPlayer-' + majorPlayerID + ' secondPlayerID-' + secondPlayerID)
                .style('fill', 'none')
                .style('stroke', '#ff2a32')
                .style('stroke-width', 1)
                .attr('opacity', 0);
        }
        if ($(spID).length > 0) {
            let cx = ptx + parseFloat(d3.select(spID).attr('cx'));
            let cy = pty + parseFloat(d3.select(spID).attr('cy'));
            let r = parseFloat(d3.select(spID).attr('r'));
            let path1 = bzpathV4(ex + rectWidth / 2, ey + rectHeight, cx, cy - r);
            g.append('path')
                .attr('d', path1)
                .attr('class', 'eventLink eventType-' + eventType + ' majorPlayer-' + majorPlayerID + ' secondPlayerID-' + secondPlayerID)
                .style('fill', 'none')
                .style('stroke', '#45d14a')
                .style('stroke-width', 1)
                .attr('opacity', 0);
        }
    })
}


// 画球员
function draw_game_player(result) {
    //画事件视图
    console.log('画节点类型视图');
    let divWidth = $('#div-event').width(),
        divHeight = $('#div-event').height();
    // 选中svg
    let svg = d3.select('#svg-event');

    // 设置宽度
    let width = divWidth,
        r = 15,
        margin = {left: 30, top: 10, right: 30, bottom: 10};

    let gCenterTopPlayers = svg.append('g')
        .attr('id', 'g-center-top-players')
        .attr('transform', 'translate(0,' + 360 + ')');

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

    // 画一个 底色 衬托
    let backgroundRect = gCenterTopPlayers.append('rect')
        .attr('x', 0)
        .attr('y', -25)
        .attr('width', width)
        .attr('height', 50)
        // .attr('rx', 10)
        // .attr('ry', 10)
        .attr('opacity', 0.5)
        .attr('fill', '#afc6c5')
        .style('pointer-events', 'none');

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
        // .style('stroke-width', function (d) {
        //     if (d.isSp === 1) {
        //         return 4;
        //     } else {
        //         return 0;
        //     }
        // })
        // .style('stroke', '#f5ca24')
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
}

// 画事件类型
function draw_game_event_type(result) {

    //画事件视图
    console.log('画事件类型视图');
    let divWidth = $('#div-event').width(),
        divHeight = $('#div-event').height();
    // 选中svg
    let svg = d3.select('#svg-event');

    // 清空画时间轴的 图
    svg.select('#gGameEventType').remove();

    let width = divWidth,
        height = 80,
        margin = {left: 10, top: 10, right: 10, bottom: 10};

    let gGameEventType = svg.append('g')
        .attr('id', 'gGameEventType')
        .attr('transform', 'translate(0,' + (140) + ')');

    // 得到 数据
    let data = result.data;
    // 得到 事件 数据
    let eventTypeDataList = sortEventsIntoEventTypeList(data);
    console.log(eventTypeDataList)

    // 设置 宽度 和 高度
    let rectWidth = 100,
        rectHeight = 30;
    // 设置比例尺
    let x = d3.scaleLinear()
        .domain([1, 10])
        .range([margin.left + 15, width]);
    // 设置 颜色 填充
    let color = d3.scaleOrdinal(d3.schemeCategory10);

    // 画一个 底色 衬托
    let backgroundRect = gGameEventType.append('rect')
        .attr('x', 0)
        .attr('y', 40)
        .attr('width', width)
        .attr('height', 50)
        // .attr('rx', 10)
        // .attr('ry', 10)
        .attr('opacity', 0.5)
        .attr('fill', '#afc6c5')
        .style('pointer-events', 'none');

    // 设置 矩形 宽度
    rectWidth = x(2) - x(1) - 20;
    // 画 事件类型 矩形
    let eventRects = gGameEventType.selectAll('event')
        .data(eventTypeDataList)
        .enter()
        .append('rect')
        .attr('id', function (d) {
            return 'g-eventType-' + d['eventType']
        })
        .attr('x', function (d, i) {
            return x(i + 1)
        })
        .attr('y', 50)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('cx', function (d, i) {
            return x(i + 1) + rectWidth / 2
        })
        .attr('cy', function (d, i) {
            return 50 + rectHeight / 2
        })
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('fill', function (d, i) {
            return color(i);
        })
        .attr('opacity', 1)
        .on('mouseover', playerMouseoverInCenterTop)
        .on('mouseout', playerMouseoutInCenterTop)
        .on('click', eventTypeClick);

    let eventText = gGameEventType.selectAll('event')
        .data(eventTypeDataList)
        .enter()
        .append('text')
        .style('text-anchor', 'middle')
        .attr('x', function (d, i) {
            return x(i + 1) + rectWidth / 2
        })
        .attr('y', 50 + rectHeight / 2)
        .text(function (d) {
            return d.eventTypeDes;
        })
        .attr('font-size', 19)
        .attr('dy', 7)
        .style('pointer-events', 'none');

}


// 画事件视图
function draw_game_score_event(result) {
    //画比分视图
    console.log('画比分视图');
    let divWidth = $('#div-event').width(),
        divHeight = $('#div-event').height();

    let svg = d3.select('#svg-event');

    // 得到 数据
    let data = result.data;
    // 清空画时间轴的 图
    svg.select('#gGameScoreBox').remove();

    let width = divWidth,
        height = 80,
        margin = {left: 10, top: 10, right: 10, bottom: 10};

    let gGameScoreBox = svg.append('g')
        .attr('id', 'gGameScoreBox')
        .attr('transform', 'translate(0,' + 5 + ')');

    // 设置比例尺
    let xScale = d3.scaleLinear()
        .domain([0, data[data.length - 1].period * 720.0])
        .range([margin.left, width - margin.right]);

    let yScale = d3.scaleLinear()
        .domain(d3.extent(data.map(function (d) {
            return Math.abs(d.homeTeamScore - d.visitorTeamScore);
        })))
        .range([0, height / 2]);

    let homeScoreAreaFunction = d3.area()
        .x(function (d) {
            return xScale(d.period * 720 - d.periodTime);
        })
        .y0(height / 2)
        .y1(function (d) {
            let scoreDiff = d.homeTeamScore - d.visitorTeamScore;
            if (scoreDiff > 0) {
                return height / 2 + yScale(scoreDiff)
            } else {
                return height / 2
            }
        })
        .curve(d3.curveMonotoneX);

    let visitorScoreAreaFunction = d3.area()
        .x(function (d) {
            return xScale(d.period * 720 - d.periodTime);
        })
        .y0(height / 2)
        .y1(function (d) {
            let scoreDiff = d.visitorTeamScore - d.homeTeamScore
            if (scoreDiff > 0) {
                return height / 2 - yScale(scoreDiff)
            } else {
                return height / 2
            }
        })
        .curve(d3.curveMonotoneX);

    // 画两个区域
    let homeScoreArea = gGameScoreBox.append('path')
        .datum(data)
        .attr('d', homeScoreAreaFunction)
        .attr('fill', '#19c4fb')
        .attr('opacity', 0.5)
        .style('pointer-events', 'none');
    let visitorScoreArea = gGameScoreBox.append('path')
        .datum(data)
        .attr('d', visitorScoreAreaFunction)
        .attr('fill', '#fe853b')
        .attr('opacity', 0.5)
        .style('pointer-events', 'none');


    // 画事件
    let eventCircles = gGameScoreBox.selectAll('event')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', function (d) {
            // 给事件 添加 类别
            let c = 'e' + d.eventType + ' m' + d.majorPlayerID + ' s'
                + d.secondPlayerID + ' p' + d.period + ' pt' + d.periodTime;
            return c;
        })
        .attr('cx', function (d) {
            return xScale(d.period * 720 - d.periodTime);
        })
        .attr('cy', function (d) {
            let scoreDiff = d.visitorTeamScore - d.homeTeamScore
            if (scoreDiff > 0) {
                return height / 2 - yScale(scoreDiff)
            } else {
                return height / 2 + yScale(Math.abs(scoreDiff))
            }
        })
        .attr('r', 0.7)
        .attr('fill', '#fff')
        .attr('stroke', '#243534')
        .attr('stroke-width', '1')
        .style('pointer-events', 'none');

    // 给这个事件一个透明度 让它不显示
    eventCircles.attr('opacity', 0);

    // 设置 brush 功能
    let brushX = d3.brushX()                 // Add the brush feature using the d3.brush function
        .extent([[margin.left, 0], [width - margin.right, height]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart);

    gGameScoreBox.call(brushX);

    // gGameScoreBox.on('.drag', null);


    // 添加几条线
    // 分界线颜色
    let divideLineColor = '#101615';
    gGameScoreBox.append('line')
        .attr('x1', xScale(0))
        .attr('y1', 0)
        .attr('x2', xScale(0))
        .attr('y2', height)
        .style('stroke-width', 1)
        .attr('stroke', divideLineColor)
        .style('pointer-events', 'none');
    gGameScoreBox.append('line')
        .attr('x1', xScale(720))
        .attr('y1', 0)
        .attr('x2', xScale(720))
        .attr('y2', height)
        .style('stroke-width', 1)
        .attr('stroke', divideLineColor)
        .style('pointer-events', 'none');
    gGameScoreBox.append('line')
        .attr('x1', xScale(720 * 2))
        .attr('y1', 0)
        .attr('x2', xScale(720 * 2))
        .attr('y2', height)
        .style('stroke-width', 1)
        .attr('stroke', divideLineColor)
        .style('pointer-events', 'none');
    gGameScoreBox.append('line')
        .attr('x1', xScale(720 * 3))
        .attr('y1', 0)
        .attr('x2', xScale(720 * 3))
        .attr('y2', height)
        .style('stroke-width', 1)
        .attr('stroke', divideLineColor)
        .style('pointer-events', 'none');
    gGameScoreBox.append('line')
        .attr('x1', xScale(720 * 4))
        .attr('y1', 0)
        .attr('x2', xScale(720 * 4))
        .attr('y2', height)
        .style('stroke-width', 1)
        .attr('stroke', divideLineColor)
        .style('pointer-events', 'none');
    gGameScoreBox.append('line')
        .attr('x1', xScale(0))
        .attr('x2', width - margin.right)
        .attr('y1', height / 2)
        .attr('y2', height / 2)
        .style('stroke-width', 1)
        .attr("stroke", "#6a8281")
        .style('pointer-events', 'none');


    function updateChart() {

        let extent = d3.event.selection;
        if (extent != null) {
            // console.log(extent);
            // console.log(xScale.invert(extent[0]))
            // 得到 刷选 的 起始时间 和 截止时间
            // 使用 转换函数
            let startGameSeconds = xScale.invert(extent[0]),
                endGameSeconds = xScale.invert(extent[1]);
            // console.log(startGameSeconds, endGameSeconds);
            // let startPeriodIndex = parseInt(startGameSeconds / 720.0),
            //     endPeriodIndex = parseInt(endGameSeconds / 720.0),
            //     startPeriodSecond = 720 - startGameSeconds + (startPeriodIndex * 720),
            //     endPeriodSecond = 720 - endGameSeconds + (endPeriodIndex * 720);

            // console.log('选中的时间信息', startPeriodIndex, startPeriodSecond, endPeriodIndex, endPeriodSecond)
            // let selectObj = {
            //     'startBrushTime': startGameSeconds,
            //     'endBrushTime': endGameSeconds
            // };
            console.log('选中范围', startGameSeconds, endGameSeconds)
            // 把这个选中时间给进行保存
            d3.select('#event_focus_btn').attr('startBrushTime', startGameSeconds);
            d3.select('#event_focus_btn').attr('endBrushTime', endGameSeconds);

        } else {
            d3.select('#event_focus_btn').attr('startBrushTime', -1);
            d3.select('#event_focus_btn').attr('endBrushTime', -1);
            console.log('没有brush的情况下 做什么操作')
        }
    }
}

// 画 比分的 时间轴
function draw_game_score_timeBar(result) {
    return 1;
    console.log('画 时间 筛选轴')
    // console.log(result);
    //    首先 是 获取 div 宽度 和高度
    let divWidth = $('#div-event').width(),
        divHeight = $('#div-event').height();
    // margin = {left: 10, top: 10, right: 10, bottom: 10};
    //    设置svg的长宽高
    let svg = d3.select('#svg-event');
    // 清空画时间轴的 图
    svg.select('#gGameScoreTimeBar').remove();


    // 得到 数据
    let data = result.data;
    // console.log('第一条数据', data[0]);


    let width = divWidth,
        height = divHeight,
        margin = {left: 10, top: 10, right: 10, bottom: 10};

    let gTimeBar = svg.append('g')
        .attr('id', 'gGameScoreTimeBar')
        .attr('transform', 'translate(0,3)')
    // 添加一个 长方形 盖在条形图上
    gTimeBar.append('rect')
        .attr('x', margin.left)
        .attr('y', 0)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('width', width - margin.right - margin.left)
        .attr('height', 20)
        .attr('fill', '#e7e7e7')
        .style('pointer-events', 'none');

    // 设置比例尺
    let xScale = d3.scaleLinear()
        .domain([0, data[data.length - 1].period * 720.0])
        .range([margin.left, width - margin.right]);

    let yScale = d3.scaleLinear()
        .domain(d3.extent(data.map(function (d) {
            return Math.abs(d.homeTeamScore - d.visitorTeamScore);
        })))
        .range([1, 8]);

    let homeScoreAreaFunction = d3.area()
        .x(function (d) {
            return xScale(d.period * 720 - d.periodTime);
        })
        .y0(10)
        .y1(function (d) {
            let scoreDiff = d.homeTeamScore - d.visitorTeamScore;
            if (scoreDiff > 0) {
                return 10 + yScale(scoreDiff)
            } else {
                return 10
            }
        })
        .curve(d3.curveCatmullRom)

    let visitorScoreAreaFunction = d3.area()
        .x(function (d) {
            return xScale(d.period * 720 - d.periodTime);
        })
        .y0(10)
        .y1(function (d) {
            let scoreDiff = d.visitorTeamScore - d.homeTeamScore
            if (scoreDiff > 0) {
                return 10 - yScale(scoreDiff)
            } else {
                return 10
            }
        })
        .curve(d3.curveCatmullRom);

    let homeScoreArea = gTimeBar.append('path')
    // .attr('transform', 'translate(' + 0 + ',' + (height / 2 - 30) + ')')
        .datum(data)
        .attr('d', homeScoreAreaFunction)
        .attr('fill', '#19c4fb')
        .attr('opacity', 0.5)
        .style('pointer-events', 'none');
    // .call(brushX)
    let visitorScoreArea = gTimeBar.append('path')
        .datum(data)
        .attr('d', visitorScoreAreaFunction)
        .attr('fill', '#fe853b')
        .attr('opacity', 0.5)
        .style('pointer-events', 'none');

    // 设置 brush 功能
    let brushX = d3.brushX()                 // Add the brush feature using the d3.brush function
        .extent([[margin.left, 0], [width - margin.right, 20]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart);

    gTimeBar.call(brushX);

    function updateChart() {
        // console.log('刷选');

        let extent = d3.event.selection;
        if (extent != null) {
            // console.log(extent);
            // console.log(xScale.invert(extent[0]))
            // 得到 刷选 的 起始时间 和 截止时间
            // 使用 转换函数
            let startGameSeconds = xScale.invert(extent[0]),
                endGameSeconds = xScale.invert(extent[1]);
            let startPeriodIndex = parseInt(startGameSeconds / 720.0),
                endPeriodIndex = parseInt(endGameSeconds / 720.0),
                startPeriodSecond = 720 - startGameSeconds + (startPeriodIndex * 720),
                endPeriodSecond = 720 - endGameSeconds + (endPeriodIndex * 720);
            // console.log('选中的时间信息', startPeriodIndex, startPeriodSecond, endPeriodIndex, endPeriodSecond)
            // let data = d3.select('#g-center-top-quarter-0').select('rect')
            //     .datum();
            d3.select('#g-center-top-round').selectAll('rect')
                .attr('selected', 0);

            d3.select('#g-center-top-round').selectAll('rect')
                .attr('fill', function (d) {
                    // 得到 起止时间等
                    let quarterIndex = d.quarterIndex,
                        quarterStartTime = d.startQuarterTime,
                        quarterEndTime = d.endQuarterTime;
                    let timeStart = 720 * (quarterIndex + 1) - quarterStartTime;
                    let timeEnd = 720 * (quarterIndex + 1) - quarterEndTime;
                    let timeMiddle = (timeStart + timeEnd) / 2
                    if (timeMiddle >= startGameSeconds && timeMiddle <= endGameSeconds) {
                        // console.log(startGameSeconds, endGameSeconds, timeStart, timeEnd)
                        d3.select(this).attr('selected', 1)
                        return '#ccc'
                    } else {
                        return d3.select(this).attr('fill-color');
                    }
                    // console.log(d3.select(this).datum())
                });
            // console.log(data)


        } else {
            console.log('没有brush的情况下 做什么操作')
        }
    }
}


// 事件的鼠标事件
function playerMouseoverInCenterTop() {
    d3.select(this)
        .transition()
        .duration(50)
        .style('opacity', 0.2);

}

function playerMouseoutInCenterTop() {
    d3.select(this)
        .transition()
        .duration(50)
        .style('opacity', 0.8)
}


function draw_players(nodes) {
// 得到 长度 宽度
    let width = $('#div-event').width(),
        height = $('#div-event').height(),
        margin = {left: 10, top: 10, right: 10, bottom: 10};


    // 建立svg
    let svg = d3.select('#svg-event');

    // 对 节点 进行排序
    let homeList = sortPlayerListInScoreChart(nodes.home),
        visitorList = sortPlayerListInScoreChart(nodes.visitor);

    let g_home = svg.append('g')
        .attr('id', 'g_home')
        .attr('transform', 'translate(' + 30 + ',' + 30 + ')');
    let g_visitor = svg.append('g')
        .attr('id', 'g_visitor')
        .attr('transform', 'translate(' + width / 2 + ',' + (height / 4 * 3) + ')');

    let spaceWidth = 1;
    if (homeList.length > visitorList.length) {
        spaceWidth = (width / 2 - 30 - 20) / homeList.length;
    } else {
        spaceWidth = (width / 2 - 10 - 10) / visitorList.length;
    }
    let r = 15;

    g_home.selectAll('homeNode')
        .data(homeList)
        .enter()
        .append('circle')
        .attr('cx', function (d, i) {
            console.log(d)
            return spaceWidth * i;
        })
        .attr('cy', 0)
        .attr('r', r)
        .attr('fill', '#fe853b')
        .style('stroke', '#092bd2')
        .attr('opacity', 0.7)
        .style('stroke-width', function (d) {
            console.log(d)
            if (d.isSp === 1) {
                return 5;
            } else {
                return 0;
            }
        })
        .on('mouseover', mouseover)
        .on('mouseout', mouseout);


    g_home.selectAll('homeNode')
        .data(homeList)
        .enter().append('text')
        .style('text-anchor', 'middle')
        .attr("x", function (d, i) {
            return spaceWidth * i;
        })
        .attr("y", 0)
        .attr('dy', 6)
        .attr('font-size', 13)
        .text(function (d) {
            return d.jersey
        })
        .style('pointer-events', 'none');


    g_visitor.selectAll('homeNode')
        .data(visitorList)
        .enter()
        .append('circle')
        .attr('cx', function (d, i) {
            return spaceWidth * i;
        })
        .attr('cy', 0)
        .attr('r', r)
        .attr('fill', '#19c4fb')
        .attr('opacity', 0.7)
        .style('stroke', '#092bd2')
        .style('stroke-width', function (d) {
            if (d.isSp === 1) {
                return 5;
            } else {
                return 0;
            }
        })
        .on('mouseover', mouseover)
        .on('mouseout', mouseout);

    g_visitor.selectAll('homeNode')
        .data(visitorList)
        .enter().append('text')
        .style('text-anchor', 'middle')
        .attr("x", function (d, i) {
            return spaceWidth * i;
        })
        .attr("y", 0)
        .attr('dy', 6)
        .attr('font-size', 13)
        .text(function (d) {
            return d.jersey
        })
        .style('pointer-events', 'none');


    function mouseover() {
        d3.select(this)
            .transition()
            .duration(50)
            .style('opacity', 0.3)
    }

    function mouseout() {
        d3.select(this)
            .transition()
            .duration(50)
            .style('opacity', 0.8)
    }


}


function draw_center_top_view_score() {

}


// 对节点进行排序
function sortPlayerListInScoreChart(playerList) {
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

// 筛选 事件 列表
function sortEventsIntoEventTypeList(data) {
    let eventTypeMap = {};
    for (let event of data) {
        let eventType = event.eventType.toString();
        // 如果 没有 这个类型 的 数据，那么 先 放空
        if (!eventTypeMap.hasOwnProperty(eventType)) {
            eventTypeMap[eventType] = [];
        }
        eventTypeMap[eventType].push(event);
    }
    let eventTypeDataList = [];
    for (let i = 1; i < 10; i++) {
        let eventType = i.toString();
        let eventTypeDes = 'score';
        if (i === 2) {
            eventTypeDes = 'miss shot';
        } else if (i === 3) {
            eventTypeDes = 'free throw';
        } else if (i === 4) {
            eventTypeDes = 'rebound';
        } else if (i === 5) {
            eventTypeDes = 'turnover';
        } else if (i === 6) {
            eventTypeDes = 'foul';
        } else if (i === 7) {
            eventTypeDes = 'violation';
        } else if (i === 8) {
            eventTypeDes = 'substitution';
        } else if (i === 9) {
            eventTypeDes = 'timeout';
        }
        let obj = {
            'eventType': eventType,
            'eventTypeDes': eventTypeDes,
            'eventData': eventTypeMap[eventType]
        };
        eventTypeDataList.push(obj);
    }
    // console.log(eventTypeDataList)
    return eventTypeDataList

    // for (let event of data){
    //     let eventType = event.eventType.toString();
    //     // 如果 没有 这个类型的数据，那么先放空
    //     if (!eventTypeMap.hasOwnProperty(eventType)){
    //         eventTypeMap[eventType] = {};
    //     }
    //     // 得到 这个类型事件 的所有对应球员数据
    //     let playersMap = eventTypeMap[eventType];
    //     // 得到 这个 事件 的 球员 ID
    //     let majorPlayerID = event.majorPlayerID.toString();
    //     // 如果 这个 事件下的 对应球员数据 没有 这个球员
    //     if (!playersMap.hasOwnProperty(majorPlayerID)){
    //         playersMap[majorPlayerID] = [];
    //     }
    //     if (majorPlayerID === '0'){
    //         console.log(event)
    //     }
    //     let playerEventList = playersMap[majorPlayerID];
    //     playerEventList.push(event);
    //     playersMap[majorPlayerID] = playerEventList;
    //     eventTypeMap[eventType] = playersMap;
    // }
    // let eventTypeDataList = [];
    // for (let i=1; i <10; i++ ){
    //     let eventType = i.toString();
    //     let playersMap = eventTypeMap[eventType]
    //
    // }
    // console.log(eventTypeMap)
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


// 横向箭头
function generateArrowHorizontal(x, y) {
    // let pathList = [];
    let arrow = d3.path();
    arrow.moveTo(x - 5, y - 5);
    arrow.lineTo(x, y);
    arrow.lineTo(x - 5, y + 5);
    return arrow;
}

// 纵向箭头
function generateArrowVertical(x, y) {
    let arrow = d3.path();
    arrow.moveTo(x - 5, y + 5);
    arrow.lineTo(x, y);
    arrow.lineTo(x + 5, y + 5);
    return arrow;
}

// 图属性
function score_button_click() {
    let clicked = d3.select(this).attr('clicked');
    if (clicked === 'true') {
        d3.select(this).attr('clicked', 'false');
        d3.select(this).style('stroke-width', '0');

        let gID = "#" + d3.select(this).attr('id').split('_')[1];
        d3.select(gID).transition().duration(500).style('opacity', 0);

    } else {
        d3.select(this).attr('clicked', 'true');
        d3.select(this).style('stroke-width', '4');
        let gID = "#" + d3.select(this).attr('id').split('_')[1];
        d3.select(gID).transition().duration(500).style('opacity', 0.7);
    }
    console.log(d3.select('#gGameEventType').selectAll('.click').size())
    console.log(d3.select('#g-center-top-players').selectAll('.click').size())

}


function centerTopPlayerClick() {
    let clicked = d3.select(this).attr('clicked');
    console.log('点击这个事件类型');
    // 得到这个事件绑定的数据
    // let eventTypeData = d3.select(this).datum();
    // console.log(eventTypeData);
    // 球员id
    let playerID = d3.select(this).attr('id').split('-')[2];
    d3.selectAll('.eventLink').style('opacity', 0);

    // console.log(clicked, typeof clicked)
    if (clicked === 'true') {
        // 执行 点击 删除事件
        console.log('删除');
        d3.select(this).attr('clicked', false);
        d3.select(this).classed('clicked', false);
        d3.select(this)
            .style('stroke', '#000')
            .style('stroke-width', '0')

    } else {
        // 执行 点击 添加事件
        console.log('添加');
        d3.select(this).attr('clicked', true);
        d3.select(this).classed('clicked', true);
        d3.select(this)
            .style('stroke', '#000')
            .style('stroke-width', '3');
        // d3.selectAll('.clicked')

    }
    console.log(d3.select('#gGameEventType').selectAll('.clicked').size());
    console.log(d3.select('#g-center-top-players').selectAll('.clicked').size());
    let eventClickedSize = d3.select('#gGameEventType').selectAll('.clicked').size();
    let playerClickedSize = d3.select('#g-center-top-players').selectAll('.clicked').size();
    if (playerClickedSize > 0 && eventClickedSize > 0) {
        let playerIDList = [];
        let eventTypeList = [];
        d3.select('#g-center-top-players').selectAll('.clicked').each(function (d, i) {
            playerIDList.push(d['playerid']);
        });
        console.log('playeridlist', playerIDList)
        d3.select('#gGameEventType').selectAll('.clicked').each(function (d, i) {
            eventTypeList.push(d['eventType']);
        });
        for (let playerID of playerIDList) {
            for (let eventTypeID of eventTypeList) {
                let classLabel1 = '.eventType-' + eventTypeID + '.majorPlayer-' + playerID;
                let classLabel2 = '.eventType-' + eventTypeID + '.secondPlayerID-' + playerID;
                d3.selectAll(classLabel1).style('opacity', 0.3);
                d3.selectAll(classLabel2).style('opacity', 0.3);
            }
        }
    } else if (eventClickedSize>0){

        let eventTypeList = [];
        // let eventTypeList = [];
        console.log('playeridlist', eventTypeList)
        d3.select('#gGameEventType').selectAll('.clicked').each(function (d, i) {
            eventTypeList.push(d['eventType']);
        });

        for (let eventTypeID of eventTypeList) {

            let classLabel1 = '.eventType-' + eventTypeID;
            d3.selectAll(classLabel1).style('opacity', 0.3);

        }
    }else if(playerClickedSize>0){
        let playerIDList = [];
        // let eventTypeList = [];
        d3.select('#g-center-top-players').selectAll('.clicked').each(function (d, i) {
            playerIDList.push(d['playerid']);
        });
        for (let playerID of playerIDList) {

            let classLabel1 = '.majorPlayer-' + playerID;
            let classLabel2 = '.secondPlayerID-' + playerID;
            d3.selectAll(classLabel1).style('opacity', 0.3);
            d3.selectAll(classLabel2).style('opacity', 0.3);

        }
    }
}


function eventTypeClick() {
    let clicked = d3.select(this).attr('clicked');
    // console.log('点击这个事件类型');
    // 得到这个事件绑定的数据
    // let eventTypeData = d3.select(this).datum();
    // console.log(eventTypeData);

    let eventType = d3.select(this).attr('id').split('-')[2];
    d3.selectAll('.eventLink').style('opacity', 0);

    // console.log(clicked, typeof clicked)
    if (clicked === 'true') {
        // 执行 点击 删除事件
        // console.log('删除');//
        d3.select(this).attr('clicked', false);
        d3.select(this).classed('clicked', false);
        d3.select(this)
            .style('stroke', '#000')
            .style('stroke-width', '0')

    } else {
        // 执行 点击 添加事件
        // console.log('添加');
        d3.select(this).attr('clicked', true);
        d3.select(this).classed('clicked', true);
        d3.select(this)
            .style('stroke', '#000')
            .style('stroke-width', '3')

        // d3.selectAll('.eventType-' + eventType).style('opacity', 0.1);


    }

    // console.log(d3.select('#gGameEventType').selectAll('.clicked').size())
    // console.log(d3.select('#g-center-top-players').selectAll('.clicked').size())

    let eventClickedSize = d3.select('#gGameEventType').selectAll('.clicked').size();
    let playerClickedSize = d3.select('#g-center-top-players').selectAll('.clicked').size();
    if (playerClickedSize > 0 && eventClickedSize > 0) {
        let playerIDList = [];
        let eventTypeList = [];
        d3.select('#g-center-top-players').selectAll('.clicked').each(function (d, i) {
            playerIDList.push(d['playerid']);
        });

        d3.select('#gGameEventType').selectAll('.clicked').each(function (d, i) {
            eventTypeList.push(d['eventType']);
        });

        // console.log('playeridlist', playerIDList, eventTypeList)
        for (let playerID of playerIDList) {
            for (let eventTypeID of eventTypeList) {
                let classLabel1 = '.eventType-' + eventTypeID + '.majorPlayer-' + playerID;
                let classLabel2 = '.eventType-' + eventTypeID + '.secondPlayerID-' + playerID;
                d3.selectAll(classLabel1).style('opacity', 0.3);
                d3.selectAll(classLabel2).style('opacity', 0.3);
            }
        }
    } else if (eventClickedSize>0){

        let eventTypeList = [];
        // let eventTypeList = [];
        // console.log('playeridlist', eventTypeList)
        d3.select('#gGameEventType').selectAll('.clicked').each(function (d, i) {
            eventTypeList.push(d['eventType']);
        });

        for (let eventTypeID of eventTypeList) {

            let classLabel1 = '.eventType-' + eventTypeID;
            d3.selectAll(classLabel1).style('opacity', 0.3);

        }
    }else if(playerClickedSize>0){
        let playerIDList = [];
        // let eventTypeList = [];
        d3.select('#g-center-top-players').selectAll('.clicked').each(function (d, i) {
            playerIDList.push(d['playerid']);
        });
        for (let playerID of playerIDList) {

            let classLabel1 = '.majorPlayer-' + playerID;
            let classLabel2 = '.secondPlayerID-' + playerID;
            d3.selectAll(classLabel1).style('opacity', 0.3);
            d3.selectAll(classLabel2).style('opacity', 0.3);

        }
    }

}

function bzpathV3(x0, y0, x1, y1) {
    return 'M' +
        x0 +
        ',' +
        y0 +
        'C' +
        x0 +
        ',' +
        (y0 + y1) / 2 +
        ' ' +
        x1 +
        ',' +
        (y0 + y1) / 2 +
        ' ' +
        x1 +
        ',' +
        y1;

}


function bzpathV4(x0, y0, x1, y1) {
    return 'M' +
        x0 +
        ',' +
        y0 +
        'C' +
        x0 +
        ',' +
        (y0 + y1 + 20) / 2 +
        ' ' +
        x1 +
        ',' +
        (y0 + y1 + 20) / 2 +
        ' ' +
        x1 +
        ',' +
        y1;

}


// 画从事件到得分视图的线条
function draw_line_from_event_to_score(sx, sy, ex, ey, d) {
    // 构建 这个 事件类型的 svg
    let g = d3.select('#svg-center-top').select('#g-eventType-' + d.eventType)
        .attr('class', 'g-eventType')
        .append('g')
        .attr('class', 'g-eventType-player-' + d.majorPlayerID)
    // 构建球员id
    let mpID = '#center-top-' + d.majorPlayerID,
        spID = '#center-top-' + d.secondPlayerID;

    // 判断 这个事件 是否有主球员
    if ($(mpID).length > 0) {
        // 得到 球员 坐标
        let ptx = parseFloat(d3.select('#g-center-top-players').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[0]);
        let pty = parseFloat(d3.select('#g-center-top-players').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[1]);
        let px = ptx + parseFloat(d3.select(mpID).attr('cx'));
        let py = pty + parseFloat(d3.select(mpID).attr('cy'));

        // 构建 path
        let path = d3.path();
        path.moveTo(sx, sy);
        // path.bezierCurveTo(sx, 200)
        path.lineTo(ex, ey);

        path.lineTo(px, py);

        g.append('path')
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', '#6a8281')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.3)
            .style('point-events', 'none');


        // 得到球员出现在哪些回合
        // let gameID = $('#select-gameID option:selected').val();
        // $.ajax({
        //     url: '/getPlayerRoundByID/',   // 得到 散点图 数据
        //     method: 'GET',
        //     timeout: 10000,  // 设置 延时函数
        //     data: {
        //         gameID: gameID,  // 比赛ID
        //         playerid: mpID
        //     },
        //     beforeSend: function () {
        //         // console.log('加载数据, 这里会弹出一个 框 让用户等待');
        //     },
        //     success: function (result, error) {
        //         // 回合便宜
        //         let rtx = parseFloat(d3.select('#g-center-top-round').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[0]);
        //         let rty = parseFloat(d3.select('#g-center-top-round').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[1]);
        //         for (let roundID of result) {
        //             console.log(roundID);
        //             let rx = rtx + parseFloat(d3.select('#' + roundID).attr('x')) + parseFloat(d3.select('#' + roundID).attr('width')) / 2;
        //             let ry = rty + parseFloat(d3.select('#' + roundID).attr('y'));
        //
        //             // 构建 path
        //             let path = d3.path();
        //             path.moveTo(sx, sy);
        //             // path.bezierCurveTo(sx, 200)
        //             path.lineTo(ex, ey);
        //
        //             path.lineTo(px, py);
        //
        //             path.lineTo(rx, ry);
        //             g.append('path')
        //                 .attr('d', path)
        //                 .attr('fill', 'none')
        //                 .attr('stroke', '#6a8281')
        //                 .attr('stroke-width', 0.5)
        //                 .attr('opacity', 0.3)
        //                 .style('point-events', 'none');
        //         }
        //
        //
        //     }
        // })

    }
    // 判断 这个事件 是否 有副 球员
    else if ($(spID).length > 0) {
        // 得到 球员 坐标
        let ptx = parseFloat(d3.select('#g-center-top-players').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[0]);
        let pty = parseFloat(d3.select('#g-center-top-players').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[1]);
        let px = ptx + parseFloat(d3.select(spID).attr('cx'));
        let py = pty + parseFloat(d3.select(spID).attr('cy'));
        // 构建 path
        let path = d3.path();
        path.moveTo(sx, sy);
        // path.bezierCurveTo(sx, 200)
        path.lineTo(ex, ey);

        path.lineTo(px, py);

        g.append('path')
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', '#6a8281')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.3)
            .style('point-events', 'none')
    } else {
        // 直接划线
        // 构建 path
        let path = d3.path();
        path.moveTo(sx, sy);
        // path.bezierCurveTo(sx, 200)
        path.lineTo(ex, ey);

        g.append('path')
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', '#6a8281')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.3)
            .style('point-events', 'none')
    }
}