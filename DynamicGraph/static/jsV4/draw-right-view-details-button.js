function details_aggregate() {
    let clicked = d3.select('#details_aggregate').attr('clicked');

    if (clicked === 'true') {
        d3.select('#details_aggregate').attr('clicked', 'false');
        d3.select('#svg-details')
            .selectAll('.details')
            .style('opacity', 1);
        d3.select('#svg-details')
            .select('.summary')
            .style('opacity', 0);
    } else {
        d3.select('#details_aggregate').attr('clicked', 'true');
        d3.select('#svg-details')
            .selectAll('.details')
            .style('opacity', 0);
        d3.select('#svg-details')
            .select('.summary')
            .style('opacity', 1);
    }


}