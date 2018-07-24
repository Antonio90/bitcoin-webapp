var dataTableConfig = {
    retrieve: true,
    data: [],
    dom: 'ftrip',
    order: [[2, 'desc']],
    columns:[
        {title: 'Transaction hash', className: '', orderable: false, visible: true},
        {title: 'Value Out', className: '', orderable: false, visible: true},
        {title: '', className: '', orderable: true, visible: false},
        {title: '', className: '', orderable: false, visible: false}
    ],
    oLanguage: {
        sEmptyTable: 'Waiting for transactions...'
    }
};


var transactionsTable;

var totalRows = 0;
var updateTable = function(data) {

    if (data) {
        try {

            var json = JSON.parse(data);

            if (json.transactionInputs.length > 0) {

                var totalValue = 0.0;
                for(tOut in json.transactionDBOutputs){
                    totalValue += json.transactionDBOutputs[tOut].value;
                }
                var row = [];
                var link = "<a target='_blank' href='/infotransaction?id=" + json.transactionHash + "'>" + json.transactionHash + "</a>";
                row.push(link);
                row.push(totalValue + " BTC");
                row.push(totalRows++);
                row.push(json);
                var addedRow = transactionsTable.row.add(row).draw();
                var node = addedRow.node();
                $('#realTimeTransactions tr').removeClass('hightlight');
                $(node).addClass('hightlight');

            }

        } catch (e) {
            console.info('Error parsing data from websocket');
        }
    }
}

var initializeTable = function(){
    transactionsTable = $('#realTimeTransactions').DataTable(dataTableConfig);
}