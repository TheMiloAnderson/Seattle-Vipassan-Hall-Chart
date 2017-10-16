var lp = {
    x: width / 2,
    y: height + (margin.bottom / 1.3),
    txtanchr: 'start',
    boxhgt: 15,
    g: {
        dana: {
            dx: 0,
            txt: 'Dana',
            box: {
                x: -68,
                y: -14,
                height: function() { return lp.boxhgt; },
                width: function() { return x.bandwidth() / 2; },
                fill: 'steelblue'
            }
        }, expense: {
            dx: 140,
            txt: 'Expense',
            box: {
                x: -95,
                y: -14,
                height: function() { return lp.boxhgt; },
                width: function() { return x.bandwidth() / 2; },
                fill: 'firebrick'
            }
        }, balance: {
            dx: 270,
            txt: 'Balance',
            box: {
                x: -90,
                y: -14,
                height: 15,
                width: function() { return x.bandwidth() / 2; },
                fill: 'orange',
                opacity: .9,
                function() { return d3.select('#lgnd-balance')
                    .append('rect')
                    .attr('fill', 'orange')
                    .attr('width', lp.g.balance.box.width)
                    .attr('height', 2.4)
                    .attr('x', lp.g.balance.box.x)
                    .attr('y', lp.g.balance.box.y)
                ;}
            }
        }
    }
};