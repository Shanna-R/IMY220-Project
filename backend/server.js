const express = require('express');
const cors = require('cors');

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());


// ========================================
// Dummy Profile Data
// ========================================

const profiles = [
    {
        id: 1,
        name: 'Shanna Reinecke',
        username: 'shanna',
        troop: 'Troop 17',
        bio: 'Scout who loves camps, hikes and new adventures.',
        location: 'Pretoria',
        friends: 12
    },
    {
        id: 2,
        name: 'Livia Webber',
        username: 'livia',
        troop: 'Troop 17',
        bio: 'Always ready for the next Scout adventure!',
        location: 'Pretoria',
        friends: 18
    },
    {
        id: 3,
        name: 'Chloe Larsen',
        username: 'chloe',
        troop: 'Troop 21',
        bio: 'Scouting, hiking and making memories.',
        location: 'Johannesburg',
        friends: 9
    }
];


// ========================================
// Dummy Post Data
// ========================================

const posts = [
    {
        id: 1,
        authorId: 1,
        authorName: 'Shanna Reinecke',
        troop: 'Troop 17',
        title: 'Weekend at Camp',
        description: 'Had an amazing weekend at camp with the troop!',
        hashtags: ['#camping', '#scouts', '#adventure'],
        likes: 24,
        comments: 6
    },
    {
        id: 2,
        authorId: 2,
        authorName: 'Livia Webber',
        troop: 'Troop 17',
        title: 'Hiking Adventure',
        description: 'A beautiful day out hiking with friends.',
        hashtags: ['#hiking', '#nature', '#scouting'],
        likes: 31,
        comments: 8
    },
    {
        id: 3,
        authorId: 3,
        authorName: 'Chloe Larsen',
        troop: 'Troop 21',
        title: 'Scout Achievement',
        description: 'Finally completed another Scout achievement!',
        hashtags: ['#achievement', '#scouts', '#proud'],
        likes: 19,
        comments: 4
    },
    {
        id: 4,
        authorId: 1,
        authorName: 'Shanna Reinecke',
        troop: 'Troop 17',
        title: 'Campfire Memories',
        description: 'Nothing beats sitting around the campfire after a busy day.',
        hashtags: ['#campfire', '#memories', '#scouts'],
        likes: 42,
        comments: 11
    },
    {
        id: 5,
        authorId: 2,
        authorName: 'Livia Webber',
        troop: 'Troop 17',
        title: 'Team Challenge',
        description: 'Our team worked together to complete the challenge!',
        hashtags: ['#teamwork', '#challenge', '#scouting'],
        likes: 27,
        comments: 5
    }
];


// ========================================
// Basic Routes
// ========================================

app.get('/', (req, res) => {
    res.json({
        message: 'Woggle backend is running'
    });
});


app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is healthy'
    });
});


// ========================================
// Profile Routes
// ========================================

// Get all profiles
app.get('/api/profiles', (req, res) => {
    res.json({
        success: true,
        profiles: profiles
    });
});


// Get one profile by ID
app.get('/api/profiles/:id', (req, res) => {
    const id = Number(req.params.id);

    const profile = profiles.find(profile => profile.id === id);

    if (!profile) {
        return res.status(404).json({
            success: false,
            message: 'Profile not found'
        });
    }

    res.json({
        success: true,
        profile: profile
    });
});


// ========================================
// Post Routes
// ========================================

// Get all posts
app.get('/api/posts', (req, res) => {
    res.json({
        success: true,
        posts: posts
    });
});


// Get one post by ID
app.get('/api/posts/:id', (req, res) => {
    const id = Number(req.params.id);

    const post = posts.find(post => post.id === id);

    if (!post) {
        return res.status(404).json({
            success: false,
            message: 'Post not found'
        });
    }

    res.json({
        success: true,
        post: post
    });
});


// ========================================
// Authentication Routes
// ========================================

// Sign in
app.post('/api/auth/signin', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }

    res.json({
        success: true,
        message: 'Sign in successful',
        user: {
            id: 1,
            name: 'Shanna Reinecke',
            email: email
        }
    });
});


// Sign up
app.post('/api/auth/signup', (req, res) => {
    const {
        fullName,
        username,
        email,
        password
    } = req.body;

    if (!fullName || !username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: {
            id: 2,
            name: fullName,
            username: username,
            email: email
        }
    });
});


// ========================================
// Start Server
// ========================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(
        `Woggle backend running on port ${PORT}`
    );
});