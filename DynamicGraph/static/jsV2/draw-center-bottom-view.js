function init_center_bottom_view() {
    // draw center bottom border
    draw_center_bottom_border();
    // draw tree
    draw_center_bottom_view_tree();


}

function draw_center_bottom_border() {
    //    首先 是 获取 div 宽度 和高度
    let divWidth = $('#center-bottom').width(),
        divHeight = $('#center-bottom').height();
    //    设置svg的长宽高
    let svg = d3.select('#svg-center-bottom')
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