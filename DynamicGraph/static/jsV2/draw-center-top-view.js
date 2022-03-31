// 画中间上侧的视图
function init_center_top_view() {
    // 画 中间 上侧 视图
    draw_center_top_view_border()

    // 画 得分 视图
    draw_center_top_score_plot()

    // 画 回合 数据
    draw_center_top_round()


}

function draw_center_top_score_plot() {
    //    首先 是 获取 div 宽度 和高度
    let divWidth = $('#center-top').width(),
        divHeight = $('#center-top').height();
    // margin = {left: 10, top: 10, right: 10, bottom: 10};
    //    设置svg的长宽高
    let svg = d3.select('#svg-center-top')
        .style('width', divWidth)
        .style('height', divHeight);
    // 清空 svg 内的 元素
    // svg.empty();
    //  取得 选中的 比赛 id
    let gameID = $('#select-gameID option:selected').val();
    // 获取 数据
    $.ajax({
        url: '/getScoreData/',   // 得到 散点图 数据
        method: 'GET',
        timeout: 10000,  // 设置 延时函数
        data: {
            gameID: gameID,  // 比赛ID
        },
        beforeSend: function () {
            console.log('加载数据, 这里会弹出一个 框 让用户等待');

        },
        success: function (result, error) {

            console.log('接收到整个比赛的 得分 和 事件 数据');
            console.log('异常信息', error, typeof error);
            console.log(result);
            // 画 时间 轴 的 刷选 轴
            draw_game_score_timeBar(result);

            // 画 详细 的 时间 轴 得分 数据 和 事件数据
            draw_game_score_event(result);

            // 画 事件
            draw_game_event_type(result);

            // 画 球员 图
            draw_center_top_players(result);


        }
    })


}

function draw_center_top_view_border() {
//    首先 是 获取 div 宽度 和高度
    let divWidth = $('#center-top').width(),
        divHeight = $('#center-top').height();
    //    设置svg的长宽高
    let svg = d3.select('#svg-center-top')
        .style('height', divHeight)
        .style('width', divWidth);
    let rect1 = svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', divWidth)
        .attr('height', divHeight)
        .attr('rx', '10px')
        .attr('ry', '10px')
        .attr('class', 'rectBackground');
}



