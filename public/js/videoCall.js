const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');

myVideo.muted = true;

const socket = io('/');

// server -> html -> js
const username = meetUsername

var peer = new Peer(undefined, {
    host: 'https://protected-retreat-21863.herokuapp.com',
    port: '443'
    // setting port for peerjs to listen on
});

let myVideoStream, displayMediaStream;

// maintain list of conencted peers
const peers = {};


// *            *
// * VIDEO CALL *
// *            *

navigator.mediaDevices.getUserMedia({
    // get audio and vid from chrome promise
    video: true,
    audio: true

}).then(stream => {

    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    // when new connetion is detected
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })

    })

    // messages in video call
    let text = $('input');

    // listning for enter key to recieve input
    $('html').keydown((e) => {
        if (e.which == 13 && text.val().length !== 0) {
            socket.emit('message', text.val(), username);
            text.val('')
            // setting the input value to blank string again
        }
    });

    // when message is createed, output to DOM
    socket.on('createMessage', (message, username) => {
        $("ul").append(
            `
            <li class = "message"><b>USER  </b>${message}</li>
            `
        );
        scrollToBottom();
    });


})

peer.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

peer.on('open', id => {
    // specific id for person who is connecting
    // ROOM_ID from room.ejs from server side
    socket.emit('join-room', ROOM_ID, id);

})

// conenct to user and output video stream to DOM
function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })

    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

// append video stream to list of videos
function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

// add message and scroll to bottom in chat
const scrollToBottom = () => {
    let element = $('.main__chat_window');
    element.scrollTop(element.prop('scrollHeight'));
}


// *                      *
// * BUTTONS FOR FEATURES *
// *                      *

// changing mute/unmute by clicking button
const muteUnmute = () => {
    // getting the current status, whether its mute or unmute
    const enabled = myVideoStream.getAudioTracks()[0].enabled;

    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        setMuteButton();
    }
}

// DOM button for voice
const setMuteButton = () => {
    const html =
        `
    <i class="fas fa-microphone"></i>
    <span> Mute </span>
    `
    document.querySelector(".main__mute_button").innerHTML = html;
}

const setUnmuteButton = () => {
    const html =
        `
    <i class="unmute fas fa-microphone-slash"></i>
    <span> Unmute </span>
    `
    document.querySelector(".main__mute_button").innerHTML = html;
}

// switching video on and off using button
const playStop = () => {
    // getting the current status, whether its mute or unmute
    const enabled = myVideoStream.getVideoTracks()[0].enabled;

    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideoButton();
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        setStopVideoButton();
    }
}

// changing DOM icon
const setPlayVideoButton = () => {
    const html =
        `
    <i class="stop fas fa-video-slash"></i>
    <span> Play Video </span>
    `
    document.querySelector(".main__video_button").innerHTML = html;
}

// changing DOM icon
const setStopVideoButton = () => {
    const html =
        `
    <i class="fas fa-video"></i>
    <span> Stop Video </span>
    `
    document.querySelector(".main__video_button").innerHTML = html;
}

// copy meeting link button
const copyLink = () => {
    const roomLink = window.location.href.toString();
    var temporaryTextArea = document.createElement("textarea");
    document.body.appendChild(temporaryTextArea);
    temporaryTextArea.value = roomLink;
    temporaryTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(temporaryTextArea);
    alert("Copied the meeting link to your clipboard");
}

// share and stop sharing screen
// * * not working * *
const shareScreen = () => {

    if (!displayMediaStream) {
        navigator.mediaDevices.getDisplayMedia().then(stream => {
            displayMediaStream = stream;
            const video = document.createElement('video');
            addVideoStream(video, displayMediaStream);
            enabled = displayMediaStream.getTracks()[0];
        })
    }
    if (enabled) {
        displayMediaStream.getTracks()[0].enabled = false;
        stopScreenShareButton();
    } else {
        displayMediaStream.getTracks()[0].enabled = true;
        const call = peer.call(userId, stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
        startScreenShareButton();
    }
}

// DOM icon while screen is sharing
const stopScreenShareButton = () => {
    const html =
        `
    <i class="fas fa-stop"></i>
    <span> Stop Video </span>
    `
    document.querySelector(".main__screenShare_button").innerHTML = html;
}

// DOM icon to stop screen sharing 
const startScreenShareButton = () => {
    const html =
        `
    <<i class="fas fa-share-square"></i>
    <span> Stop Video </span>
    `
    document.querySelector(".main__screenShare_button").innerHTML = html;
}