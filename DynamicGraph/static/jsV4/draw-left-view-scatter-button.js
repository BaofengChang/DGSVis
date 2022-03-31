function scatter_zoom() {
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
        d3.select('#svg-scatter')
            .selectAll('g')
            .attr('transform', d3.event.transform)
    }

    d3.select('#svg-scatter')
        .on('.drag', null);

    d3.select('#svg-scatter')
        .call(zoom);
}

function scatter_brush() {
    d3.select('#svg-scatter').selectAll('circle')
        .classed('selected', false);
    // 初始化lasso功能模块
            let lasso_start = function () {
                // console.log(1);
                lasso.items()
                    .attr('r', 1)
                    .classed('not_possible', true)
                    .classed('selected', false);
            };
            let lasso_draw = function () {
                lasso.possibleItems()
                    .classed('not_possible', false)
                    .classed('possible', true);
                lasso.notPossibleItems()
                    .classed('not_possible', true)
                    .classed('possible', false);
            };
            let lasso_end = function () {
                lasso.items()
                    .classed('not_possible', false)
                    .classed('possible', false);
                lasso.selectedItems()
                    .classed('selected', true)
                    .style('r', 3)
                    .attr('opacity', 1);
                lasso.notSelectedItems()
                    .style('r', 1);
            };

            let scatter_svg = d3.select('#svg-scatter');
            let points = scatter_svg.selectAll('circle');

            // 创建lasso功能对象
            let lasso = d3.lasso()
                .closePathSelect(true)
                .closePathDistance(50)
                .items(points)
                .targetArea(scatter_svg)
                .on('start', lasso_start)
                .on('draw', lasso_draw)
                .on('end', lasso_end);

    d3.select('#svg-scatter')
        .on('.zoom', null);

    d3.select('#svg-scatter')
        .call(lasso);
}


function scatter_focus() {
    let value = $('#scatter_focus').attr('value');
    let circles = d3.select('#svg-scatter').selectAll('.selected');
    let timeList = [];
    circles.each(function (d, i) {
        let timeIndex = d['timeIndex'];
        timeList.push(timeIndex);
    });

    draw_root_tree_by_timeIndex(timeList)
    // console.log(timeList);
    // console.log(value);
}