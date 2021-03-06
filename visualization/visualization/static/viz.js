'use strict';
console.log('vis.js running')
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var dat = JSON.parse(this.responseText);
        if (universityId=="all") { // page for all universities
          keywords_cloud(dat.keywords) // keywords cloud  
          barchart(dat.tech_views, " #9fa9a3", "Count of Views", "600", "1200") // count of views 
          barchart(dat.tech_emails, "#8d9db6", "Count of Emails Sent", "600", "1200")  //count of email sent             

        }

        if (universityId!="all") { // page for university specified by university id
          barchart(dat.tech_views, "#667292", "Count of Views", "500", "750") // count of views
          emailSentVsClick(dat.emails) // count of clicks vs emails sent
          userKeywords_SVG(dat.user_keywords) // top user keywords viewing technologies
          techKeywords_SVG(dat.tech_keywords) // top keywords crossing all technologies published by the university
          matchUsers(dat.matches) // most relevant universities
          viewedusers(dat.viewed_users) // users who viewed the technologies
        }

    }
};

var universityId = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
console.log(window.location.origin)
xmlhttp.open("GET", window.location.origin + "/university/data/" + universityId, true);
console.log( window.location.origin + "/university/data/" + universityId)
xmlhttp.setRequestHeader("Access-Control-Allow-Origin","*");
xmlhttp.send();


function barchart(techData, col, title, height, width) { // generate bar chart 


	console.log(techData)

  // append a div for tooltip
  var tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")

  // svg canvus
  var svgContainer = d3.select("body")
            .append("svg")
            .attr("height", height)
            .attr("width", width)
            .attr("class", "svgContainer")

  var margin = {top: 30, right: 20, bottom: 30, left: 40},
      width = svgContainer.attr("width") - margin.left - margin.right,
      height = svgContainer.attr("height") - 3*margin.top - margin.bottom;

  var g = svgContainer.append("g")
                      .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); //add a g element that provides a reference point for adding axes
  
  g.append("text")
    .attr("class", "title")
    .attr("x", width/2)
    .attr("y", 0 - (margin.top / 2))
    .attr("dy", "0.5em")
    .text(title);
	
  var g = svgContainer.append("g")
                      .attr("transform", "translate(" + margin.left + "," + 2*margin.top + ")"); //add a g element that provides a reference point for adding axes
	// ordinal scale function 
  var xScale = d3.scaleBand()
  				.rangeRound([0, width])
  				.padding(.5)
  				.domain(techData.map(function(d) { return d.TechID; })); 

  // linear scale function
  var yScale = d3.scaleLinear()
  				.rangeRound([height, 0])
  				.domain([0, d3.max(techData, function(d) { return d.Count; })]);


	//append x axis
	g.append("g").attr("class", "axis--x")
		            .attr("transform", "translate(0," + height + ")")
		            .call(d3.axisBottom(xScale))

  //append x label
  svgContainer.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + (height + 3*margin.top+20) + ")")
      .style("text-anchor", "middle")
      .text("Technology");

  //append y axis
  g.append("g").attr("class", "axis axis--y")
    			     .call(d3.axisLeft(yScale).ticks(10))
               .append("text")
               .attr("transform", "rotate(-90)")
               .attr("y", 6)
               .attr("dy", ".71em")
               .attr("text-anchor", "end")
               .attr("fill", "#000")
               .text("Counts")

// append bars
    var bars = g.selectAll("bar")
      					.data(techData)
    						.enter()
    						.append("rect")

// bars attribute    
    var barAttr = bars.attr("class", "bar")
              .attr("fill", col)
    					.attr("x", function(d) {return xScale(d.TechID); })
    					.attr("width", xScale.bandwidth())
    					.attr("y", function(d) {return yScale(d.Count); })
    					.attr("height", function(d){return height - yScale(d.Count); })
              .on("mouseover", function(d) {
                tooltip.text(d.TechID + ": " + d.Count);
                tooltip.style("visibility", "visible");
              })
            .on("mousemove", function() {
              return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
            })
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");
            });
}


