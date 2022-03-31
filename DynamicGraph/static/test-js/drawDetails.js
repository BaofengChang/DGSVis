// 画细节视图
function drawDetails(timeDataIndexList) {
    d3.select('#svg-details')
        .style('width', $('#div-details').width())
        .style('height', $('#div-details').height())
        .style('background-color', '#ffd3c9');
    let gameID = '0021500003';
    // timeDataIndexList = JSON.parse()
    console.log('画细节视图', '比赛id', gameID, '选择的时间索引', timeDataIndexList);
    // 获取 数据
    $.ajax({
        url: '/ajaxGetDetails/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
            timeDataIndexList: timeDataIndexList  // 时间序列
        },
        beforeSend: function () {
            console.log('加载数据, 这里会弹出一个框让用户等待');
        },
        success: function (result, error) {
            console.log('接收到选中的细节数据');
            //console.log('异常信息', error, typeof error);
            // console.log('原始数据', result);
            let svg = d3.select('#svg-details');
            // 获取宽度和高度
            let width = $('#div-details').width(),
                height = $('#div-details').height();
            // 取得 细节 数据 和 汇总 数据
            let details = result.details,
                summary = result.summary;
            //console.log('汇总数据，每一个snapshot内的数据', summary);
            // 得到 g节点的宽度和高度，添加g元素。
            let gWidth = 0.25 * width,
                gHeight = 0.1 * height,
                margin = {left: 100, top: 10, right: 10, bottom: 10};
            let gNode = svg.append('g')
                .attr('id', 'g-summary-node')
                .attr('transform', 'translate(' + 0 + ',' + 0 + ')');
            // 得到节点数据
            let nodes = summary.nodes;
            //console.log('汇总数据，节点数据', nodes);
            let speedExtent = getExtentValue(nodes, 'speed');
            //console.log('汇总数据，速度属性 speed 取值范围', speedExtent);
            // 按照顺序画
            let orderNum = getTimeOrderNum(nodes);
            //console.log('汇总数据，时刻数量', orderNum);
            // 设置比例尺
            let xScale = d3.scaleLinear()
                .domain([0, orderNum - 1])
                .range([gWidth, gWidth * 2 - 10]);
            let xAxis = d3.axisBottom().scale(xScale)
                .ticks(2);
            let yScale = d3.scaleLinear()
                .domain(speedExtent)
                .range([gHeight - margin.bottom, margin.top]);
            let yAxis = d3.axisLeft().scale(yScale)
                .ticks(2);
            gNode.append('g')
                .attr("transform", "translate(" + 0 + "," + (gHeight - margin.bottom) + ")")
                .call(xAxis);
            gNode.append('g')
                .attr("transform", "translate(" + gWidth + "," + 0 + ")")
                .call(yAxis);
            // 建立线条函数
            let speedLine = d3.line()
                .x(function (d, i) {
                    return xScale(i);
                })
                .y(function (d,) {
                    //console.log(d['speed']);
                    return yScale(0.3048 * d['speed']);
                })
                .curve(d3.curveMonotoneX);

            for (let node of nodes) {
                //console.log(node);
                if (node['playerId'] === -1) {
                    continue;
                }
                let timeData = node['timeData'];
                gNode.append('path')
                    .datum(timeData)
                    .attr('d', speedLine)
                    .attr("fill", "none")
                    .attr("stroke", "#101615")
                    .attr("stroke-width", 1);
                gNode.selectAll('n')
                    .data(timeData)
                    .enter()
                    .append('circle')
                    .attr('id', function (d) {
                        return node['playerId'] + '-' + d['unixTime'];
                    })
                    .attr('cx', function (d, i) {
                        return xScale(i)
                    })
                    .attr('cy', function (d) {
                        return yScale(0.3048 * d['speed'])
                    })
                    .attr('r', '2')
                    .attr('fill', '#e7e7e7')
                    .attr('stroke', '#243534')
                    .attr('stroke-width', 1);
            }
        }
    })

}


