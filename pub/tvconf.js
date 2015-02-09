// ----------------------------
// Consts
// ----------------------------

var Queries = (function() {
    var queryStr = window.location.search;
    var result = {};
    if (queryStr.length <= 1) {
        return result; 
    }
    var queries = queryStr.substring(1, queryStr.length).split('&');
    for (var i=0; i<queries.length; i++) {
        var query = queries[i].split('=');
        var key = decodeURIComponent(query[0]);
        var value = (query.length === 1) ? null : decodeURIComponent(query[1]);
        result[key] = value;
    }
    return result;
})();
var Settings = {
    isLocal: (function() {
        if (window.location.host.indexOf('192.168.') === 0) {
            return true;
        }
        return false;
    })(),
    OID: Queries.OID || null,
    RID: Queries.RID || null,
};
Settings.STUN_URL = Settings.isLocal ?
    'stun:stun.l.google.com:19302' :
    'stun:stun.syno.jp';
Settings.SERVER_URL = Settings.isLocal ?
//    'http://192.168.31.6:8888' :
    'http://192.168.24.74:8888' :
    'http://stun2.syno.jp:8888';
console.log('Settings', Settings);


$(function() {
    $('#meetup-roomName').text(Settings.RID);

    var meetup = Meetup.create({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'localVideo',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: 'remoteVideos',
        // immediately ask for camera access. default false
        //autoRequestMedia: true,
        debug: true,
        peerConnectionConfig: {
            iceServers: [{
                "url": Settings.STUN_URL
            }]
        },
        peerConnectionContraints: {
            //mandatory:[video-min-height:600, video-max-bandwidth:500],
            //mandatory: {
            //    minWidth: "300",
            //    maxWidth: "400",
            //    minHeight: "200",
            //    maxHeight: "300",
            //    minFrameRate: "1",
            //    maxFrameRate: "2"
            //},
            optional: [
                { DtlsSrtpKeyAgreement: true },
                { RtpDataChannels: true },
//                { 'video-max-aspectratio': 1.333333333333},
//                { 'video-min-timebetweenrefframes': 20},
//                { 'video-min-framerate': 40},
//                { 'video-autowhitebalance': 'on'},
            ],
        },
        autoAdjustMic: false,
        //media: {
        //    audio: true,
        //    video: true
        //},
        detectSpeakingEvents: true,
        enableDataChannels: true,
        url: Settings.SERVER_URL
    
        // adjustPeerVolume: true,
        // peerVolumeWhenSpeaking: 0.25
    }).login(Settings.OID, function(err) {
        if (err) {
            // ログイン失敗
            return;
        }
        // ログイン成功

        // ルームIDがなければ、招待待ちを行う。
        if (!Settings.RID) {
            //stateEl.text('ユーザを待っています…。');
            return;
        }

        //stateEl.text('カメラとマイクの許可をしてください。');
        meetup.ready(function(err, sessionId) {
            console.log('ready, sessionId=', sessionId);
            //$('#alert-permit').remove();
            //$('#waiting').remove();
            //$('#meetup').show();
        
            // ready
            this.joinRoom(Settings.RID, function(err, roomDescription) {
                console.log('joinRoom', err);
                if (err) {
                    alert(err.message);
                    this.stopLocalVideo();
                    return;
                }
            }).speaking(function(event) {
                $('#localVideo').addClass('speaking');
            }).stoppedSpeaking(function(event) {
                $('#localVideo').removeClass('speaking');
            }).addedPeer(function(peer) {
                Meetup.notify({
                    title: peer.id + 'が会議に参加しました。'
                }).show();
                //refreshList(this.members);
            }).removedPeer(function(peer) {
                //refreshList(this.members);
            });
        }).denied(function(event) {
            var msg = 'カメラとマイクへのアクセスが許可されていません。\n許可した後、リロードしてください。';
            //stateEl.text(msg);
        
            console.log('deniedTime=', Date.now() - startTime);
        });
    }).on('socketError', function(evt) {
        console.log('socketError', this, evt);
        if (this.open === false && this.connected === false) {
            // TODO: Failed connect to Socket.IO Server
        }
	});

    var isSharedScreen = true;
    var shareScreenEl = $('#meetup-sharescreen').click(function() {
        if (isSharedScreen) {
            meetup.shareScreen(function() {
                shareScreenEl.val('画面共有開始');
            });
        } else {
            meetup.stopShareScreen(function() {
                shareScreenEl.val('画面共有停止');
            });
        }
        muteEl.attr('disable', 'disable');
        isSharedScreen = !isSharedScreen;
    }).val('画面共有停止');

    // mute/unmute
    var isMute = false; // TODO: デフォルト値
    var muteEl = $('#meetup-mute').click(function() {
        if (isMute) {
            meetup.unmute(function() {
                muteEl.val('ミュート');
            });
        } else {
            meetup.mute(function() {
                muteEl.val('ミュート解除');
            });
        }
        isMute = !isMute;
    }).val('ミュート');

    // pause/resume
    var isPaused = false;
    var pauseEl = $('#meetup-pause').click(function() {
        if (isPaused) {
            meetup.resume(function() {
                pauseEl.val('ポーズ');
            });
        } else {
            meetup.pause(function() {
                pauseEl.val('再開');
            });
        }
        isPaused = !isPaused;
    }).val('ポーズ');

    // TODO
    var stopVideoEl = $('#meetup-leave').click(function() {
        // 退室する
        meetup.stopLocalVideo(function() {
            stopVideoEl.val('退室しました');
        });
    }).val('退室する');
    //$('#startVideo').click(function() {
    //    meetup.startLocalVideo(function() {
    //    });
    //});

    $('#meetup-chat-form').submit(function(evt) {
        var chatLogEl = $('#meetup-chat-log');
        var chatInputEl = $('#meetup-chat-input');
        evt.preventDefault();
        $('<li/>').text('User : ' + chatInputEl.val()).appendTo(chatLogEl);
        chatInputEl.val('');
        chatLogEl.animate({
            scrollTop: chatLogEl[0].scrollHeight
        }, 100);
    });
    // TODO: socketio chat
    //var socketio = meetup.getConnection();
    //socketio.emit('chat', );

    // notify
    var notifyEl = $('#meetup-notify');
    if (Meetup.notify.permission() === 'granted') {
        notifyEl.hide();
    } else if (Meetup.notify.permission() === 'denied') {
        notifyEl.attr('disabled', 'disabled');
    } else {
        notifyEl.click(function(evt) {
            console.log('request notify');
            Notification.requestPermission(function (status) {
                console.log('status', status);

                if (status === 'granted') {
                    // 通知が有効になりました。
                    notifyEl.hide();
                } else if (status === 'denied') {
                    notifyEl.attr('disabled', 'disabled');
                } else {
                    // default
                }
            });
        });
    }
});
