function init_tree_view() {
    // draw_init_tree_data()
}


function draw_init_tree_data() {
    console.log('画树图');
    //取得 选中的 比赛 id
    let gameID = $('#select-gameID option:selected').val();
    //首先获取svgdiv的宽度 和 长度
    let divWidth = $('#div-tree').width(),
        divHeight = $('#div-tree').height();
    //设置svg的长宽高
    let svg = d3.select('#svg-tree')
        .style('height', divHeight - 40)
        .style('width', divWidth);

    $('#svg-tree').empty();

    // 得到 树图数据
    let value = d3.select('#load-tree-root').attr('value');

    console.log(value);

    $.ajax({
        url: '/getRootTreeData/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
            range: value   // 读取比赛的范围
        },
        beforeSend: function () {
            // console.log('加载数据, 这里会弹出一个 框 让用户等待');
        },
        success: function (result, error) {
            console.log('得到根节点数据', result[0]);
            // 得到数据
            let data = result;

            let width = divWidth;
            let height = divHeight;
            let margin = {left: 250, top: 10, right: 10, bottom: 10};

            // draw tree root
            // 建立比例尺
            let x0 = d3.scaleLinear()
                .domain([0, data.length])
                .range([margin.left + 0.2 * width, width - margin.right - 0.2 * width]);
            let y0 = 0.05 * height;


            let rectHeight = height * 0.08;
            let rectWidth = x0(1) - x0(0);

            // 建立树节点
            let g = svg.append('g')
                .datum('0')
                .attr('brushedStartIndex', data[0].indexList[0])
                .attr('brushedEndIndex', data[data.length - 1].indexList[0])
                .attr('id', 'g-tree-0')
                .attr('class', 'tree-level');

            // 建立画选项的视图
            let g1 = svg.append('g')
                .attr('class', 'g-tree-0');

            // 画根节点
            result.forEach(function (value, i) {
                // console.log(value, i)
                g.append('rect')
                // .datum([value.indexList])
                    .datum(value)
                    .attr('value', JSON.stringify(value.indexList))
                    .attr('id', 'rect-' + i)
                    .attr('class', 'rect-' + i + ' rect')
                    .attr('x', x0(i))
                    .attr('y', y0)
                    .attr('rx', 3)
                    .attr('ry', 3)
                    .attr('width', rectWidth)
                    .attr('height', rectHeight)
                    .attr('widthUnit', rectWidth)
                    .attr('opacity', 0.5)
                    .attr('fill', '#5191fb');
                // .attr('fill', colorScale(d.linkNum * 2 / d.nodeNum));
                // console.log(g.select('#rect-0').attr('value'))
            });

            let pianyi = -30;
            // 添加 统计值
            g1.append('text')
                .style('text-anchor', 'end')
                .attr('x', 120)
                .attr('y', y0 + pianyi)
                .text('Merge Stats:')
                .attr('font-size', 15)
                .attr('dy', 14)
                .style('pointer-events', 'none');
            g1.append('text')
                .style('text-anchor', 'start')
                .attr('x', 125)
                .attr('y', y0 + pianyi)
                .text('No Stats')
                .attr('font-size', 15)
                .attr('dy', 14)
                .style('pointer-events', 'none');

            pianyi = -10;
            // 画控制填充色的文字和渐变条
            g1.append('text')
                .style('text-anchor', 'end')
                .attr('x', 120)
                .attr('y', y0 + pianyi)
                .text('Ave Node Deg:')
                .attr('font-size', 15)
                .attr('dy', 14)
                .style('pointer-events', 'none');
            let svgDefs = g.append('defs');
            let mainGradient = svgDefs.append('linearGradient')
                .attr('id', 'fillGradient1');
            mainGradient.append('stop')
                .attr('class', 'stop-left')
                .attr('offset', '0');
            mainGradient.append('stop')
                .attr('class', 'stop-right')
                .attr('offset', '1');
            // let fillRange = d3.extent(result.map(d => (d.linkNum * 2 / d.nodeNum)));
            // 要填充的值
            let fillRange = data.map(d => (d.linkNum * 2 / d.nodeNum));
            // console.log(fillRange);
            g1.append('rect')
                .datum(fillRange)
                // .attr('min', fillRange[0])
                .classed('filled1', true)
                .attr('id', 'fillRect_' + 'g-tree-0')
                .attr('x', 125)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('width', 100)
                .attr('height', 15)
                .on('click', fillRectClicked)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);

            pianyi = 10;
            // 添加节点属性
            g1.append('text')
                .style('text-anchor', 'end')
                .attr('x', 120)
                .attr('y', y0 + pianyi)
                .text('Node Attr:')
                .attr('font-size', 15)
                .attr('dy', 14)
                .style('pointer-events', 'none');
            // 添加代表节点属性的小矩形和折线图
            let nodeMinValueList = data.map(d => d.nodeSpeed[0]);
            let nodeMeanValueList = data.map(d => d.nodeSpeed[1]);
            let nodeMaxValueList = data.map(d => d.nodeSpeed[2]);
            // console.log(nodeMinValueList, nodeMeanValueList, nodeMaxValueList);
            // 画节点属性最小值的连线
            drawNodeAttributeLine(nodeMinValueList, g, 'nodeMinAttr', '#ccece6');
            drawNodeAttributeLine(nodeMeanValueList, g, 'nodeMeanAttr', '#66c2a4');
            drawNodeAttributeLine(nodeMaxValueList, g, 'nodeMaxAttr', '#006d2c');

            g1.append('rect')
                .datum(nodeMinValueList)
                .attr('id', 'nodeMinAttr_' + 'g-tree-0')
                .attr('x', 125)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('width', 30)
                .attr('height', 15)
                .attr('fill', '#ccece6')
                .on('click', nodeMinAttrClick)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);
            g1.append('rect')
                .datum(nodeMeanValueList)
                .attr('id', 'nodeMeanAttr_' + 'g-tree-0')
                .attr('x', 125 + 35)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('width', 30)
                .attr('height', 15)
                .attr('fill', '#66c2a4')
                .on('click', nodeMinAttrClick)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);
            g1.append('rect')
                .datum(nodeMaxValueList)
                .attr('id', 'nodeMaxAttr_' + 'g-tree-0')
                .attr('x', 125 + 70)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('width', 30)
                .attr('height', 15)
                .attr('fill', '#006d2c')
                .on('click', nodeMinAttrClick)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);


            // 添加代表节点属性的小矩形和折线图
            let linkDistanceMinValueList = data.map(d => d.linkDistance[0]);
            let linkDistanceMeanValueList = data.map(d => d.linkDistance[1]);
            let linkDistanceMaxValueList = data.map(d => d.linkDistance[2]);
            // console.log(linkDistanceMinValueList, linkDistanceMeanValueList, linkDistanceMaxValueList);
            // 画节点属性最小值的连线
            drawNodeAttributeLine(linkDistanceMinValueList, g, 'linkDistanceMin', '#fcc5c0');
            drawNodeAttributeLine(linkDistanceMeanValueList, g, 'linkDistanceMean', '#f768a1');
            drawNodeAttributeLine(linkDistanceMaxValueList, g, 'linkDistanceMax', '#7a0177');
            pianyi = 30;
            // 添加连接属性
            g1.append('text')
                .style('text-anchor', 'end')
                .attr('x', 120)
                .attr('y', y0 + pianyi)
                .text('Link Attr 1:')
                .attr('font-size', 15)
                .attr('dy', 14)
                .style('pointer-events', 'none');
            // 添加代表连接属性的小矩形
            g1.append('rect')
                .attr('id', 'linkDistanceMin_' + 'g-tree-0')
                .attr('x', 125)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('width', 30)
                .attr('height', 15)
                .attr('fill', '#fcc5c0')
                .on('click', nodeMinAttrClick)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);
            g1.append('rect')
                .attr('id', 'linkDistanceMean_' + 'g-tree-0')
                .attr('x', 125 + 35)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('width', 30)
                .attr('height', 15)
                .attr('fill', '#f768a1')
                .on('click', nodeMinAttrClick)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);
            g1.append('rect')
                .attr('id', 'linkDistanceMax_' + 'g-tree-0')
                .attr('x', 125 + 70)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('width', 30)
                .attr('height', 15)
                .attr('fill', '#7a0177')
                .on('click', nodeMinAttrClick)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);

            // 添加代表节点属性的小矩形和折线图
            let linkStableMinValueList = data.map(d => d.linkStable[0]);
            let linkStableMeanValueList = data.map(d => d.linkStable[1]);
            let linkStableMaxValueList = data.map(d => d.linkStable[2]);
            // console.log(linkDistanceMinValueList, linkDistanceMeanValueList, linkDistanceMaxValueList);
            // 画节点属性最小值的连线
            drawNodeAttributeLine(linkStableMinValueList, g, 'linkStableMin', '#fed976');
            drawNodeAttributeLine(linkStableMeanValueList, g, 'linkStableMean', '#fd8d3c');
            drawNodeAttributeLine(linkStableMaxValueList, g, 'linkStableMax', '#bd0026');

            pianyi = 50;
            // 添加连接属性2
            g1.append('text')
                .style('text-anchor', 'end')
                .attr('x', 120)
                .attr('y', y0 + pianyi)
                .text('Link Attr 2:')
                .attr('font-size', 15)
                .attr('dy', 14)
                .style('pointer-events', 'none');
            // 添加代表连接属性的小矩形
            g1.append('rect')
                .attr('id', 'linkStableMin_' + 'g-tree-0')
                .attr('x', 125)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('width', 30)
                .attr('height', 15)
                .attr('fill', '#fed976')
                .on('click', nodeMinAttrClick)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);
            g1.append('rect')
                .attr('id', 'linkStableMean_' + 'g-tree-0')
                .attr('x', 125 + 35)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('width', 30)
                .attr('height', 15)
                .attr('fill', '#fd8d3c')
                .on('click', nodeMinAttrClick)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);
            g1.append('rect')
                .attr('id', 'linkStableMax_' + 'g-tree-0')
                .attr('x', 125 + 70)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('width', 30)
                .attr('height', 15)
                .attr('fill', '#bd0026')
                .on('click', nodeMinAttrClick)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);

            // 添加另一个渐变条
            pianyi = 70;
            g1.append('text')
                .style('text-anchor', 'end')
                .attr('x', 120)
                .attr('y', y0 + pianyi)
                .text('Graph Stability:')
                .attr('font-size', 15)
                .attr('dy', 14)
                .style('pointer-events', 'none');
            let svgDefs2 = g.append('defs');
            let mainGradient2 = svgDefs2.append('linearGradient')
                .attr('id', 'fillGradient2');
            mainGradient2.append('stop')
                .attr('class', 'stop-left2')
                .attr('offset', '0');
            mainGradient2.append('stop')
                .attr('class', 'stop-right2')
                .attr('offset', '1');
            // let fillRange = d3.extent(result.map(d => (d.linkNum * 2 / d.nodeNum)));
            // 要填充的值
            let fillRange2 = data.map(d => (d.linkNum * d.linkAppearNum /
                (d.nodeSpeed[1] + 1) / (d.nodeNum + 1) / (d.linkDistance[1] + 1) / d.indexList.length));
            // console.log(fillRange);
            g1.append('rect')
                .datum(fillRange2)
                // .attr('min', fillRange[0])
                .classed('filled2', true)
                .attr('id', 'fillRect2_' + 'g-tree-0')
                .attr('x', 125)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('width', 100)
                .attr('height', 15)
                .on('click', fillRectClicked2)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);

            pianyi = 90;
            g1.append('text')
                .style('text-anchor', 'end')
                .attr('x', 120)
                .attr('y', y0 + pianyi)
                .text('Operation:')
                .attr('font-size', 15)
                .attr('dy', 14)
                .style('pointer-events', 'none');
            g1.append('rect')
                .attr('id', 'delete_' + 'g-tree-0')
                .attr('x', 125)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('width', 48)
                .attr('height', 17)
                .attr('fill', '#fed976')
                .on('click', deleteFunction)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);
            g1.append('text')
                .style('text-anchor', 'start')
                .attr('x', 127)
                .attr('y', y0 + pianyi)
                .text('delete')
                .attr('border', '#bd0026')
                .attr('font-size', 15)
                .attr('dy', 14)
                .style('pointer-events', 'none');
            g1.append('rect')
                .attr('id', 'focus_' + 'g-tree-0')
                .attr('x', 180)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('width', 45)
                .attr('height', 17)
                .attr('value', 0)
                .attr('fill', '#fed976')
                .on('click', focusFunction)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);
            g1.append('text')
                .style('text-anchor', 'start')
                .attr('x', 181)
                .attr('y', y0 + pianyi)
                .text('focus')
                .attr('border', '#bd0026')
                .attr('font-size', 15)
                .attr('dy', 14)
                .style('pointer-events', 'none');

            // 添加 brush 范围
            let rects = g.selectAll('.rect').nodes();
            let xmin = parseFloat(d3.select(rects[0]).attr('x'));
            let ymin = parseFloat(d3.select(rects[0]).attr('y'));
            let xmax = parseFloat(d3.select(rects[rects.length - 1]).attr('x')) + parseFloat(d3.select(rects[rects.length - 1]).attr('width'));
            let ymax = parseFloat(d3.select(rects[rects.length - 1]).attr('height')) + ymin;

            console.log('brush 范围', xmin, ymin, xmax, ymax);
            // 设置 brush
            let brushX = d3.brushX()                 // Add the brush feature using the d3.brush function
                .extent([[xmin, ymin], [xmax, ymax]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
                .on("end", brushEnd);
            g.call(brushX);
        }
    })

}


