function court_path() {
    d3.select('#svg-court')
        .selectAll('.court_path')
        .transition()
        .duration(300)
        .style('opacity', 0.7);
    d3.select('#svg-court')
        .selectAll('.court_link')
        .transition()
        .duration(300)
        .style('opacity', 0);
}

function court_link() {
    d3.select('#svg-court')
        .selectAll('.court_path')
        .transition()
        .duration(300)
        .style('opacity', 0);
    d3.select('#svg-court')
        .selectAll('.court_link')
        .transition()
        .duration(300)
        .style('opacity', 0.3);
}

function court_aggregate() {

    d3.select('#svg-court')
        .selectAll('.snapshot')
        .transition()
        .duration(300)
        .attr('opacity', 0);
    d3.select('#svg-court')
        .select('#snapshot-summary')
        .transition()
        .duration(300)
        .attr('opacity', 1);

}

function court_redisplay(){
    console.log('充展示')
    d3.select('#svg-court')
        .selectAll('.court_player')
        .transition()
        .duration(300)
        .style('opacity', 0.7);
    d3.select('#svg-court')
        .selectAll('.court_link')
        .transition()
        .duration(300)
        .style('opacity', 0.3);
    d3.select('#svg-court')
        .selectAll('.court_path')
        .transition()
        .duration(300)
        .style('opacity', 0);
}