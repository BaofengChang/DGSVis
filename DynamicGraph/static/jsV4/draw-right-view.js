function init_court_view() {

}

init_court_view();


// 初始化场地
$(function () {
    // 得到场地视图所在的div的宽度
    let divWidth = $('#div-court').width();
    let divHeight = $('#div-court').height();
    let nameHeight = $('#node-link-diagram-name').height();
    // console.log(nameHeight)
    // let svg_court = d3.select('#svg-court');
    // console.log(divWidth);
    // 初始化宽度和高度
    let courtHeight = (divWidth - 10) * 50 / 94;
    d3.select('#svg-court')
        .style('width', divWidth - 10)
        .style('height', courtHeight);

    let miniCourtHeight = divHeight - nameHeight - 10 - courtHeight;
    d3.select('#svg-court-mini')
        .attr('width', divWidth-10)
        .attr('height', miniCourtHeight-20);
        // .style('background-color', '#ccc')

    // 初始化细节视图所在的div高度和宽度
    divWidth = $('#div-details').width();
    divHeight = $('#div-details').height();
    nameHeight = $('#details-diagram-name').height();
    let detailsHeight = divHeight - nameHeight;
     d3.select('#svg-details')
        .attr('width', divWidth)
        .attr('height', detailsHeight);

});
