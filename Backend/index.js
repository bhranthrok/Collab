// Node.js Server Setup
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const {S3Client, PutObjectCommand} = require("@aws-sdk/client-s3");
require('dotenv').config({path: './info.env'});

// Configure AWS SDK with credentials from the environment
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
})

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const app = express();
const PORT = 4000;

app.use(express.urlencoded({extended: true}))
app.use(express.json());
app.use(cors(
    {origin: "https://c0llab.netlify.app"} // Enables frontend requests
));

app.get("/api", (req, res) => {
    res.json({
        message: "This is working!",
    })
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

const users = []; // All users, NOT ENCRYPTED
const generateID = () => Math.random().toString(36).substring(2,10); // Generates alphanumeric Id eg. 5g8zxr1w

// Register Request
app.post("/api/register", async (req, res) => {
    const { email, password, username } = req.body;
    const id = generateID();
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Checks for existing user
    const result = users.filter(
        (user) => user.email === email);
    
    if (result.length === 0) {
        const newUser = { id, email, password: hashedPassword, username, storedAudioUrl: null};
        users.push(newUser);
        return res.json({
            message: "Account created successfully!",
        });
    }
     
    res.json({
        error_message: "User already exists",
    });
});

// Login Request
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    // Checks for user
    const user = users.find((user) => user.email === email);

    // User doesn't exist
    if (!user) {
        return res.json({
            error_message: "Incorrect credentials",
        });
    }

    const match = await bcrypt.compare(password, user.password);

    // Wrong password
    if (!match) {
        return res.json({
            error_message: "Incorrect credentials",
        });
    }

    // Successful login
    res.json({
        message: "Login successfully",
        id: user.id,
    });
});

const threadList = []; // All Posts

app.post("/api/create/thread", async (req, res) => {
const { thread, userId } = req.body;
const threadId = generateID();

const user = users.filter((user) => user.id === userId);

    threadList.unshift({
        id: threadId,
        title: thread,
        userId,
        username: user[0].username,
        replies: [],
        likes: [], // Array of users who like the thread
    });

    res.json({
        message: "Thread created successfully!",
        threads: threadList,
    });
});

// Shows all posts
app.get("/api/all/threads", (req, res) => {
    res.json({
        threads: threadList,
    });
});

// Shows all users
app.get("/api/all/users", (req, res) => {
    res.json({
        users: users,
    });
});

app.post("/api/thread/like", (req, res) => {
    // Defines id's
    const { threadId, userId } = req.body;
    // Gets the reacted post
    const result = threadList.filter((thread) => thread.id === threadId);
    // Gets the array with user likes
    const threadLikes = result[0].likes;

    // if user has already liked the post
    if (threadLikes.includes(userId)) {
        return res.json({
            message: "You can only react once!",
        });
    }

    // If not, lets them post
    threadLikes.push(userId);
    return res.json({
            message: "You've reacted to the post!",
        });
});

app.post("/api/thread/replies", (req, res) => {
    // Post Id
    const { postId } = req.body;
    // Finds Post
    const result = threadList.filter((thread) => thread.id === postId);
    // Returns replies and titles
    res.json({
        id: postId,
        replies: result[0].replies,
        title: result[0].title,
        username: result[0].username
    });
});

app.post("/api/create/reply", async (req, res) => {
    // Accepts the post id, user id, and reply
    const { id, userId, reply } = req.body;
    // Finds the relevant post
    const result = threadList.filter((thread) => thread.id === id);
    // Finds User
    const user = users.filter((user) => user.id === userId);

    // Adds the reply to the replies array
    result[0].replies.unshift({
        userId: user[0].id,
        name: user[0].username,
        text: reply,
    });

    res.json({
        message: "You Replied!",
    });
});

app.post("/api/upload", upload.single('audioFile'), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({error: 'File not received'});
    }

    const fileName = Date.now() + '-' + file.originalname;

    // Sets Parameters
    const uploadParams = {
        Bucket: 'collab-forum-amz-s3-bucket',
        Key: fileName,
        Body: file.buffer,
        ContentType: 'audio/mpeg',
      };
      
    // Upload the file to S3 bucket
    try {
        const data = await s3Client.send(new PutObjectCommand(uploadParams));
        const fileUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`
        
        const user = users.find(user => user.id === req.body.userId);
        user.storedAudioUrl = fileUrl;

        res.json({
            message: 'File uploaded successfully!',
            fileUrl: fileUrl,
        });
    } catch (err) {
        res.status(500).json({ error: 'Upload to S3 failed', details: err.message });
    }
});