function userKeywords_SVG(userKeywords) { // generate circle packing based on the keywords of users viewing the technologies published by the university
	//console.log(userKeywords)

  // svg canvus
  var svgContainer = d3.select("body")
                        .append("svg")
                        .attr("height", "800")
                        .attr("width", "750")
                        .attr("class", "svgContainer")

  var margin = {top: 30, right: 20, bottom: 20, left: 20},
      width = svgContainer.attr("width") - margin.left - margin.right,
      height = svgContainer.attr("height") - margin.top - margin.bottom;

  var diameter = svgContainer.attr("width")-2*margin.top;

  svgContainer.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")") 
            .append("text")
            .attr("class", "title")
            .attr("x", width/2)
            .attr("y", 0 - (margin.top / 2))
            .attr("dy", "0.5em")
            .text("Top User Keywords")

  var g = svgContainer.append("g")
                    .attr("transform", "translate(" + margin.left + "," + 2*margin.top + ")"); 


  var format = d3.format(",d")

  var pack = d3.pack()
        .size([diameter -margin.top, diameter-margin.left])
        .padding(10)


  var root = d3.hierarchy(userKeywords).sum(function(d) { return d.size; })
  
  var node = g.selectAll(".node")
                .data(pack(root).descendants())
                .enter()
                .append("g")
                .attr("class", "node") 
                .attr("class", function(d) { return d.children ? "node" : "leaf node"; })
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


  node.append("title")
      .text(function(d) { return d.data.name + "\n" + format(d.value); });

  node.append("circle")
      .attr("r", function(d) { return d.r; });

  node.filter(function(d) { return !d.children; }).append("text")
      .attr("dy", "0.3em")
      .attr("dx", "-0.7em")
      .text(function(d) {return d.data.name})

}


function techKeywords_SVG(techKeywords){ // generate bubble chart based on the keywords crossing all technologies published by the university
//	console.log(techKeywords.slice(0,10))
   var svgContainer = d3.select("body")
                      .append("svg")
                      .attr("height", "800")
                      .attr("width", "750")
                      .attr("class", "svgContainer");

  var margin = {top: 30, right: 20, bottom: 20, left: 20},
      width = svgContainer.attr("width") - margin.left - margin.right,
      height = svgContainer.attr("height") - margin.top - margin.bottom;

  
  // append a title to the chart
  svgContainer.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")") 
            .append("text")
            .attr("class", "title")
            .attr("x", width/2)
            .attr("y", 0 - (margin.top / 2))
            .attr("dy", "0.5em")
            .text("Top Technology Keywords")

  // /add a g element that provides a reference point for adding axes
  var g = svgContainer.append("g")
                  .attr("transform", "translate(" + margin.left + "," + 2*margin.top + ")"); 



  var diameter = svgContainer.attr("width")-2*margin.top;

  // find the max count of keywords
  var max_count = d3.max(techKeywords, function(d){
        return d.Count;
    });
  
  // define the color range of bubbles
  var color = d3.scaleLinear()
                .domain([1, max_count])
                .range(["#f1e3dd","#87bdd8"]);


  var bubble = d3.pack(techKeywords)
                  .size([diameter, diameter])
                  .padding(1.5);

  var nodes = d3.hierarchy({children:techKeywords.slice(0,10)})
                .sum(function(d) { return d.Count; });

  var node = svgContainer.selectAll(".node")
          .data(bubble(nodes).descendants())
          .enter()
          .filter(function(d){
              return  !d.children
          })
          .append("g")
          .attr("class", "node")
          .attr("transform", function(d) {
              return "translate(" + d.x + "," + d.y + ")";
          });


  var tooltip = d3.select("body")
                  .append("div")
                  .attr("class", "tooltip")


    node.append("circle")
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d) {
                return color(d.value);
            })
            .on("mouseover", function(d) {
              tooltip.text(d.data.keyword + ": " + d.value);
              tooltip.style("visibility", "visible");
            })
            .on("mousemove", function() {
              return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
            })
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");
            });


    node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.keyword + ": " + d.data.Count;
            });

    d3.select(self.frameElement)
            .style("height", diameter + "px");



}

function emailSentVsClick(emailData){ // generate a group bar chart showing counts of email sent vs email clicks on each technology
 
  //console.log(emailData)

  var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")       
      // .style("opacity", 0);

  var svgContainer = d3.select("body")
            .append("svg")
            .attr("height", "500")
            .attr("width", "750")
            .attr("class", "svgContainer")


  var margin = {top: 30, right: 20, bottom: 30, left: 40},
      width = svgContainer.attr("width") - margin.left - margin.right,
      height = svgContainer.attr("height") - 3*margin.top - margin.bottom;

 // add a title to the chart
  svgContainer.append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")") 
              .append("text")
              .attr("class", "title")
              .attr("x", width/2)
              .attr("y", 0 - (margin.top / 2))
              .attr("dy", "0.5em")
              .text("Emails Sent Vs Clicked")

  var g = svgContainer.append("g")
                      .attr("transform", "translate(" + margin.left + "," + 2* margin.top + ")"); //add a g element that provides a reference point for adding axes



  var x0 = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.3)
    .domain(emailData.map(function(d) {return d.Technology}));

  var keys = d3.keys(emailData[0]).filter(function(key) { return key !== "Technology"; });

 emailData.forEach(function(d) {
    d.values = keys.map(function(name) { return {label: name, value: +d[name]}; });
    console.log(d.values)
});
  
  var x1 = d3.scaleBand()
    .padding(0.15)
    .rangeRound([0, x0.bandwidth()])
    .domain(keys);  
  
  
  var y = d3.scaleLinear().rangeRound([height, 0])
            .domain([0, d3.max(emailData, function(d) { return d3.max(d.values, function(d) { return d.value; }); })])

  var z = d3.scaleOrdinal().range(["#a05d56" , "#8a89a6"])

