// 画细节视图的指标
function draw_details_view_indicators(result) {
    console.log('画细节视图内的指标', result);
    // 得到 细节视图 的 svg
    let svg = d3.select('#svg-details');
    // 获取宽度和高度
    let width = $('#svg-details').width(),
        height = $('#svg-details').height(),
        margin = {left: 10, top: 10, right: 10, bottom: 10};

    // 取得 细节 数据 和 汇总 数据
    let details = result.details,
        summary = result.summary,
        playerMap = result['playerMap'];
    // 得到范围
    let speedExtent = getExtentValue(summary.nodes, 'speed');
    //console.log('汇总数据，节点度的范围', speedExtent);
    let degreeExtent = getDegreeExtent(summary.nodes, 'linkTarget');
   // console.log('汇总数据，节点度的范围', degreeExtent);
    let linkDistanceExtent = getLinkDisExtentValue(summary.links, 'dis');
   // console.log('汇总数据，链接距离的范围', linkDistanceExtent);

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

        g.append('rect')
            .attr('id', 'snapshot-border-' + i)
            .attr('x', x0 - 10)
            .attr('y', y0 + 7)
            .attr('rx', 5)
            .attr('rx', 5)
            .attr('width', width - x0 - 30)
            .attr('height', snapHeight - 5)
            .style('stroke', '#000')
            .style('stroke-dasharray', 2)
            .style('stroke-width', 0.2)
            .style('opacity', 1)
            .style('fill', '#fff')
            .on('click', snapshotDetailsClick);


        drawSpeedView(g, snapshotData, y0, x0, snapHeight, snapWidth, speedExtent, playerMap);
        drawDegreeView(g, snapshotData, y0, x1, snapHeight, snapWidth, degreeExtent, playerMap);
        drawLinkView(g, snapshotData, y0, x2, snapHeight, snapWidth, linkDistanceExtent, playerMap);
        // drawButton(g, snapshotData, y0, x3, snapHeight);

        drawLinkLine(g, snapshotData, y0, x0, x1, x2, snapHeight, snapWidth, speedExtent, degreeExtent, linkDistanceExtent);
    }

    let g1 = svg.append('g')
        .attr('class', 'summary')
        .style('opacity', 0);

    drawSummarySpeedView(g1, summary, speedExtent, width / 4 - 60, playerMap);
    drawSummaryDegreeView(g1, summary, degreeExtent, width / 4 - 60, playerMap);
    drawSummaryLinkView(g1, summary, linkDistanceExtent, width / 4 - 60, playerMap);


}


