(function () {

    var roomName,
        myName = prompt("What's your name?", "Son Goku"),
        executeDelta = !1,
        storeDeltas = !1,
        sendDelta = !1,
        deltas = [],
        isNew = !1,
        editor,
        lobby;

    if (location.hash.substr(1)) {
        roomName = location.hash.substr(1);
    }
    else {
        roomName = "" + +new Date;
        isNew = !0;
    }
        
    location.hash = roomName;
    
    console.log('Connecting...');
    goinstant.connect('https://goinstant.net/ca346407cc6d/snippeRT', {room : roomName}, function (err, connection, room) {
        var notifications = new goinstant.widgets.Notifications();

        if (err) {
            console.dir(err);
            return;
        }

        console.log('Connected.');
        lobby = room;

        
        console.log('Subscribing to notifications...');
        notifications.subscribe(room, function(err) {
            console.log('Done subscribing');
            if (err) {
                throw err;
            }
            console.log('Publishing notifications...');
            notifications.publish({
                room: room,
                type: 'success',
                message: myName + ' has joined.'
            }, function(err) {
                console.log('Done publishing');
                if (err) {
                    throw err;
                }
            });
        });

        room.key('delta').on('set', function (value, context) {
            console.log("receiving");
            console.dir(value);
            if (executeDelta) {
                sendDelta = !1;
                editor.getSession().getDocument().applyDeltas([value]);
                sendDelta = !0;

                // root's job
                if (storeDeltas) {
                    console.log("Saving deltas");
                    room.key('deltas').set(editor.getValue(), function (err) {
                        if (err) {
                            throw err;
                        }
                    });
                }
            }
            else {
                deltas.push(value);
            }
        });
        
        
        console.log("Getting deltas");
        room.key('deltas').get(function (err, value){
            console.log("Deltas : ");
            console.dir(value);
            
            editor = ace.edit("editor")
            editor.setTheme('ace/theme/twilight');
            editor.getSession().setMode('ace/mode/javascript');
            editor.focus();
            
            if (value) {
                sendDelta = !1;
                editor.setValue(value);
                editor.clearSelection();
            }
            else {
                storeDeltas = !0;
            }

            editor.getSession().getDocument().applyDeltas(deltas);
            executeDelta = !0;
            sendDelta = !0;

            editor.on("change", function (e) {
                if (sendDelta) {
                    console.log("sending delta : ");
                    console.dir(e.data);
                    lobby.key('delta').set(e.data, function (err, value, context) {
                        if (err) {
                            throw err;
                        }
                    });

                    if (storeDeltas) {
                        console.log("Saving deltas");
                        room.key('deltas').set(editor.getValue(), function (err) {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                }
            });
            
            if (isNew) {
                alert("You can now share your URL to other collaborators! Hoorah!");
            }
        });
    });

} () );