// 画细节视图
function drawDetailsV2(timeDataIndexList) {
    d3.select('#svg-details')
        .style('width', $('#div-details').width())
        .style('height', $('#div-details').height())
        .style('background-color', '#ffd3c9');
    let gameID = '0021500003';
    // timeDataIndexList = JSON.parse()
    console.log('画细节视图', '比赛id', gameID, '选择的时间索引', timeDataIndexList);
    // 获取 数据
    $.ajax({
        url: '/ajaxGetDetails/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
            timeDataIndexList: timeDataIndexList  // 时间序列
        },
        beforeSend: function () {
            // console.log('加载数据, 这里会弹出一个框让用户等待');
        },
        success: function (result, error) {
            console.log('接收到选中的细节数据');
            //console.log('异常信息', error, typeof error);
            //console.log('原始数据', result);
            let svg = d3.select('#svg-details');
            // 获取宽度和高度
            let width = $('#div-details').width(),
                height = $('#div-details').height();
            // 取得 细节 数据 和 汇总 数据
            let details = result.details,
                summary = result.summary;
            // 得到范围
            let speedExtent = getExtentValue(summary.nodes, 'speed');
            //console.log('汇总数据，节点度的范围', speedExtent);
            let degreeExtent = getDegreeExtent(summary.nodes, 'linkTarget');
            //console.log('汇总数据，节点度的范围', degreeExtent);
            let linkDistanceExtent = getLinkDisExtentValue(summary.links, 'dis');
            //console.log('汇总数据，链接距离的范围', linkDistanceExtent);
            // 首先是画节点
            let gPlayer = svg.append('g');
            draw_players(gPlayer, summary.nodes);
            // 然后是画每一个snapshot
            let snapHeight = 150;
            let snapWidth = width / 4;
            for (let i = 0; i < details.length; i++) {
                let snapshotData = details[i];
                let g = svg.append('g')
                    .attr('class', 'details ' + 'details-' + i)
                    .datum(JSON.stringify(snapshotData));
                let y0 = snapHeight * i;
                let x0 = width / 4 - 60;
                let x1 = width / 2 - 50;
                let x2 = 3 * width / 4 - 40;
                let x3 = width - 50;
                if (y0 + 200 > parseFloat(svg.style('height'))) {
                    svg.style('height', y0 + 200);
                }
                drawSpeedView(g, snapshotData, y0, x0, snapHeight, snapWidth, speedExtent);
                drawDegreeView(g, snapshotData, y0, x1, snapHeight, snapWidth, degreeExtent);
                drawLinkView(g, snapshotData, y0, x2, snapHeight, snapWidth, linkDistanceExtent);
                drawButton(g, snapshotData, y0, x3, snapHeight);

                drawLinkLine(g, snapshotData, y0, x0, x1, x2, snapHeight, snapWidth, speedExtent, degreeExtent, linkDistanceExtent);


            }
        }
    })
}


// 画 函数功能
function drawButton(g, snapshotData, y0, x0, snapHeight) {
    if (snapHeight < 150) {
        snapHeight = 150;
    } else {
        snapHeight = 150;
    }
    //设置目标区域
    let padding = 10;
    let x1 = x0 + padding;
    let y2 = y0 + snapHeight / 2;

    g.append('rect')
        .attr('class', 'snapshot-button')
        .attr('x', x1)
        .attr('y', y2 - 10)
        .attr('width', 30)
        .attr('height', 20)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('value', JSON.stringify(snapshotData))
        .attr('fill', '#ccc011')
        .attr('stroke', '#314544')
        .attr('stroke-width', 0)
        .on('mouseover', playerMouseoverDetails)
        .on('mouseout', playerMouseoutDetails)
        .on('click', snapShotClick);


}


