if(window.location.href.indexOf('livedata') != -1) {

    if ("WebSocket" in window) {

        // Let us open a web socket
        var ws = new WebSocket("ws://" + config.wsHost + ":" + config.wsPort);

        ws.onopen = function () {
            ws.send("Open Connection");
        };

        ws.onmessage = function (evt) {
            var received_msg = evt.data;
            updateTable(evt.data);
        };

        ws.onclose = function () {
            alert("Connection is closed...");
        };

    } else {

        // The browser doesn't support WebSocket
        alert("WebSocket NOT supported by your Browser!");
    }
}