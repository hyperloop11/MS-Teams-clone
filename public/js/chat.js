const chatForm      = document.getElementById('chat-form');
const chatMessages  = document.querySelector('.chat-messages');
const roomName      = document.getElementById('room-name');
const UserList      = document.getElementById('users');

const socket = io('/');

socket.on('chat-message', message =>{
    outputMessage(message);
})

// joining chatroom
const username = chosenUsername;
const  room = chosenRoom;

socket.emit('join-chat-room', {username, room} );

// get room users
socket.on('room-users', ({room, users}) => {
    outputRoomName(room);
    outputRoomUsers(users);
})

// message submit
chatForm.addEventListener('submit', (e)=>{

    e.preventDefault();

    // emitting msg to the server
    const msg = e.target.elements.msg.value;
    socket.emit('chat-chatMessage', msg);
    
    // scroll to bottom and clear input field
    // chatMessages.scrollTop=chatMessages.scrollHeight;
    let element = $('.chat-messages');
    element.scrollTop(element.prop('scrollHeight'));
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();
})

// output message to DOM
outputMessage = (message)=>{
    let div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = 
    `
    <p class="meta">${message.username} :<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>
    `;
    document.querySelector('.chat-messages').appendChild(div);
}

// add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

// add user list to DOM
function outputRoomUsers(users){
    UserList.innerHTML =
    `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
 }