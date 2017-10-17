(function() {
    
    var p = {};
        p.title = 'Seattle Vipassa Hall: Financials';
        p.outerWidth = 1200;
        p.outerHeight = 700;
        p.margin = {top: 150, right: 100, bottom: 180, left: 100};
        p.width = p.outerWidth - p.margin.left - p.margin.right;
        p.height = p.outerHeight - p.margin.top - p.margin.bottom;
        p.bordercolor = 'lightgray';
        p.borderWidth = 4;
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
            opacity: .4,
            strokeWidth: 3
        };
        p.targetMinimumBalance = {
            color: 'green',
            strokeWidth: 2,
            text: ['Target', 'Minimum', 'Balance'],
            yOffset: -16,
            lineHeight: 16,
            fontSize: 15
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
    
    d3.json(
        'https://spreadsheets.google.com/feeds/cells/1dKG0ubVUXrUg0lLhVVu8HqKO18t992PHoQktrhOCeCk/3/public/values?range=B3:O7&alt=json', 
        function(error, json) {
            if (error) return console.warn(error);
            data = prepData(json.feed.entry);
            createChart(data);
        }
    );
    
    var prepData = function(d) {
        var month = [],
            dana = [],
            expense = [],
            balance = [],
            targetMinBal = [],
            chartData = []
        ;
        for (var n=0; n < d.length; n++) {
            var w = d[n]
            switch(d[n].gs$cell.row) {
                case '3': month.push(d[n].content.$t);
                    break;
                case '4': dana.push(Number(d[n].gs$cell.numericValue));
                    break;
                case '5': expense.push(Number(d[n].gs$cell.numericValue));
                    break;
                case '6': balance.push(Number(d[n].gs$cell.numericValue));
                    break;
                case '7': targetMinBal.push(Number(d[n].gs$cell.numericValue));
                    break;
            }
        }
        for (n = 0; n < month.length; n++) {
            chartData[n] = {
                month: month[n], 
                dana: dana[n], 
                expense: expense[n], 
                balance: balance[n], 
                targetMinBal: targetMinBal[n]
            };
        }
        return chartData;
    }; // End prepData
    
    var createChart = function(d) {
        
        var svg = d3.select('.chart');
        svg.append('text')
            .text(p.title)
            .attr('x', (p.outerWidth / 2))             
            .attr('y', p.margin.top / 2)
            .attr('text-anchor', 'middle')
            .attr('class', 'title')
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
                .tickSizeInner(12)
                .tickSizeOuter(0))
        ;
        chart.selectAll('.xaxis .tick text')
            .attr('transform', 'rotate(-40)')
            .attr('dy', 15)
            .attr('dx', -5)
        ;
        
        //-----  Y Axis  -----//
        chart.append('g')
            .attr('class', 'yaxis')
            .call(d3.axisLeft(y)
                .tickSizeOuter(0)
                .tickSizeInner(p.width * -1)
                .tickArguments([4, d3.format('$,f')]))
        ;
        chart.selectAll('.yaxis .tick text')
            .attr('dx', -10)
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
        for(var n=0;n<p.targetMinimumBalance.text.length;n++) {
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
        for (var n=0; n<p.legend.text.length; n++) {
            var legendGroup = legend.append('g')
                .attr('id', 'lgnd-' + p.legend.text[n])
                .attr('transform', 'translate(' + p.legend.dx[n] + ', 0)');
            legendGroup.append('rect')
                .attr('width', function() { return x.bandwidth() / 2; })
                .attr('height', p.legend.boxhgt)
                .attr('fill', p.legend.fill[n])
                .attr('opacity', p.legend.opacity[n])
                .attr('transform', 'translate(' + function() { return x.bandwidth() / 2; } + ', 0)')
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