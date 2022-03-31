// 画 树图
function draw_center_bottom_view_tree() {
    // get game id
    let gameID = $('#select-gameID option:selected').val();
    // 获取 数据
    $.ajax({
        url: '/getTreeData/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
        },
        beforeSend: function () {
            console.log('加载数据, 这里会弹出一个 框 让用户等待');

        },
        success: function (result, error) {
            console.log('接收到整个树图的数据');
            // console.log('异常信息', error, typeof error);
            console.log(result);
            // draw snapshots
            draw_snapshots(result)
        }
    })
}

function draw_snapshots(result) {
    //    首先 是 获取 div 宽度 和高度
    let divWidth = $('#center-bottom').width(),
        divHeight = $('#center-bottom').height();
    //    设置svg的长宽高
    let svg = d3.select('#svg-center-bottom')
        .style('height', divHeight)
        .style('width', divWidth);
    //  get g to draw tree data by g-ID : g-center-bottom-tree
    let  g_tree = svg.append('g')
        .attr('id', '#g-center-bottom-tree');
    // set width and height of g_tree
    let width = divWidth,
        height = divHeight,
        margin = {left:10, top:10, bottom:10, right:10};
    // get timeList data and merged index list
    let timeList = result['timeListGraphData'];
    let mergedList = result['timeListMergedIndex'];

    // 画第一条时间线
    // 设置 x 比例尺 和 y比例尺
    let x1 = d3.scaleLinear()
        .domain([0, timeList.length])
        .range([margin.left + 0.1*width, width - margin.right - 0.1*width]);
    let y1 = height * 0.1;
    // 设置时间条宽度
    let rectHeight = 0.05 * height;


    // 画第一条没有经过划分的时间线, 用rect表示
    let timeListRect = g_tree.append('rect')
        .attr('id', 'raw-time-list')
        .attr('x', x1(0))
        .attr('y', y1)
        .attr('width', x1(timeList.length) - x1(0))
        .attr('height', y1 / 2)
        .attr('fill', '#19c4fb');

    //  设置 单位宽度 和 空白 间隔
    let widthUnit = parseFloat(timeListRect.attr('width')) / timeList.length;
    let paddingWidth = (width - margin.left - margin.right - parseFloat(timeListRect.attr('width'))) / mergedList.length;

    // 设置 第二条 划线 在什么位置
    let x2 = margin.left;
    let y2 = 0.3 * height;

    mergedList.forEach(function (value, i) {
        let rw = value.length * widthUnit;
        g_tree.append('rect')
            .datum(value)
            .attr('id', 'rect-' + i)
            .attr('x', x2)
            .attr('y', y2)
            .attr('width', rw)
            .attr('height', rectHeight)
            .attr('fill', '#19c4fb');
        x2  = x2 + paddingWidth + value.length * widthUnit;
    });

    let r1 = d3.select('#rect-1');
    console.log(r1.datum())


    console.log('draw tree plot')

}