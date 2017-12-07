var w=window,
dw=document,
ew=dw.documentElement,
gw=dw.getElementsByTagName('body')[0]

var window_width = w.innerWidth||ew.clientWidth||gw.clientWidth

var width = (window_width<900)?window_width*0.95:900, height= 550, margin={top: 10, right: 25, bottom: 55, left: 45}
var desktop_width = 300, desktop_height= 280

var projection = d3.geoMercator();

var path = d3.geoPath()
        .projection(projection)
        .pointRadius(2);

d3.queue()
.defer(d3.csv, "data/all_data.csv")
.defer(d3.csv, "data/census.csv")

.defer(d3.json, "data/gujarat_geo_all.json")
.await(ready);

var start_year = 1976
var end_year = 2008

function ready(error, data, geo){
        select_data = _.chain(data).filter(function(d){
                return (+d.Year == 2012) && d.Position=="1"
            }).sortBy('Party').sortBy('Year').value()

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
        var xAxis = d3.axisBottom(x).ticks(5).tickSize(-height+(margin.top)+margin.bottom).ticks(2),
            yAxis = d3.axisLeft(y).ticks(5).tickSize(-width+(margin.left)+margin.right).tickFormat(function(d){
                if (d!=0){
                    return d
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

        // scatter plot dots
        g.selectAll(".dot")
                        .data(select_data)
                        .enter()
                        .append("circle")
                        .attr("class", function(d){
                            var census_obj = _.filter(census,function(e){
                                return +e.AC_NO == +d.Constituency_No
                            })

                            if (d.Party=='INC'){
                                if ((100-census_obj[0].Urban_per)<50){
                                    return 'dot congress less-50'
                                } else {
                                    return 'dot congress more-50'
                                }
                                
                            } else if(d.Party=='BJP'){
                                if ((100-census_obj[0].Urban_per)<50){
                                    return 'dot bjp less-50'
                                } else {
                                    return 'dot bjp more-50'
                                }
                            } else {
                                var cong = _.findWhere(data,{
                                    'Party':'INC',
                                    'Position':'1',
                                    'Year':'2012'
                                })
                                var bjp = _.findWhere(data,{
                                    'Party':'BJP',
                                    'Position':'1',
                                    'Year':'2012'
                                })
                                if (bjp.Vote_Share_Percentage>cong.Vote_Share_Percentage){
                                    if ((100-census_obj[0].Urban_per)<50){
                                    return 'dot bjp less-50'
                                    } else {
                                        return 'dot bjp more-50'
                                    }
                                } else {
                                    if ((100-census_obj[0].Urban_per)<50){
                                        return 'dot congress less-50'
                                    } else {
                                        return 'dot congress more-50'
                                    }
                                }
                            }
                        })
                        .attr("r", function(d){
                            return '5'
                        })
                        .attr("cx", function (d) { 
                            var census_obj = _.filter(census,function(e){
                                return +e.AC_NO == +d.Constituency_No
                            })
                            return x(100-+census_obj[0].Urban_per); 
                        })
                        .attr("cy", function (d) { 
                            if (d.Party=='INC' || d.Party=='BJP'){
                                return y(+d.Vote_Share_Percentage); 
                            } else {
                                var cong = _.findWhere(data,{
                                    'Party':'INC',
                                    'Position':'1',
                                    'Year':'2012'
                                })
                                var bjp = _.findWhere(data,{
                                    'Party':'BJP',
                                    'Position':'1',
                                    'Year':'2012'
                                })
                                if (bjp.Vote_Share_Percentage>cong.Vote_Share_Percentage){
                                    return x(bjp.Vote_Share_Percentage)
                                } else {
                                    return x(cong.Vote_Share_Percentage)
                                }
                            }
                            
                        })
                        .attr("opacity", 0.7)
                        .style("fill", function(d){
                            if (d.Party=='BJP'){
                                return 'orange'
                            } else if (d.Party=='INC'){
                                return 'steelblue'
                            } else {
                                var cong = _.findWhere(data,{
                                    'Party':'INC',
                                    'Position':'1',
                                    'Year':'2012'
                                })
                                var bjp = _.findWhere(data,{
                                    'Party':'BJP',
                                    'Position':'1',
                                    'Year':'2012'
                                })
                                if (bjp.Vote_Share_Percentage>cong.Vote_Share_Percentage){
                                    return 'orange'
                                } else {
                                    return 'steelblue'
                                }
                            }
                        });

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
              .attr('dy', function(d,i) { return i ? lh || 10 : 0; });
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
