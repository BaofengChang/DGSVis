$(function () {
    $("#nodeChangeSlider").slider({
        orientation: "horizontal",
        range: "min",
        max: 100,
        // {#min:0,#}
        value: 10,
        step: 1,
        slide: function (event, ui) {
            $("#nodeChangeThresholdText").text(ui.value);
        }
    });

    $("#linkChangeSlider").slider({
        orientation: "horizontal",
        range: "min",
        max: 100,
        // {#min:0,#}
        value: 10,
        step: 1,
        slide: function (event, ui) {
            $("#linkChangeThresholdText").text(ui.value);
        }
    });
    $("#timeGapSlider").slider({
        orientation: "horizontal",
        range: "min",
        max: 10,
        min: 0,
        value: 1,
        step: 0.1,
        slide: function (event, ui) {
            $("#timeGapThresholdText").text(ui.value);
        }
    });

    $("#timeSliceSlider").slider({
        orientation: "horizontal",
        range: "min",
        max: 10,
        min: 2,
        value: 5,
        step: 1,
        slide: function (event, ui) {
            $("#timeSliceValue").text(ui.value);
        }
    });

});