function drawLinkLine(g, snapshotData, y0, x0, x1, x2, snapHeight, snapWidth, speedExtent, degreeExtent, disExtent) {
    if (snapHeight < 150) {
        snapHeight = 150;
    } else {
        snapHeight = 150;
    }
    // 建立比例尺
    let dataLength = snapshotData.index.length;
    let speedX = d3.scaleLinear()
        .domain([0, dataLength - 1])
        .range([x0 + 15, x0 + snapWidth - 15]);
    let speedY = d3.scaleLinear()
        .domain([0, speedExtent[1] + 2])
        .range([y0 + snapHeight - 15, y0 + 15]);
    // 建立比例尺
    let degX = d3.scaleLinear()
        .domain([0, dataLength - 1])
        .range([x1 + 15, x1 + snapWidth - 15]);
    let degY = d3.scaleLinear()
        .domain([0, degreeExtent[1] + 1])
        .range([y0 + snapHeight - 15, y0 + 15]);
    // 建立比例尺
    let unixTime = snapshotData['unixTimeList'];
    let disX = d3.scaleBand()
        .domain(unixTime)
        .range([x2 + 15, x2 + snapWidth - 15]);
    let disY = d3.scaleLinear()
        .domain([0, disExtent[1] + 2])
        .range([y0 + snapHeight - 15, y0 + 20]);
    // 建立节点
    let nodes = snapshotData.nodes;
    let links = snapshotData.links;
    let nodesDegreeEnd = {};
    for (let node of nodes) {
        if (node['playerId'] === -1) {
            continue;
        }
        // console.log('画球员和速度的链接')
        let nodeID = node['playerId'];
        let playerID = "#details-player-" + nodeID;
        let cx = parseFloat(d3.select('#svg-details').select(playerID).attr('cx'));
        let cy = parseFloat(d3.select('#svg-details').select(playerID).attr('cy'));
        let r = parseFloat(d3.select('#svg-details').select(playerID).attr('r'));

        let timeData = node['timeData'];
        let sx = speedX(0);
        let sy = speedY(timeData[0]['speed']);
        // console.log(cx, cy, sx, sy);
        g.append('path')
            .attr('class', 'details-link player-speed-' + nodeID)
            .attr('d', bzpath(cx + r, cy, sx, sy))
            .attr("fill", "none")
            .attr("stroke", "#a4b7b6")
            .attr("stroke-width", 1)
            .style('opacity', 0.0)
            .style('pointer-events', 'none');
        sx = speedX(timeData.length - 1);
        sy = speedY(timeData[timeData.length - 1]['speed']);
        let dx = degX(0);
        let dy = degY(timeData[0]['linkTarget'].length);
        // console.log(dx, dy, sx, sy);
        g.append('path')
            .attr('class', 'details-link speed-degree-' + nodeID)
            .attr('d', bzpath(sx, sy, dx, dy))
            .attr("fill", "none")
            .attr("stroke", "#a4b7b6")
            .attr("stroke-width", 1)
            .style('opacity', 0.0)
            .style('pointer-events', 'none');

        dx = degX(timeData.length - 1);
        dy = degY(timeData[timeData.length - 1]['linkTarget'].length);
        nodesDegreeEnd[nodeID + ''] = [dx, dy];
    }
    //console.log(nodesDegreeEnd)
    for (let link of links) {
        if (link['s'] === -1) {
            continue;
        }
        let s = link.s,
            t = link.t,
            dis = link['dis'],
            timeData = link['timeData'];
        // console.log(s, t)
        let lx = disX(timeData[0]['unixTime']);
        let ly = disY(timeData[0]['dis']);
        // console.log(lx, ly)
        let sP = nodesDegreeEnd[s + ''];
        let tP = nodesDegreeEnd[t + ''];
        // console.log(sP, tP, sP[0])
        // console.log(bzpathV2(sP[0], tP[1], lx, ly, x2));
        g.append('path')
            .attr('class', 'details-link degree-link-' + s)
            .attr('d', bzpathV2(sP[0], sP[1], lx, ly, x2))
            .attr("fill", "none")
            .attr("stroke", "#a4b7b6")
            .attr("stroke-width", 1)
            .style('opacity', 0.1)
            .style('pointer-events', 'none');
        g.append('path')
            .attr('class', 'details-link degree-link-' + t)
            .attr('d', bzpathV2(tP[0], tP[1], lx, ly, x2))
            .attr("fill", "none")
            .attr("stroke", "#a4b7b6")
            .attr("stroke-width", 1)
            .style('opacity', 0.0)
            .style('pointer-events', 'none');
    }
}


