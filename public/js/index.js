function info(div, text, type) {
  div.empty()
    .removeClass()
    .addClass('alert '+type)
    .html(text);
}

function pieChart(data, div) {
  data = d3.csv.parse(data);
  console.log(data);
  var keys = Object.keys(data[0]);
  var age = keys[0];
  var population = keys[1];
  console.log(age);
  console.log(population);
  var width = 960,
      height = 500,
      radius = Math.min(width, height) / 2;

  var color = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d[population]; });

  var svg = d3.select(div).append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


    data.forEach(function(d) {
      d[population] = +d[population];
    });

    var g = svg.selectAll(".arc")
        .data(pie(data))
      .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data[age]); });

    g.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.data[age]; });

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
  var $projects = $('#projects-container');
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

  $projects.on('click', 'button', function(e) {
    e.preventDefault();
    var $this = $(this);
    var name = $this.parent().find('p').html();
    var data = null;
    if ($this.hasClass('barChart') || $this.hasClass('pieChart')) {
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
          if ($this.hasClass('barChart')) {
            barChart(res.data, '#chart');
            $parsedResult.html(JSON.stringify(new CSV(res.data).parse()));
          } else if ($this.hasClass('pieChart')) {
            console.log(res.data);
            pieChart(res.data, '#chart');
            $parsedResult.html(JSON.stringify(d3.csv.parse(res.data)));
          }
          $csvResult.html(res.data);
          $chartInfo.empty().removeClass();
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
    }
  });

});