//给定系列值，画曲线
function drawNodeAttributeLine(valueList, g, gClass, strokeColor) {
    let height = g.select('.rect-0').attr('height');
    let y = parseFloat(g.select('.rect-0').attr('y'));
    let yScale = d3.scaleLinear()
        .domain(d3.extent(valueList))
        .range([height - 10, 15]);
    let pathList = [];
    // 构建 线条 数据
    valueList.forEach(function (d, i) {
        let classLabel = '.rect-' + i;
        let x = parseFloat(g.select(classLabel).attr('x'));
        let width = parseFloat(g.select(classLabel).attr('width'));
        pathList.push([x + width / 2, y + yScale(d)]);
    });
    // 构建线条函数
    let lineFunction = d3.line()
        .x(function (d) {
            return d[0];
        })
        .y(function (d) {
            return d[1];
        })
        // .curve(d3.curveNatural);
        .curve(d3.curveMonotoneX);
    // let g1 = g.append('g')

    g.append('path')
        .attr('class', gClass)
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .datum(pathList)
        .attr('d', lineFunction)
        .attr('fill', 'none')
        .attr('stroke', strokeColor)
        .attr('stroke-width', 2);
}


function nodeMinAttrClick() {
    // 得到 id
    let gID = d3.select(this).attr('id').split('_')[1];
    let classLabel = d3.select(this).attr('id').split('_')[0];
    console.log(classLabel);
    let g = d3.select('#' + gID);
    let clicked = d3.select(this).attr('clicked');
    // console.log(clicked)
    if (clicked === 'true') {
        // 执行 消除 事件
        d3.select(this).attr('clicked', false);
        d3.select(this)
            .style('stroke-width', 0);
        g.select('.' + classLabel).style('opacity', 0)
    } else {
        d3.select(this).attr('clicked', true);
        d3.select(this)
            .style('stroke', '#000')
            .style('stroke-width', 3);
        g.select('.' + classLabel).style('opacity', 1)
    }
}

