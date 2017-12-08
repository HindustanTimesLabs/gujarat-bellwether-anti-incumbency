var w=window,
dw=document,
ew=dw.documentElement,
gw=dw.getElementsByTagName('body')[0]

var window_width = w.innerWidth||ew.clientWidth||gw.clientWidth

var width = (window_width<900)?window_width*0.95:900, height= 550, margin={top: 10, right: 25, bottom: 55, left: 45}
var desktop_width = 300, desktop_height= 280, pointRadius = 5

var projection = d3.geoMercator();

var path = d3.geoPath()
        .projection(projection)
        .pointRadius(2);

d3.queue()
.defer(d3.csv, "data/data.csv?v1")
.defer(d3.csv, "data/strongholds.csv?v1")
.defer(d3.json, "data/gujarat_geo_all.json")
.await(ready);

var start_year = 1976
var end_year = 2008

function ready(error, data,strongholds, geo){
    var select_data = _.filter(data,function(d){
        return d.Position == "Higher" || d.Position == 'No CG'
    })
    // initalize the tip
            var tip = d3.select("body").append("div")
                .attr("class", "tip");
            tip.append("div")
                .attr("class", "close-tip");
            tip.append("div")
                .attr("class", "title");

            tip.append("div")
                .attr("class", "type");

            tip.append("div")
                .attr("class", "higher");

        var party_colors = {
                    'BJP':'orange',
                    'INC':'steelblue',
                    'INC(I)':'steelblue',
                    "State":'#3a3a3a'
                }

        var party_name = {
                    'BJP':'BJP',
                    'INC':'Congress',
                    'INC(I)':'Congress (Indira)',
                    'IND':'Independent',
                    'JD':'Janata Dal',
                    'JNP':'Janata Party'
                }

        var svg = d3.selectAll('#scatter-plot')
            .append('svg')
            .attr('height',height)
            .attr('width',width)

        //scales
        const x = d3.scaleLinear()
            .rangeRound([0,(width-margin.left-margin.right)])
            .domain([0,100]);

        const y = d3.scaleLinear()
            .rangeRound([0,(height-margin.top-margin.bottom)])
            .domain([80,0]);

        //axes
        var xAxis = d3.axisBottom(x).ticks(5).tickSize(-height+(margin.top)+margin.bottom).ticks(2).tickFormat(function(d){
            return d+'%'
        }),
            yAxis = d3.axisLeft(y).ticks(5).tickSize(-width+(margin.left)+margin.right).tickFormat(function(d){
                if (d!=0){
                    return d+'%'
                }
            }); 

        var g = svg.append('g')
                    .attr('class','scatter')
                    .attr('transform','translate('+margin.left+','+margin.top+')')

        g.append("g")
            .attr("class", "y axis")
            .attr('id', "axis--y")
            .call(yAxis);

        g.append("g")
        .attr("class", "x axis")
        .attr('id', "axis--x")
        .attr('transform','translate(0,'+(height-margin.top-margin.bottom)+')')
        .call(xAxis);

        // labels
        g.append("g")
                .attr("class", "axis-label-detail")
                .append('text')
                .text('')
                .style('text-anchor','start')
                .attr("transform", "translate("+(10)+"," + 24 + ")")
                .tspans( function(d){return d3.wordwrap("← More urban", 12)})

        g.append("g")
                .attr("class", "axis-label-detail")
                .append('text')
                .text('')
                .style('text-anchor','end')
                .attr("transform", "translate("+(width-margin.left-margin.right-10)+"," + 24 + ")")
                .tspans( function(d){return d3.wordwrap("More rural →", 12)})

        g.append("g")
                .attr("class", "axis-label")
                .attr("transform", "translate(0," + (height-margin.bottom+30) + ")")
                .append('text')

                .text('Percentage of population living in rural areas →')

        g.append("g")
                .attr("class", "axis-label")
                .attr("transform", "translate(-30," + (0) + ") rotate(270)")
                .append('text')
                .style('text-anchor','end')
                .text('Vote Share Percentage →')

        var desktop_ann = ["BJP had a higher vote share in 50/56 seats (90%) where more than half the population lives in urban areas.","Rural constituencies have a tougher fight - Congress dominates in 44% of seats (55); BJP led in 56% of the seats (71)."]

        var mobile_ann = ["Urban Gujarat: BJP led in 50/56 seats (90%).","Rural Gujarat: BJP led in 71/126 seats (56%); Congress - 55/126 (44%)."]

        g.append("g")
                .attr("class", "annotation")
                .append('text')
                .text('')
                .style('text-anchor','middle')
                .attr("transform", "translate("+x(25)+"," + y(15) + ")")
                .tspans( function(d){return d3.wordwrap((window_width>600)?desktop_ann[0]:mobile_ann[0], (window_width>600)?22:18)})


         g.append("g")
                .attr("class", "annotation")
                .append('text')
                .text('')
                .style('text-anchor','middle')
                .attr("transform", "translate("+x(75)+"," + y(15) + ")")
                .tspans( function(d){return d3.wordwrap((window_width>600)?desktop_ann[1]:mobile_ann[1], (window_width>600)?22:18)})


        // scatter plot dots
        g.append("g").attr('class','circle-layer').selectAll(".dot")
                        .data(select_data)
                        .enter()
                        .append("circle")
                        .attr("class", function(d){
                            return 'dot ac-'+d.Constituency_No
                        })
                        .attr("r", function(d){
                            return pointRadius
                        })
                        .attr("cx", function (d) { 
                            return x(d.rural_per); 
                        })
                        .attr("cy", function (d) { 
                            return y(+d.Vote_Share_Percentage); 
                            
                        })
                        .attr("opacity", 0.7)
                        .style("fill", function(d){
                            if (d.Party=='BJP'){
                                return 'orange'
                            } else if (d.Party=='INC'){
                                return 'steelblue'
                            } 
                        })
                        
            function tipOff(){
                d3.selectAll(".dot").classed("selected", false);

                d3.select(".tip")
                    .style("opacity", 0)
                    .style("left", "-1000px")
                    .style("top", "-1000px");               
            }

            function tipOn(d){

                    var rect_class = ".dot.ac-" + d.Constituency_No;
                    tip.select(".title")
                        .html(toTitleCase(d.Constituency_Name))

                    tip.select(".type")
                        .html('<span>Percentage of population living in rural areas: </span>'+parseInt(d.rural_per)+'%')

                    tip.select(".higher")
                        .html((d.Position=='No CG')?'Congress did not contest from this seat.':'Higher vote share ('+parseInt(d.Vote_Share_Percentage)+'%) acquired by <span>'+d.Party+"</span>")

                    tip.select(".close-tip")
                        .html("<i class='fa fa-times' aria-hidden='true'></i>")
                        .on('click',tipOff());

                    // position
                    var media_pos = d3.select(rect_class).node().getBoundingClientRect();
                    var tip_pos = d3.select(".tip").node().getBoundingClientRect();
                    var tip_offset = 5;
                    var window_offset = window.pageYOffset;
                    var window_padding = 40;

                    var left = (media_pos.left - tip_pos.width / 2);
                    left = left < 0 ? media_pos.left :
                        left + tip_pos.width > window_width ? media_pos.left - tip_pos.width :
                        left;

                    var top = window_offset + media_pos.top - tip_pos.height - tip_offset;
                    top = top < window_offset + window_padding ? window_offset + media_pos.top + media_pos.height + tip_offset :
                        top;
                    
                    d3.select(".tip")
                        .style("opacity", .98)
                        .style("left", left + "px")
                        .style("top", top + "px");
                } // tipOn ends

            const voronoiDiagram = d3.voronoi()
                                      .x(d => x(d.rural_per) )
                                      .y(d => y(d.Vote_Share_Percentage))
                                      .size([width, height])(select_data);

            const voronoiRadius = width / 10;

            g.append('circle')
              .attr('class', 'highlight-circle')
              .attr('r', pointRadius + 2) // slightly larger than our points
              .style('fill', 'none')
              .style('display', 'none');


            // callback to highlight a point
            function highlight(d) {
              // no point to highlight - hide the circle
              if (!d) {
                d3.select('.highlight-circle').style('display', 'none');
                tipOff()
              // otherwise, show the highlight circle at the correct position
              } else {
                d3.select('.highlight-circle')
                  .style('display', '')
                  .style('stroke', 'black')
                  .attr('cx', x(+d.rural_per))
                  .attr('cy', y(+d.Vote_Share_Percentage));

                tipOn(d)
              }
                
            }
            // callback for when the mouse moves across the overlay
                function mouseMoveHandler() {
                  // get the current mouse position
                  const [mx, my] = d3.mouse(this);

                  // use the new diagram.find() function to find the Voronoi site
                  // closest to the mouse, limited by max distance voronoiRadius
                  const site = voronoiDiagram.find(mx, my, voronoiRadius);

                  // highlight the point if we found one
                  highlight(site && site.data);
                  
                }
            // add the overlay on top of everything to take the mouse events
            g.append('rect')
                  .attr('class', 'overlay')
                  .attr('width', width)
                  .attr('height', height)
                  .style('fill', '#f00')
                  .style('opacity', 0)
                  .on('mousemove', mouseMoveHandler)
                  .on('mouseleave', () => {
                    // hide the highlight circle when the mouse leaves the chart
                    highlight(null);
                  });

            ////////////////////////////////////
            /////////// MAP BEGINS /////////////
            ////////////////////////////////////
            var map_width = (window_width<700)?window_width*0.9:300
            var map_height = map_width*0.7
            map_margin={left:25, right:25, top: 5, bottom: 5}
            var effective_width = map_width-map_margin.left-map_margin.right
            var effective_height = map_height-map_margin.top-map_margin.bottom


            var boundary = centerZoom(geo,'gujarat_2008');

            var g_map = d3.select('#strongholds').append('svg')
            .attr('height',map_height)
            .attr('width',map_width)
            .append('g')

            drawOuterBoundary(boundary);
             drawSubUnits()
             // This function "centers" and "zooms" a map by setting its projection's scale and translate according to its outer boundary
            // It also returns the boundary itself in case you want to draw it to the map
              function centerZoom(data, selected){
                var o = topojson.mesh(data, data.objects[selected], function(a, b) { return a === b; });

                projection
                    .scale(1)
                    .translate([0, 0]);

                var b = path.bounds(o),
                    s = 1 / Math.max((b[1][0] - b[0][0]) / effective_width, (b[1][1] - b[0][1]) / effective_height),
                    t = [(effective_width - s * (b[1][0] + b[0][0])) / 2, (effective_height - s * (b[1][1] + b[0][1])) / 2];

                projection
                    .scale(s)
                    .translate(t);

                return o;
              }

              function drawOuterBoundary(boundary){
                g_map.append("path")
                    .datum(boundary)
                    .attr("d", path)
                    .attr("class", "subunit-boundary");
              }

              function drawSubUnits(){
            
            g_map
                .append('g')
                .selectAll(".subunit")
                .data(topojson.feature(geo, geo.objects['gujarat_2008']).features)
                .enter().append("path")
                .attr("class", function(d){ return "subunit g-ac-"+ d.properties.ac_no})
                .attr("d", path)
                .attr('fill', function(d){
                    if (d.properties.ac_no!=0){
                        var obj = _.filter(strongholds, function(e){
                            return (+e['ac_no_2012'] == +d.properties.ac_no)
                        })
                        if (obj.length>0){
                            return party_colors[obj[0].party]
                        } else {
                            return 'none'
                        }
                    } else {
                        return 'none'
                    }
                })
                .on('mouseover',function(d){
                    var obj = _.filter(strongholds, function(e){
                            return (+e['ac_no_2012'] == +d.properties.ac_no)
                        })
                    if (d.properties.ac_no!=0 && obj.length>0){
                        mapTipOn(d.properties.ac_no,obj[0])
                    }
                })
                .on('mouseout',function(d){
                    mapTipOff(d.properties.ac_no)
                })

        } // end drawSubunits();
            function mapTipOff(ac){
                d3.selectAll( ".subunit.g-ac-" + ac).classed("selected", false)
                 d3.select(".tip")
                    .style("opacity", 0)
                    .style("left", "-1000px")
                    .style("top", "-1000px");   
            }
             function mapTipOn(ac,d){

                    var rect_class = ".subunit.g-ac-" + ac;

                        d3.selectAll( ".subunit.g-ac-" + ac).classed("selected", true).moveToFront();
                    tip.select(".title, .higher").html('')
                    tip.select(".type")
                        .html(function(){
                            return "<span>"+party_name[d.party] +'</span> has retained the <span>'+toTitleCase(d.ac_name_2012)+'</span> seat since 1995.'
                    });

                    tip.select(".close-tip")
                        .html("<i class='fa fa-times' aria-hidden='true'></i>");

                    // position

                    var media_pos = d3.select(rect_class).node().getBoundingClientRect();
                    var tip_pos = d3.select(".tip").node().getBoundingClientRect();
                    var tip_offset = 5;
                    var window_offset = window.pageYOffset;
                    var window_padding = 40;

                    var left = (media_pos.left - tip_pos.width / 2);
                    left = left < 0 ? media_pos.left :
                        left + tip_pos.width > window_width ? media_pos.left - tip_pos.width :
                        left;

                    var top = window_offset + media_pos.top - tip_pos.height - tip_offset;
                    top = top < window_offset + window_padding ? window_offset + media_pos.top + media_pos.height + tip_offset :
                        top;
                    
                    d3.select(".tip")
                        .style("opacity", .98)
                        .style("left", left + "px")
                        .style("top", top + "px");
                }
        } // ready ends

        function toTitleCase(str){
            return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        }

        function slugify(text){
          return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
        }

        function roundNum(num, decimals) {
            return parseFloat(Math.round(num * 100) / 100).toFixed(decimals);
        }

        // d3 webpack functions

      d3.selection.prototype.tspans = function(lines, lh) {

          return this.selectAll('tspan')
              .data(lines)
              .enter()
              .append('tspan')
              .text(function(d) { return d; })
              .attr('x', 0)
              .attr('dy', function(d,i) { return i ? lh || 15 : 0; });
      };

      d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
        };
        d3.selection.prototype.moveToBack = function() {  
            return this.each(function() { 
                var firstChild = this.parentNode.firstChild; 
                if (firstChild) { 
                    this.parentNode.insertBefore(this, firstChild); 
                } 
            });
        };

      d3.wordwrap = function(line, maxCharactersPerLine, gap) {

          var w = line.split(' '),
              lines = [],
              words = [],
              maxChars = maxCharactersPerLine || 40,
              l = 0;
          w.forEach(function(d) {
              if (l+d.length > maxChars) {
                  lines.push(words.join(' '));
                  words.length = 0;
                  l = 0;
              }
              l += d.length;
              words.push(d);
          });
          if (words.length) {
              lines.push(words.join(' '));
          }
          return ((gap)? (lines,gap): lines)
      };
