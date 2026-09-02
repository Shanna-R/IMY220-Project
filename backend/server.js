const express = require('express');
const cors = require('cors');

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());

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

app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body;

    if(!email || !password)
    {
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

app.post('/api/auth/signup', (req, res) => {
    const {
        fullName,
        username,
        email,
        password
    } = req.body;

    if(!fullName || !username || !email || !password)
    {
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(
        `Woggle backend running on port ${PORT}`
    );
});