// 点击填充颜色
function fillRectClicked() {
    // 得到 id
    let gID = d3.select(this).attr('id').split('_')[1];
    let g = d3.select('#' + gID);
    let clicked = d3.select(this).attr('clicked');
    // console.log(clicked)
    if (clicked === 'true') {
        // 执行 消除 事件
        d3.select(this).attr('clicked', false);
        d3.select(this)
            .style('stroke-width', 0);
        g.selectAll('.rect').attr('fill', '#5191fb')
    } else {
        d3.select(this).attr('clicked', true);
        d3.select(this)
            .style('stroke', '#000')
            .style('stroke-width', 3);
        let fillValue = d3.select(this).datum();
        // console.log(fillValue)
        let colorScale = d3.scaleLinear()
            .domain(d3.extent(fillValue))
            .range(['#fee5d9', '#a50f15']);
        fillValue.forEach(function (value, i) {
            g.select('.rect-' + i)
                .attr('fill', colorScale(value));
        })
    }
}

// 点击填充颜色
function fillRectClicked2() {
    // 得到 id
    let gID = d3.select(this).attr('id').split('_')[1];
    let g = d3.select('#' + gID);
    let clicked = d3.select(this).attr('clicked');
    // console.log(clicked)
    if (clicked === 'true') {
        // 执行 消除 事件
        d3.select(this).attr('clicked', false);
        d3.select(this)
            .style('stroke-width', 0);
        g.selectAll('.rect').attr('fill', '#5191fb');
    } else {
        d3.select(this).attr('clicked', true);
        d3.select(this)
            .style('stroke', '#000')
            .style('stroke-width', 3);
        let fillValue = d3.select(this).datum();
        // console.log(fillValue)
        let colorScale = d3.scaleLinear()
            .domain(d3.extent(fillValue))
            .range(['#eff3ff', '#08519c']);
        fillValue.forEach(function (value, i) {
            g.select('.rect-' + i)
                .attr('fill', colorScale(value));
        })
    }
}

