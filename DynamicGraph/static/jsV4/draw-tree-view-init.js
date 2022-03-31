function draw_root_tree_by_TimeRange(startTime, endTime) {
    console.log('根据时间画初始树', startTime, endTime);
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
    // let value = d3.select('#load-tree-root').attr('value');

    // console.log(value);

    $.ajax({
        url: '/getRootTreeByTimeRange/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
            startTime: startTime,   // 读取比赛的范围
            endTime: endTime,   // 读取比赛的范围
        },
        beforeSend: function () {
            // console.log('加载数据, 这里会弹出一个 框 让用户等待');
        },
        success: function (result, error) {
            // console.log('得到根节点数据', result['data'][0]);
            console.log('得到根节点数据', result);
            // 得到数据
            let data = result['data'];
            let brushedIndex = result['brushedIndex'];

            let width = divWidth;
            let height = divHeight;
            let margin = {left: 250, top: 10, right: 10, bottom: 10};

            // draw tree root
            // 建立比例尺
            let x0 = d3.scaleLinear()
                .domain([0, data.length])
                // .range([margin.left + 0.1 * width, width - margin.right - 0.1 * width]);
                .range([margin.left + 0 * width, width - margin.right - 0 * width - 20]);
            let y0 = 0.05 * height;


            let rectHeight = height * 0.08;
            let rectWidth = x0(1) - x0(0);
            let padding = (width - margin.left - margin.right - rectWidth * result.data.length) / (result.data.length-1);
            let x = margin.left;
            let paddingWidth = (width - margin.left - margin.right - rectWidth * result.data.length);

            // 建立树节点
            let g = svg.append('g')
                .datum('0')
                .attr('brushedStartIndex', data[0].indexList[0])
                .attr('brushedEndIndex', data[data.length - 1].indexList[0])
                .attr('brushedIndex', JSON.stringify(brushedIndex))
                .attr('id', 'g-tree-0')
                .attr('class', 'tree-level');

            // 建立画选项的视图
            let g1 = svg.append('g')
                .attr('class', 'g-tree-0');

            // 画根节点
            result.data.forEach(function (value, i) {
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
                    .attr('width', rectWidth - 0.15 * rectWidth)
                    .attr('height', rectHeight)
                    // .attr('widthUnit', rectWidth)
                    .attr('widthUnit', rectWidth - 0.15 * rectWidth)
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
                .text('Ave N-Degree:')
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
                .text('Node Speed:')
                .attr('font-size', 15)
                .attr('dy', 14)
                .style('pointer-events', 'none');
            // 添加代表节点属性的小矩形和折线图
            // let nodeMinValueList = data.map(d => d.nodeSpeed[0]);
            let nodeMeanValueList = data.map(d => d.nodeSpeed[1]);
            // let nodeMaxValueList = data.map(d => d.nodeSpeed[2]);
            // console.log(nodeMinValueList, nodeMeanValueList, nodeMaxValueList);
            // 画节点属性最小值的连线
            // drawNodeAttributeLine(nodeMinValueList, g, 'nodeMinAttr', '#ccece6');
            // drawNodeAttributeLine(nodeMeanValueList, g, 'nodeMeanAttr', '#66c2a4');
            drawNodeAttributeLine(nodeMeanValueList, g, 'nodeMeanAttr', '#006d2c');
            // drawNodeAttributeLine(nodeMaxValueList, g, 'nodeMaxAttr', '#006d2c');

            // g1.append('rect')
            //     .datum(nodeMinValueList)
            //     .attr('id', 'nodeMinAttr_' + 'g-tree-0')
            //     .attr('x', 125)
            //     .attr('y', y0 + pianyi)
            //     .attr('rx', 3)
            //     .attr('ry', 3)
            //     .attr('width', 30)
            //     .attr('height', 15)
            //     .attr('fill', '#ccece6')
            //     .on('click', nodeMinAttrClick)
            //     .on('mouseover', fillRectMouseover)
            //     .on('mouseout', fillRectMouseout);
            g1.append('rect')
                .datum(nodeMeanValueList)
                .attr('id', 'nodeMeanAttr_' + 'g-tree-0')
                // .attr('x', 125 + 35)
                .attr('x', 125)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('width', 100)
                // .attr('width', 30)
                .attr('height', 15)
                // .attr('fill', '#66c2a4')
                .attr('fill', '#006d2c')
                .on('click', nodeMinAttrClick)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);
            // g1.append('rect')
            //     .datum(nodeMaxValueList)
            //     .attr('id', 'nodeMaxAttr_' + 'g-tree-0')
            //     .attr('x', 125 + 70)
            //     .attr('y', y0 + pianyi)
            //     .attr('rx', 3)
            //     .attr('ry', 3)
            //     .attr('width', 30)
            //     .attr('height', 15)
            //     .attr('fill', '#006d2c')
            //     .on('click', nodeMinAttrClick)
            //     .on('mouseover', fillRectMouseover)
            //     .on('mouseout', fillRectMouseout);


            // 添加代表节点属性的小矩形和折线图
            // let linkDistanceMinValueList = data.map(d => d.linkDistance[0]);
            let linkDistanceMeanValueList = data.map(d => d.linkDistance[1]);
            // let linkDistanceMaxValueList = data.map(d => d.linkDistance[2]);
            // console.log(linkDistanceMinValueList, linkDistanceMeanValueList, linkDistanceMaxValueList);
            // 画节点属性最小值的连线
            // drawNodeAttributeLine(linkDistanceMinValueList, g, 'linkDistanceMin', '#fcc5c0');
            // drawNodeAttributeLine(linkDistanceMeanValueList, g, 'linkDistanceMean', '#f768a1');
            drawNodeAttributeLine(linkDistanceMeanValueList, g, 'linkDistanceMean', '#7a0177');
            // drawNodeAttributeLine(linkDistanceMaxValueList, g, 'linkDistanceMax', '#7a0177');
            pianyi = 30;
            // 添加连接属性
            g1.append('text')
                .style('text-anchor', 'end')
                .attr('x', 120)
                .attr('y', y0 + pianyi)
                .text('Link Distance:')
                .attr('font-size', 15)
                .attr('dy', 14)
            //     .style('pointer-events', 'none');
            // // 添加代表连接属性的小矩形
            // g1.append('rect')
            //     .attr('id', 'linkDistanceMin_' + 'g-tree-0')
            //     .attr('x', 125)
            //     .attr('y', y0 + pianyi)
            //     .attr('rx', 3)
            //     .attr('ry', 3)
            //     .attr('width', 30)
            //     .attr('height', 15)
            //     .attr('fill', '#fcc5c0')
            //     .on('click', nodeMinAttrClick)
            //     .on('mouseover', fillRectMouseover)
            //     .on('mouseout', fillRectMouseout);
            g1.append('rect')
                .attr('id', 'linkDistanceMean_' + 'g-tree-0')
                // .attr('x', 125 + 35)
                .attr('x', 125)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                // .attr('width', 30)
                .attr('width', 100)
                .attr('height', 15)
                // .attr('fill', '#f768a1')
                .attr('fill', '#7a0177')
                .on('click', nodeMinAttrClick)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);
            // g1.append('rect')
            //     .attr('id', 'linkDistanceMax_' + 'g-tree-0')
            //     .attr('x', 125 + 70)
            //     .attr('y', y0 + pianyi)
            //     .attr('rx', 3)
            //     .attr('ry', 3)
            //     .attr('width', 30)
            //     .attr('height', 15)
            //     .attr('fill', '#7a0177')
            //     .on('click', nodeMinAttrClick)
            //     .on('mouseover', fillRectMouseover)
            //     .on('mouseout', fillRectMouseout);

            // 添加代表节点属性的小矩形和折线图
            // let linkStableMinValueList = data.map(d => d.linkStable[0]);
            let linkStableMeanValueList = data.map(d => d.linkStable[1]);
            // let linkStableMaxValueList = data.map(d => d.linkStable[2]);
            // console.log(linkDistanceMinValueList, linkDistanceMeanValueList, linkDistanceMaxValueList);
            // 画节点属性最小值的连线
            // drawNodeAttributeLine(linkStableMinValueList, g, 'linkStableMin', '#fed976');
            // drawNodeAttributeLine(linkStableMeanValueList, g, 'linkStableMean', '#fd8d3c');
            drawNodeAttributeLine(linkStableMeanValueList, g, 'linkStableMean', '#bd0026');
            // drawNodeAttributeLine(linkStableMaxValueList, g, 'linkStableMax', '#bd0026');

            pianyi = 50;
            // 添加连接属性2
            g1.append('text')
                .style('text-anchor', 'end')
                .attr('x', 120)
                .attr('y', y0 + pianyi)
                .text('Link Stability:')
                .attr('font-size', 15)
                .attr('dy', 14)
                .style('pointer-events', 'none');
            // 添加代表连接属性的小矩形
            // g1.append('rect')
            //     .attr('id', 'linkStableMin_' + 'g-tree-0')
            //     .attr('x', 125)
            //     .attr('y', y0 + pianyi)
            //     .attr('rx', 3)
            //     .attr('ry', 3)
            //     .attr('width', 30)
            //     .attr('height', 15)
            //     .attr('fill', '#fed976')
            //     .on('click', nodeMinAttrClick)
            //     .on('mouseover', fillRectMouseover)
            //     .on('mouseout', fillRectMouseout);
            g1.append('rect')
                .attr('id', 'linkStableMean_' + 'g-tree-0')
                // .attr('x', 125 + 35)
                .attr('x', 125)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                // .attr('width', 30)
                .attr('width', 100)
                .attr('height', 15)
                // .attr('fill', '#fd8d3c')
                .attr('fill', '#bd0026')
                .on('click', nodeMinAttrClick)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);
            // g1.append('rect')
            //     .attr('id', 'linkStableMax_' + 'g-tree-0')
            //     .attr('x', 125 + 70)
            //     .attr('y', y0 + pianyi)
            //     .attr('rx', 3)
            //     .attr('ry', 3)
            //     .attr('width', 30)
            //     .attr('height', 15)
            //     .attr('fill', '#bd0026')
            //     .on('click', nodeMinAttrClick)
            //     .on('mouseover', fillRectMouseover)
            //     .on('mouseout', fillRectMouseout);

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


function draw_root_tree_by_timeIndex(timeIndexList) {
    console.log('根据选中索引画初始树', timeIndexList);
    // console.log('根据时间画初始树', startTime, endTime);
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

    // // 得到 树图数据
    // let value = d3.select('#load-tree-root').attr('value');
    //
    // console.log(value);

    $.ajax({
        url: '/getRootTreeByTimeList/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
            timeList: JSON.stringify(timeIndexList)
        },
        beforeSend: function () {
            // console.log('加载数据, 这里会弹出一个 框 让用户等待');
        },
        // success: function (result, error) {
        //     console.log('得到根节点数据', result[0]);
        //     // 得到数据
        //     let data = result;
        //
        //     let width = divWidth;
        //     let height = divHeight;
        //     let margin = {left: 250, top: 10, right: 10, bottom: 10};
        //
        //     // draw tree root
        //     // 建立比例尺
        //     let x0 = d3.scaleLinear()
        //         .domain([0, data.length])
        //         .range([margin.left + 0.2 * width, width - margin.right - 0.2 * width]);
        //     let y0 = 0.05 * height;
        //
        //
        //     let rectHeight = height * 0.08;
        //     let rectWidth = x0(1) - x0(0);
        //     let padding = (width - margin.left - margin.right - rectWidth * result.length) / (result.length-1);
        //     let x = margin.left;
        //     let paddingWidth = (width - margin.left - margin.right - rectWidth * result.length);
        //
        //     // 建立树节点
        //     let g = svg.append('g')
        //         .datum('0')
        //         .attr('brushedStartIndex', data[0].indexList[0])
        //         .attr('brushedEndIndex', data[data.length - 1].indexList[0])
        //         .attr('paddingWidth', paddingWidth)
        //         .attr('id', 'g-tree-0')
        //         .attr('class', 'tree-level');
        //
        //     // 建立画选项的视图
        //     let g1 = svg.append('g')
        //         .attr('class', 'g-tree-0');
        //
        //     // 画根节点
        //     result.forEach(function (value, i) {
        //         // console.log(value, i)
        //         g.append('rect')
        //         // .datum([value.indexList])
        //             .datum(value)
        //             .attr('value', JSON.stringify(value.indexList))
        //             .attr('id', 'rect-' + i)
        //             .attr('class', 'rect-' + i + ' rect')
        //             // .attr('x', x )
        //             .attr('x', x0(i) )
        //             .attr('y', y0)
        //             .attr('rx', 3)
        //             .attr('ry', 3)
        //             .attr('width', rectWidth)
        //             .attr('height', rectHeight)
        //             .attr('widthUnit', rectWidth)
        //             .attr('opacity', 0.5)
        //             .attr('fill', '#5191fb');
        //         // .attr('fill', colorScale(d.linkNum * 2 / d.nodeNum));
        //         // console.log(g.select('#rect-0').attr('value'))
        //         x = x + rectWidth + padding
        //     });

        success: function (result, error) {
            console.log(result)
            console.log('得到根节点数据', result[0]);
            // 得到数据
            // let data = result;
            let data = result['data'];
            let brushedIndex = result['brushedIndex'];

            let width = divWidth;
            let height = divHeight;
            let margin = {left: 250, top: 10, right: 10, bottom: 10};

            // draw tree root
            // 建立比例尺
            let x0 = d3.scaleLinear()
                .domain([0, data.length])
                // .range([margin.left + 0.2 * width, width - margin.right - 0.2 * width]);
                .range([margin.left + 0 * width, width - margin.right - 0 * width -20]);
            let y0 = 0.05 * height;


            let rectHeight = height * 0.08;
            let rectWidth = x0(1) - x0(0);
            let padding = (width - margin.left - margin.right - rectWidth * result.data.length) / (result.data.length-1);
            let x = margin.left;
            let paddingWidth = (width - margin.left - margin.right - rectWidth * result.data.length);

            // 建立树节点
            let g = svg.append('g')
                .datum('0')
                .attr('brushedStartIndex', data[0].indexList[0])
                .attr('brushedEndIndex', data[data.length - 1].indexList[0])
                .attr('brushedIndex', JSON.stringify(brushedIndex))
                .attr('id', 'g-tree-0')
                .attr('class', 'tree-level');

            // 建立画选项的视图
            let g1 = svg.append('g')
                .attr('class', 'g-tree-0');

            // console.log()

            // 画根节点
            result.data.forEach(function (value, index) {
                // console.log(value, i)
                g.append('rect')
                // .datum([value.indexList])
                    .datum(value)
                    .attr('value', JSON.stringify(value.indexList))
                    .attr('id', 'rect-' + index)
                    .attr('class', 'rect' + ' rect-' + index)
                    .attr('x', x0(index))
                    .attr('y', y0)
                    .attr('rx', 3)
                    .attr('ry', 3)
                    // .attr('width', rectWidth)
                    .attr('width', rectWidth - 0.15 * rectWidth)
                    .attr('height', rectHeight)
                    // .attr('widthUnit', rectWidth)
                    .attr('widthUnit', rectWidth - 0.15 * rectWidth)
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
                // .text('Ave NodeDeg:')
                .text('Ave N-Degree:')
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
                .text('Node Speed:')
                .attr('font-size', 15)
                .attr('dy', 14)
                .style('pointer-events', 'none');
            // 添加代表节点属性的小矩形和折线图
            // let nodeMinValueList = data.map(d => d.nodeSpeed[0]);
            let nodeMeanValueList = data.map(d => d.nodeSpeed[1]);
            // let nodeMaxValueList = data.map(d => d.nodeSpeed[2]);
            // console.log(nodeMinValueList, nodeMeanValueList, nodeMaxValueList);
            // 画节点属性最小值的连线
            // drawNodeAttributeLine(nodeMinValueList, g, 'nodeMinAttr', '#ccece6');
            // drawNodeAttributeLine(nodeMeanValueList, g, 'nodeMeanAttr', '#66c2a4');
            drawNodeAttributeLine(nodeMeanValueList, g, 'nodeMeanAttr', '#006d2c');
            // drawNodeAttributeLine(nodeMaxValueList, g, 'nodeMaxAttr', '#006d2c');

            // g1.append('rect')
            //     .datum(nodeMinValueList)
            //     .attr('id', 'nodeMinAttr_' + 'g-tree-0')
            //     .attr('x', 125)
            //     .attr('y', y0 + pianyi)
            //     .attr('rx', 3)
            //     .attr('ry', 3)
            //     .attr('width', 30)
            //     .attr('height', 15)
            //     .attr('fill', '#ccece6')
            //     .on('click', nodeMinAttrClick)
            //     .on('mouseover', fillRectMouseover)
            //     .on('mouseout', fillRectMouseout);
            g1.append('rect')
                .datum(nodeMeanValueList)
                .attr('id', 'nodeMeanAttr_' + 'g-tree-0')
                // .attr('x', 125 + 35)
                .attr('x', 125)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                // .attr('width', 30)
                .attr('width', 100)
                .attr('height', 15)
                // .attr('fill', '#66c2a4')
                .attr('fill', '#006d2c')
                .on('click', nodeMinAttrClick)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);
            // g1.append('rect')
            //     .datum(nodeMaxValueList)
            //     .attr('id', 'nodeMaxAttr_' + 'g-tree-0')
            //     .attr('x', 125 + 70)
            //     .attr('y', y0 + pianyi)
            //     .attr('rx', 3)
            //     .attr('ry', 3)
            //     .attr('width', 30)
            //     .attr('height', 15)
            //     .attr('fill', '#006d2c')
            //     .on('click', nodeMinAttrClick)
            //     .on('mouseover', fillRectMouseover)
            //     .on('mouseout', fillRectMouseout);


            // 添加代表节点属性的小矩形和折线图
            // let linkDistanceMinValueList = data.map(d => d.linkDistance[0]);
            let linkDistanceMeanValueList = data.map(d => d.linkDistance[1]);
            // let linkDistanceMaxValueList = data.map(d => d.linkDistance[2]);
            // console.log(linkDistanceMinValueList, linkDistanceMeanValueList, linkDistanceMaxValueList);
            // 画节点属性最小值的连线
            // drawNodeAttributeLine(linkDistanceMinValueList, g, 'linkDistanceMin', '#fcc5c0');
            // drawNodeAttributeLine(linkDistanceMeanValueList, g, 'linkDistanceMean', '#f768a1');
            drawNodeAttributeLine(linkDistanceMeanValueList, g, 'linkDistanceMean', '#7a0177');
            // drawNodeAttributeLine(linkDistanceMaxValueList, g, 'linkDistanceMax', '#7a0177');
            pianyi = 30;
            // 添加连接属性
            g1.append('text')
                .style('text-anchor', 'end')
                .attr('x', 120)
                .attr('y', y0 + pianyi)
                .text('Link Distance:')
                .attr('font-size', 15)
                .attr('dy', 14)
                .style('pointer-events', 'none');
            // 添加代表连接属性的小矩形
            // g1.append('rect')
            //     .attr('id', 'linkDistanceMin_' + 'g-tree-0')
            //     .attr('x', 125)
            //     .attr('y', y0 + pianyi)
            //     .attr('rx', 3)
            //     .attr('ry', 3)
            //     .attr('width', 30)
            //     .attr('height', 15)
            //     .attr('fill', '#fcc5c0')
            //     .on('click', nodeMinAttrClick)
            //     .on('mouseover', fillRectMouseover)
            //     .on('mouseout', fillRectMouseout);
            g1.append('rect')
                .attr('id', 'linkDistanceMean_' + 'g-tree-0')
                // .attr('x', 125 + 35)
                .attr('x', 125)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('width', 100)
                // .attr('width', 30)
                .attr('height', 15)
                // .attr('fill', '#f768a1')
                .attr('fill', '#7a0177')
                .on('click', nodeMinAttrClick)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);
            // g1.append('rect')
            //     .attr('id', 'linkDistanceMax_' + 'g-tree-0')
            //     .attr('x', 125 + 70)
            //     .attr('y', y0 + pianyi)
            //     .attr('rx', 3)
            //     .attr('ry', 3)
            //     .attr('width', 30)
            //     .attr('height', 15)
            //     .attr('fill', '#7a0177')
            //     .on('click', nodeMinAttrClick)
            //     .on('mouseover', fillRectMouseover)
            //     .on('mouseout', fillRectMouseout);

            // 添加代表节点属性的小矩形和折线图
            // let linkStableMinValueList = data.map(d => d.linkStable[0]);
            let linkStableMeanValueList = data.map(d => d.linkStable[1]);
            // let linkStableMaxValueList = data.map(d => d.linkStable[2]);
            // console.log(linkDistanceMinValueList, linkDistanceMeanValueList, linkDistanceMaxValueList);
            // 画节点属性最小值的连线
            // drawNodeAttributeLine(linkStableMinValueList, g, 'linkStableMin', '#fed976');
            drawNodeAttributeLine(linkStableMeanValueList, g, 'linkStableMean', '#fd8d3c');
            // drawNodeAttributeLine(linkStableMaxValueList, g, 'linkStableMax', '#bd0026');

            pianyi = 50;
            // 添加连接属性2
            g1.append('text')
                .style('text-anchor', 'end')
                .attr('x', 120)
                .attr('y', y0 + pianyi)
                .text('Link Stability:')
                .attr('font-size', 15)
                .attr('dy', 14)
                .style('pointer-events', 'none');
            // 添加代表连接属性的小矩形
            // g1.append('rect')
            //     .attr('id', 'linkStableMin_' + 'g-tree-0')
            //     .attr('x', 125)
            //     .attr('y', y0 + pianyi)
            //     .attr('rx', 3)
            //     .attr('ry', 3)
            //     .attr('width', 30)
            //     .attr('height', 15)
            //     .attr('fill', '#fed976')
            //     .on('click', nodeMinAttrClick)
            //     .on('mouseover', fillRectMouseover)
            //     .on('mouseout', fillRectMouseout);
            g1.append('rect')
                .attr('id', 'linkStableMean_' + 'g-tree-0')
                .attr('x', 125)
                // .attr('x', 125 + 35)
                .attr('y', y0 + pianyi)
                .attr('rx', 3)
                .attr('ry', 3)
                // .attr('width', 30)
                .attr('width', 100)
                .attr('height', 15)
                .attr('fill', '#bd0026')
                // .attr('fill', '#fd8d3c')
                .on('click', nodeMinAttrClick)
                .on('mouseover', fillRectMouseover)
                .on('mouseout', fillRectMouseout);
            // g1.append('rect')
            //     .attr('id', 'linkStableMax_' + 'g-tree-0')
            //     .attr('x', 125 + 70)
            //     .attr('y', y0 + pianyi)
            //     .attr('rx', 3)
            //     .attr('ry', 3)
            //     .attr('width', 30)
            //     .attr('height', 15)
            //     .attr('fill', '#bd0026')
            //     .on('click', nodeMinAttrClick)
            //     .on('mouseover', fillRectMouseover)
            //     .on('mouseout', fillRectMouseout);

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