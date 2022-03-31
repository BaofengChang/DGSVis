// 画左侧视图的散点图
function draw_left_view_scatter() {
    //取得 选中的 比赛 id
    let gameID = $('#select-gameID option:selected').val();
    //首先获取svgdiv的宽度 和 长度
    let divWidth = $('#matrix-scatter').width(),
        divHeight = $('#matrix-scatter').height();
    //设置svg的长宽高
    let svg = d3.select('#svg-scatter')
        .style('height', divHeight - divWidth-67.5)
        .style('width', divWidth);

    $.ajax({
        url: '/getScatterPlotData/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
        },
        beforeSend: function () {
            // console.log('加载数据, 这里会弹出一个 框 让用户等待');
        },
        success: function (result, error) {
            console.log('得到散点图数据', result);

            // 回合 降维 数据 和 时间 降维 数据
            let timeData = result['timeData'];
            svg.empty();

            // 设置 散点图的长度和宽度
            let timeWidth = divWidth,
                margin = {left: 10, top: 10, right: 10, bottom: 10},
                timeHeight = (divHeight - divWidth-67.5);

            const zoom = d3.zoom()
                .scaleExtent([1, 8])
                .extent([[0, 0], [timeWidth, timeHeight]])
                .on("zoom", zoomed);
            // svg.call(zoom);

            // 设置承载时间点散点图的g节点
            let gTimeScatter = svg
                .append('g');
                // .attr('id', 'g-game-time-scatter')
                // .attr('viewBox', [0, 0, timeWidth, timeHeight])
                // .attr('transform', 'translate(' + 0 + ',' + (divWidth) + ')');

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
                .range(['#fef0d9', '#b30000']);

            // 画时间线函数
            let lineFunction = d3.line()
                .x(function (d) {
                    return tx(d.x);
                })
                .y(function (d) {
                    return ty(d.y);
                })
                .curve(d3.curveMonotoneX);


            gTimeScatter.append('path')
                .attr('d', lineFunction(timeData.data))
                .attr("fill", "none")
                .attr("stroke", "#6b7d7c")
                .attr('opacity', 0.5)
                .attr("stroke-width", 1);


            // 画点
            let timeCircle = gTimeScatter.selectAll('node')
                .data(timeData.data)
                .enter()
                .append('circle')
                .attr('id', function (d) {
                    let timeIndex = d.timeIndex[0];
                    return 'q-' + timeIndex[1] + '-r-' + timeIndex[3] + '-t-' + timeIndex[5];
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

            function zoomed() {
                d3.select('#svg-scatter')
                    .selectAll('g')
                    .attr('transform', d3.event.transform)
            }

        }
    })
}