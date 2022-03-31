function draw_div_score() {
    // 这个函数 画 比分数据
    draw_Time_ScoreBar();
    // 这个函数 画 回合数据
    draw_round()
}

function draw_players(nodes) {
// 得到 长度 宽度
    let width = $('#div_score').width(),
        height = $('#div_score').height(),
        margin = {left: 10, top: 10, right: 10, bottom: 10};


    // 建立svg
    let svg = d3.select('#svg_score')
        .attr('width', width)
        .attr('height', height)
        .attr("viewBox", [0, 0, width, height]);

    // 对 节点 进行排序
    let homeList = sortPlayerListInScoreChart(nodes.home),
        visitorList = sortPlayerListInScoreChart(nodes.visitor);

    let g_home = svg.append('g')
        .attr('id', 'g_home')
        .attr('transform', 'translate(' + 30 + ',' + 30 + ')');
    let g_visitor = svg.append('g')
        .attr('id', 'g_visitor')
        .attr('transform', 'translate(' + width / 2 + ',' + 30 + ')');

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

function draw_Time_ScoreBar() {
    console.log('画比分数据');
    $.ajax({
        url: '/getScoreData/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: '0021500003',  // 比赛ID
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

            // 清空 div 下 的 子节点
            $('#svg_score').empty();

            // 得到 数据
            let data = result.data;
            console.log('第一条数据', data[0]);

            // 画上 球员 节点
            draw_players(result.nodes);

            // 得到 长度 宽度
            let width = $('#div_score').width(),
                height = $('#div_score').height(),
                margin = {left: 10, top: 10, right: 10, bottom: 10};

            // 建立svg
            let svg = d3.select('#svg_score')
                .attr('width', width)
                .attr('height', height)
                .attr("viewBox", [0, 0, width, height]);

            // 设置比例尺
            let xScale = d3.scaleLinear()
                .domain([0, data[data.length - 1].period * 720.0])
                .range([margin.left, width - margin.right]);

            let yScale = d3.scaleLinear()
                .domain(d3.extent(data.map(function (d) {
                    return Math.abs(d.homeTeamScore - d.visitorTeamScore);
                })))
                // .range([0, height / 3 - margin.top - margin.bottom]);
                .range([0, 23]);
            console.log(yScale.domain())
            console.log(yScale.range())

            let homeScoreAreaFunction = d3.area()
                .x(function (d) {
                    return xScale(d.period * 720 - d.periodTime);
                })
                .y0(25)
                .y1(function (d) {
                    let scoreDiff = d.homeTeamScore - d.visitorTeamScore;
                    let a = yScale(scoreDiff);

                    if (scoreDiff > 0) {
                        return 25 + yScale(scoreDiff)
                    } else {
                        return 25
                    }
                })
                .curve(d3.curveCatmullRom)

            let visitorScoreAreaFunction = d3.area()
                .x(function (d) {
                    return xScale(d.period * 720 - d.periodTime);
                })
                .y0(25)
                .y1(function (d) {
                    let scoreDiff = d.visitorTeamScore - d.homeTeamScore
                    if (scoreDiff > 0) {
                        return 25 - yScale(scoreDiff)
                    } else {
                        return 25
                    }
                })
                .curve(d3.curveCatmullRom);

            // 设置 brush
            let brushX = d3.brushX()                 // Add the brush feature using the d3.brush function
                .extent([[margin.left, 0], [width - margin.right, 50]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
                .on("end", updateChart)
            // 画分差区域
            let g = svg.append('g')
                .attr('id', 'g_score_event')
                .attr('transform', 'translate(' + 0 + ',' + (height - 60) + ')')
                .call(brushX);
            let homeScoreArea = g.append('path')
            // .attr('transform', 'translate(' + 0 + ',' + (height / 2 - 30) + ')')
                .datum(data)
                .attr('d', homeScoreAreaFunction)
                .attr('fill', '#19c4fb')
                .attr('opacity', 0.5)
                .style('pointer-events', 'none');
            // .call(brushX)
            let visitorScoreArea = g.append('path')
                .datum(data)
                .attr('d', visitorScoreAreaFunction)
                .attr('fill', '#fe853b')
                .attr('opacity', 0.5)
                .style('pointer-events', 'none');
            // 画事件点 todo: 给点 在 y 上加一个随机值 抖动， 然后连接到 事件 发生 的 位置。
            let g_event = svg.append('g')
                .attr('id', 'g_event')
                .attr('transform', 'translate(' + 0 + ',' + (height - 60) + ')');

            let eventCircles = g_event.selectAll('event')
                .data(data)
                .enter()
                .append('circle')
                .attr('cx', function (d) {
                    return xScale(d.period * 720 - d.periodTime)
                })
                .attr('cy', function (d) {
                    let scoreDiff = d.visitorTeamScore - d.homeTeamScore
                    if (scoreDiff > 0) {
                        return 25 - yScale(scoreDiff)
                    } else {
                        return 25 + yScale(Math.abs(scoreDiff))
                    }
                })
                .attr('r', 0.5)
                .style('pointer-events', 'none');

            eventCircles.attr('opacity', 1);

            // console.log(1);

            // 添加几条线
            g.append('line')
                .attr('x1', xScale(0))
                .attr('y1', 0)
                .attr('x2', xScale(0))
                .attr('y2', 50)
                .style('stroke-width', 1)
                .attr('stroke', '#ae7a44')
                .style('pointer-events', 'none');
            g.append('line')
                .attr('x1', xScale(720))
                .attr('y1', 0)
                .attr('x2', xScale(720))
                .attr('y2', 50)
                .style('stroke-width', 1)
                .attr('stroke', '#ae7a44')
                .style('pointer-events', 'none');
            g.append('line')
                .attr('x1', xScale(720 * 2))
                .attr('y1', 0)
                .attr('x2', xScale(720 * 2))
                .attr('y2', 50)
                .style('stroke-width', 1)
                .attr('stroke', '#ae7a44')
                .style('pointer-events', 'none');
            g.append('line')
                .attr('x1', xScale(720 * 3))
                .attr('y1', 0)
                .attr('x2', xScale(720 * 3))
                .attr('y2', 50)
                .style('stroke-width', 1)
                .attr('stroke', '#ae7a44')
                .style('pointer-events', 'none');
            g.append('line')
                .attr('x1', xScale(720 * 4))
                .attr('y1', 0)
                .attr('x2', xScale(720 * 4))
                .attr('y2', 50)
                .style('stroke-width', 1)
                .attr('stroke', '#ae7a44')
                .style('pointer-events', 'none');

            g.append('line')
                .attr('x1', xScale(0))
                .attr('x2', width - margin.right)
                .attr('y1', 25)
                .attr('y2', 25)
                .style('stroke-width', 1)
                .attr("stroke", "#6a8281")
                .style('pointer-events', 'none');


            function updateChart() {
                console.log('刷选');

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
                        startPeriodSecond = 720 - startGameSeconds - (startPeriodIndex * 720),
                        endPeriodSecond = 720 - endGameSeconds + (endPeriodIndex * 720);
                    console.log('选中的时间信息', startPeriodIndex, startPeriodSecond, endPeriodIndex, endPeriodSecond)
                } else {
                    console.log('没有brush的情况下 做什么操作')
                }


            }

        },
        complete: function () {
            // 做 什么 操作
            console.log('绘制 比赛图 完毕');
        }
    })
}

function draw_div_scoreV3() {
    // 这个函数画比分数据
    console.log('画比分数据')
    $.ajax({
        url: '/getScoreData/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: '0021500003',  // 比赛ID
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

            // 清空 div 下 的 子节点
            $('#div_score').empty();

            // 得到 数据
            let data = result.data;
            console.log('第一条数据', data[0]);


            // 得到 长度 宽度
            let width = $('#div_score').width(),
                height = $('#div_score').height(),
                margin = {left: 10, top: 10, right: 10, bottom: 10};

            // let svg1 = d3.create("svg")
            //     .attr("viewBox", [0, 0, width, height])
            //     // .on("click", reset);
            //
            // const zoom = d3.zoom()
            //     .scaleExtent([1, 8])
            //     .on("zoom", zoomed);

            // 建立svg
            let svg = d3.select('#div_score')
                .append('svg')
                .attr('id', 'svg_score')
                .attr('width', width)
                .attr('height', height)
                .attr("viewBox", [0, 0, width, height]);

            // 设置 brush
            let brushX = d3.brushX()                 // Add the brush feature using the d3.brush function
                .extent([[0, 0], [width, height]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
                .on("end", updateChart)

            // 设置比例尺
            let xScale = d3.scaleLinear()
                .domain([0, data[data.length - 1].period * 720.0])
                .range([margin.left, width - margin.right]);
            let yScale1 = d3.scaleLinear()
                .domain([0, data[data.length - 1].homeTeamScore > data[data.length - 1].visitorTeamScore ? data[data.length - 1].homeTeamScore : data[data.length - 1].visitorTeamScore])
                .range([height / 2, margin.top]);
            let yScale2 = d3.scaleLinear()
                .domain([0, data[data.length - 1].homeTeamScore > data[data.length - 1].visitorTeamScore ? data[data.length - 1].homeTeamScore : data[data.length - 1].visitorTeamScore])
                .range([height / 2, height - margin.bottom]);

            let yScale = d3.scaleLinear()
                .domain(d3.extent(data.map(function (d) {
                    return Math.abs(d.homeTeamScore - d.visitorTeamScore);
                })))
                // .range([0, height / 3 - margin.top - margin.bottom]);
                .range([0, 20]);

            let homeScoreAreaFunction = d3.area()
                .x(function (d) {
                    return xScale(d.period * 720 - d.periodTime);
                })
                .y0(height / 2)
                .y1(function (d) {
                    let scoreDiff = d.homeTeamScore - d.visitorTeamScore
                    if (scoreDiff > 0) {
                        return height / 2 + yScale(scoreDiff)
                    } else {
                        return height / 2
                    }
                })
                .curve(d3.curveCatmullRom)

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
                .curve(d3.curveCatmullRom)

            // // 设置 主队 的 线条
            // let homeTeamLine = d3.line()
            //     .x(d => xScale(d.period * 720 - d.periodTime))
            //     .y(d => yScale2(d.homeTeamScore));
            //
            // // 设置 主队 的 线条
            // let visitorTeamLine = d3.line()
            //     .x(d => xScale(d.period * 720 - d.periodTime))
            //     .y(d => yScale1(d.visitorTeamScore));
            // let homeScoreLine = svg.append('path')
            //     .datum(data)
            //     .attr("fill", "none")
            //     .attr("stroke", "steelblue")
            //     .attr("stroke-width", 1.5)
            //     .attr("d", homeTeamLine);
            //
            // let visitorScoreLine = svg.append('path')
            //     .datum(data)
            //     .attr("fill", "none")
            //     .attr("stroke", "steelblue")
            //     .attr("stroke-width", 1.5)
            //     .attr("d", visitorTeamLine);

            // 画分差区域
            let g = svg.append('g')
                .call(brushX);
            let homeScoreArea = svg.append('path')
                .attr('transform', 'translate(' + 0 + ',' + (height / 2 - 30) + ')')
                .datum(data)
                .attr('d', homeScoreAreaFunction)
                .attr('fill', '#0e9bd2')
                .attr('opacity', 0.5)
                .call(brushX)
            let visitorScoreArea = svg.append('path')
                .attr('transform', 'translate(' + 0 + ',' + (height / 2 - 30) + ')')
                .datum(data)
                .attr('d', visitorScoreAreaFunction)
                .attr('fill', '#f56274')
                .attr('opacity', 0.5);
            // 画事件点 todo: 给点 在 y 上加一个随机值 抖动， 然后连接到 事件 发生 的 位置。
            let eventCircles = svg.selectAll('event')
                .data(data)
                .enter()
                .append('circle')
                .attr('cx', function (d) {
                    return xScale(d.period * 720 - d.periodTime)
                })
                .attr('cy', function (d) {
                    let scoreDiff = d.visitorTeamScore - d.homeTeamScore
                    if (scoreDiff > 0) {
                        return height / 2 - yScale(scoreDiff)
                    } else {
                        return height / 2 + yScale(Math.abs(scoreDiff))
                    }
                })
                .attr('r', 0.5);

            eventCircles.attr('opacity', 0);

            console.log(1);

            // 添加几条线
            svg.append('line')
                .attr('transform', 'translate(' + 0 + ',' + (height / 2 - 30) + ')')
                .attr('x1', xScale(0))
                .attr('y1', height / 2 - 25)
                .attr('x2', xScale(0))
                .attr('y2', height / 2 + 25)
                .style('stroke-width', 0.5)
                .attr('stroke', '#ae7a44')
            svg.append('line')
                .attr('transform', 'translate(' + 0 + ',' + (height / 2 - 30) + ')')
                .attr('x1', xScale(720))
                .attr('y1', height / 2 - 25)
                .attr('x2', xScale(720))
                .attr('y2', height / 2 + 25)
                .style('stroke-width', 0.5)
                .attr('stroke', '#ae7a44')
            svg.append('line')
                .attr('transform', 'translate(' + 0 + ',' + (height / 2 - 30) + ')')
                .attr('x1', xScale(720 * 2))
                .attr('y1', height / 2 - 25)
                .attr('x2', xScale(720 * 2))
                .attr('y2', height / 2 + 25)
                .style('stroke-width', 0.5)
                .attr('stroke', '#ae7a44')
            svg.append('line')
                .attr('transform', 'translate(' + 0 + ',' + (height / 2 - 30) + ')')
                .attr('x1', xScale(720 * 3))
                .attr('y1', height / 2 - 25)
                .attr('x2', xScale(720 * 3))
                .attr('y2', height / 2 + 25)
                .style('stroke-width', 0.5)
                .attr('stroke', '#ae7a44')
            svg.append('line')
                .attr('transform', 'translate(' + 0 + ',' + (height / 2 - 30) + ')')
                .attr('x1', xScale(720 * 4))
                .attr('y1', height / 2 - 25)
                .attr('x2', xScale(720 * 4))
                .attr('y2', height / 2 + 25)
                .style('stroke-width', 0.5)
                .attr('stroke', '#ae7a44')

            svg.append('line')
                .attr('transform', 'translate(' + 0 + ',' + (height / 2 - 30) + ')')
                .attr('x1', margin.left)
                .attr('x2', width - margin.right)
                .attr('y1', height / 2)
                .attr('y2', height / 2)
                .attr("stroke", "#6a8281");


            function updateChart() {
                console.log('刷选')

                // let extent = d3.event.selection;
                //
                // // If no selection, back to initial coordinate. Otherwise, update X axis domain
                // if (!extent) {
                //     if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                //     x.domain([4, 8])
                // } else {
                //     x.domain([x.invert(extent[0]), x.invert(extent[1])])
                //     scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
                // }
                //
                // // Update axis and circle position
                // xAxis.transition().duration(1000).call(d3.axisBottom(x))
                // scatter
                //     .selectAll("circle")
                //     .transition().duration(1000)
                //     .attr("cx", function (d) {
                //         return x(d.Sepal_Length);
                //     })
                //     .attr("cy", function (d) {
                //         return y(d.Petal_Length);
                //     })

            }

        },
        complete: function () {
            console.log('绘制 比赛图 完毕');
        }
    })
}

function draw_div_scoreV2() {
    // 这个函数画比分数据
    console.log('画比分数据')
    $.ajax({
        url: '/getScoreData/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: '0021500003',  // 比赛ID
        },
        beforeSend: function () {
            console.log('加载数据, 这里会弹出一个 框 让用户等待');

        },
        success: function (result, error) {
            // $('#matrix-container').empty();
            // todo: 在这里执行关掉等待页面响应的操作
            console.log('接收到整个比赛的得分 和 事件数据');
            console.log('异常信息', error, typeof error);
            console.log(result);

            // 清空 div 下 的 子节点
            // $('#div_score').empty();

            let scoreList = result.data;

        },
        complete: function () {
            console.log('绘制 比赛图 完毕');
        }
    })
}

function draw_round() {
    // 这个函数画比分数据
    console.log('画比分数据')
    $.ajax({
        url: '/getRoundData/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: '0021500003',  // 比赛ID
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

            // 得到 长度 宽度
            let width = $('#div_score').width(),
                height = $('#div_score').height(),
                margin = {left: 10, top: 10, right: 10, bottom: 10};

            // 建立svg
            let svg = d3.select('#svg_score')
                .attr('width', width)
                .attr('height', height)
                .attr("viewBox", [0, 0, width, height]);
            console.log(height)

            let g = svg.append('g')
                .attr('id', 'g_round')
                .attr('transform', 'translate(' + 15 + ',' + (height - 150) + ')');

            // 拿到 数据
            let quarterList = result.data;
            // 设置每一个小节的宽度 和 高度
            let quarterWidth = (width - 60) / quarterList.length,
                quarterHeight = 80;
            // 得到 y 上要映射的信息
            let key = 'links';
            let yList = [];
            for (let quarterData of quarterList) {
                for (let roundData of quarterData) {
                    yList.push(roundData[key].length)
                }
            }
            console.log(yList)

            // 设置 y 比例尺
            let yScale = d3.scaleLinear()
                .range([quarterHeight - 5, 0])
                .domain(d3.extent(yList));
            console.log(yScale);
            console.log(yScale(10));

            // 画图
            for (let i = 0; i < quarterList.length; i++) {
                let quarterData = quarterList[i];
                // 设置 横轴的比例尺
                let xScale = d3.scaleBand()
                    .range([0, quarterWidth])
                    .domain(quarterData.map(function (d) {
                        // console.log(d)
                        return d.roundIndex.toString();
                    }))
                    .padding(0.1);
                let g_round = g.append('g')
                    .attr('transform', 'translate(' + (10 + quarterWidth) * i + ',' + 0 + ')');
                g_round.selectAll('bar')
                    .data(quarterData)
                    .enter()
                    .append('rect')
                    .attr('id', function (d) {
                        return 'r-' + d.quarterIndex + '-' + d.roundIndex;
                    })
                    .attr('class', 'roundBar')
                    .attr('x', function (d) {
                        return xScale(d.roundIndex.toString());
                    })
                    .attr('y', function (d) {
                        return yScale(d[key].length)
                    })
                    .attr('rx', 5)
                    .attr('ry', 5)
                    .attr("width", xScale.bandwidth())
                    .attr("height", function (d) {
                        return quarterHeight - yScale(d[key].length);
                    })
                    .attr("fill", "#f5bb54")
                    .attr('opacity', 0.8)
                    .on('mouseover', mouseover)
                    .on('mouseout', mouseout)
                // 添加 一些 线条
                g_round.append('line')
                    .attr('transform', 'translate(' + 0 + ',' + (yScale.range()[0] - 20) + ')')
                    .attr('x1', xScale(0))
                    .attr('x2', xScale(0) + quarterWidth)
                    .attr('y1', 25)
                    .attr('y2', 25)
                    .style('stroke-width', 1)
                    .attr("stroke", "#6a8281")
                    .style('pointer-events', 'none');

            }

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


        },
        complete: function () {
            console.log('绘制 比赛图 完毕');
        }
    })
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
