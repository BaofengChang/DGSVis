function draw_game_score_event(result) {
    //画比分视图
    console.log('画比分视图')

    let divWidth = $('#center-top').width(),
        divHeight = $('#center-top').height();
    // margin = {left: 10, top: 10, right: 10, bottom: 10};
    //    设置svg的长宽高
    let svg = d3.select('#svg-center-top')
        .style('width', divWidth)
        .style('height', divHeight);
    // 清空画时间轴的 图
    svg.select('#gGameScoreBox').remove();

    // 得到 数据
    let data = result.data;
    // console.log('第一条数据', data[0]);


    let width = divWidth,
        height = 80,
        margin = {left: 10, top: 10, right: 10, bottom: 10};

    let gGameScoreBox = svg.append('g')
        .attr('id', 'gGameScoreBox')
        .attr('transform', 'translate(0,' + 10 + ')');

    // 设置比例尺
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
        .curve(d3.curveCatmullRom);

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
        .curve(d3.curveCatmullRom);
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
        .attr('r', 2)
        .style('pointer-events', 'none');
    // 给这个事件一个透明度 让它不显示
    eventCircles.attr('opacity', 0);


    // 设置 brush 功能
    let brushX = d3.brushX()                 // Add the brush feature using the d3.brush function
        .extent([[margin.left, 0], [width - margin.right, height]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart);

    gGameScoreBox.call(brushX);

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
            d3.select('#g-center-top-round').selectAll('rect')
                .attr('selected', 0);
            d3.select('#g-center-top-round').selectAll('rect')
                .attr('fill', function (d) {
                    return d3.select(this).attr('fill-color');
                });
            console.log('没有brush的情况下 做什么操作')
        }


    }
}


function draw_game_event_type(result) {
    //画比分视图
    console.log('画比分视图')

    let divWidth = $('#center-top').width(),
        divHeight = $('#center-top').height();
    // margin = {left: 10, top: 10, right: 10, bottom: 10};
    //    设置svg的长宽高
    let svg = d3.select('#svg-center-top')
        .style('width', divWidth)
        .style('height', divHeight);

    // 清空画时间轴的 图
    svg.select('#gGameEventType').remove();

    // 得到 数据
    let data = result.data;
    console.log('第一条数据', data[0]);

    let width = divWidth,
        height = 80,
        margin = {left: 10, top: 10, right: 10, bottom: 10};

    let gGameEventType = svg.append('g')
        .attr('id', 'gGameEventType')
        .attr('transform', 'translate(0,' + 110 + ')')

    // 得到 事件 数据
    let eventTypeDataList = sortEventsIntoEventTypeList(data);

    // 设置 宽度 和 高度
    let rectWidth = 100,
        rectHeight = 30;
    // 设置比例尺
    let x = d3.scaleLinear()
        .domain([1, 10])
        .range([margin.left + 15, width]);
    // 设置 颜色 填充
    let color = d3.scaleOrdinal(d3.schemeCategory10);
    // .domain([1, 2, 3, 4, 5, 6, 7, 8, 9])
    // .range(d3.scheme);
    // 设置 矩形 宽度
    rectWidth = x(2) - x(1) - 20;
    // console.log(rectWidth)
    // 画 事件类型 矩形
    let eventRects = gGameEventType.selectAll('event')
        .data(eventTypeDataList)
        .enter()
        .append('rect')
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
        .attr('opacity', 0.5)
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
            .style('opacity', 0.5)
    }

    //
    function eventTypeClick() {
        let clicked = d3.select(this).attr('clicked');
        console.log('点击这个事件类型')
        // 得到这个事件绑定的数据
        let eventTypeData = d3.select(this).datum();
        // console.log(eventTypeData)

        // console.log(clicked, typeof clicked)
        if (clicked === 'true') {
            // 执行 点击 删除事件
            console.log('删除')
            d3.select(this).attr('clicked', false);
            // 删掉这个画布
            let gLineID = eventTypeData.eventType;
            d3.select('#g-eventType-' + gLineID).remove();
        } else {
            // 执行 点击 添加事件
            console.log('添加')
            d3.select(this).attr('clicked', true);
            d3.select('#svg-center-top').append('g')
                .attr('id', 'g-eventType-' + eventTypeData.eventType);
            // 得到事件序列
            let eventList = eventTypeData.eventData;
            console.log(eventList[0]);

            // 得到 时间轴上的偏移数据
            let stx = parseFloat(d3.select('#gGameScoreBox').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[0]);
            let sty = parseFloat(d3.select('#gGameScoreBox').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[1]);
            let etx = parseFloat(d3.select('#gGameEventType').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[0]);
            let ety = parseFloat(d3.select('#gGameEventType').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[1]);
            let ptx = parseFloat(d3.select('#g-center-top-players').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[0]);
            let pty = parseFloat(d3.select('#g-center-top-players').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[1]);
            let rtx = parseFloat(d3.select('#g-center-top-round').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[0]);
            let rty = parseFloat(d3.select('#g-center-top-round').attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[1]);


            // 遍历数据
            for (let event of eventList) {
                // console.log(event)
                // 得到 类 的标识
                let d = event;
                let classLabel = '.e' + d.eventType + '.m' + d.majorPlayerID + '.s'
                    + d.secondPlayerID + '.p' + d.period + '.pt' + d.periodTime;
                // console.log(d3.select(classLabel).datum())
                // 得到 分数 轴上的 坐标
                let sx = stx + parseFloat(d3.select(classLabel).attr('cx'));
                let sy = sty + parseFloat(d3.select(classLabel).attr('cy'));
                // 得到 事件类型 的坐标
                let ex = etx + parseFloat(d3.select(this).attr('cx'));
                let ey = ety + parseFloat(d3.select(this).attr('cy'));


                draw_line_from_event_to_score(sx, sy, ex, ey, d);


                // console.log(sx, sy, ex, ey)

            }

        }

    }
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