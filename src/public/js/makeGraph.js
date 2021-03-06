//http://bl.ocks.org/fancellu/2c782394602a93921faff74e594d1bb1
var makeSVGTransaction = function(json, idSvg, isBig) {

    var colors = d3.scaleOrdinal(d3.schemeCategory10);

    var simulation;

    var svg = d3.select("#" + idSvg),
        width = + $("#" + idSvg).width(),
        height = +svg.attr("height");

    var zoomLayer = svg.append('g');

    svg.call(d3.zoom().on('zoom', function(){
        zoomLayer.attr('transform', d3.event.transform);
    }));

    zoomLayer.append('defs').append('marker')
        .attrs({'id':'arrowhead',
            'viewBox':'-0 -5 10 10',
            'refX':13,
            'refY':0,
            'orient':'auto',
            'markerWidth':13,
            'markerHeight':13,
            'xoverflow':'visible'})
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#999')
        .style('stroke','none');

    var dati = getLinksandNodes(json);
    update(dati.links, d3.values(dati.nodes));

    function update(links, nodes) {

        simulation = d3.forceSimulation(nodes)
                            .force("link", d3.forceLink().id(function (d) { return d.hash;}))
                            .force("charge", d3.forceManyBody().strength(-80))
                            .force("center", d3.forceCenter(width / 2, height / 2))
                            .on("tick", tick)
                            .stop();

        simulation.force("link")
            .links(links);

        for(i=0; i < 300; i++) simulation.tick();

        link = zoomLayer.selectAll(".link")
                        .data(links)
                        .enter()
                        .append("line")
                        .attr("class", "link")
                        .attr('marker-end','url(#arrowhead)')
                        .attr("x1", function(d){ return d.source.x; })
                        .attr("y1", function(d){ return d.source.y; })
                        .attr("x2", function(d){ return d.target.x; })
                        .attr("y2", function(d){ return d.target.y; })


        link.append("title")
            .text(function (d) {
                var t = "Transaction Hash: " + d.transactionHash + "\n" +
                        "Received Time: " + d.receivedTime + "\n" +
                        "Block Hash: " + d.blockHash + "\n" +
                        "Value: " + d.value;
                return t;

            });


        edgepaths = zoomLayer.selectAll(".edgepath")
            .data(links)
            .enter()
            .append('path')
            .attrs({
                'class': 'edgepath',
                'fill-opacity': 0,
                'stroke-opacity': 0,
                'id': function (d, i) {return 'edgepath' + i}
            })
            .attr("d", function(d){ return "M " + d.source.x + " " + d.source.y + " L " + d.target.x + " " + d.target.y; })
            .style("pointer-events", "none");

        edgelabels = zoomLayer.selectAll(".edgelabel")
            .data(links)
            .enter()
            .append('text')
            .style("pointer-events", "none")
            .attrs({
                'class': 'edgelabel',
                'id': function (d, i) {return 'edgelabel' + i},
                'font-size': 10,
                'fill': '#aaa'
            })
            .attr("d", function(d){ return "M " + d.source.x + " " + d.source.y + " L " + d.target.x + " " + d.target.y; })

        edgelabels.append('textPath')
            .attr('xlink:href', function (d, i) {return '#edgepath' + i})
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text(function (d) {return isBig ? '' : d.value});


        node = zoomLayer
            .selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d){ return "translate(" + d.x + ", " + d.y + ")";})
            .on("contextmenu", function(data,index){
                console.info("Selected hash: " + data.hash);
                $("input[type='search']").val(data.hash);
                $("input[type='search']").keyup();
                d3.event.preventDefault();

            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
            );

        node.append("circle")
            .attr("r", 5)
            .style("fill", function (d, i) {return colors(i);})


        node.append("title")
            .text(function (d) {return d.hash;});

        if(!isBig) {
            node.append("text")
                .attr("dy", -3)
                .attr("font-size", 14)
                .text(function (d) {return d.hash;});
        }


        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d){
            if(!d3.event.active) simulation.alphaTarget(0);
            d.fx = undefined;
            d.fy = undefined;
        }

        function tick(){
            link
                .attr("x1", function(d){ return d.source.x; })
                .attr("y1", function(d){ return d.source.y; })
                .attr("x2", function(d){ return d.target.x; })
                .attr("y2", function(d){ return d.target.y; })

            node
                .attr("transform", function(d){ return "translate(" + d.x + ", " + d.y + ")";})

            edgepaths
                .attr("d", function(d){
                    return "M " + d.source.x + " " + d.source.y + " L " + d.target.x + " " + d.target.y;
                })

            edgelabels
                .attr("transform", function(d){
                if(d.target.x < d.source.x){
                    var bbox = this.getBBox();
                    rx = bbox.x + bbox.width  /2;
                    ry = bbox.y + bbox.height /2;
                    return "rotate(180 " + rx + " " + ry + " )";
                } else {
                    return "rotate(0)";
                }
            })

        }

    }
}


var getLinksandNodes = function(json) {

    var data = {
        nodes: {},
        links: []
    };

    for(i in json){
        var transaction = json[i];
        var link = {source: '', target:'', value:'', blockHash: '', receivedTime: '', transactionHash: '' };
        link.source = data.nodes[transaction.source.properties.hash] || (data.nodes[transaction.source.properties.hash] = {hash: transaction.source.properties.hash});
        link.target = data.nodes[transaction.destination.properties.hash] || (data.nodes[transaction.destination.properties.hash] = {hash: transaction.destination.properties.hash });
        link.value = Number(transaction.relation.properties.value).toFixed(3) + " BTC";
        link.blockHash = transaction.relation.properties.blockHash;
        link.receivedTime = transaction.relation.properties.receivedTime;
        link.transactionHash = transaction.relation.properties.transactionHash;
        data.links.push(link);
    }

    return data;
}