function drawSummaryLinkView(g, summary, linkDistanceExtent, x0, playerMap) {

    // 数据长度
    let unixTime = summary['unixTimeList'];
    //console.log(unixTime)
    let links = summary.links;

    // console.log('汇总数据节点', nodes);

    let snapHeight = ($('#div-details').height() - $('#details-diagram-name').height()) / 3;
    let snapWidth = $('#div-details').width() - 15 - 40;

    // 建立比例尺
    let x = d3.scaleBand()
        .domain(unixTime)
        .range([x0 + 15, snapWidth]);
    let y = d3.scaleLinear()
        .domain([0, linkDistanceExtent[1] + 2])
        .range([snapHeight * 3 - 40, snapHeight * 2 + 15]);

    let speedLine = d3.line()
        .x(function (d, i) {
            return x(d['unixTime']);
        })
        .y(function (d,) {
            // console.log(d['speed']);
            return y(d['dis']);
        })
        .curve(d3.curveMonotoneX);

    let nodesDegreeEnd = {};
    for (let link of links) {
        if (link['s'] === -1) {
            continue;
        }
        let strokeColor = '#3bb240';
        let sTeam = playerMap[link['s'].toString()]['teamDes'];
        let tTeam = playerMap[link['t'].toString()]['teamDes'];
        if (sTeam !== tTeam) {
            // strokeColor = '#eb6849';
            strokeColor = '#e6b80e';
        } else {
            strokeColor = '#3bb240'
        }
        // console.log(link);
        let timeData = link['timeData'];
        // console.log(timeData);
        g.append('path')
            .attr('class', 'details-line link-' + link.s + ' link-' + link.t)
            .datum(timeData)
            .attr('d', speedLine)
            .attr("fill", "none")
            .attr("stroke", strokeColor)
            .attr("stroke-width", 1)
            .attr('opacity', 0.7);

        g.selectAll('n')
            .data(timeData)
            .enter()
            .append('circle')
            .attr('class', 'details-line summary-link-' + link.s + ' summary-link-' + link.t)
            .attr('id', function (d) {
                return link.s + '-' + link.t;
            })
            .attr('cx', function (d, i) {
                return x(d['unixTime'])
            })
            .attr('cy', function (d) {
                return y(d['dis']);
            })
            .attr('r', '0.7')
            .attr('fill', '#535353')
            .attr('stroke', '#243534')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.5);


        let s = link.s,
            t = link.t;

        let lx = x(timeData[0]['unixTime']);
        let ly = y(timeData[0]['dis']);

        let sPlayerID = "#details-player-" + s;
        let tPlayerID = "#details-player-" + t;

        let scx = parseFloat(d3.select('#svg-details').select(sPlayerID).attr('cx'));
        let scy = parseFloat(d3.select('#svg-details').select(sPlayerID).attr('cy'));
        let sr = parseFloat(d3.select('#svg-details').select(sPlayerID).attr('r'));

        let tcx = parseFloat(d3.select('#svg-details').select(tPlayerID).attr('cx'));
        let tcy = parseFloat(d3.select('#svg-details').select(tPlayerID).attr('cy'));
        let tr = parseFloat(d3.select('#svg-details').select(tPlayerID).attr('r'));


        g.append('path')
            .attr('class', 'details-link player-link-' + s)
            .attr('d', bzpathV2(scx + sr, scy, lx, ly, x0))
            .attr("fill", "none")
            .attr("stroke", "#a4b7b6")
            .attr("stroke-width", 1)
            .style('opacity', 0.0)
            .style('pointer-events', 'none');
        g.append('path')
            .attr('class', 'details-link player-link-' + t)
            .attr('d', bzpathV2(tcx + tr, tcy, lx, ly, x0))
            .attr("fill", "none")
            .attr("stroke", "#a4b7b6")
            .attr("stroke-width", 1)
            .style('opacity', 0.0)
            .style('pointer-events', 'none');
    }

    //设置目标区域
    let y0 = 0;
    let padding = 15;
    let x1 = x0 + padding;
    let y1 = snapHeight * 2 + padding;
    let x2 = snapWidth - padding + 30;
    let y2 = snapHeight * 3 - padding - 20;

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
        .text('link distance')
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
}


function drawSummaryDegreeView(g, summary, degreeExtent, x0, playerMap) {
    // 数据长度
    let dataLength = summary.index.length;
    let nodes = summary.nodes;
    //console.log('汇总数据节点', nodes);

    let snapHeight = ($('#div-details').height() - $('#details-diagram-name').height()) / 3;
    let snapWidth = $('#div-details').width() - 15 - 40;

    let x = d3.scaleLinear()
        .domain([0, dataLength - 1])
        .range([x0 + 15, snapWidth]);
    let y = d3.scaleLinear()
        .domain([0, degreeExtent[1] + 1])
        .range([snapHeight * 2 - 15, snapHeight + 15]);

    let fillColorMap = {
        'home': '#e6421c',
        'visitor': '#1d70fb'
    };


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


        let fillColorMap = {
            'home': '#e6421c',
            'visitor': '#1d70fb'
        };
        let timeData = node['timeData'];
        let strokeColor = fillColorMap[playerMap[node['playerId'].toString()]['teamDes']];
        // console.log(timeData)

        g.append('path')
            .attr('class', 'details-line degree-' + node['playerId'])
            .datum(timeData)
            .attr('d', speedLine)
            .attr("fill", "none")
            .attr("stroke", strokeColor)
            .attr("stroke-width", 1)
            .attr('opacity', 0.7);
        g.selectAll('n')
            .data(timeData)
            .enter()
            .append('circle')
            .attr('class', 'details-line summary-degree-' + node['playerId'])
            .attr('id', function (d) {
                return node['playerId'] + '-' + d['unixTime'];
            })
            .attr('cx', function (d, i) {
                return x(i)
            })
            .attr('cy', function (d) {
                return y(d['linkTarget'].length);
            })
            .attr('r', '0.7')
            .attr('fill', '#535353')
            .attr('stroke', '#243534')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.5);


        let nodeID = node['playerId'];
        let playerID = "#details-player-" + nodeID;

        let cx = parseFloat(d3.select('#svg-details').select(playerID).attr('cx'));
        let cy = parseFloat(d3.select('#svg-details').select(playerID).attr('cy'));
        let r = parseFloat(d3.select('#svg-details').select(playerID).attr('r'));

        // let timeData = node['timeData'];
        let sx = x(0);
        let sy = y(timeData[0]['linkTarget'].length);
        // console.log(cx, cy, sx, sy);
        g.append('path')
            .attr('class', 'details-link player-degree-' + nodeID)
            .attr('d', bzpathV1(cx + r, cy, sx, sy))
            .attr("fill", "none")
            .attr("stroke", "#a4b7b6")
            .attr("stroke-width", 1)
            .style('opacity', 0.0)
            .style('pointer-events', 'none');
    }

    //设置目标区域
    let y0 = 0;
    let padding = 15;
    let x1 = x0 + padding;
    let y1 = snapHeight + padding;
    let x2 = snapWidth - padding + 30;
    let y2 = snapHeight * 2 - padding;

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

}