// append x axis

g.append("g")
      .attr("class", "axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x0));

svgContainer.append("text")             
      .attr("transform", "translate(" + (width/2) + " ," + (height + 3*margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Technology");

// append y axis
g.append("g").attr("class", ".axis")
             .call(d3.axisLeft(y).ticks(10))
             .append("text")
             .attr("transform", "rotate(-90)")
             .attr("y", 6)
             .attr("dy", ".71em")
             .attr("text-anchor", "end")
             .attr("fill", "#000")
             .text("Counts")

var bar = g.append("g")
    .selectAll(".bar")
    .data(emailData)
    .enter().append("g")
    .attr("class", ".bar")
    .attr("transform", function(d) { return "translate(" + x0(d.Technology) + ",0)"; });

bar.selectAll("rect")
  .data(function(d){return d.values;})
  .enter()
  .append("rect")
  .attr("class", "gbar")
  .attr("width", x1.bandwidth())
  .attr("x", function(d){return x1(d.label);})
  .attr("y", function(d){return y(d.value);})
  .attr("fill", function(d){return z(d.label);})
  .attr("height", function(d){return height-y(d.value);})
                .on("mouseover", function(d) {
                tooltip.text(d.label + ": " + d.value);
                tooltip.style("visibility", "visible");
              })
            .on("mousemove", function() {
              return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
            })
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");
            });

var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys)
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });
}



function matchUsers(matchUsers){ // add an html table showing the top 5 most relevant users to each technology
  //console.log(matchUsers)
  


  var div = d3.select("body")
              .append("div")
              .attr("class", "table")


  var table =  div.append("table"),
      caption = table.append("caption").text("Most Relevant Companies"),
      thead = table.append("thead"),
      tbody = table.append("tbody")

  thead.selectAll("th")
      .data(matchUsers.map(function(d){return d.Technology})) // technology list
      .enter()
      .append("th")
      .text(function(d){return d})

  var td = tbody.selectAll("td")
              .data(matchUsers)
              .enter()
              .append("td")

  td.selectAll("tr")
      .data(function(d){return d.Matches})
      .enter()
      .append("tr")
      .style("line-height", "30px")
      .text(function(d){return d})
}


function viewedusers(viewedUsers){ // generate an html table showing the users that viewed each technology
    //console.log(viewedUsers)


    var div = d3.select("body")
            .append("div")
            .attr("class", "table")

    var columns = ["Technology", "Company"]



    var table =  div.append("table"),
        caption = table.append("caption").text("Who Viewed Technology"),
        thead = table.append("thead"),
        tbody = table.append("tbody")



    // // append the header row
    thead.append("tr")
          .selectAll("th")
          .data(columns)
          .enter()
          .append("th")
          .text(function(column){ return column;})
                  

    var nested = d3.nest()
                  .key(function(d){ return d.Technology;})
                  .entries(viewedUsers)
    console.log(nested)

    nested.forEach(function (d) {
    var rowspan = d.values.length;
    d.values.forEach(function (val, index) {
        var tr = thead.append("tr");
        if (index == 0) { //rowspan only for first element
            tr.append("td")
                .attr("rowspan", rowspan)
                .text(val.Technology);
        }
        tr.append("td")
            .text(val.Company);


    });
});
          

}

function keywords_cloud(keywords){
  // console.log(keywords)


  var fill = d3.scaleOrdinal(d3.schemeCategory20);

  var svgContainer = d3.select("body").append("svg")
              .attr("width",1200)
              .attr("height", 500)
              .attr("class", "svgContainer")

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = svgContainer.attr("width") - margin.left - margin.right,
      height = svgContainer.attr("height") - margin.top - margin.bottom;

  var g = svgContainer.append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  g.append("text")
      .attr("class", "title")
      .attr("x", width/2)
      .attr("y", 0 - (margin.top / 2))
      .attr("dy", "0.5em")
      .text("Keywords Cloud");

  d3.layout.cloud().size([900, 500])
          .words(keywords)
          .padding(5)
          .rotate(0)
          .fontSize(function(d) { return d.size; })
          .on("end", draw)
          .start();

  function draw(words) {

          svgContainer.append("g")
            .attr("transform", "translate(500, 250)")
          .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("fill", function(d, i) { return fill(i); })
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
}
}