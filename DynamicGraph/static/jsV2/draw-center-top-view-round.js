// 画 回合 数据
function draw_center_top_round() {
    // 画 回合 数据
    //    首先 是 获取 div 宽度 和高度
    let divWidth = $('#center-top').width(),
        divHeight = $('#center-top').height();
    // margin = {left: 10, top: 10, right: 10, bottom: 10};
    //    设置svg的长宽高
    let svg = d3.select('#svg-center-top')
        .style('width', divWidth)
        .style('height', divHeight);
    d3.select('#g-center-top-round').remove()
    //  取得 选中的 比赛 id
    let gameID = $('#select-gameID option:selected').val();
    $.ajax({
        url: '/getRoundData/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
        },
        beforeSend: function () {
            // console.log('加载数据, 这里会弹出一个 框 让用户等待');
        },
        success: function (result, error) {
            console.log('接收到整个比赛的 回合数据');
            console.log('异常信息', error, typeof error);
            console.log(result);
            // 得到 长度 宽度
            let width = divWidth,
                height = 90,
                margin = {left: 10, top: 10, right: 10, bottom: 10};
            // 创建 承载 round 的 g 节点
            let gRound = svg.append('g')
                .attr('id', 'g-center-top-round')
                .attr('transform', 'translate(' + 15 + ',' + (divHeight - 100) + ')');

            // 拿到 数据
            let quarterList = result.data;
            // 设置每一个小节的宽度 和 高度
            let quarterWidth = (width - 60) / quarterList.length,
                quarterHeight = 85;

            // 得到 y 上要映射的信息
            let key = 'links';
            let yList = [];
            for (let quarterData of quarterList) {
                for (let roundData of quarterData) {
                    yList.push(roundData[key].length)
                }
            }
            // console.log(yList);
            // 设置 y 比例尺
            let yScale = d3.scaleLinear()
                .range([quarterHeight - 2, 0])
                .domain(d3.extent(yList));
            // 建立 颜色比例尺
            let rColor = ['#1258cc', '#0fcc45', '#ccc011', '#cc3214'];


            // 遍历 小节
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
                // 承载这个小节的g
                let g_round = gRound.append('g')
                    .attr('id', 'g-center-top-quarter-' + i)
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
                    .attr("fill", rColor[i])
                    .attr("fill-color", rColor[i])
                    .attr('opacity', 0.8)
                    .on('mouseover', roundMouseover)
                    .on('mouseout', roundMouseout);
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

            function roundMouseover() {
                d3.select(this)
                    .transition()
                    // .duration(50)
                    .style('opacity', 0.2)
            }

            function roundMouseout() {
                d3.select(this)
                    .transition()
                    // .duration(50)
                    .style('opacity', 0.8)
            }

        }
    })
}