// 画连接
function drawLinkView(g, snapshotData, y0, x0, snapHeight, snapWidth, extent) {
    // 数据长度
    let unixTime = snapshotData['unixTimeList'];
    let links = snapshotData.links;
    if (snapHeight < 150) {
        snapHeight = 150;
    } else {
        snapHeight = 150;
    }

    //设置目标区域
    let padding = 15;
    let x1 = x0 + padding;
    let y1 = y0 + padding;
    let x2 = x0 + snapWidth - padding;
    let y2 = y0 + snapHeight - padding;

    // 建立比例尺
    let x = d3.scaleBand()
        .domain(unixTime)
        .range([x0 + 15, x0 + snapWidth - 15]);
    let y = d3.scaleLinear()
        .domain([0, extent[1] + 2])
        .range([y0 + snapHeight - 15, y0 + 20]);

    // 坐标轴
    g.append('line')
    // .attr('x1', x1 - 10)
        .attr('x1', x1 - 10)
        .attr('y1', y2)
        .attr('x2', x2)
        .attr('y2', y2)
        .style('stroke-width', 1)
        .attr('stroke', '#314544')
        .style('pointer-events', 'none');
    g.append('line')
        .attr('x1', x1 - 10)
        .attr('y1', y1)
        .attr('x2', x1 - 10)
        .attr('y2', y2)
        .style('stroke-width', 1)
        .attr('stroke', '#314544')
        .style('pointer-events', 'none');
    g.append('path')
        .attr('d', generateArrowHorizontal(x2, y2))
        .style('stroke-width', 1)
        .attr('stroke', '#314544')
        .style('pointer-events', 'none')
        .attr('fill', 'none');
    g.append('path')
        .attr('d', generateArrowVertical(x1 - 10, y1))
        .style('stroke-width', 1)
        .attr('stroke', '#314544')
        .style('pointer-events', 'none')
        .attr('fill', 'none');

    g.append('text')
        .style('text-anchor', 'start')
        .attr('x', x1 + 2)
        .attr('y', function (d, i) {
            return y1;
        })
        .text('link distance')
        .attr('border', '#bd0026')
        .attr('font-size', 15)
        .attr('dy', 7)
        .style('pointer-events', 'none');
    g.append('text')
        .style('text-anchor', 'end')
        .attr('x', x2 - 10)
        .attr('y', function (d, i) {
            return y2 + 7;
        })
        .text('time')
        .attr('border', '#bd0026')
        .attr('font-size', 15)
        .attr('dy', 7)
        .style('pointer-events', 'none');

    let speedLine = d3.line()
        .x(function (d, i) {
            return x(d['unixTime']);
        })
        .y(function (d,) {
            // console.log(d['speed']);
            return y(d['dis']);
        })
        .curve(d3.curveMonotoneX);
    for (let link of links) {
        if (link['s'] === -1) {
            continue;
        }
        // console.log(link);
        let timeData = link['timeData'];
        // console.log(timeData);
        g.append('path')
            .attr('class', 'details-line link-' + link.s + ' link-' + link.t)
            .datum(timeData)
            .attr('d', speedLine)
            .attr("fill", "none")
            .attr("stroke", "#101615")
            .attr("stroke-width", 1);
        g.selectAll('n')
            .data(timeData)
            .enter()
            .append('circle')
            .attr('class', 'details-line link-' + link.s + ' link-' + link.t)
            .attr('id', function (d) {
                return link.s + '-' + link.t;
            })
            .attr('cx', function (d, i) {
                return x(d['unixTime'])
            })
            .attr('cy', function (d) {
                return y(d['dis']);
            })
            .attr('r', '2')
            .attr('fill', '#e7e7e7')
            .attr('stroke', '#243534')
            .attr('stroke-width', 1);
    }


}

