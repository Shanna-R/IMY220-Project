import { connectDB, getDB } from './db.js';

const users = [
    {
        _id: 'u1',
        name: 'Shanna Reinecke',
        username: 'shanna',
        email: 'test@test.com',
        password: 'test1234',
        bio: 'Scout who loves camps, hikes and new adventures.',
        location: 'Pretoria',
        profileImage: '',
        friends: ['u2', 'u3'],
        friendRequestsSent: [],
        friendRequestsReceived: [],
        isAdmin: false,
        createdAt: new Date('2026-09-01')
    },
    {
        _id: 'u2',
        name: 'Livia Webber',
        username: 'livia',
        email: 'livia@example.com',
        password: 'livia123',
        bio: 'Always ready for the next Scout adventure!',
        location: 'Pretoria',
        profileImage: '',
        friends: ['u1'],
        friendRequestsSent: [],
        friendRequestsReceived: [],
        isAdmin: false,
        createdAt: new Date('2026-09-02')
    },
    {
        _id: 'u3',
        name: 'Janke Rall',
        username: 'janke',
        email: 'janke@example.com',
        password: 'janke123',
        bio: 'Scouting, hiking and making memories.',
        location: 'Johannesburg',
        profileImage: '',
        friends: ['u1'],
        friendRequestsSent: [],
        friendRequestsReceived: [],
        isAdmin: false,
        createdAt: new Date('2026-09-03')
    },
    {
        _id: 'u4',
        name: 'Jemma Smith',
        username: 'jemma',
        email: 'jemma@example.com',
        password: 'jemma123',
        bio: 'Outdoor adventures and photography.',
        location: 'Pretoria',
        profileImage: '',
        friends: [],
        friendRequestsSent: [],
        friendRequestsReceived: [],
        isAdmin: false,
        createdAt: new Date('2026-09-04')
    },
    {
        _id: 'u5',
        name: 'Alex Brown',
        username: 'alex',
        email: 'alex@example.com',
        password: 'alex123',
        bio: 'Hiking enthusiast.',
        location: 'Centurion',
        profileImage: '',
        friends: [],
        friendRequestsSent: [],
        friendRequestsReceived: [],
        isAdmin: false,
        createdAt: new Date('2026-09-05')
    },
    {
        _id: 'u6',
        name: 'Sam Jones',
        username: 'sam',
        email: 'sam@example.com',
        password: 'sam123',
        bio: 'Campfires and good friends.',
        location: 'Pretoria',
        profileImage: '',
        friends: [],
        friendRequestsSent: [],
        friendRequestsReceived: [],
        isAdmin: false,
        createdAt: new Date('2026-09-06')
    },
    {
        _id: 'u7',
        name: 'Taylor Green',
        username: 'taylor',
        email: 'taylor@example.com',
        password: 'taylor123',
        bio: 'Learning new Scout skills.',
        location: 'Johannesburg',
        profileImage: '',
        friends: [],
        friendRequestsSent: [],
        friendRequestsReceived: [],
        isAdmin: false,
        createdAt: new Date('2026-09-07')
    },
    {
        _id: 'u8',
        name: 'Morgan White',
        username: 'morgan',
        email: 'morgan@example.com',
        password: 'morgan123',
        bio: 'Adventure starts outside.',
        location: 'Pretoria',
        profileImage: '',
        friends: [],
        friendRequestsSent: [],
        friendRequestsReceived: [],
        isAdmin: false,
        createdAt: new Date('2026-09-08')
    },
    {
        _id: 'u-admin',
        name: 'Admin User',
        username: 'admin',
        email: 'admin@example.com',
        password: '12345678',
        bio: 'Woggle Administrator',
        location: 'Pretoria',
        profileImage: '',
        friends: [],
        friendRequestsSent: [],
        friendRequestsReceived: [],
        isAdmin: true,
        createdAt: new Date('2026-09-09') }
];

