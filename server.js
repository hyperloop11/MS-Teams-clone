const express               = require('express');
const app                   = express();
const server                = require('http').Server(app);
const io                    = require('socket.io')(server);
const {v4: uuidv4}          = require('uuid');
const flash                 = require('express-flash');
const session               = require('express-session');
const { ExpressPeerServer } = require('peer');


const { userJoin, getCurrentUser, userLeaves, getRoomUsers } = require('./utils/users');
const formatMessage = require('./utils/chatMessages');

const peerServer = ExpressPeerServer(server, {
    //peer with express
    debug: true,
    allow_discovery: true
});

const BOT_NAME = 'NearYou Bot';

//setting view engine as ejs 
app.set('view engine', 'ejs');

//setting static folder
app.use(express.static('public'))

app.use('/peerjs', peerServer);
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))
app.use(flash())

//access form variable in request method
app.use(express.urlencoded({ extended: false }))

// *        *
// * ROUTES *
// *        *

app.get('/joinMeet', (req, res) => {
    let uuvid = uuidv4();
    res.render('landing', { redirectLink: uuvid });
})

app.get('/', (req, res) => {
    res.render('chatIndex')
})

app.post('/', async (req, res) => {
    global.chosenUsername = await req.body.username;
    global.chosenRoom = await req.body.room;
    res.redirect('/chatroom')
})

app.post('/joinMeet', (req, res) => {
    res.redirect(req.body.meetLink)
})

app.get('/chatroom', (req, res) => {
    res.render('chatroom', { chosenUsername: chosenUsername })
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room, meetUsername: 'user' })
})

// *             *
// * SOCKET CODE *
// *             *

io.on('connection', socket => {
    // socket code for video chat
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);

        socket.to(roomId).emit('user-connected', userId);

        // when user disconnects from video meet
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
        })

        // when a user sends message
        socket.on('message', (message, username) => {
            io.to(roomId).emit('createMessage', message, username)
        })
    })

    //socket code for chat room
    socket.on('join-chat-room', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room)

        socket.emit('chat-message', formatMessage(BOT_NAME, 'Welcome to NearYou')); // to single client

        //broadcast when user connects
        socket.broadcast.to(user.room).emit('chat-message', formatMessage(BOT_NAME, `${user.username} has joined the chat`));
        //to all clients except the client that conects

        //send user and room info
        io.to(user.room).emit('room-users', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

        //when client disconnects
        socket.on('disconnect', () => {
            const user = userLeaves(socket.id);
            if (user) {
                io.emit('chat-message', formatMessage(BOT_NAME, 'A user has left the chat'))
                //to every connection

                io.to(user.room).emit('room-users', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                })
            }
        })

        //listen for chat message
        socket.on('chat-chatMessage', (msg) => {
            const thisUser = getCurrentUser(socket.id);
            io.to(user.room).emit('chat-message', formatMessage(thisUser.username, msg));
        });
    })
})

server.listen(process.env.PORT || 3030);