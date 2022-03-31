function draw_div_players() {
    $.ajax({
        url: '/getPlayerData/',   // 得到 散点图 数据
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
            console.log(result);

            // 清空 div 下 的 子节点
            $('#div_player').empty();

            // 得到 svg 的 长宽 高
            let width = $('#div_player').width(),
                heigth = $('#div_player').height(),
                margin = {left: 10, top: 10, right: 10, bottom: 10};
            // 添加 svg，再添加一个g 便宜10px 以防占到边
            let svg = d3.select('#div_player').append('svg')
                .attr('width', width)
                .attr('height', heigth)
                .append('g');

            console.log('画球员')
            let homePlayerList = sortPlayerList(result.nodes.home),
                visitorPlayerList = sortPlayerList(result.nodes.visitor),
                links = result.links;


            console.log('home', homePlayerList);
            console.log('visitor', visitorPlayerList);
            console.log('link', links);

            // 主队 高度 和 客队 高度
            let visitorHeight = heigth / 4,
                homeHeight = heigth * 3 / 4;


            // 建立 横向的比例尺
            let xScale = d3.scaleLinear()
                .domain([0, 11])
                .range([margin.left + 20, width - margin.right - 20]);

            let rectWidth = (width) / (visitorPlayerList.length * 2);

            // 画 主队 球员
            for (let i = 0; i < visitorPlayerList.length; i++) {
                let player = visitorPlayerList[i],
                    x = xScale(i),
                    y = visitorHeight,
                    id = 'p-' + player.playerid;

                svg.append('circle')
                    .attr('id', id)
                    .attr('cx', x)
                    .attr('cy', y)
                    .attr('r', 13)
                    .attr('fill', '#1d70fb')
                    .attr('opacity', 0.5);

                // 画号码
                let jersey = player.jersey;
                svg.append('text')
                    .style('text-anchor', 'middle')
                    .attr("x", x)
                    .attr("y", y)
                    .attr('dy', 6)
                    .attr('font-size', 13)
                    .text(jersey)
                    .style('pointer-events', 'none');

            }

            // 画 主队 球员
            for (let i = 0; i < homePlayerList.length; i++) {
                let player = homePlayerList[i],
                    x = xScale(i),
                    y = homeHeight,
                    id = 'p-' + player.playerid;

                svg.append('circle')
                    .attr('id', id)
                    .attr('cx', x)
                    .attr('cy', y)
                    .attr('r', 13)
                    .attr('fill', '#af3118')
                    .attr('opacity', 0.5);

                // 画号码
                let jersey = player.jersey;
                svg.append('text')
                    .style('text-anchor', 'middle')
                    .attr("x", x)
                    .attr("y", y)
                    .attr('dy', 6)
                    .attr('font-size', 13)
                    .text(jersey)
                    .style('pointer-events', 'none');
            }


            // 建立 连接宽度 比例尺
            let linkWidthScale = d3.scaleLinear()
                .domain(d3.extent(links.map(d => d.linkNum)))
                .range([0.5, 10]);
            // console.log(linkWidth(380))
            // 画 连接
            for (let i = 0; i < links.length; i++) {
                let link = links[i];
                let sID = '#p-' + link.s,
                    tID = '#p-' + link.t,
                    linkNum = link.linkNum,
                    fill_opacity = 0.5;

                let sx = svg.select(sID)
                    .attr('cx');
                let sy = svg.select(sID)
                    .attr('cy');

                let tx = svg.select(tID)
                    .attr('cx');
                let ty = svg.select(tID)
                    .attr('cy');

                sx = parseFloat(sx)
                sy = parseFloat(sy)
                tx = parseFloat(tx)
                ty = parseFloat(ty)
                // console.log(sx, sy, tx, ty);
                if (sy > heigth / 2 && ty > heigth / 2) {
                    let dx = 10,
                        dy = heigth / 5;
                    let path = d3.path();
                    let cpx1 = sx;
                    let cpy1 = sy + (ty - heigth / 2);
                    let cpx2 = sx + (tx - sx) * 0.5;
                    let cpy2 = sy + (ty - heigth / 2);
                    let cpx3 = tx;
                    let cpy3 = sy + (ty - heigth / 2);
                    path.moveTo(sx, sy)
                    path.bezierCurveTo(cpx1, cpy1, cpx3, cpy3, tx, ty)
                    svg.append('path')
                        .attr('d', path.toString())
                        .attr('class', 'p-' + link.s + ' '+ 'p-' + link.t)
                        .style('fill', 'none')
                        .style('stroke', '#6a8281')
                        .style('opacity', fill_opacity)
                        .style('stroke-width', linkWidthScale(linkNum));
                    // svg.append('line')
                    //     .attr('x1', sx)
                    //     .attr('x2', tx)
                    //     .attr('y1', sy)
                    //     .attr('y2', ty)
                    //     // .attr('stroke-width', linkWidthScale(linkNum))
                    //     .attr("stroke", "#6a8281");
                } else if (sy < heigth / 2 && ty < heigth / 2) {
                    let dx = 10,
                        dy = heigth / 5;
                    let path = d3.path();
                    let cpx1 = sx;
                    let cpy1 = sy + (ty - heigth / 2);
                    let cpx2 = sx + (tx - sx) * 0.5;
                    let cpy2 = sy + (ty - heigth / 2);
                    let cpx3 = tx;
                    let cpy3 = sy + (ty - heigth / 2);
                    path.moveTo(sx, sy)
                    path.bezierCurveTo(cpx1, cpy1, cpx3, cpy3, tx, ty)
                    svg.append('path')
                        .attr('d', path.toString())
                        .attr('class', 'p-' + link.s + ' '+ 'p-' + link.t)
                        .style('fill', 'none')
                        .style('stroke', '#6a8281')
                        .style('opacity', fill_opacity)
                        .style('stroke-width', linkWidthScale(linkNum));
                } else {

                    let dx = 10,
                        dy = heigth / 5;
                    let path = d3.path();
                    let cpx1 = sx;
                    let cpy1 = sy + (ty - sy) * 0.3;
                    let cpx3 = tx;
                    let cpy3 = sy + (ty - sy) * 0.7;
                    path.moveTo(sx, sy)
                    path.bezierCurveTo(cpx1, cpy1, cpx3, cpy3, tx, ty)
                    svg.append('path')
                        .attr('d', path.toString())
                        .attr('class', 'p-' + link.s + ' '+ 'p-' + link.t)
                        .style('fill', 'none')
                        .style('stroke', '#6a8281')
                        .style('opacity', fill_opacity)
                        .style('stroke-width', linkWidthScale(linkNum));

                }

            }

            svg.selectAll('circle').remove();
            svg.selectAll('text').remove();

            // 画 主队 球员
            for (let i = 0; i < visitorPlayerList.length; i++) {
                let player = visitorPlayerList[i],
                    x = xScale(i),
                    y = visitorHeight,
                    id = 'p-' + player.playerid;

                let circle = svg.append('circle')
                    .attr('id', id)
                    .attr('isSp', player.isSp)
                    .attr('cx', x)
                    .attr('cy', y)
                    .attr('r', 13)
                    .attr('fill', '#19c4fb')
                    .attr('opacity', 0.7);

                if (player.isSp === 1){
                    circle.style('stroke', '#092bd2')
                        .style('stroke-width', 5);
                }

                // 画号码
                let jersey = player.jersey;
                svg.append('text')
                    .style('text-anchor', 'middle')
                    .attr("x", x)
                    .attr("y", y)
                    .attr('dy', 6)
                    .attr('font-size', 13)
                    .text(jersey)
                    .style('pointer-events', 'none');

            }

            // 画 主队 球员
            for (let i = 0; i < homePlayerList.length; i++) {
                let player = homePlayerList[i],
                    x = xScale(i),
                    y = homeHeight,
                    id = 'p-' + player.playerid;

                let circle = svg.append('circle')
                    .attr('id', id)
                    .attr('isSp', player.isSp)
                    .attr('cx', x)
                    .attr('cy', y)
                    .attr('r', 13)
                    .attr('fill', '#fe853b')
                    .attr('opacity', 0.7);

                if (player.isSp === 1){
                    circle.style('stroke', '#092bd2')
                        .style('stroke-width', 5);
                }

                // 画号码
                let jersey = player.jersey;
                svg.append('text')
                    .style('text-anchor', 'middle')
                    .attr("x", x)
                    .attr("y", y)
                    .attr('dy', 6)
                    .attr('font-size', 13)
                    .text(jersey)
                    .style('pointer-events', 'none');
            }


        },
        complete: function () {
            console.log('绘制 比赛图 完毕');
        }
    })

}


function sortPlayerList(playerList) {
    let positionString = 'b G G-F F F-C C';
    playerList = playerList.sort(function (a, b) {
        let aisSp = a.isSp,
            bisSp = b.isSp,
            aTeamDes = a.teamDes,
            bTeamDes = b.teamDes,
            aPosition = positionString.indexOf(a.position),
            bPosition = positionString.indexOf(b.position),
            aID = a.playerid,
            bID = b.playerid;

        if (aTeamDes < bTeamDes) {
            return -1;
        } else if (aTeamDes > bTeamDes) {
            return 1;
        } else {
            if (aPosition.length === bPosition.length) {
                if (aPosition < bPosition) {
                    return -1;
                } else if (aPosition > bPosition) {
                    return 1;
                } else {
                    if (aID < bID) {
                        return -1
                    } else {
                        return 1;
                    }
                }
            }
        }
    });
    return playerList
}