// 画汇总的指标和属性
function drawSummarySpeedView(g, summary, speedExtent, x0, playerMap) {
    // 数据长度
    let dataLength = summary.index.length;
    let nodes = summary.nodes;
    //console.log('汇总数据节点', nodes);

    let snapHeight = ($('#div-details').height() - $('#details-diagram-name').height()) / 3;
    let snapWidth = $('#div-details').width() - 15 - 40;
    //console.log('汇总区域', snapWidth, snapHeight);
    let x = d3.scaleLinear()
        .domain([0, dataLength - 1])
        .range([x0 + 15, snapWidth]);
    let y = d3.scaleLinear()
        .domain([0, speedExtent[1] + 2])
        .range([snapHeight - 15, 15]);

    let fillColorMap = {
        'home': '#e6421c',
        'visitor': '#1d70fb'
    };


    // 建立线条函数
    let speedLine = d3.line()
        .x(function (d, i) {
            // console.log(d)
            return x(i);
        })
        .y(function (d,) {
            // console.log(d)
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
        //console.log('汇总数据的时间节点数据', timeData)
        let strokeColor = fillColorMap[playerMap[node['playerId'].toString()]['teamDes']];
        // console.log(timeData)
        g.append('path')
            .attr('class', 'details-line summary-speed-' + node['playerId'])
            .datum(timeData)
            .attr('d', speedLine)
            .attr("fill", "none")
            .attr("stroke", strokeColor)
            .attr("stroke-width", 1)
            .attr('opacity', 0.7);
        g.selectAll('n')
            .data(timeData)
            .enter()
            .append('circle')
            .attr('class', 'details-line summary-speed-' + node['playerId'])
            .attr('id', function (d) {
                return node['playerId'] + '-' + d['unixTime'];
            })
            .attr('cx', function (d, i) {
                return x(i)
            })
            .attr('cy', function (d) {
                return y(d['speed'])
            })
            .attr('r', '0.7')
            .attr('fill', '#535353')
            .attr('stroke', '#243534')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.5);


        let nodeID = node['playerId'];
        let playerID = "#details-player-" + nodeID;

        let cx = parseFloat(d3.select('#svg-details').select(playerID).attr('cx'));
        let cy = parseFloat(d3.select('#svg-details').select(playerID).attr('cy'));
        let r = parseFloat(d3.select('#svg-details').select(playerID).attr('r'));

        // let timeData = node['timeData'];
        let sx = x(0);
        let sy = y(timeData[0]['speed']);
        // console.log(cx, cy, sx, sy);
        g.append('path')
            .attr('class', 'details-link player-speed-' + nodeID)
            .attr('d', bzpathV1(cx + r, cy, sx, sy))
            .attr("fill", "none")
            .attr("stroke", "#a4b7b6")
            .attr("stroke-width", 1)
            .style('opacity', 0.0)
            .style('pointer-events', 'none');
    }

    //


    //设置目标区域
    let y0 = 0;
    let padding = 15;
    let x1 = x0 + padding;
    let y1 = y0 + padding;
    let x2 = snapWidth - padding + 30;
    let y2 = snapHeight - padding;

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

}