// 鼠标事件
function fillRectMouseover() {
    d3.select(this)
        .transition()
        .duration(50)
        .style('opacity', 0.2);

}

// 鼠标事件
function fillRectMouseout() {
    d3.select(this)
        .transition()
        .duration(50)
        .style('opacity', 1)
}

// 给定两个点生成贝塞尔曲线
function bzpath(x0, y0, x1, y1) {
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


function focusFunction() {
    console.log('focus function');
    let indexList = d3.select(this).attr('value');
    if (indexList === '0') {
        // alert('Please Brush Your Interested Time Slice!');
        console.log('请先brush来选择感兴趣的时间片')

    } else {
        console.log('执行focus函数，画细节视图', typeof indexList, indexList);
        draw_node_link_court(indexList)
        // todo 执行 场地视图 等 操作
    }
}

function deleteFunction() {
    console.log('删除数据');
    // 得到 id
    let gID = d3.select(this).attr('id').split('_')[1];
    let gNumber = parseInt(gID.split('-')[2]);
    let gLength = d3.selectAll('.tree-level').size();
    console.log('要删除的范围', gNumber, gLength)
    for (let i = gNumber; i <= gLength; i++) {
        d3.select('#g-tree-' + i).remove();
        d3.select('.g-tree-' + i).remove();
    }
}


function brushEnd() {
    let extent = d3.event.selection;
    if (extent != null) {
        console.log(extent);
        // 得到 刷选范围
        let xl = extent[0],
            xr = extent[1];
        console.log('do brush function');
        let gid = d3.select(this).attr('id');
        console.log(gid)
        let indexList = [];
        d3.select('#' + gid).selectAll('.rect').each(function (d, i) {
            let rectClassLabel = '.rect-' + i;
            let x = parseFloat(d3.select('#' + gid).select(rectClassLabel).attr('x'));
            let w = parseFloat(d3.select('#' + gid).select(rectClassLabel).attr('width'));
            x = x + w / 2;
            if (x >= xl && x <= xr) {
                let index = JSON.parse(d3.select('#' + gid).select(rectClassLabel).attr('value'));
                // console.log(index);
                indexList.push(index);
            }
        });
        // 保存节点顺序
        console.log('保存时间点顺序', indexList);
        d3.select('#focus_' + gid).attr('value', JSON.stringify(indexList));

        // // console.log(xScale.invert(extent[0]))
        // // 得到 刷选 的 起始时间 和 截止时间
        // // 使用 转换函数
        // let startGameSeconds = xScale.invert(extent[0]),
        //     endGameSeconds = xScale.invert(extent[1]);
        // let startPeriodIndex = parseInt(startGameSeconds / 720.0),
        //     endPeriodIndex = parseInt(endGameSeconds / 720.0),
        //     startPeriodSecond = 720 - startGameSeconds - (startPeriodIndex * 720),
        //     endPeriodSecond = 720 - endGameSeconds + (endPeriodIndex * 720);
        // console.log('选中的时间信息', startPeriodIndex, startPeriodSecond, endPeriodIndex, endPeriodSecond)
    } else {
        console.log('没有brush的情况下 做什么操作')
        let gid = d3.select(this).attr('id');
        d3.select('#focus_' + gid).attr('value', '0');
        console.log(d3.select('.rect-1').datum())
    }
}


function tree_zoom() {

    let divWidth = $('#matrix-scatter').width(),
        divHeight = $('#matrix-scatter').height();
    let timeWidth = divWidth,
        margin = {left: 10, top: 10, right: 10, bottom: 10},
        timeHeight = (divHeight - divWidth - 67.5);

    const zoom = d3.zoom()
        .scaleExtent([0.8, 8])
        .extent([[0, 0], [timeWidth, timeHeight]])
        .on("zoom", zoomed);

    // zoom的功能
    function zoomed() {
        d3.select('#svg-tree')
            .selectAll('g')
            .attr('transform', d3.event.transform)
    }

    // d3.select('#svg-scatter')
    //     .on('.drag', null);

    let clicked = d3.select('#tree_zoom').attr('clicked');
    // console.log(clicked)
    if (clicked === 'true') {
        // 执行 消除 事件
        d3.select('#tree_zoom').attr('clicked', false);

        d3.select('#svg-tree')
            .on('.zoom', null);
    } else {
        d3.select('#tree_zoom').attr('clicked', true);

        d3.select('#svg-tree')
            .call(zoom);

    }


}