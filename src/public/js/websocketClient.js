if ("WebSocket" in window) {

    // Let us open a web socket
    var ws = new WebSocket("ws://localhost:9087");

    ws.onopen = function() {
        ws.send("Open Connection");
    };

    ws.onmessage = function (evt) {
        var received_msg = evt.data;
        updateGraph(evt.data);
    };

    ws.onclose = function() {
        alert("Connection is closed...");
    };

} else {

    // The browser doesn't support WebSocket
    alert("WebSocket NOT supported by your Browser!");
}