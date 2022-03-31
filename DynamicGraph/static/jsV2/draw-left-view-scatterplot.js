// 画左侧视图的散点图
function draw_game_scatterplot() {
    console.log('画散点图')
    //    首先获取svgdiv的宽度 和 长度
    let divWidth = $('#left').width(),
        divHeight = $('#left').height();
//    设置svg的长宽高
    let svg = d3.select('#svg-left')
        .style('height', divHeight)
        .style('width', divWidth);
//  取得 选中的 比赛 id
    let gameID = $('#select-gameID option:selected').val();

    $.ajax({
        url: '/getScatterPlotData/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
        },
        beforeSend: function () {
            console.log('加载数据, 这里会弹出一个 框 让用户等待');

        },
        success: function (result, error) {
            // $('#matrix-container').empty();
            // todo: 在这里执行关掉等待页面响应的操作
            console.log('接收到整个回合数据和时间戳 散点图');
            console.log('异常信息', error, typeof error);
            // console.log(result);

            // 回合 降维 数据 和 时间 降维 数据
            let roundData = result.roundData;
            svg.select('#g-game-rounds').remove();

            // 设置 散点图的长度和宽度
            let roundWidth = divWidth,
                margin = {left: 10, top: 10, right: 10, bottom: 10},
                roundHeight = (divHeight - divWidth - margin.top - margin.bottom) / 2;

            let gRoundScatter = svg.append('g')
                .attr('id', 'g-game-rounds')
                .attr('viewBox', [0, 0, roundWidth, roundHeight])
                .attr('transform', 'translate(' + 0 + ',' + (divWidth) + ')');

            // 建立 比例尺
            let rx = d3.scaleLinear()
                .domain(d3.extent(roundData.data.map(d => d.x)))
                // .domain([-1, 1])
                .range([margin.left, roundWidth - margin.right]);
            let ry = d3.scaleLinear()
                .domain(d3.extent(roundData.data.map(d => d.y)))
                .range([margin.top + 10, roundHeight - margin.bottom - 30]);
            // 建立 颜色比例尺
            let rColor = ['#1258cc', '#0fcc45', '#ccc011', '#cc3214'];

            // 画点
            let roundCircle = gRoundScatter.selectAll('node')
                .data(roundData.data)
                .enter()
                .append('circle')
                .attr('id', function (d) {
                    let timeIndex = d.timeIndex[0];
                    return 'q-' + timeIndex[1] + '-r-' + timeIndex[3];
                })
                .attr('cx', d => rx(d.x))
                .attr('cy', d => ry(d.y))
                .attr('r', 2)
                .attr('fill', function (d, i) {
                    let timeIndex = d.timeIndex[0][1];
                    return rColor[timeIndex]
                })
                .attr('class', function (d) {
                    return d.timeIndex[0][0];
                });

            let timeData = result.timeData;
            console.log(roundData, timeData);
            svg.select('#g-game-times').remove();

            let timeWidth = divWidth,
                timeHeight = (divHeight - divWidth - roundHeight);

            let gTimeScatter = svg.append('g')
                .attr('id', 'g-game-times')
                .attr('viewBox', [0, 0, timeWidth, timeHeight])
                .attr('transform', 'translate(' + 0 + ',' + (divWidth + roundHeight) + ')');
            // 设置比例尺
            let tx = d3.scaleLinear()
                .domain(d3.extent(timeData.data.map(d => d.x)))
                // .domain([-1, 1])
                .range([margin.left, timeWidth - margin.right]);
            let ty = d3.scaleLinear()
                .domain(d3.extent(timeData.data.map(d => d.y)))
                .range([margin.top, timeHeight - margin.bottom]);

            // 设置颜色比例尺
            let colorScale1 = d3.scaleLinear()
                .domain([0, 2 * 720, 4 * 720])
                .range(['#2c50d2', '#ccc011', '#ff0305']);

            // 画点
            let timeCircle = gTimeScatter.selectAll('node')
                .data(timeData.data)
                .enter()
                .append('circle')
                .attr('id', function (d) {
                    let timeIndex = d.timeIndex[0];
                    return 'q-' + timeIndex[1] + '-r-' + timeIndex[3] + '-t-'+timeIndex[5];
                })
                .attr('class', function (d) {
                    let timeIndex = d.timeIndex[0];
                    return 'q-' + timeIndex[1] + '-r-' + timeIndex[3] + ' ' + timeIndex[0];
                })
                .attr('cx', (d => tx(d.x)))
                .attr('cy', d => ty(d.y))
                .attr('r', 1)
                .attr('fill', function (d) {
                    let index = d.timeIndex[0];
                    let time = index[1] * 720 + 720 - index[2];
                    return colorScale1(time);
                });





            // 添加 刷选 功能
            let brushR = d3.brush()
                .extent([[3, 8], [roundWidth-3, roundHeight-30]])
                .on("end", brushRound);

            gRoundScatter.call(brushR);

            function brushRound() {
                let extent = d3.event.selection;
                // console.log(extent)
                if (extent != null) {
                    // 先把 所有的 时间散点图 上的 点 置为 空
                    // timeCircle.attr('r', 1);
                    roundCircle.attr('r', function (d) {
                        let x = rx(d.x),
                            y = ry(d.y);
                        if (x>=extent[0][0] && x<=extent[1][0] && y>=extent[0][1] && y<=extent[1][1]){
                            let timeClass = d3.select(this).attr('id')
                            gTimeScatter.selectAll('.'+timeClass).attr('r', 5);
                            // console.log(timeClass)
                            return 5;
                        }else {
                            // let timeClass = d3.select(this).attr('id')
                            // gTimeScatter.selectAll('.'+timeClass).attr('r', 1);
                            return 2;
                        }
                    })
                } else {
                    // 恢复原样
                    roundCircle.attr('r', 2);
                    timeCircle.attr('r', 1);
                }
            }

            // 添加 刷选 功能
            let brushT = d3.brush()
                .extent([[3, 0], [timeWidth-3, timeHeight-3]])
                .on("end", brushTime);

            gTimeScatter.call(brushT);

            function brushTime() {
                let extent = d3.event.selection;
                // console.log(extent);
                if (extent != null) {
                    roundCircle.attr('r', 2);
                    timeCircle.attr('r', function (d) {
                        let x = tx(d.x),
                            y = ty(d.y);
                        if (x>=extent[0][0] && x<=extent[1][0] && y>=extent[0][1] && y<=extent[1][1]){
                            let roundID = d3.select(this).attr('class').split(' ')[0];
                            gRoundScatter.select('#' + roundID).attr('r', 5);
                            return 5;
                        }else {
                            return 1;
                        }
                    })

                } else {
                    roundCircle.attr('r', 2);
                    timeCircle.attr('r', 1)
                }
            }
        },
        complete: function () {
            console.log('绘制 左侧 散点 完毕');
        }
    })
}