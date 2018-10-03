window.onload = (function() {
    
    var p = {};
        p.title = 'Seattle Vipassana Hall: Financials';
        p.spreadsheetRange = 'A5:E';
        p.outerWidth = 1200;
        p.outerHeight = 700;
        p.margin = {top: 150, right: 110, bottom: 180, left: 110};
        p.width = p.outerWidth - p.margin.left - p.margin.right;
        p.height = p.outerHeight - p.margin.top - p.margin.bottom;
        p.bordercolor = 'lightgray';
        p.borderWidth = 0; // disabled
        p.xAxis = {
            rotation: -35,
            dx: -8,
            dy: 15,
            tickSize: 12
        };
        p.yAxis = {
            numberOfTicks: 4, // approximate
            dx: -10
        };
        p.dana = {
            color: 'steelblue',
            opacity: 1
        };
        p.expense = {
            color: 'firebrick',
            opacity: 1
        };
        p.balance = {
            color: 'orange',
            opacity: .2,
            strokeWidth: 3
        };
        p.targetMinimumBalance = {
            color: 'green',
            strokeWidth: 2,
            text: ['Target', 'Minimum', 'Balance'],
            yOffset: -16,
            lineHeight: 16,
            fontSize: 16
        };
        p.legend = {
            x: p.width / 2 - 160,
            y: p.height + p.margin.bottom * .7,
            textAnchor: 'start',
            boxhgt: 17,
            text: ['Dana', 'Expense', 'Balance'],
            fill: [p.dana.color, p.expense.color, p.balance.color],
            opacity: [p.dana.opacity, p.expense.opacity, p.balance.opacity],
            dx: [0, 110, 240]
        };
    
    var allData,
        changeDataButton = document.getElementById("changeDataButton"),
        changeDataBox = document.getElementById("changeDataBox"),
        changeDataBoxCancel = document.getElementById("changeDataBoxCancel"),
        changeDataBoxOK = document.getElementById("changeDataBoxOK"),
        svg = d3.select('#svhChart');
    
    d3.json('https://sheets.googleapis.com/v4/spreadsheets/1dKG0ubVUXrUg0lLhVVu8HqKO18t992PHoQktrhOCeCk/values/Monthly%20Summaries!' + p.spreadsheetRange + '?key=AIzaSyCUoCo3HpGO2RbBnoooc7ycl__UtdAdX48', 
        function(error, json) {
            if (error) return console.warn(error);
            allData = prepData(json.values);
            var data = filterData(allData.slice(0));
            createChart(data);
            setupInterface();
        }
    );
    
    function setupInterface() {
        var endDate = document.getElementById("endDate");
        var monthCount = document.getElementById("monthCount");
        for (var n = 0; n < allData.length; n++) {
            var option = document.createElement("option");
            option.text = allData[n].month;
            endDate.add(option);
        }
        var timeout;
        window.onmousemove = function() {
            changeDataButton.style.opacity = '1';
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                if (changeDataBox.style.opacity !== '1') {
                    changeDataButton.style.opacity = '0';
                }
            }, 2000);
        };
        changeDataButton.onclick = function() {
            changeDataBox.style.opacity = '1';
        };
        changeDataBoxCancel.onclick = function() {
            changeDataBox.style.opacity = '0';
            changeDataButton.style.opacity = '0';
        };
        changeDataBoxOK.onclick = function() {
            changeDataBox.style.opacity = '0';
            changeDataButton.style.opacity = '0';
            svg.selectAll("*").remove();
            var data = filterData(allData.slice(0), endDate.value, monthCount.value);
            createChart(data);
        };
    } // end setupInterface
    
    function prepData(d) {
        var preppedData = [];
        for (var n=0; n < d.length; n++) {
            preppedData[n] = {
                month: d[n][0],
                dana: Number(d[n][1].replace(/[^0-9.-]+/g,"")),
                expense: Number(d[n][2].replace(/[^0-9.-]+/g,"")),
                balance: Number(d[n][3].replace(/[^0-9.-]+/g,"")),
                targetMinBal: Number(d[n][4].replace(/[^0-9.-]+/g,""))
            };
        }
        return preppedData;
    }; // end prepData
    
    function filterData(d, endDate, monthCount = 16) {
        if (typeof(endDate) === 'undefined') { 
            var currentDate = Date.now();
            for (var n = d.length - 1; n > 0; n--) {
                var rowDate = Date.parse(d[n].month);
                if (rowDate > currentDate) {
                    d.splice(n, 1);
                }
            }
        } else {
            endDate = Date.parse(endDate);
            for (var n = d.length - 1; n > 0; n--) {
                var rowDate = Date.parse(d[n].month);
                if (rowDate > endDate) {
                    d.splice(n, 1);
                }
            }
        }
        if (d.length > monthCount) {
            d.splice(0, d.length - monthCount);
        }
        return d;
    }; // end filterData
    
    function createChart(d) {
        svg.append('text')
            .attr('class', 'title')
            .text(p.title)
            .attr('x', (p.outerWidth / 2))             
            .attr('y', p.margin.top / 2)
            .attr('text-anchor', 'middle')
        ;
        svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", p.outerHeight)
            .attr("width", p.outerWidth)
            .style("stroke", p.bordercolor)
            .style("fill", "none")
            .style("stroke-width", p.borderWidth);
        var chart = svg.append('g')
            .attr('class', 'container')
            .attr('transform', 'translate(' + p.margin.left + ',' + p.margin.top + ')')
        ;    
        
        //-----  Scale, Range, Domain -----//
        var x = d3.scaleBand()
            .rangeRound([0, p.width])
            .padding(0.0004 * p.width)
        ;
        var y = d3.scaleLinear()
            .range([p.height, 0])
        ;
        x.domain(d.map(function(d) { return d.month; } ));
        y.domain([0, d3.max(d.map(function(d) { return d.balance; } ))]);
        
        //-----  X Axis  -----//
        chart.append('g')
            .attr('class', 'xaxis')
            .attr('transform', 'translate(0,' + p.height + ')')
            .call(d3.axisBottom(x)
                .tickSizeInner(p.xAxis.tickSize)
                .tickSizeOuter(0))
        ;
        chart.selectAll('.xaxis .tick text')
            .attr('transform', 'rotate(' + p.xAxis.rotation + ')')
            .attr('dx', p.xAxis.dx)
            .attr('dy', p.xAxis.dy)
        ;
        
        //-----  Y Axis  -----//
        chart.append('g')
            .attr('class', 'yaxis')
            .call(d3.axisLeft(y)
                .tickSizeOuter(0)
                .tickSizeInner(p.width * -1)
                .tickArguments([p.yAxis.numberOfTicks, d3.format('$,f')]))
        ;
        chart.selectAll('.yaxis .tick text')
            .attr('dx', p.yAxis.dx)
        ;
        chart.selectAll('.tick')
            .each(function (n) { if (n === 0) this.remove(); })
        ;
    
        //-----  Balance  -----//
        var balanceLine = d3.line()
            .x(function(d) { return x(d.month); })
            .y(function(d) { return y(d.balance); })
        ;
        chart.append('path')
            .attr('class', 'balance')
            .attr('stroke', p.balance.color)
            .attr('stroke-width', p.balance.strokeWidth)
            .data([d])
            .attr('transform', 'translate(' + x.bandwidth() / 2 + ', 0)')
            .attr('d', balanceLine)
        ;	
        var balanceArea = d3.area()
            .x(function(d) { return x(d.month); })
            .y0(p.height)
            .y1(function(d) { return y(d.balance); })
        ;
        chart.append('path')
            .attr('class', 'balanceFill')
            .attr('opacity', p.balance.opacity)
            .attr('fill', p.balance.color)
            .data([d])
            .attr('d', balanceArea)
            .attr('transform', 'translate(' + x.bandwidth() / 2 + ', 0)')
        ;
        
        //-----  Target Minimum Balance  -----//
        var minimumLine = d3.line()
            .x(function(d) { return x(d.month); })
            .y(function(d) { return y(d.targetMinBal); })
        ;
        minimumLine = minimumLine(d);
        var minimumLineEnd = minimumLine.substring(minimumLine.lastIndexOf(',') + 1);
        minimumLine = minimumLine + ',' + (p.width - (x.bandwidth() / 2)) + ' ' + minimumLineEnd;
        chart.append('path')
            .attr('class', 'minimum')
            .attr('id', 'minimum')
            .attr('d', minimumLine)
            .attr('transform', 'translate(' + x.bandwidth() / 2 + ',0)')
            .attr('stroke', p.targetMinimumBalance.color)
            .attr('stroke-width', p.targetMinimumBalance.strokeWidth)
        ;
        var TarMinBalBox = chart.append('text')
            .attr('class', 'minimumText')
            .attr('x', function() { return p.width; })
            .attr('y', (Number(minimumLineEnd) + 5))
        ;
        for(var n = 0; n < p.targetMinimumBalance.text.length; n++) {
            TarMinBalBox.append('tspan')
                .text(p.targetMinimumBalance.text[n])
                .attr('text-anchor', 'start')
                .attr('font-size', p.targetMinimumBalance.fontSize)
                .attr('dy', function() { 
                    return !n ? p.targetMinimumBalance.yOffset : p.targetMinimumBalance.lineHeight; })
                .attr('x', function() { return p.width; })
                .attr('dx', 8)
                .attr('fill', p.targetMinimumBalance.color)
            ;
        }
        
        //-----  Dana & Expense  -----//
        var bars = chart.selectAll('g.container')
            .data(d)
            .enter().append('g')
                .attr('transform', function(d) { return 'translate(' + x(d.month) + ',0)'; })
        ;
        bars.append('rect')
            .attr('class', 'dana')
            .attr('fill', p.dana.color)
            .attr('y', function(d) { return y(d.dana); })
            .attr('height', function(d) { return p.height - y(d.dana); })
            .attr('width', x.bandwidth() / 2)
        ;
        bars.append('rect')
            .attr('class', 'expense')
            .attr('fill', p.expense.color)
            .attr('y', function(d) { return y(d.expense); })
            .attr('height', function(d) { return p.height - y(d.expense); })
            .attr('width', x.bandwidth() / 2)
            .attr('x', x.bandwidth() / 2)
        ;
    
        //-----  Legend  -----//
        var legend = chart.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(' + p.legend.x + ', ' + p.legend.y + ')')
        ;
        for (var n = 0; n < p.legend.text.length; n++) {
            var legendGroup = legend.append('g')
                .attr('id', 'lgnd-' + p.legend.text[n])
                .attr('transform', 'translate(' + p.legend.dx[n] + ', 0)');
            legendGroup.append('rect')
                .attr('width', function() { return x.bandwidth() / 2; })
                .attr('height', p.legend.boxhgt)
                .attr('fill', p.legend.fill[n])
                .attr('opacity', p.legend.opacity[n])
            ;
            legendGroup.append('text')
                .attr('class', 'legend-' + p.legend.text[n] + '-text')
                .text(p.legend.text[n])
                .attr('dx', function() { return x.bandwidth() / 2 + 5; })
            ;
            if (p.legend.text[n] === 'Balance') {
                legendGroup.append('rect')
                    .attr('height', p.balance.strokeWidth)
                    .attr('width', function() { return x.bandwidth() / 2; })
                    .attr('fill', p.legend.fill[n])
                ;
            }
        }
    }; // end createChart
})();