// 画度
function drawDegreeView(g, snapshotData, y0, x0, snapHeight, snapWidth, extent) {
    // 数据长度
    let dataLength = snapshotData.index.length;
    let nodes = snapshotData.nodes;
    if (snapHeight < 150) {
        snapHeight = 150;
    } else {
        snapHeight = 150;
    }

    //设置目标区域
    let padding = 15;
    let x1 = x0 + padding;
    let y1 = y0 + padding;
    let x2 = x0 + snapWidth - padding;
    let y2 = y0 + snapHeight - padding;

    // console.log(snapshotData);
    // 建立比例尺
    let x = d3.scaleLinear()
        .domain([0, dataLength - 1])
        .range([x0 + 15, x0 + snapWidth - 15]);
    let y = d3.scaleLinear()
        .domain([0, extent[1] + 1])
        .range([y0 + snapHeight - 15, y0 + 15]);

    // 坐标轴
    g.append('line')
    // .attr('x1', x1 - 10)
        .attr('x1', x1 - 10)
        .attr('y1', y2)
        .attr('x2', x2 + 10)
        .attr('y2', y2)
        .style('stroke-width', 1)
        .attr('stroke', '#314544')
        .style('pointer-events', 'none');
    g.append('line')
        .attr('x1', x1 - 10)
        .attr('y1', y1)
        .attr('x2', x1 - 10)
        .attr('y2', y2)
        .style('stroke-width', 1)
        .attr('stroke', '#314544')
        .style('pointer-events', 'none');
    g.append('path')
        .attr('d', generateArrowHorizontal(x2 + 10, y2))
        .style('stroke-width', 1)
        .attr('stroke', '#314544')
        .style('pointer-events', 'none')
        .attr('fill', 'none');
    g.append('path')
        .attr('d', generateArrowVertical(x1 - 10, y1))
        .style('stroke-width', 1)
        .attr('stroke', '#314544')
        .style('pointer-events', 'none')
        .attr('fill', 'none');

    g.append('text')
        .style('text-anchor', 'start')
        .attr('x', x1 + 2)
        .attr('y', function (d, i) {
            return y1;
        })
        .text('node degree')
        .attr('border', '#bd0026')
        .attr('font-size', 15)
        .attr('dy', 7)
        .style('pointer-events', 'none');
    g.append('text')
        .style('text-anchor', 'end')
        .attr('x', x2)
        .attr('y', function (d, i) {
            return y2 + 7;
        })
        .text('time')
        .attr('border', '#bd0026')
        .attr('font-size', 15)
        .attr('dy', 7)
        .style('pointer-events', 'none');

    let speedLine = d3.line()
        .x(function (d, i) {
            return x(i);
        })
        .y(function (d,) {
            // console.log(d['speed']);
            return y(d['linkTarget'].length);
        })
        .curve(d3.curveMonotoneX);
    for (let node of nodes) {
        if (node['playerId'] === -1) {
            continue;
        }
        // console.log(node);
        if (node['playerId'] === -1) {
            continue;
        }
        let timeData = node['timeData'];
        // console.log(timeData)
        g.append('path')
            .attr('class', 'details-line degree-' + node['playerId'])
            .datum(timeData)
            .attr('d', speedLine)
            .attr("fill", "none")
            .attr("stroke", "#101615")
            .attr("stroke-width", 1);
        g.selectAll('n')
            .data(timeData)
            .enter()
            .append('circle')
            .attr('class', 'details-line degree-' + node['playerId'])
            .attr('id', function (d) {
                return node['playerId'] + '-' + d['unixTime'];
            })
            .attr('cx', function (d, i) {
                return x(i)
            })
            .attr('cy', function (d) {
                return y(d['linkTarget'].length);
            })
            .attr('r', '2')
            .attr('fill', '#e7e7e7')
            .attr('stroke', '#243534')
            .attr('stroke-width', 1);
    }
}