const posts = [
    {
        _id: 'p1',
        authorId: 'u1',
        imageUrl: '',
        title: 'Weekend at Camp',
        description: 'Had an amazing weekend at camp with the troop!',
        hashtags: ['#camping', '#scouts', '#adventure'],
        createdAt: new Date('2026-09-20T10:00:00')
    },
    {
        _id: 'p2',
        authorId: 'u2',
        imageUrl: '',
        title: 'Hiking Adventure',
        description: 'A beautiful day out hiking with friends.',
        hashtags: ['#hiking', '#nature', '#scouting'],
        createdAt: new Date('2026-09-20T11:00:00')
    },
    {
        _id: 'p3',
        authorId: 'u3',
        imageUrl: '',
        title: 'Scout Achievement',
        description: 'Finally completed another Scout achievement!',
        hashtags: ['#achievement', '#scouts', '#proud'],
        createdAt: new Date('2026-09-21T09:00:00')
    },
    {
        _id: 'p4',
        authorId: 'u1',
        imageUrl: '',
        title: 'Campfire Memories',
        description: 'Nothing beats sitting around the campfire after a busy day.',
        hashtags: ['#campfire', '#memories', '#scouts'],
        createdAt: new Date('2026-09-21T12:00:00')
    },
    {
        _id: 'p5',
        authorId: 'u2',
        imageUrl: '',
        title: 'Team Challenge',
        description: 'Our team worked together to complete the challenge!',
        hashtags: ['#teamwork', '#challenge', '#scouting'],
        createdAt: new Date('2026-09-22T09:00:00')
    },
    {
        _id: 'p6',
        authorId: 'u4',
        imageUrl: '',
        title: 'Morning Hike',
        description: 'Started the morning with a beautiful hike.',
        hashtags: ['#hiking', '#morning', '#nature'],
        createdAt: new Date('2026-09-22T10:00:00')
    },
    {
        _id: 'p7',
        authorId: 'u5',
        imageUrl: '',
        title: 'First Aid Practice',
        description: 'Practised important first aid skills today.',
        hashtags: ['#firstaid', '#skills', '#scouts'],
        createdAt: new Date('2026-09-23T09:00:00')
    },
    {
        _id: 'p8',
        authorId: 'u6',
        imageUrl: '',
        title: 'Campfire Evening',
        description: 'A great evening around the campfire.',
        hashtags: ['#campfire', '#friends', '#camping'],
        createdAt: new Date('2026-09-23T14:00:00')
    },
    {
        _id: 'p9',
        authorId: 'u7',
        imageUrl: '',
        title: 'Scout Skills',
        description: 'Learning some new outdoor skills.',
        hashtags: ['#skills', '#outdoors', '#scouting'],
        createdAt: new Date('2026-09-24T08:00:00')
    },
    {
        _id: 'p10',
        authorId: 'u8',
        imageUrl: '',
        title: 'Adventure Day',
        description: 'Another great day of adventure!',
        hashtags: ['#adventure', '#scouts', '#outdoors'],
        createdAt: new Date('2026-09-24T16:00:00')
    }
];

const albums = [
    {
        _id: 'a1',
        ownerId: 'u1',
        name: 'Summer Camp',
        description: 'Photos and memories from summer camp.',
        hashtags: ['#camping', '#summer'],
        postIds: ['p1', 'p4'],
        createdAt: new Date('2026-09-20')
    },
    {
        _id: 'a2',
        ownerId: 'u2',
        name: 'Hiking Adventures',
        description: 'Our favourite hiking trips.',
        hashtags: ['#hiking', '#nature'],
        postIds: ['p2', 'p5'],
        createdAt: new Date('2026-09-20')
    },
    {
        _id: 'a3',
        ownerId: 'u3',
        name: 'Scout Achievements',
        description: 'Achievements from our Scout journey.',
        hashtags: ['#scouts', '#achievement'],
        postIds: ['p3'],
        createdAt: new Date('2026-09-21')
    },
    {
        _id: 'a4',
        ownerId: 'u4',
        name: 'Outdoor Activities',
        description: 'Outdoor activities and adventures.',
        hashtags: ['#outdoors', '#adventure'],
        postIds: ['p6', 'p9'],
        createdAt: new Date('2026-09-22')
    },
    {
        _id: 'a5',
        ownerId: 'u6',
        name: 'Camp Memories',
        description: 'Campfire and camping memories.',
        hashtags: ['#campfire', '#camping'],
        postIds: ['p8'],
        createdAt: new Date('2026-09-23')
    }
];

const comments = [
    {
        _id: 'c1',
        postId: 'p1',
        authorId: 'u2',
        text: 'Looks like an amazing camp!',
        createdAt: new Date('2026-09-20T13:00:00')
    },
    {
        _id: 'c2',
        postId: 'p1',
        authorId: 'u3',
        text: 'Wish I could have joined!',
        createdAt: new Date('2026-09-20T14:00:00')
    },
    {
        _id: 'c3',
        postId: 'p2',
        authorId: 'u1',
        text: 'That view is beautiful.',
        createdAt: new Date('2026-09-20T15:00:00')
    }
];


const reports = [
    {
        _id: 'r1',
        reporterId: 'u2',
        targetType: 'post',
        targetId: 'p1',
        reason: 'Spam',
        createdAt: new Date('2026-09-25T10:00:00')
    },
    {
        _id: 'r2',
        reporterId: 'u3',
        targetType: 'user',
        targetId: 'u4',
        reason: 'Harassment',
        createdAt: new Date('2026-09-25T11:00:00')
    }
];


async function seed() {
    await connectDB();

    const db = getDB();

    await db.collection('users').deleteMany({});
    await db.collection('posts').deleteMany({});
    await db.collection('albums').deleteMany({});
    await db.collection('comments').deleteMany({});
    await db.collection('reports').deleteMany({});

    await db.collection('users').insertMany(users);
    await db.collection('posts').insertMany(posts);
    await db.collection('albums').insertMany(albums);
    await db.collection('comments').insertMany(comments);

    if(reports.length > 0) {
        await db.collection('reports').insertMany(reports);
    }

    console.log('Database seeded successfully.');
    console.log('Users:', users.length);
    console.log('Posts:', posts.length);
    console.log('Albums:', albums.length);
    console.log('Comments:', comments.length);
    console.log('Reports:', reports.length);

    process.exit(0);
}

seed().catch(error => {
    console.error('Seed error:', error);
    process.exit(1);
});