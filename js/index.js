//////////////////////////////////////////////////
//          SET UP LOCAL VARIABLES              //
///////////////////////////////////////////////////
var margin = {top: 15, right: 25, bottom: 20, left: 15};
var width = 820 - margin.left - margin.right;
var height = 380 - margin.top - margin.bottom;
var padding = 1;
var current_ticker = "GME";
var current_subreddit = "wallstreetbets";

///////////////////////////////////////////////////
//          HANDLE INPUT FROM HTML PAGE          //
///////////////////////////////////////////////////

d3.selectAll("input[name='ticker']").on("change", function () {
  $("#d3").empty();
  draw(this.id, current_subreddit);
  current_ticker = this.id;
});

d3.selectAll("input[name='subreddit']").on("change", function () {
  $("#d3").empty();
  draw(current_ticker, this.id);
  current_subreddit = this.id;
});

// Draw starting graph
draw(current_ticker, current_subreddit)

// Helper function
function parseDate(timestamp) {
  return timestamp.toString().split(' ').slice(0, 5).join(' ')
}

// Draw function updates the graph
function draw(stock, sub) {
  console.log(stock);
  console.log(sub);

  // mysvg is the graph
  var mysvg = d3.select("#d3")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // Load in stock data from parsed folder
  d3.csv(`data/parsed/${stock}_${sub}.csv`,
    function (data) {
      var data_matrix = { timestamp: d3.timeParse("%s")(data.unix_time),
                          price_change: data.price_change,
                          sentiment_change: data.sentiment_change,
                          sentiment: data.sentiment_score,
                          price: data.closing_price};
      return data_matrix;
    },

    function (data) {

      // Create the X axis
      var x = d3.scaleTime()
        .domain(d3.extent(data, data => data.timestamp))
        .range([margin.left, width - margin.right])

      var xAxis = mysvg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .attr("class", "x-axis")
        .attr("clip-path", "url(#clip)")
        .call(d3.axisBottom(x)
          .tickSizeOuter(0.1));

      // Calculate minimum and maximum value for the graph
      var abs_min = d3.min([d3.min(data, data => +data.price_change), d3.min(data, data => +data.sentiment_change)])
      var abs_max = d3.max([d3.max(data, data => +data.price_change), d3.max(data, data => +data.sentiment_change)])


      // Create the Y axis
      var y = d3.scaleLinear()
        .domain([abs_min - padding, abs_max + padding])
        .range([height - margin.bottom, margin.top])

      var yAxis = mysvg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));


      // Create text for axes
      mysvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 39 - (margin.left))
        .attr("x", 9 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text("% Change");

      // Create lines for sentiment and price
      var line = d3.line()
        .defined(data => !isNaN(data.price_change))
        .y(data => y(data.price_change))
        .x(data => x(data.timestamp))

      var line2 = d3.line()
        .defined(data => !isNaN(data.sentiment_change))
        .y(data => y(data.sentiment_change))
        .x(data => x(data.timestamp))

      var bisect = d3.bisector(function (data) { return data.timestamp; }).left;

      // Create the circle
      var price_change_circle = mysvg
        .append('g')
        .append('circle')
        .style("fill", "#41B1A7")
        .attr("stroke", "#41B1A7")
        .attr('r', 5.0)
        .style("opacity", 0);

      // "Price Change" tooltip
      var price_change_text = mysvg
        .append('g')
        .append('text')
        .attr("alignment-baseline", "middle")
        .attr("text-anchor", "left")
        .style("opacity", 0)
        .attr("fill", "#41B1A7");

      var sentiment_change_circle = mysvg
        .style("fill", "#E2BF6B")
        .append('g')
        .append('circle')
        .style("opacity", 0)
        .attr('r', 5.0)
        .attr("stroke", "#E2BF6B");

      // "Sentiment Change" tooltip
      var sentiment_change_text = mysvg
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("fill", "#E2BF6B")
        .attr("alignment-baseline", "middle")
        .attr("text-anchor", "left");


      var date_text = mysvg
          .append('g')
          .append('text')
          .style("opacity", 0)
          .attr("alignment-baseline", "middle")
          .attr("text-anchor", "left")
          .attr("fill", "white");

      // Axes lines
      var borders = mysvg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width - margin.right)
        .attr("height", height)
        .attr("x", margin.left);


      // Sentiment price_change line on graph
      var sentiment_line = mysvg.append("path")
        .datum(data)
        .attr("class", "path")
        .attr("id", "line1")
        .attr("stroke", "#41B1A7")
        .attr("stroke-width", .85)
        .attr("d", line)
        .attr("fill", "none")
        .attr("clip-path", "url(#clip)");

      // Stock price_change line on graph
      var stock_line = mysvg.append("path")
        .datum(data)
        .attr("clip-path", "url(#clip)")
        .attr("stroke", "#E2BF6B")
        .attr("d", line2)
        .attr("class", "path")
        .attr("id", "line2")
        .attr("stroke-width", .85)
        .attr("fill", "none");

      // Rectangle covering graph to trigger mouse events
      mysvg.append('rect')
        .style("fill", "none")
        .attr('width', width)
        .attr('height', height)
        .style("pointer-events", "all")
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);

      //Zooming Functionality
      mysvg.call(CallZoom);

      function CallZoom(mysvg) {
        var left = [margin.left, margin.top];
        var right = [width - margin.right, height - margin.top];
        var extent = [left, right];

        var varzoom = d3.zoom()
          .scaleExtent([1, 5])
          .translateExtent(extent)
          .extent(extent)
          .on("zoom", ZoomScale);

        mysvg.call(varzoom);

        function ZoomScale() {
          x.range([margin.left, width - margin.right]
            .map(data => d3.event.transform.applyX(data)));

          mysvg.select(".x-axis")
          .call(d3.axisBottom(x)
            .tickSizeOuter(0.1));

          mysvg.select("#line2")
          .attr("d", line2);

          mysvg.select("#line1")
            .attr("d", line);
        }
      }

      // Handle mouse movement on the graph
      function mouseover() {
        price_change_circle.style("opacity", 1)
        price_change_text.style("opacity", 1)
        sentiment_change_circle.style("opacity", 1)
        sentiment_change_text.style("opacity", 1)
        date_text.style("opacity", 1)
      }

      // Move line cricle alongside mouse x position
      function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]);
        var i = bisect(data, x0, 1);
        selectedData = data[i];

        price_change_circle
          .attr("cx", x(selectedData.timestamp))
          .attr("cy", y(selectedData.price_change))
        price_change_text
          .html("Price Change: " + selectedData.price_change + "% ($" + selectedData.price + ")")
          .attr("x", width - 219)
          .attr("y", 0)
          .attr("font-size", "10px")
        
        sentiment_change_circle
          .attr("cx", x(selectedData.timestamp))
          .attr("cy", y(selectedData.sentiment_change))
        sentiment_change_text
          .html("Sentiment Change: " + selectedData.sentiment_change + "% (" + selectedData.sentiment + ")")
          .attr("x", width - 219)
          .attr("y", 20)
          .attr("font-size", "10px")

        date_text
          .html("Date: " + parseDate(selectedData.timestamp) + " CST")
          .attr("y", height+20)
          .attr("font-size", "14px")
          .attr("x",width-525)
      }

      function mouseout() {
        price_change_circle.style("opacity", 0)
        price_change_text.style("opacity", 0)
        sentiment_change_circle.style("opacity", 0)
        sentiment_change_text.style("opacity", 0)
        date_text.style("opacity", 0)
      }
    })
}
