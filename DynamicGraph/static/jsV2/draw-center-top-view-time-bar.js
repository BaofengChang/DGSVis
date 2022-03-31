// 画 比分的 时间轴
function draw_game_score_timeBar(result) {
    return 1;
    console.log('画 时间 筛选轴')
    // console.log(result);
    //    首先 是 获取 div 宽度 和高度
    let divWidth = $('#center-top').width(),
        divHeight = $('#center-top').height();
    // margin = {left: 10, top: 10, right: 10, bottom: 10};
    //    设置svg的长宽高
    let svg = d3.select('#svg-center-top')
        .style('width', divWidth)
        .style('height', divHeight);
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
                    if (timeMiddle>= startGameSeconds && timeMiddle <= endGameSeconds){
                        // console.log(startGameSeconds, endGameSeconds, timeStart, timeEnd)
                        d3.select(this).attr('selected', 1)
                        return '#ccc'
                    }else {
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