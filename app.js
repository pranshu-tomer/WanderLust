require('dotenv').config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");

const dbUrl = process.env.MONGO_URL;

async function main(){
    await mongoose.connect(dbUrl);
}

main()
.then(() => {
    console.log("Connected to Server");
})
.catch((err) => {
    console.log(err);
})

const session = require('express-session');

// for session storage
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

// session storage
const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret : process.env.SECRET
    },
    touchAfter : 24 * 3600
});

store.on('error', (err) => {
    console.log("Error in mongo session store",err);
});

const sessionOption = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized: true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
};

const path = require("path");
app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));

const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('./models/user.js');

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

const listingsRouter = require('./routes/listing.js');
const reviewsRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');

// we are installing ejs-mate (help in creating templates/layouts)
// Nav bar website ki har page same rahega to use banao
// more example = footer
const ejsMate = require("ejs-mate");
app.engine('ejs', ejsMate);

// Use of static files
app.use(express.static(path.join(__dirname, "/public")));

const expressError = require('./utils/expressError.js');

// Socket io
const http = require('http')
const server = http.createServer(app);
const {Server} = require('socket.io');
const Chat = require('./models/chat.js')
const Room = require('./models/room.js')
const io = new Server(server);

let onlineUsers = new Map();

server.listen(3000,() => console.log("Server is listening"))

io.on('connection', (socket) => {

    console.log(`User connected with socket ID: ${socket.id}`);
    socket.on('login', async (userId) => {
        onlineUsers.set(userId, socket.id);

        await Room.find({ participants: userId })
            .populate('participants') 
            .then((res) => {
                socket.emit('all-rooms', res);
            }).catch((err) => {
                console.error('Error loading messages:', err);
            });
    });

    socket.on('join-room', async ({ userId, otherUserId }) => {
            // console.log(userId)
            // Check if the room between these two users already exists
            let room = await Room.findOne({
                participants: { $all: [userId, otherUserId] }
            });
    
            // If the room doesn't exist, create a new one
            if (!room) {
                room = new Room({
                    participants: [userId, otherUserId],
                    roomName: `${userId}-${otherUserId}`,  // or generate any unique name
                });
                await room.save();
                console.log('New room created:', room._id);
            }
    
            const roomId = room._id.toString();
    
        // Now the user joins the room (socket.io room)
        socket.join(roomId);

        // // Load previous messages for this room
        await Chat.find({ room: roomId })
            .sort({ timestamp: 1 }) // Sort by timestamp (oldest to newest)
            .populate('sender') // Optionally populate sender details
            .then((res) => {
                socket.emit('previous-messages', {res,roomId});
            }).catch((err) => {
                console.error('Error loading messages:', err);
            });
    });

    socket.on('send-message', async (data) => {
        const { sender, roomId, content } = data;
        console.log(sender,roomId,content)

        const contentTrim = content

        if(contentTrim.length != 0){
            // Save the message to the database
            const newMessage = new Chat({
                room: roomId,
                sender,
                content : contentTrim,
            });

            await newMessage.save();
            io.to(roomId).emit('receive-message', newMessage);
        }
    });

    socket.on('disconnect', () => {
        let disconnectedUserId;
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                disconnectedUserId = userId;
                onlineUsers.delete(userId);
                break;
            }
        }
        console.log(`User disconnected ${socket.id}`)
    });
})
// io.to(room).emit()
// io - entire circite
// socket.broadcast.emit() (message usko chhod ke sabko jaayega)












app.use(session(sessionOption));
app.use(flash());

// making passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));

// user se relation jitni bhi information hai use store karaye session me - serialisation
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.created = req.flash('created');
    res.locals.error = req.flash('err');
    res.locals.currUser = req.user;
    next();
})

// Express Router
app.get('/', (req,res) => {
    res.redirect('/listings');
});
app.use('/listings', listingsRouter);
app.use('/listings/:id/reviews', reviewsRouter);
app.use('/', userRouter);

// agar upar kisi ke saath match nahi hua to iske saath kar do
app.all('*', (req,res,next) => {
    next(new expressError(404,"Page not found !!"));
})

// Error Handling Middleware
app.use((err,req,res,next) => {
    let {statusCode=500, message="Something Went Wrong !!"} = err;
    res.status(statusCode).render("error.ejs", {err});
    // res.status(statusCode).send(message);
})
