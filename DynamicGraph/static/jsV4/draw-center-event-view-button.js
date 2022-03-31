// 刷选事件
function event_brush() {
    // // 设置 brush 功能
    // let brushX = d3.brushX()                 // Add the brush feature using the d3.brush function
    //     .extent([[margin.left, 0], [width - margin.right, height]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    //     .on("end", updateChart);

    // gGameScoreBox.call(brushX);
}

// 聚焦事件
function event_focus_function() {
    let startTime = parseFloat(d3.select('#event_focus_btn').attr('startBrushTime'));
    let endTime = parseFloat(d3.select('#event_focus_btn').attr('endBrushTime'));
    console.log('选中范围', startTime, endTime);
    draw_root_tree_by_TimeRange(startTime, endTime);

}