// 画连线
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
            .attr('d', bzpathV1(cx + r, cy, sx, sy))
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
            .attr('d', bzpathV1(sx, sy, dx, dy))
            .attr("fill", "none")
            .attr("stroke", "#a4b7b6")
            .attr("stroke-width", 1)
            .style('opacity', 0.0)
            .style('pointer-events', 'none');

        dx = degX(timeData.length - 1);
        dy = degY(timeData[timeData.length - 1]['linkTarget'].length);
        nodesDegreeEnd[nodeID + ''] = [dx, dy];
    }
    // console.log(nodesDegreeEnd)
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
            .style('opacity', 0.0)
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
function drawLinkView(g, snapshotData, y0, x0, snapHeight, snapWidth, extent, playerMap) {
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
        let strokeColor = '#3bb240';
        let sTeam = playerMap[link['s'].toString()]['teamDes'];
        let tTeam = playerMap[link['t'].toString()]['teamDes'];
        // if (sTeam === tTeam) {
        //     strokeColor = '#eb6849';
        // }
        if (sTeam !== tTeam) {
            // strokeColor = '#eb6849';
            strokeColor = '#e6b80e';
        } else {
            strokeColor = '#3bb240'
        }
        // console.log(link);
        let timeData = link['timeData'];
        // console.log(timeData);
        g.append('path')
            .attr('class', 'details-line link-' + link.s + ' link-' + link.t)
            .datum(timeData)
            .attr('d', speedLine)
            .attr("fill", "none")
            .attr("stroke", strokeColor)
            .attr("stroke-width", 1)
            .attr('opacity', 0.7);

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
            .attr('r', '0.7')
            .attr('fill', '#535353')
            .attr('stroke', '#243534')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.5);
    }


}

// 画度
function drawDegreeView(g, snapshotData, y0, x0, snapHeight, snapWidth, extent, playerMap) {
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


        let fillColorMap = {
            'home': '#e6421c',
            'visitor': '#1d70fb'
        };
        let timeData = node['timeData'];
        let strokeColor = fillColorMap[playerMap[node['playerId'].toString()]['teamDes']];
        // console.log(timeData)

        g.append('path')
            .attr('class', 'details-line degree-' + node['playerId'])
            .datum(timeData)
            .attr('d', speedLine)
            .attr("fill", "none")
            .attr("stroke", strokeColor)
            .attr("stroke-width", 1)
            .attr('opacity', 0.7);
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
            .attr('r', '0.7')
            .attr('fill', '#535353')
            .attr('stroke', '#243534')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.5);
    }
}

// 画速度
function drawSpeedView(g, snapshotData, y0, x0, snapHeight, snapWidth, speedExtent, playerMap) {
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


    let fillColorMap = {
        'home': '#e6421c',
        'visitor': '#1d70fb'
    };


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
        let strokeColor = fillColorMap[playerMap[node['playerId'].toString()]['teamDes']];
        // console.log(timeData)
        g.append('path')
            .attr('class', 'details-line speed-' + node['playerId'])
            .datum(timeData)
            .attr('d', speedLine)
            .attr("fill", "none")
            .attr("stroke", strokeColor)
            .attr("stroke-width", 1)
            .attr('opacity', 0.7);
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
            .attr('r', '0.7')
            .attr('fill', '#535353')
            .attr('stroke', '#243534')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.5);
    }
}

function bzpathV1(x0, y0, x1, y1) {
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


function snapshotDetailsClick() {
    let snapshotID = d3.select(this).attr('id').split('-')[2];
    let clicked = d3.select(this).attr('clicked');

    d3.select('#svg-court-mini').selectAll('rect')
        .attr('clicked', false)
        .style('stroke-dasharray', 2)
        .style('stroke-width', 1);
    // d3.select('').attr('clicked', true);
    d3.select('#svg-court')
        .selectAll('.snapshot')
        .attr('opacity', 0);

    d3.select('#snapshot-miniRect-' + snapshotID)
        .style('stroke-dasharray', 0)
        .style('stroke-width', 3);
   d3.select('#snapshot-' + snapshotID).transition()
        .duration(300)
        .attr('opacity', 1);


    d3.select('#svg-details')
        .selectAll('rect')
        .style('stroke-dasharray', 2)
        .style('stroke-width', 0.2);

    // // console.log(clicked)
    // if (clicked === 'true') {
    //     // 执行 消除 事件
    //     d3.select(this).attr('clicked', 'false');
    //
    // } else {
        d3.select(this).attr('clicked', 'true');
        d3.select(this)
            .transition()
            .duration(300)
            .style('stroke-dasharray', 0)
            .style('stroke-width', 3);
    // }
}