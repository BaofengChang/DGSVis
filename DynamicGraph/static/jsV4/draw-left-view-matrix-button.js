function matrix_zoom() {
    let divWidth = $('#matrix-scatter').width(),
        divHeight = $('#matrix-scatter').height();
    //设置svg的长宽高
    let svg = d3.select('#svg-matrix');
    const zoom = d3.zoom()
        .scaleExtent([0.8, 8])
        .extent([[0, 0], [divWidth, divHeight]])
        .on("zoom", zoomed);

    let clicked = d3.select('#matrix_zoom').attr('clicked');
    // console.log(clicked, typeof clicked)
    if (clicked === 'true') {
        d3.select('#matrix_zoom').attr('clicked', false);
        svg.on('.zoom', null);
    } else {
        d3.select('#matrix_zoom').attr('clicked', true);
        svg.call(zoom);
    }

    function zoomed() {
        d3.select('#svg-matrix')
            .selectAll('g')
            .attr('transform', d3.event.transform)
    }


}