(function () {
    var editor = ace.edit("editor"),
        roomName = location.hash = location.hash.substr(1) || ""+ +new Date,
        send = true,
        lobby;

    editor.setTheme('ace/theme/twilight');
    editor.getSession().setMode('ace/mode/javascript');
    editor.focus();
    goinstant.connect('https://goinstant.net/ca346407cc6d/snippeRT', {room : roomName}, function (err, connection, room) {
        if (err) {
            console.dir(err);
            return;
        }
        lobby = room;

        lobby.key('data').on('set', function (value, context) {
            send = false;
            editor.getSession().getDocument().applyDeltas([value.delta]);
            send = true;
        });
        
        lobby.on("join", function(){
            lobby.key('data').set(editor.getValue());
        });

        editor.on("change", function (e) {
            if (send) {
                lobby.key('data').set({
                    delta : e.data,
                    cursor : editor.getCursorPosition()
                });
            }
        });
    });
} () );