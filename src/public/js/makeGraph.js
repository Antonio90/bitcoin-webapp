
var parsedTree = [];

var updateGraph = function(data) {

     parseData(data);

    /*var links = [
        {source: "Microsoft", target: "Amazon", type: "licensing"},
        {source: "Microsoft", target: "HTC", type: "licensing"},
        {source: "Samsung", target: "Apple", type: "suit"},
        {source: "Motorola", target: "Apple", type: "suit"},
        {source: "Nokia", target: "Apple", type: "resolved"},
        {source: "HTC", target: "Apple", type: "suit"},
        {source: "Kodak", target: "Apple", type: "suit"},
        {source: "Microsoft", target: "Barnes & Noble", type: "suit"},
        {source: "Microsoft", target: "Foxconn", type: "suit"},
        {source: "Oracle", target: "Google", type: "suit"},
        {source: "Apple", target: "HTC", type: "suit"},
        {source: "Microsoft", target: "Inventec", type: "suit"},
        {source: "Samsung", target: "Kodak", type: "resolved"},
        {source: "LG", target: "Kodak", type: "resolved"},
        {source: "RIM", target: "Kodak", type: "suit"},
        {source: "Sony", target: "LG", type: "suit"},
        {source: "Kodak", target: "LG", type: "resolved"},
        {source: "Apple", target: "Nokia", type: "resolved"},
        {source: "Qualcomm", target: "Nokia", type: "resolved"},
        {source: "Apple", target: "Motorola", type: "suit"},
        {source: "Microsoft", target: "Motorola", type: "suit"},
        {source: "Motorola", target: "Microsoft", type: "suit"},
        {source: "Huawei", target: "ZTE", type: "suit"},
        {source: "Ericsson", target: "ZTE", type: "suit"},
        {source: "Kodak", target: "Samsung", type: "resolved"},
        {source: "Apple", target: "Samsung", type: "suit"},
        {source: "Kodak", target: "RIM", type: "suit"},
        {source: "Nokia", target: "Qualcomm", type: "suit"}
    ];*/


// Compute the distinct nodes from the links.
    var nodes = {};
    var links = [];

    $('svg').html('');
 /*   parsedTree.forEach(function (link) {
        link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
        link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
    });*/

    for(var i = 0; i < parsedTree.length; i++){
        var pLink = parsedTree[i];
        var link = {source: '', target: ''};
        link.source = nodes[pLink.source] || (nodes[pLink.source] = {name: pLink.source});
        link.target = nodes[pLink.target] || (nodes[pLink.target] = {name: pLink.target});
        links.push(link);
    }

    var width = 1024,
        height = 1000;

    var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance(60)
        .charge(-300)
        .on("tick", tick)
        .start();

    var svg = d3.select("svg")
        .attr("width", width)
        .attr("height", height);

    var link = svg.selectAll(".link")
        .data(force.links())
        .enter().append("line")
        .attr("class", "link");

    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .call(force.drag);

    node.append("circle")
        .attr("r", 8);

    node.append("text")
        .attr("x", 12)
        .attr("dy", ".35em")
        .text(function (d) {
            return d.name;
        });

    function tick() {
        link
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        node
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
    }

    function mouseover() {
        d3.select(this).select("circle").transition()
            .duration(750)
            .attr("r", 16);
    }

    function mouseout() {
        d3.select(this).select("circle").transition()
            .duration(750)
            .attr("r", 8);
    }
}

var parseData = function(data){

    if(data){
        try{

            var json = JSON.parse(data);

            if(json.transactionInputs.length > 0 ){

                var source = '';

                if(json.transactionInputs.length == 1){
                    source = json.transactionInputs[0];
                } else {
                    var src = '';
                    for(txi in json.transactionInputs){
                        src += json.transactionInputs[txi] + '-';
                    }
                    source = src;
                }

                for(var t = 0; t < json.transactionDBOutputs.length; t++){
                    var trident = {source: source, target: '',type: ''};
                    var currentTX = json.transactionDBOutputs[t];
                    trident.target = currentTX.hash;
                    trident.type = currentTX.value.toString();
                    parsedTree.push(trident);
                    console.info('New trident ' + JSON.stringify(trident));
                }

            }

        } catch (e) {
            console.info('Error parsing data from websocket');
        }

    }
}