// 画速度
function drawSpeedView(g, snapshotData, y0, x0, snapHeight, snapWidth, speedExtent) {
    // 数据长度
    let dataLength = snapshotData.index.length;
    let nodes = snapshotData.nodes;
    if (snapHeight < 150) {
        snapHeight = 150;
    } else {
        snapHeight = 150;
    }
    //设置目标区域
    let padding = 15;
    let x1 = x0 + padding;
    let y1 = y0 + padding;
    let x2 = x0 + snapWidth - padding;
    let y2 = y0 + snapHeight - padding;


    // console.log(snapshotData);
    // 建立比例尺
    let x = d3.scaleLinear()
        .domain([0, dataLength - 1])
        .range([x0 + 15, x0 + snapWidth - 15]);
    let y = d3.scaleLinear()
        .domain([0, speedExtent[1] + 2])
        .range([y0 + snapHeight - 15, y0 + 15]);

    // 坐标轴
    g.append('line')
        .attr('x1', x1 - 10)
        .attr('y1', y2)
        .attr('x2', x2 + 10)
        .attr('y2', y2)
        .style('stroke-width', 1)
        .attr('stroke', '#314544')
        .style('pointer-events', 'none');
    g.append('line')
        .attr('x1', x1 - 10)
        .attr('y1', y1)
        .attr('x2', x1 - 10)
        .attr('y2', y2)
        .style('stroke-width', 1)
        .attr('stroke', '#314544')
        .style('pointer-events', 'none');
    g.append('path')
        .attr('d', generateArrowHorizontal(x2 + 10, y2))
        .style('stroke-width', 1)
        .attr('stroke', '#314544')
        .style('pointer-events', 'none')
        .attr('fill', 'none');
    g.append('path')
        .attr('d', generateArrowVertical(x1 - 10, y1))
        .style('stroke-width', 1)
        .attr('stroke', '#314544')
        .style('pointer-events', 'none')
        .attr('fill', 'none');

    g.append('text')
        .style('text-anchor', 'start')
        .attr('x', x1 + 2)
        .attr('y', function (d, i) {
            return y1;
        })
        .text('node speed')
        .attr('border', '#bd0026')
        .attr('font-size', 15)
        .attr('dy', 7)
        .style('pointer-events', 'none');
    g.append('text')
        .style('text-anchor', 'end')
        .attr('x', x2)
        .attr('y', function (d, i) {
            return y2 + 7;
        })
        .text('time')
        .attr('border', '#bd0026')
        .attr('font-size', 15)
        .attr('dy', 7)
        .style('pointer-events', 'none');

    // let xAxis = d3.axisBottom().scale(x)
    //     .ticks(3);
    // g.append('g')
    //     .attr("transform", "translate(" + 0 + "," + (y0 + snapHeight - 15) + ")")
    //     .call(xAxis);
    // let yAxis = d3.axisLeft().scale(y)
    //     .ticks(3);
    // g.append('g')
    //     .attr("transform", "translate(" + (x0 + 15) + "," + 0 + ")")
    //     .call(yAxis);
    // 建立线条函数
    let speedLine = d3.line()
        .x(function (d, i) {
            return x(i);
        })
        .y(function (d,) {
            return y(d['speed']);
        })
        .curve(d3.curveMonotoneX);
    for (let node of nodes) {
        if (node['playerId'] === -1) {
            continue;
        }
        // console.log(node);
        if (node['playerId'] === -1) {
            continue;
        }
        let timeData = node['timeData'];
        // console.log(timeData)
        g.append('path')
            .attr('class', 'details-line speed-' + node['playerId'])
            .datum(timeData)
            .attr('d', speedLine)
            .attr("fill", "none")
            .attr("stroke", "#314544")
            .attr("stroke-width", 2);
        g.selectAll('n')
            .data(timeData)
            .enter()
            .append('circle')
            .attr('class', 'details-line speed-' + node['playerId'])
            .attr('id', function (d) {
                return node['playerId'] + '-' + d['unixTime'];
            })
            .attr('cx', function (d, i) {
                return x(i)
            })
            .attr('cy', function (d) {
                return y(d['speed'])
            })
            .attr('r', '2')
            .attr('fill', '#e7e7e7')
            .attr('stroke', '#243534')
            .attr('stroke-width', 1);
    }
}


// 画节点
function draw_players(g, nodes) {
    // 过滤数据
    let nodeList = [];
    for (let node of nodes) {
        if (node['playerId'] === -1) {
            continue;
        }
        nodeList.push(node);
    }
    // 得到宽度和高度
    let width = $('#div-details').width();
    let height = $('#div-details').height();
    let margin = {top: 50, bottom: 50};
    let x = width / 4 / 4;
    let y = d3.scaleLinear()
        .domain([0, nodeList.length - 1])
        .range([margin.top, height - margin.bottom]);
    g.selectAll('node')
        .data(nodeList)
        .enter()
        .append('circle')
        .attr('class', 'details-player')
        .attr('id', function (d) {
            return 'details-player-' + d['playerId'];
        })
        .attr('cx', x)
        .attr('cy', function (d, i) {
            return y(i);
        })
        .attr('r', 20)
        .attr('fill', '#e7e7e7')
        .attr('stroke', '#243534')
        .attr('stroke-width', 0)
        .attr('clicked', 'false')
        .on('mouseover', playerMouseoverDetails)
        .on('mouseout', playerMouseoutDetails)
        .on('click', playerClickDetails);
    g.selectAll('node')
        .data(nodeList)
        .enter()
        .append('text')
        .style('text-anchor', 'middle')
        .attr('x', x)
        .attr('y', function (d, i) {
            return y(i);
        })
        .text(function (d) {
            return d['playerId'];
        })
        // .attr('border', '#bd0026')
        .attr('font-size', 15)
        .attr('dy', 7)
        .style('pointer-events', 'none');
}


