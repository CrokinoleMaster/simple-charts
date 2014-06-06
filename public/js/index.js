function info(div, text, type) {
  div.empty()
    .removeClass()
    .addClass('alert '+type)
    .html(text);
}

function barChart(data, div) {
  var dataset = new CSV(data).parse();
  console.log(dataset);
  if (!dataset[1]){
    dataset = dataset[0];
  } else if (Object.prototype.toString.call(dataset[0]) === '[object Array]') {
    if (dataset[0].length > 1){
      alert('this CSV contains multiple values for each data array, ' +
          'only the first value will be used');
      dataset = dataset.map(function(el) {
        return el[0];
      });
    }
  }
  var w = 750;
  var max = Math.max.apply(Math, dataset);
  var h = 400;
  var r = h/max;

  var barPadding = 1;

  var svg = d3.select(div)
              .append('svg')
              .attr('width', w)
              .attr('height', h);
  svg.selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr("x", function(d, i) {
      return i * (w / dataset.length);
    })
    .attr("y", function(d) {
      return h - (d*r);
    })
    .attr("width", w / dataset.length - barPadding)
    .attr("height", function(d) {
      return (d*r);
    })
    .attr("fill", function(d) {
      return "rgb(0, 0, " + Math.round(d/max *255, 0) + ")";
    });

  svg.selectAll("text")
    .data(dataset)
    .enter()
    .append("text")
    .text(function(d) {
      return d;
    })
    .attr("text-anchor", "middle")
    .attr("x", function(d, i) {
      return i * (w / dataset.length) + (w / dataset.length - barPadding) / 2;
    })
    .attr("y", function(d) {
      return h - (d*r) + 14;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr("fill", "white");

}

$(function(){
  var $newBtn = $('#new-button');
  var $removeBtn = $('.remove-btn');
  var $newData = $('#new-data');
  var $newName = $('#new-name');
  var $info = $('#info');
  var $barBtn = $('.barChart');
  var $chart = $('#chart');
  var $chartInfo = $('#chart-info');
  var $csvResult = $('#csv-result');
  var $parsedResult = $('#parsed-result');

  $newBtn.on('click', function(e){
    var parsedData = null;
    var valid = true;
    $info.removeClass().empty();
    e.preventDefault();
    if ($newData.val().length === 0 || $newName.val().length === 0){
      info($info, 'you left something blank!', 'alert-danger');
    } else {
      parsedData = new CSV($newData.val()).parse();
      console.log(parsedData);
      parsedData.forEach(function(el1){
        if (Object.prototype.toString.call(el1) === '[object Array]'){
          el1.forEach(function(el2){
            if (isNaN(el2)){
              valid = false;
              info($info, 'something is wrong, even I can tell', 'alert-danger');
            }
          });
        } else if (isNaN(el1)){
          valid = false;
          info($info, 'something is wrong, even I can tell', 'alert-danger');
        }
      });
      if (valid === true){
        $.ajax({
          type: 'POST',
          url: '/projects/new',
          data: {name: $newName.val(), data: $newData.val()},
          dataType: 'json',
          success: function(d){
            if (d.error){
              info($info,
                d.error,
                'alert-danger');
            } else {
              console.log(d);
              info($info,
                'success',
                'alert-success');
              $(location).attr('href','/');
            }
          },
          error: function(e){
            info($info,
              e.responseText,
              'alert-danger');
          }
        });
      }
    }
  });

  $removeBtn.on('click', function(e){
    e.preventDefault();
    var $this = $(this);
    var name = $this.parent().find('p').html();
    info($chartInfo, 'Deleting...', 'alert-info');
    $.ajax({
      type: 'DELETE',
      url: '/projects/'+name,
      success: function(res){
        if (res.error){
          info($chartInfo,
            res.error,
            'alert-danger');
        } else {
          info($chartInfo, 'success', 'alert-success');
          $(location).attr('href', '/');
        }
      },
      error: function(err){
        info($chartInfo,
          err.responseText,
          'alert-danger');
      }
    });
  });

  $barBtn.on('click', function(e) {
    e.preventDefault();
    var $this = $(this);
    var name = $this.parent().find('p').html();
    var data = null;
    info($chartInfo,
      'Loading...',
      'alert-info');
    $chart.empty();
    $csvResult.empty();
    $parsedResult.empty();
    $.ajax({
      type: 'GET',
      url: '/projects/data/'+name,
      success: function(res){
        barChart(res.data, '#chart');
        $csvResult.html(res.data);
        $chartInfo.empty().removeClass();
        $parsedResult.html(JSON.stringify(new CSV(res.data).parse()));
        if (res.error){
          info($chartInfo,
            res.error,
            'alert-danger');
        }
      },
      error: function(err){
        info($chartInfo,
          err.responseText,
          'alert-danger');
      }
    });
  });

});
