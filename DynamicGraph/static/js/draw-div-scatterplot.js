function draw_div_scatter() {
    $.ajax({
        url: '/getScatterPlotData/',   // 得到 散点图 数据
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
            // console.log(result);

            // 回合 降维 数据 和 时间 降维 数据
            let roundData = result.roundData;
            let timeData = result.timeData;
            console.log(timeData);

            // 清空 div 下 的 子节点
            $('#div_scatterplot').empty();

            // 得到 svg 的 长宽 高
            let width = $('#div_scatterplot').width(),
                heigth = $('#div_scatterplot').height(),
                margin = {left: 10, top: 10, right: 10, bottom: 10};
            // 添加 svg，再添加一个g 便宜10px 以防占到边
            let svg = d3.select('#div_scatterplot').append('svg')
                .attr('width', width)
                .attr('height', heigth)
                .append('g');

            // 添加 一个 分界线
            svg.append('line')
                .attr('x1', margin.left)
                .attr('x2', width - margin.right)
                .attr('y1', heigth/2)
                .attr('y2', heigth/2)
                .attr("stroke", "#6a8281");





            console.log(roundData)
            let xScale2 = d3.scaleLinear()
                .domain(d3.extent(roundData.data.map(d => d.x)))
                // .domain([-1, 1])
                .range([margin.left, width - margin.left - margin.right]);
            let yScale2 = d3.scaleLinear()
                .domain(d3.extent(roundData.data.map(d => d.y)))
                .range([ margin.top / 2, (heigth - margin.top - margin.bottom) / 2]);
            // 设置颜色比例尺
            let colorScale2 = d3.scaleLinear()
                .domain([0, roundData.data.length/2, roundData.data.length])
                .range(['#2c50d2', '#f5ca24', '#ff0305']);

            // 画点
            let roundCircle = svg.selectAll('node')
                .data(roundData.data)
                .enter()
                .append('circle')
                .attr('cx', d => xScale2(d.x))
                .attr('cy', d => yScale2(d.y))
                .attr('r', 3)
                .attr('fill', function (d, i) {
                    // let index = d.timeIndex[0];
                    // let time = index[1] * 720 + 720 - index[2];
                    return colorScale2(i);
                })
                .attr('class', function (d) {
                    return d.timeIndex[0][0];
                });



            // .attr('transform', "translate(" + margin.left + ',' + margin.right + ')');
            // 设置比例尺 x 比例尺 和 y 比例尺  基于 时间降维数据
            let xScale1 = d3.scaleLinear()
                .domain(d3.extent(timeData.data.map(d => d.x)))
                // .domain([-1, 1])
                .range([margin.left, width - margin.left - margin.right]);
            let yScale1 = d3.scaleLinear()
                .domain(d3.extent(timeData.data.map(d => d.y)))
                .range([heigth/2 + margin.top, heigth/2 +(heigth - margin.top - margin.bottom) / 2]);

            // 设置颜色比例尺
            let colorScale1 = d3.scaleLinear()
                 .domain([0, 4 * 720])
                .range(['#2c50d2', '#ff0305']);
                //
                // .domain([0, 2*720, 4 * 720])
                // .range(['#2c50d2', '#f5ca24', '#ff0305']);


            // 画点
            let timeCircle = svg.selectAll('node')
                .data(timeData.data)
                .enter()
                .append('circle')
                .attr('cx', (d => xScale1(d.x)))
                .attr('cy', d => yScale1(d.y))
                .attr('r', 1)
                .attr('fill', function (d) {
                    let index = d.timeIndex[0];
                    let time = index[1] * 720 + 720 - index[2];
                    return colorScale1(time);
                })
                .attr('class', function (d) {
                    return d.timeIndex[0][0];
                });




        },
        complete: function () {
            console.log('绘制 比赛图 完毕');
        }
    })

}