// 得到某一个属性的取值范围
function getExtentValue(data, key) {
    let dataList = [];
    for (let e of data) {
        // 过滤篮球数据
        if (e['teamId'] === -1) {
            continue;
        }
        let timeData = e['timeData'];
        for (let t of timeData) {
            dataList.push(t[key]);
        }
    }
    return d3.extent(dataList);
}

// 得到 度 的 范围
function getDegreeExtent(data, key) {
    let dataList = [];
    for (let e of data) {
        // 过滤篮球数据
        if (e['teamId'] === -1) {
            continue;
        }
        let timeData = e['timeData'];
        for (let t of timeData) {
            // console.log(t[key]);
            dataList.push(t[key].length);
        }
    }
    return d3.extent(dataList);
}

function getLinkDisExtentValue(data, key) {
    let dataList = [];
    for (let e of data) {
        // 过滤篮球数据
        if (e['s'] === -1) {
            continue;
        }
        let timeData = e['timeData'];
        for (let t of timeData) {
            dataList.push(t[key]);
        }
    }
    return d3.extent(dataList);
}


function getTimeOrderNum(data) {
    let timeNum = [];
    for (let e of data) {
        // 过滤篮球数据
        if (e['teamId'] === -1) {
            continue;
        }
        timeNum.push(e['timeData'].length);
    }
    return d3.max(timeNum);
}

function generateArrowHorizontal(x, y) {
    // let pathList = [];
    let arrow = d3.path();
    arrow.moveTo(x - 5, y - 5);
    arrow.lineTo(x, y);
    arrow.lineTo(x - 5, y + 5);
    // arrow.closePath();
    return arrow;
    // pathList.push([x-5, y - 5]);
    // pathList.push([x, y]);
    // pathList.push([x-5, y + 5]);
    // return pathList;
}

function generateArrowVertical(x, y) {
    let arrow = d3.path();
    arrow.moveTo(x - 5, y + 5);
    arrow.lineTo(x, y);
    arrow.lineTo(x + 5, y + 5);
    // arrow.closePath();
    return arrow;
    // let pathList = [];
    // pathList.push([x-5, y + 5]);
    // pathList.push([x, y]);
    // pathList.push([x + 5, y + 5]);
    // return pathList;
}

// 画 场地 图
function snapShotClick() {
    // 得到 id
    // let gID = d3.select(this).attr('id').split('-')[2];
    let clicked = d3.select(this).attr('clicked');
    // console.log(clicked)
    if (clicked === 'true') {
        // 执行 消除 事件
        d3.select(this).attr('clicked', 'false');
        d3.select(this)
            .style('stroke-width', 0);
        d3.selectAll('.details-line').style('opacity', 1);
    } else {
        d3.select(this).attr('clicked', 'true');
        d3.select(this)
            .style('stroke-width', 3);
    }
    let snapshotData = JSON.parse(d3.select(this).attr('value'));
    //console.log(snapshotData);
    // 取得场地的svg
    let svg = d3.select('#svg-court');
    // 得到宽度和高度
    let width = $('#div-court').width(),
        height = svg.attr('height'),
        courtWidth = width,
        courtHeight = width * 50 / 94;
    //console.log(courtWidth, typeof height)
    // 设计比例尺
    let xScale = d3.scaleLinear()
        .domain([0, 94])
        .range([0, courtWidth]);
    let yScale = d3.scaleLinear()
        .domain([0, 50])
        .range([0, courtHeight]);

    // 承载场地的g节点
    let g = svg.append('g');

    // 得到节点 和 连接
    let nodes = snapshotData.nodes;
    let links = snapshotData.links;

    draw_node_move(g, nodes, xScale, yScale);

    // console.log('点击snapshot按钮');
}

function draw_node_move(g, nodes, xScale, yScale) {
    let lineFunction = d3.line()
        .x(function (d) {
            //console.log(xScale(d.x))
            return xScale(d.x);
        })
        .y(function (d) {
            return yScale(d.y);
        })
        .curve(d3.curveMonotoneX);
    for(let node of nodes){
        let timeData = node['timeData'];
        // console.log(lineFunction(timeData))
        g.append('path')
            .datum(timeData)
            .attr('d', lineFunction)
            .attr("fill", "none")
            .attr("stroke", "#314544")
            .attr("stroke-width", 2);
        g.append('circle')
            .datum(timeData[0])
            .attr('value', lineFunction(timeData))
            .attr('cx', function (d) {
                return xScale(d.x)
            })
            .attr('cy', function (d) {
                return yScale(d.y)
            })
            .attr('r', '5')
            .attr('fill', '#e7e7e7')
            .attr('stroke', '#243534')
            .attr('stroke-width', 1);

    }
}


function playerClickDetails() {
    // 得到 id
    // let gID = d3.select(this).attr('id').split('-')[2];
    let clicked = d3.select(this).attr('clicked');
    d3.selectAll('.details-line').style('opacity', 0);
    d3.selectAll('.details-link').style('opacity', 0);
    // console.log(clicked)
    if (clicked === 'true') {
        // 执行 消除 事件
        d3.select(this).attr('clicked', 'false');
        d3.select(this)
            .style('stroke-width', 0);
        d3.selectAll('.details-line').style('opacity', 1);
    } else {
        d3.select(this).attr('clicked', 'true');
        d3.select(this)
            .style('stroke-width', 3);

        // 执行操作
        d3.selectAll('.details-player').each(function (d, i) {
            //console.log(d, i);
            let playerID = d['playerId'];
            let playerCircleID = '#details-player-' + d['playerId'];
            let isClicked = d3.select(playerCircleID).attr('clicked');
            if (isClicked === 'true') {
                d3.selectAll('.speed-' + playerID).transition().duration(500).style('opacity', 1);
                d3.selectAll('.degree-' + playerID).transition().duration(500).style('opacity', 1);
                d3.selectAll('.link-' + playerID).transition().duration(500).style('opacity', 1);
                d3.selectAll('.player-speed-' + playerID).transition().duration(500).style('opacity', 1);
                d3.selectAll('.speed-degree-' + playerID).transition().duration(500).style('opacity', 1);
                d3.selectAll('.degree-link-' + playerID).transition().duration(500).style('opacity', 1);
            }
        });
    }
}


function playerMouseoverDetails() {
    d3.select(this)
        .transition()
        .duration(50)
        .style('opacity', 0.3)
}

function playerMouseoutDetails() {
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
        'L' +
        (x0 + 5) +
        ',' +
        y0 +
        'C' +
        (x0 + x1) / 2 +
        ',' +
        y0 +
        ' ' +
        (x0 + x1) / 2 +
        ',' +
        y1 +
        ' ' +
        (x1 - 5) +
        ',' +
        y1 +
        'L' +
        x1 +
        ',' +
        y1;
}

function bzpathV2(x0, y0, x1, y1, x2) {
    x2 = x2 + 10;
    return 'M' +
        x0 +
        ',' +
        y0 +
        'L' +
        (x0 + 5) +
        ',' +
        y0 +
        'C' +
        (x0 + x2) / 2 +
        ',' +
        y0 +
        ' ' +
        (x0 + x2) / 2 +
        ',' +
        y1 +
        ' ' +
        (x2) +
        ',' +
        y1 +
        'L' +
        x1 +
        ',' +
        y1;
}

// 画场地
function draw_court() {
    let width = $('#div-court').width(),
        height = $('#div-court').height();
    //console.log(width, height)
    let svg = d3.select('#svg-court')
        .style('width', width - 20)
        .style('height', height - 20)
        .style('background-color', '#e7e7e7');
    // console.log(d3.select('.snapshot-button').attr('value'))
    // let snapshotData = JSON.parse(d3.select('.snapshot-button').attr('value'));
    // console.log(snapshotData);
}




























