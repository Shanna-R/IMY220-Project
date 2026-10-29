import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';

import { connectDB, getDB } from './db.js';

import {
  getAllUsers,
  getUserById,
  getUserForLogin,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser
} from './repositories/userRepository.js';

import {
  getAllPosts,
  getPostById,
  getPostsByAuthor,
  createPost,
  updatePost,
  deletePost
} from './repositories/postRepository.js';

import {
  getAllAlbums,
  getAlbumById,
  getAlbumsByOwner,
  createAlbum,
  updateAlbum,
  deleteAlbum
} from './repositories/albumRepository.js';

import {
    getCommentsByPost,
  createComment,
  deleteCommentsForPost,
  getCommentCount,
  getCommentById,
  deleteComment
} from './repositories/commentRepository.js';

import {
  createReport,
  countReportsForPost,
  getAllReports,
  hasUserReported,
  deleteReportsForPost,
  deleteReportsForUser
} from './repositories/reportRepository.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   MIDDLEWARE
========================= */

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '8mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'woggle-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax'
  }
}));

/* =========================
   HELPERS
========================= */

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({
      message: 'You must be logged in.'
    });
  }

  next();
}

function requireAdmin(req, res, next)
{
    if (!req.session.userId)
    {
        return res.status(401).json({
            message: 'You must be logged in.'
        });
    }

    getUserById(req.session.userId)
        .then(user =>
        {
            if (!user || !user.isAdmin)
            {
                return res.status(403).json({
                    message: 'Admin access required.'
                });
            }

            next();
        })
        .catch(error =>
        {
            console.error('Admin check failed:', error);

            res.status(500).json({
                message: 'Unable to check admin access.'
            });
        });
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

async function getHiddenPostIds() {
  const db = getDB();

  const hiddenPosts = await db
    .collection('reports')
    .aggregate([
      {
        $match: {
          targetType: 'post'
        }
      },
      {
        $group: {
          _id: '$targetId',
          reportCount: {
            $sum: 1
          }
        }
      },
      {
        $match: {
          reportCount: {
            $gte: 3
          }
        }
      }
    ])
    .toArray();

  return new Set(
    hiddenPosts.map(post => post._id)
  );
}

async function createNotification(userId, type, message) {
  await getDB().collection('notifications').insertOne({
    _id: makeId('n'),
    userId,
    type,
    message,
    read: false,
    createdAt: new Date()
  });
}

/* =========================
   BASIC ROUTES
========================= */

app.get('/', (req, res) => {
  res.json({
    message: 'Woggle API is running'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});

/* =========================
   AUTHENTICATION
========================= */

app.post('/api/auth/signup', async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password
    } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required.'
      });
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    const user = {
      _id: makeId('u'),
      name,
      username,
      email,
      password,
      bio: '',
      location: '',
      profileImage: '',
      friends: [],
      friendRequestsSent: [],
      friendRequestsReceived: [],
      isAdmin: false,
      createdAt: new Date()
    };

    const createdUser = await createUser(user);

    req.session.userId = createdUser._id;

    const {
      password: removedPassword,
      ...safeUser
    } = createdUser;

    res.status(201).json({
      message: 'Sign up successful.',
      user: safeUser
    });
  } catch (error) {
    console.error('Signup error:', error);

    res.status(500).json({
      message: 'Unable to sign up.'
    });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.'
      });
    }

    const user = await getUserForLogin(
      email,
      password
    );

    if (!user) {
      return res.status(401).json({
        message: 'Incorrect email or password.'
      });
    }

    req.session.userId = user._id;

    const {
      password: removedPassword,
      ...safeUser
    } = user;

    res.json({
      message: 'Sign in successful.',
      user: safeUser
    });
  } catch (error) {
    console.error('Signin error:', error);

    res.status(500).json({
      message: 'Unable to sign in.'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({
      message: 'Logged out successfully.'
    });
  });
});

app.get('/api/auth/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.json({
        user: null
      });
    }

    const user = await getUserById(
      req.session.userId
    );

    if (!user) {
      return res.json({
        user: null
      });
    }

    const {
      password: removedPassword,
      ...safeUser
    } = user;

    res.json({
      user: safeUser
    });
  } catch (error) {
    console.error('Auth me error:', error);

    res.status(500).json({
      message: 'Unable to get current user.'
    });
  }
});

/* =========================
   FEED
========================= */

async function addAuthorsToPosts(posts, currentUserId = null) {
  const users = getDB().collection('users');

  return Promise.all(
    posts.map(async (post) => {
      const author = await users.findOne(
        {
          _id: post.authorId
        },
        {
          projection: {
            password: 0
          }
        }
      );

      const commentsCount =
        await getDB()
          .collection('comments')
          .countDocuments({
            postId: post._id
          });

      const likesArray = Array.isArray(post.likes)
        ? post.likes
        : [];

      return {
        ...post,

        // Store the number separately for the frontend.
        likes: likesArray.length,

        // Tells the logged-in user whether they liked this post.
        liked: currentUserId
          ? likesArray.includes(currentUserId)
          : false,

        author,
        commentsCount
      };
    })
  );
}


app.get('/api/feed', requireLogin, async (req, res) => {
  try {
    const db = getDB();

    const scope = req.query.scope || 'local';
    const sort = req.query.sort || 'newest';

    const currentUser = await db
      .collection('users')
      .findOne({
        _id: req.session.userId
      });

    if (!currentUser) {
      return res.status(404).json({
        error: 'User not found.'
      });
    }

    // Use separate favourites for Local and Global.
    const FavouritePostIds =
      scope === 'global'
        ? currentUser.globalFavouritePostIds || []
        : currentUser.localFavouritePostIds || [];

    let userIds = [];

    // LOCAL: current user + friends
    // GLOBAL: all users
    if (scope === 'global') {
      const allUsers = await db
        .collection('users')
        .find(
          { _id: { $ne: currentUser._id } },
          { projection: { _id: 1 } }
        )
        .toArray();

      userIds = allUsers.map(user => user._id);
    } 
    else {
      userIds = (currentUser.friends || []).filter(
        userId => userId !== currentUser._id
      );
    }

    // Fetch posts from the selected feed only.
    let posts;

    if (sort === 'popular') {
      posts = await db
        .collection('posts')
        .find({
          authorId: { $in: userIds }
        })
        .sort({ likes: -1 })
        .toArray();
    } else {
      posts = await db
        .collection('posts')
        .find({
          authorId: { $in: userIds }
        })
        .sort({ createdAt: -1 })
        .toArray();
    }

    // Hide posts with at least 3 reports.
    const hiddenPostIds = await getHiddenPostIds();

    const visiblePosts = posts.filter(
      post => !hiddenPostIds.has(post._id)
    );

    const activities = await addAuthorsToPosts(
      visiblePosts,
      req.session.userId
    );

    // Fetch albums from the selected feed only.
    const albums = await db
      .collection('albums')
      .find({
        ownerId: { $in: userIds }
      })
      .sort({ createdAt: -1 })
      .toArray();

    const albumActivities = await Promise.all(
      albums.map(async album => {
        const author = await db
          .collection('users')
          .findOne(
            { _id: album.ownerId },
            { projection: { password: 0 } }
          );

        return {
          ...album,
          type: 'album',
          author
        };
      })
    );

    const postActivities = activities.map(post => ({
      ...post,
      type: 'post',
      isFavourited: FavouritePostIds.includes(post._id)
    }));

    const combinedActivities = [
      ...postActivities,
      ...albumActivities
    ];

    // Prioritise favourites within the selected feed.
    combinedActivities.sort((a, b) => {
      const aIsFavourite =
        a.type === 'post' &&
        FavouritePostIds.some(
          favouriteId => String(favouriteId) === String(a._id)
        );

      const bIsFavourite =
        b.type === 'post' &&
        FavouritePostIds.some(
          favouriteId => String(favouriteId) === String(b._id)
        );

      if (aIsFavourite !== bIsFavourite) {
        return aIsFavourite ? -1 : 1;
      }

      if (sort === 'popular') {
        const aValue =
          a.type === 'post'
            ? Array.isArray(a.likes)
              ? a.likes.length
              : Number(a.likes || 0)
            : (a.postIds || []).length;

        const bValue =
          b.type === 'post'
            ? Array.isArray(b.likes)
              ? b.likes.length
              : Number(b.likes || 0)
            : (b.postIds || []).length;

        return bValue - aValue;
      }

      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    });

    res.json({
      scope,
      sort,
      activities: combinedActivities
    });
  } 
  catch (error)
  {
    console.error('Feed error:', error);

    res.status(500).json({
      error: 'Could not load feed.'
    });
  }
});


app.post('/api/posts/:id/favourite', requireLogin, async (req, res) => {
  try {
    const db = getDB();
    const postId = req.params.id;
    const scope = req.body.scope;

    if (!['local', 'global'].includes(scope)) {
      return res.status(400).json({ error: 'Invalid feed scope.' });
    }

    const post = await db.collection('posts').findOne({ _id: postId });

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const field = scope === 'global'
      ? 'globalFavouritePostIds'
      : 'localFavouritePostIds';

    await db.collection('users').updateOne(
      { _id: req.session.userId },
      { $addToSet: { [field]: postId } }
    );

    res.json({ message: 'Post favourited.', isFavourited: true });
  } catch (error) {
    console.error('Favourite post error:', error);
    res.status(500).json({ error: 'Could not favourite post.' });
  }
});

app.delete('/api/posts/:id/favourite', requireLogin, async (req, res) => {
  try {
    const db = getDB();
    const postId = req.params.id;
    const scope = req.body.scope;

    if (!['local', 'global'].includes(scope)) {
      return res.status(400).json({ error: 'Invalid feed scope.' });
    }

    const field = scope === 'global'
      ? 'globalFavouritePostIds'
      : 'localFavouritePostIds';

    await db.collection('users').updateOne(
      { _id: req.session.userId },
      { $pull: { [field]: postId } }
    );

    res.json({ message: 'Post unfavourited.', isFavourited: false });
  } catch (error) {
    console.error('Unfavourite post error:', error);
    res.status(500).json({ error: 'Could not unfavourite post.' });
  }
});



/* =========================
   USERS
========================= */

app.get('/api/users', async (req, res) => {
  try {
    const users = await getAllUsers();

    const safeUsers = users.map(user => {
      const {
        password,
        ...safeUser
      } = user;

      return safeUser;
    });

    res.json({
      users: safeUsers
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Unable to load users.'
    });
  }
});



app.get('/api/users/:id', async (req, res) => {
  try
  {
    const user = await getUserById(req.params.id);

    if (!user)
    {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    const currentUserId = req.session.userId || null;
    const isOwnUser = currentUserId === user._id;

    let isFriend = false;
    let friendRequestSent = false;
    let friendRequestReceived = false;

    if (currentUserId)
    {
      const currentUser = await getUserById(currentUserId);

      if (currentUser)
      {
        isFriend = (currentUser.friends || []).includes(user._id);

        friendRequestSent =
          (currentUser.friendRequestsSent || []).includes(user._id);

        friendRequestReceived =
          (currentUser.friendRequestsReceived || []).includes(user._id);
      }
    }

    // Only the owner and their friends can see the full profile.
    let publicUser = {
      _id: user._id,
      name: user.name,
      profileImage: user.profileImage || '',
      verified: user.verified || false
    };

    if (isOwnUser || isFriend)
    {
      const posts = await getPostsByAuthor(user._id);

      publicUser = {
        ...publicUser,
        username: user.username,
        bio: user.bio || '',
        location: user.location || '',
        postsCount: posts.length,
        friendsCount: (user.friends || []).length
      };
    }

    res.json({
      user: {
        ...publicUser,
        isOwnUser,
        isFriend,
        friendRequestSent,
        friendRequestReceived
      }
    });
  }
  catch (error)
  {
    console.error('Profile error:', error);

    res.status(500).json({
      message: 'Unable to load user.'
    });
  }
});



app.put('/api/users/:id', requireLogin, async (req, res) => {
  try {
    if (req.session.userId !== req.params.id) {
      return res.status(403).json({
        message: 'You can only edit your own account.'
      });
    }

    const {
      name,
      username,
      bio,
      location,
      profileImage
    } = req.body;

    const updates = {
      name,
      username,
      bio,
      location,
      profileImage
    };

    const user = await updateUser(
      req.params.id,
      updates
    );

    const {
      password,
      ...safeUser
    } = user;

    res.json({
      message: 'User updated.',
      user: safeUser
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Unable to update user.'
    });
  }
});

app.delete('/api/users/:id', requireLogin, async (req, res) => {
  try {
    if (req.session.userId !== req.params.id) {
      return res.status(403).json({
        message: 'You can only delete your own account.'
      });
    }

    await deleteUser(req.params.id);

    req.session.destroy(() => {
      res.json({
        message: 'Account deleted.'
      });
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Unable to delete account.'
    });
  }
});


/* =========================
   FUZZY SEARCH HELPERS
========================= */

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^#/, '')
    .replace(/[^a-z0-9@._-]+/g, ' ')
    .trim();
}

// Calculate the number of character edits needed
// to change one word into another.
function levenshteinDistance(first, second) {
  const previous = Array.from(
    { length: second.length + 1 },
    (_, index) => index
  );

  for (let i = 1; i <= first.length; i++) {
    const current = [i];

    for (let j = 1; j <= second.length; j++) {
      const insertion = current[j - 1] + 1;
      const deletion = previous[j] + 1;
      const substitution =
        previous[j - 1] + (first[i - 1] === second[j - 1] ? 0 : 1);

      current[j] = Math.min(insertion, deletion, substitution);
    }

    for (let j = 0; j < current.length; j++) {
      previous[j] = current[j];
    }
  }

  return previous[second.length];
}

function fuzzyMatch(value, searchTerm) {
  const text = normalizeSearchText(value);
  const query = normalizeSearchText(searchTerm);

  if (!text || !query) return false;

  // Exact or partial matches are always accepted.
  if (text.includes(query)) return true;

  const queryWords = query.split(/\s+/).filter(Boolean);
  const textWords = text.split(/\s+/).filter(Boolean);

  return queryWords.every((queryWord) => {
    // Short words should match exactly or partially;
    // fuzzy matching short words creates too many false positives.
    if (queryWord.length < 4) {
      return textWords.some(
        (word) => word.includes(queryWord)
      );
    }

    const maxDistance = queryWord.length >= 7 ? 2 : 1;

    return textWords.some((word) => {
      if (word.includes(queryWord) || queryWord.includes(word)) {
        return true;
      }

      // Avoid comparing words with very different lengths.
      if (Math.abs(word.length - queryWord.length) > maxDistance) {
        return false;
      }

      return (
        levenshteinDistance(word, queryWord) <= maxDistance
      );
    });
  });
}

function getHashtagText(hashtags) {
  if (!Array.isArray(hashtags)) return '';

  return hashtags
    .map((tag) => String(tag).replace(/^#/, ''))
    .join(' ');
}

/* =========================
   SEARCH
========================= */

app.get('/api/search', requireLogin, async (req, res) => {
  try {
    const searchTerm = String(req.query.q || '')
      .trim()
      .replace(/^#/, '');

    if (!searchTerm) {
      return res.json({
        users: [],
        posts: [],
        albums: []
      });
    }

    const db = getDB();

    // Load users without exposing their passwords.
    const allUsers = await db
      .collection('users')
      .find(
        {},
        {
          projection: {
            password: 0
          }
        }
      )
      .toArray();

    const hiddenPostIds = await getHiddenPostIds();

    const allPosts = await db
      .collection('posts')
      .find({
        _id: {
          $nin: [...hiddenPostIds]
        }
      })
      .toArray();

    const allAlbums = await db
      .collection('albums')
      .find({})
      .toArray();

    /* =========================
       USERS
       Search name, username, email
    ========================= */

    const users = allUsers
      .filter((user) =>
        fuzzyMatch(
          [
            user.name,
            user.username,
            user.email
          ].filter(Boolean).join(' '),
          searchTerm
        )
      )
      .slice(0, 50);

    /* =========================
       POSTS
       Search title, description, hashtags
    ========================= */

    const matchingPosts = allPosts
      .filter((post) =>
        fuzzyMatch(
          [
            post.title,
            post.description,
            getHashtagText(post.hashtags)
          ].filter(Boolean).join(' '),
          searchTerm
        )
      )
      .slice(0, 50);

    /* =========================
       ADD AUTHORS TO POSTS
    ========================= */

    const postsWithAuthors = matchingPosts.map((post) => {
      const author = allUsers.find(
        (user) =>
          String(user._id) === String(post.authorId)
      );

      return {
        ...post,
        author: author
          ? {
              _id: author._id,
              name: author.name,
              username: author.username
            }
          : null
      };
    });

    /* =========================
       ALBUMS
       Search name, description, hashtags
    ========================= */

    const matchingAlbums = allAlbums
      .filter((album) =>
        fuzzyMatch(
          [
            album.name,
            album.description,
            getHashtagText(album.hashtags)
          ].filter(Boolean).join(' '),
          searchTerm
        )
      )
      .slice(0, 50);

    /* =========================
       ADD OWNERS TO ALBUMS
    ========================= */

    const albumsWithOwners = matchingAlbums.map((album) => {
      const owner = allUsers.find(
        (user) =>
          String(user._id) === String(album.ownerId)
      );

      return {
        ...album,
        owner: owner
          ? {
              _id: owner._id,
              name: owner.name,
              username: owner.username
            }
          : null
      };
    });

    return res.json({
      users,
      posts: postsWithAuthors,
      albums: albumsWithOwners
    });
  } catch (error) {
    console.error('Search error:', error);

    return res.status(500).json({
      error: 'Search failed.'
    });
  }
});


/* =========================
   USER POSTS
========================= */

app.get(
  '/api/users/:id/posts',
  requireLogin,
  async (req, res) => {
    try {
      const user = await getUserById(
        req.params.id
      );

      if (!user) {
        return res.status(404).json({
          message: 'User not found.'
        });
      }

      const currentUser = await getUserById(req.session.userId);

      const isOwnProfile = req.session.userId === user._id;

      const isFriend = (currentUser?.friends || []).includes(user._id);

      if (!isOwnProfile && !isFriend)
      {
        return res.status(403).json({
          message: 'You must be friends to view this user\'s posts.'
        });
      }

      const hiddenPostIds = await getHiddenPostIds();

      const posts = (await getPostsByAuthor(req.params.id))
        .filter(post => !hiddenPostIds.has(post._id));

      const users =
        await getAllUsers();

      const postsWithAuthors =
        posts.map(post => {
          const author = users.find(
            user =>
              user._id === post.authorId
          );

          return {
            ...post,
            author: author
              ? {
                  _id: author._id,
                  name: author.name,
                  username: author.username
                }
              : null
          };
        });

      res.json({
        posts: postsWithAuthors
      });

    } catch (error) {
      console.error(
        'User posts error:',
        error
      );

      res.status(500).json({
        message: 'Unable to load user posts.'
      });
    }
  }
);


/* =========================
   USER FRIENDS
========================= */

app.get(
  '/api/users/:id/friends',
  requireLogin,
  async (req, res) => {
    try {
      const requestedUserId =
        req.params.id;

      const currentUserId =
        req.session.userId;

      const user =
        await getUserById(
          requestedUserId
        );

      if (!user) {
        return res.status(404).json({
          message: 'User not found.'
        });
      }

      /*
        Users may always see their own
        friend list.

        To see another user's friend list,
        the two users must already be friends.
      */

      if (requestedUserId !== currentUserId) {
        const currentUser =
          await getUserById(
            currentUserId
          );

        const areFriends =
          (currentUser?.friends || [])
            .includes(requestedUserId);

        if (!areFriends) {
          return res.status(403).json({
            message:
              'You can only view a User\'s friends if you are already friends.'
          });
        }
      }

      const friends = [];

      for (
        const friendId of
        user.friends || []
      ) {
        const friend =
          await getUserById(
            friendId
          );

        if (friend)
        {
          friends.push({
            _id: friend._id,
            name: friend.name,
            username: friend.username,
            profileImage: friend.profileImage || ''
          });
        }
      }

      res.json({
        friends
      });

    } catch (error) {
      console.error(
        'User friends error:',
        error
      );

      res.status(500).json({
        message: 'Unable to load user friends.'
      });
    }
  }
);


/* =========================
   CURRENT USER FRIENDS
========================= */

app.get(
  '/api/friends',
  requireLogin,
  async (req, res) => {
    try {
      const currentUser =
        await getUserById(
          req.session.userId
        );

      if (!currentUser) {
        return res.status(404).json({
          message: 'User not found.'
        });
      }

      /* =========================
         FRIENDS
      ========================= */

      const friends = [];

      for (
        const friendId of
        currentUser.friends || []
      ) {
        const friend =
          await getUserById(friendId);

        if (friend) {
          const {
            password,
            ...safeFriend
          } = friend;

          friends.push({
            _id: friend._id,
            name: friend.name,
            username: friend.username,
            profileImage: friend.profileImage
          });
        }
      }

      /* =========================
         RECEIVED FRIEND REQUESTS
      ========================= */

      const received = [];

      for (
        const requesterId of
        currentUser.friendRequestsReceived || []
      ) {
        const requester =
          await getUserById(requesterId);

        if (requester) {
          const {
            password,
            ...safeRequester
          } = requester;

          received.push(safeRequester);
        }
      }

      /* =========================
         SENT FRIEND REQUESTS
      ========================= */

      const sent = [];

      for (
        const targetId of
        currentUser.friendRequestsSent || []
      ) {
        const target =
          await getUserById(targetId);

        if (target) {
          const {
            password,
            ...safeTarget
          } = target;

          sent.push(safeTarget);
        }
      }

      res.json({
        friends,
        received,
        sent
      });

    } catch (error) {
      console.error(
        'Friends error:',
        error
      );

      res.status(500).json({
        message: 'Unable to load friends.'
      });
    }
  }
);


/* =========================
   SEND FRIEND REQUEST
========================= */

app.post(
  '/api/users/:id/friend-request',
  requireLogin,
  async (req, res) => {
    try {
      const currentUserId =
        req.session.userId;

      const targetUserId =
        req.params.id;

      if (currentUserId === targetUserId) {
        return res.status(400).json({
          message: 'You cannot send yourself a friend request.'
        });
      }

      const currentUser =
        await getUserById(
          currentUserId
        );

      const targetUser =
        await getUserById(
          targetUserId
        );

      if (!targetUser) {
        return res.status(404).json({
          message: 'User not found.'
        });
      }

      if (
        (currentUser.friends || [])
          .includes(targetUserId)
      ) {
        return res.status(400).json({
          message: 'You are already friends with this user.'
        });
      }

      if (
        (currentUser.friendRequestsSent || [])
          .includes(targetUserId)
      ) {
        return res.status(400).json({
          message: 'Friend request already sent.'
        });
      }

      // Add target to current user's sent requests.
      await updateUser(
        currentUserId,
        {
          friendRequestsSent: [
            ...(currentUser.friendRequestsSent || []),
            targetUserId
          ]
        }
      );

      // Add current user to target's received requests.
      await updateUser(
        targetUserId,
        {
          friendRequestsReceived: [
            ...(targetUser.friendRequestsReceived || []),
            currentUserId
          ]
        }
      );

      res.status(201).json({
        message: 'Friend request sent.'
      });

    } catch (error) {
      console.error(
        'Friend request error:',
        error
      );

      res.status(500).json({
        message: 'Unable to send friend request.'
      });
    }
  }
);

// Favourite a user
app.post(
  '/api/users/:id/favourite',
  requireLogin,
  async (req, res) => {
    try {
      const db = getDB();
      const currentUserId = req.session.userId;
      const targetUserId = req.params.id;

      if (currentUserId === targetUserId) {
        return res.status(400).json({
          error: 'You cannot favourite yourself.'
        });
      }

      const targetUser = await db
        .collection('users')
        .findOne({ _id: targetUserId });

      if (!targetUser) {
        return res.status(404).json({
          error: 'User not found.'
        });
      }

      await db.collection('users').updateOne(
        { _id: currentUserId },
        {
          $addToSet: {
            FavouritePostIds: targetUserId
          }
        }
      );

      res.json({
        message: 'User added to favourites.',
        favourited: true
      });
    } catch (error) {
      console.error('Favourite user error:', error);

      res.status(500).json({
        error: 'Could not favourite user.'
      });
    }
  }
);


// Unfavourite a user
app.delete(
  '/api/users/:id/favourite',
  requireLogin,
  async (req, res) => {
    try {
      const db = getDB();
      const currentUserId = req.session.userId;
      const targetUserId = req.params.id;

      await db.collection('users').updateOne(
        { _id: currentUserId },
        {
          $pull: {
            FavouritePostIds: targetUserId
          }
        }
      );

      res.json({
        message: 'User removed from favourites.',
        favourited: false
      });
    } catch (error) {
      console.error('Unfavourite user error:', error);

      res.status(500).json({
        error: 'Could not remove favourite.'
      });
    }
  }
);


/* =========================
   ACCEPT FRIEND REQUEST
========================= */

app.post(
  '/api/users/:id/accept',
  requireLogin,
  async (req, res) => {
    try {
      const currentUserId =
        req.session.userId;

      const requesterId =
        req.params.id;

      const currentUser =
        await getUserById(
          currentUserId
        );

      const requester =
        await getUserById(
          requesterId
        );

      if (!requester) {
        return res.status(404).json({
          message: 'User not found.'
        });
      }

      if (
        !(currentUser.friendRequestsReceived || [])
          .includes(requesterId)
      ) {
        return res.status(400).json({
          message: 'No friend request found.'
        });
      }

      await updateUser(
        currentUserId,
        {
          friends: [
            ...(currentUser.friends || []),
            requesterId
          ],
          friendRequestsReceived:
            (currentUser.friendRequestsReceived || [])
              .filter(
                id => id !== requesterId
              )
        }
      );

      await updateUser(
        requesterId,
        {
          friends: [
            ...(requester.friends || []),
            currentUserId
          ],
          friendRequestsSent:
            (requester.friendRequestsSent || [])
              .filter(
                id => id !== currentUserId
              )
        }
      );

      res.json({
        message: 'Friend request accepted.'
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Unable to accept friend request.'
      });
    }
  }
);


/* =========================
   DECLINE FRIEND REQUEST
========================= */

app.post(
  '/api/users/:id/decline',
  requireLogin,
  async (req, res) => {
    try {
      const currentUserId =
        req.session.userId;

      const requesterId =
        req.params.id;

      const currentUser =
        await getUserById(
          currentUserId
        );

      const requester =
        await getUserById(
          requesterId
        );

      if (!requester) {
        return res.status(404).json({
          message: 'User not found.'
        });
      }

      if (
        !(currentUser.friendRequestsReceived || [])
          .includes(requesterId)
      ) {
        return res.status(400).json({
          message: 'No friend request found.'
        });
      }

      /* Remove request from current user's received requests */

      await updateUser(
        currentUserId,
        {
          friendRequestsReceived:
            (currentUser.friendRequestsReceived || [])
              .filter(
                id => id !== requesterId
              )
        }
      );

      /* Remove request from requester's sent requests */

      await updateUser(
        requesterId,
        {
          friendRequestsSent:
            (requester.friendRequestsSent || [])
              .filter(
                id => id !== currentUserId
              )
        }
      );

      res.json({
        message: 'Friend request declined.'
      });

    } catch (error) {
      console.error(
        'Decline friend request error:',
        error
      );

      res.status(500).json({
        message: 'Unable to decline friend request.'
      });
    }
  }
);


/* =========================
   UNFRIEND
========================= */

app.delete(
  '/api/users/:id/friend',
  requireLogin,
  async (req, res) => {
    try {
      const currentUserId =
        req.session.userId;

      const friendId =
        req.params.id;

      const currentUser =
        await getUserById(
          currentUserId
        );

      const friend =
        await getUserById(
          friendId
        );

      if (!friend) {
        return res.status(404).json({
          message: 'User not found.'
        });
      }

      await updateUser(
        currentUserId,
        {
          friends:
            (currentUser.friends || [])
              .filter(
                id => id !== friendId
              )
        }
      );

      await updateUser(
        friendId,
        {
          friends:
            (friend.friends || [])
              .filter(
                id => id !== currentUserId
              )
        }
      );

      res.json({
        message: 'Friend removed.'
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Unable to unfriend user.'
      });
    }
  }
);

/* =========================
   POSTS
========================= */

app.get('/api/posts', async (req, res) => {
  try {
    const posts =
      await getAllPosts();

    const users =
      await getAllUsers();

    const currentUserId =
      req.session.userId || null;

    const postsWithAuthors =
      posts.map(post => {
        const author = users.find(
          user =>
            user._id === post.authorId
        );

        const likesArray =
          Array.isArray(post.likes)
            ? post.likes
            : [];

        return {
          ...post,

          likes: likesArray.length,

          liked: currentUserId
            ? likesArray.includes(currentUserId)
            : false,

          author: author
            ? {
                _id: author._id,
                name: author.name,
                username: author.username
              }
            : null
        };
      });

    res.json({
      posts: postsWithAuthors
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Unable to load posts.'
    });
  }
});


app.get('/api/posts/:id', async (req, res) => {
  try {
    const post =
      await getPostById(
        req.params.id
      );

    if (!post) {
      return res.status(404).json({
        message: 'Post not found.'
      });
    }

    const albums = await getAllAlbums();

    const postAlbums = albums
      .filter(album =>
        (album.postIds || []).some(
          postId => String(postId) === String(post._id)
        )
      )
      .map(album => ({
        _id: album._id,
        name: album.name
      }));

    const author =
      await getUserById(
        post.authorId
      );

    const comments =
      await getCommentsByPost(
        post._id
      );

    const reports =
      await countReportsForPost(
        post._id
      );

    const safeAuthor = author
      ? {
          _id: author._id,
          name: author.name,
          username: author.username
        }
      : null;

    const likesArray =
      Array.isArray(post.likes)
        ? post.likes
        : [];

    const currentUserId =
      req.session.userId || null;

    res.json({
      post: {
        ...post,

        likes: likesArray.length,

        liked: currentUserId
          ? likesArray.includes(currentUserId)
          : false,

        author: safeAuthor,
        albums: postAlbums
      },

      comments,
      reportCount: reports
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Unable to load post.'
    });
  }
});

// HIDDEN POSTS (for admins and users who reported posts)
app.get(
  '/api/hidden-posts',
  requireLogin,
  async (req, res) => {
    try {
      const db = getDB();
      const currentUserId = req.session.userId;

      const currentUser = await db
        .collection('users')
        .findOne({
          _id: currentUserId
        });

      if (!currentUser) {
        return res.status(404).json({
          error: 'User not found.'
        });
      }

      const hiddenPostIds = await getHiddenPostIds();

      const query = {
        _id: {
          $in: [...hiddenPostIds]
        }
      };

      // Regular users can only see their own hidden posts.
      // Admins can see all hidden posts.
      if (!currentUser.isAdmin) {
        query.authorId = currentUserId;
      }

      const posts = await db
        .collection('posts')
        .find(query)
        .sort({
          createdAt: -1
        })
        .toArray();

      const activities = await addAuthorsToPosts(
        posts,
        currentUserId
      );

      res.json({
        activities: activities.map(post => ({
          ...post,
          type: 'post'
        }))
      });
    } catch (error) {
      console.error('Hidden posts error:', error);

      res.status(500).json({
        error: 'Could not load hidden posts.'
      });
    }
  }
);


/* =========================
   LIKE / UNLIKE POST
========================= */

app.post(
  '/api/posts/:id/like',
  requireLogin,
  async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.session.userId;

      const posts = getDB().collection('posts');

      const post = await posts.findOne({
        _id: postId
      });

      if (!post) {
        return res.status(404).json({
          message: 'Post not found.'
        });
      }

      const likes = Array.isArray(post.likes)
        ? post.likes
        : [];

      const alreadyLiked =
        likes.includes(userId);

      if (alreadyLiked) {
        // User clicked the filled heart.
        // Remove their ID.
        await posts.updateOne(
          {
            _id: postId
          },
          {
            $pull: {
              likes: userId
            }
          }
        );
      } else {
        // User clicked the empty heart.
        // Add their ID.
        await posts.updateOne(
          {
            _id: postId
          },
          {
            $addToSet: {
              likes: userId
            }
          }
        );
      }

      const updatedPost =
        await posts.findOne({
          _id: postId
        });

      const updatedLikes =
        Array.isArray(updatedPost.likes)
          ? updatedPost.likes
          : [];

      res.json({
        liked: updatedLikes.includes(userId),
        likesCount: updatedLikes.length
      });

    } catch (error) {
      console.error(
        'Like/unlike error:',
        error
      );

      res.status(500).json({
        message: 'Unable to like or unlike post.'
      });
    }
  }
);


app.post(
  '/api/posts',
  requireLogin,
  async (req, res) => {
    try {
      const {
        title,
        description,
        hashtags,
        imageUrl
      } = req.body;

      if (!description) {
        return res.status(400).json({
          message: 'Description is required.'
        });
      }


      const post = {
        _id: makeId('p'),
        authorId: req.session.userId,
        title: title || 'Untitled Post',
        description,
        hashtags: Array.isArray(hashtags)
          ? hashtags
          : [],
        imageUrl: imageUrl || '',
        likes: [],
        createdAt: new Date()
      };



      const createdPost =
        await createPost(post);

      res.status(201).json({
        message: 'Post created.',
        post: createdPost
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Unable to create post.'
      });
    }
  }
);

app.put(
  '/api/posts/:id',
  requireLogin,
  async (req, res) => {
    try {
      const post =
        await getPostById(
          req.params.id
        );

      if (!post) {
        return res.status(404).json({
          message: 'Post not found.'
        });
      }

      if (
        post.authorId !==
        req.session.userId
      ) {
        return res.status(403).json({
          message: 'You can only edit your own posts.'
        });
      }

      const {
        description,
        hashtags
      } = req.body;

      const updatedPost =
        await updatePost(
          req.params.id,
          {
            description,
            hashtags
          }
        );

      res.json({
        message: 'Post updated.',
        post: updatedPost
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Unable to update post.'
      });
    }
  }
);

app.delete(
  '/api/posts/:id',
  requireLogin,
  async (req, res) => {
    try {
      const post = await getPostById(req.params.id);

      if (!post) {
        return res.status(404).json({
          message: 'Post not found.'
        });
      }

      if (post.authorId !== req.session.userId) {
        return res.status(403).json({
          message: 'You can only delete your own posts.'
        });
      }

      // Remove the post from every album containing it.
      const albums = await getAllAlbums();

      for (const album of albums) {
        const postIds = album.postIds || [];

        const containsPost = postIds.some(
          postId => String(postId) === String(post._id)
        );

        if (containsPost) {
          const updatedPostIds = postIds.filter(
            postId => String(postId) !== String(post._id)
          );

          if (updatedPostIds.length === 0) {
            // Delete the album if this was its only post.
            await deleteAlbum(album._id);
          } else {
            // Otherwise, keep the album and update its posts.
            await updateAlbum(album._id, {
              postIds: updatedPostIds
            });
          }
        }
      }

      // Delete the post and its related comments.
      await deletePost(req.params.id);
      await deleteCommentsForPost(req.params.id);

      res.json({
        message: 'Post deleted.'
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Unable to delete post.'
      });
    }
  }
);

/* =========================
   COMMENTS
========================= */

app.get(
  '/api/posts/:id/comments',
  async (req, res) => {
    try {
      const comments =
        await getCommentsByPost(
          req.params.id
        );

      res.json({
        comments
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Unable to load comments.'
      });
    }
  }
);

app.post(
  '/api/posts/:id/comments',
  requireLogin,
  async (req, res) => {
    try {
      const post =
        await getPostById(
          req.params.id
        );

      if (!post) {
        return res.status(404).json({
          message: 'Post not found.'
        });
      }

      const {
        text
      } = req.body;

      if (!text) {
        return res.status(400).json({
          message: 'Comment text is required.'
        });
      }

      const comment = {
        _id: makeId('c'),
        postId: req.params.id,
        authorId: req.session.userId,
        text,
        createdAt: new Date()
      };

      const createdComment =
        await createComment(
          comment
        );

      res.status(201).json({
        message: 'Comment added.',
        comment: createdComment
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Unable to add comment.'
      });
    }
  }
);

app.get(
  '/api/posts/:id/comments/count',
  async (req, res) => {
    try {
      const count = await getCommentCount(req.params.id);

      res.json({ count });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Unable to load comment count.'
      });
    }
  }
);

app.delete(
  '/api/comments/:id',
  requireLogin,
  async (req, res) => {
    try {
      const comment = await getCommentById(req.params.id);

      if (!comment) {
        return res.status(404).json({
          message: 'Comment not found.'
        });
      }

      if (comment.authorId !== req.session.userId) {
        return res.status(403).json({
          message: 'You can only delete your own comments.'
        });
      }

      await deleteComment(req.params.id);

      res.json({
        message: 'Comment deleted successfully.'
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Unable to delete comment.'
      });
    }
  }
);

/* =========================
   ALBUMS
========================= */
app.get('/api/albums', async (req, res) => {
  try {
    const albums =
      await getAllAlbums();

    const users =
      await getAllUsers();

    const posts =
      getDB().collection('posts');

    const hiddenPostIds = await getHiddenPostIds();

    const albumsWithOwners =
      await Promise.all(
        albums.map(async (album) => {
          const owner = users.find(
            user =>
              user._id === album.ownerId
          );

          let coverImage = '';

          if (album.postIds && album.postIds.length > 0)
          {
            const visiblePostIds = album.postIds.filter(
              postId => !hiddenPostIds.has(postId)
            );

            if (visiblePostIds.length > 0) {
              const firstPost = await posts.findOne({
                _id: { $in: visiblePostIds }
              });

              if (firstPost) {
                coverImage = firstPost.imageUrl || '';
              }
            }
          }

          return {
            ...album,

            coverImage,

            owner: owner
              ? {
                  _id: owner._id,
                  name: owner.name,
                  username: owner.username
                }
              : null
          };
        })
      );

    res.json({
      albums: albumsWithOwners
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Unable to load albums.'
    });
  }
});

app.get('/api/albums/hashtag-suggestions', requireLogin, async (req, res) => {
  try {
    const posts = await getPostsByAuthor(req.session.userId);
    const counts = {};

    posts.forEach(post => {
      (post.hashtags || []).forEach(raw => {
        const tag = String(raw).replace(/^#/, '').trim().toLowerCase();
        if (tag) counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    const suggestions = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));

    res.json({ suggestions });
  } catch (error) {
    console.error('Could not build hashtag suggestions:', error);
    res.status(500).json({ message: 'Unable to load suggestions.' });
  }
});

app.get('/api/albums/:id', async (req, res) => {
  try {
    const album = await getAlbumById(req.params.id);

    if (!album) {
      return res.status(404).json({
        message: 'Album not found.'
      });
    }

    const owner = await getUserById(album.ownerId);

    const safeOwner = owner
      ? {
          _id: owner._id,
          name: owner.name,
          username: owner.username
        }
      : null;

    // Get the actual posts belonging to this album.
    
    // Get the actual posts belonging to this album, excluding hidden posts.
    const db = getDB();
    const postIds = album.postIds || [];
    const hiddenPostIds = await getHiddenPostIds();

    const posts = postIds.length > 0
      ? await db.collection('posts')
          .find({
            _id: {
              $in: postIds,
              $nin: [...hiddenPostIds]
            }
          })
          .toArray()
      : [];


    res.json({
      album: {
        ...album,
        owner: safeOwner
      },
      posts
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Unable to load album.'
    });
  }
});


app.post('/api/albums', requireLogin, async (req, res) => {
    try {
      const {
        name,
        description,
        hashtags
      } = req.body;

      if (!name) {
        return res.status(400).json({
          message: 'Album name is required.'
        });
      }

      const album = {
        _id: makeId('a'),
        ownerId: req.session.userId,
        name,
        description: description || '',
        hashtags: Array.isArray(hashtags)
          ? hashtags
          : [],
        postIds: [],
        createdAt: new Date()
      };

      const createdAlbum =
        await createAlbum(
          album
        );

      res.status(201).json({
        message: 'Album created.',
        album: createdAlbum
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Unable to create album.'
      });
    }
  }
);

app.put('/api/albums/:id', requireLogin, async (req, res) => {
    try {
      const album =
        await getAlbumById(
          req.params.id
        );

      if (!album) {
        return res.status(404).json({
          message: 'Album not found.'
        });
      }

      if (
        album.ownerId !==
        req.session.userId
      ) {
        return res.status(403).json({
          message: 'You can only edit your own albums.'
        });
      }

      const updatedAlbum =
        await updateAlbum(
          req.params.id,
          {
            name: req.body.name,
            description: req.body.description,
            hashtags: req.body.hashtags
          }
        );

      res.json({
        message: 'Album updated.',
        album: updatedAlbum
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Unable to update album.'
      });
    }
  }
);

app.delete('/api/albums/:id', requireLogin, async (req, res) => {
    try {
      const album =
        await getAlbumById(
          req.params.id
        );

      if (!album) {
        return res.status(404).json({
          message: 'Album not found.'
        });
      }

      if (
        album.ownerId !==
        req.session.userId
      ) {
        return res.status(403).json({
          message: 'You can only delete your own albums.'
        });
      }

      await deleteAlbum(
        req.params.id
      );

      res.json({
        message: 'Album deleted.'
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Unable to delete album.'
      });
    }
  }
);

// add/remove post from album
app.post('/api/albums/:id/posts/:postId', requireLogin, async (req,res)=>{

  try
  {
    const album = await getAlbumById(req.params.id);

    if(!album)
    {
      return res.status(404).json({message:'Album not found.'});
    }

    const post = await getPostById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found.'
      });
    }

    const hiddenPostIds = await getHiddenPostIds();

    if (hiddenPostIds.has(post._id)) {
      return res.status(403).json({
        message: 'Hidden posts cannot be added to albums.'
      });
    }

    if(album.ownerId !== req.session.userId)
    {
      return res.status(403).json({message:'Not your album.'});
    }

    await getDB().collection('albums').updateOne({_id:album._id},{$addToSet:{postIds:req.params.postId}});
    res.json({message:'Post added.'});
  }
  catch (error)
  {
      console.error(error);

      res.status(500).json({
        message: 'Unable to add post to album.'
      });
    }
  
});


app.delete('/api/albums/:id/posts/:postId', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        message: 'You must be logged in.'
      });
    }

    const album = await getAlbumById(req.params.id);

    if (!album) {
      return res.status(404).json({
        message: 'Album not found.'
      });
    }

    if (String(album.ownerId) !== String(req.session.userId)) {
      return res.status(403).json({
        message: 'You cannot edit this album.'
      });
    }

    const postId = req.params.postId;

    if (!(album.postIds || []).map(String).includes(String(postId))) {
      return res.status(404).json({
        message: 'Post is not in this album.'
      });
    }

    await getDB().collection('albums').updateOne(
      { _id: album._id },
      { $pull: { postIds: postId } }
    );

    res.json({ message: 'Post removed from album.' });
  } catch (error) {
    console.error('Error removing post from album:', error);

    res.status(500).json({
      message: 'Could not remove post from album.'
    });
  }
});


// ==================== ADMIN ROUTES ====================

// Get all users
app.get('/api/admin/users', requireAdmin, async (req, res) =>
{
    try
    {
        const users = await getAllUsers();

        res.json({
            users
        });
    }
    catch (error)
    {
        console.error('Could not load admin users:', error);

        res.status(500).json({
            message: 'Unable to load users.'
        });
    }
});


// Edit any user
app.put('/api/admin/users/:id', requireAdmin, async (req, res) =>
{
    try
    {
        const { name, username, bio, location, profileImage } = req.body;

        const updates = {
            name,
            username,
            bio,
            location,
            profileImage
        };

        const updatedUser = await updateUser(
            req.params.id,
            updates
        );

        if (!updatedUser)
        {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        res.json({
            message: 'User updated successfully.',
            user: updatedUser
        });
    }
    catch (error)
    {
        console.error('Could not update user:', error);

        res.status(500).json({
            message: 'Unable to update user.'
        });
    }
});


// Delete a user as an admin
app.delete('/api/admin/posts/:id', requireAdmin, async (req, res) => {
  try {
    const post = await getPostById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    await deletePost(req.params.id);
    await deleteCommentsForPost(req.params.id);
    await deleteReportsForPost(req.params.id);
    await removePostFromAlbums(req.params.id);

    // Alert the author (unless the admin deleted their own post)
    if (post.authorId !== req.session.userId) {
      const label = post.title || (post.description || '').slice(0, 40);
      await createNotification(
        post.authorId,
        'post_deleted',
        `An administrator removed your post "${label}" because it broke the community guidelines.`
      );
    }

    res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Could not delete admin post:', error);
    res.status(500).json({ message: 'Unable to delete post.' });
  }
});

app.get('/api/notifications', requireLogin, async (req, res) => {
  try {
    const notifications = await getDB()
      .collection('notifications')
      .find({ userId: req.session.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    res.json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load notifications.' });
  }
});

app.post('/api/notifications/read', requireLogin, async (req, res) => {
  try {
    await getDB().collection('notifications').updateMany(
      { userId: req.session.userId, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'Notifications marked as read.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to update notifications.' });
  }
});

app.delete('/api/notifications/:id', requireLogin, async (req, res) => {
  try {
    await getDB().collection('notifications').deleteOne({
      _id: req.params.id,
      userId: req.session.userId
    });
    res.json({ message: 'Notification dismissed.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to dismiss notification.' });
  }
});


// Get all posts
app.get('/api/admin/posts', requireAdmin, async (req, res) =>
{
    try
    {
        const posts = await getAllPosts();

        res.json({
            posts
        });
    }
    catch (error)
    {
        console.error('Could not load admin posts:', error);

        res.status(500).json({
            message: 'Unable to load posts.'
        });
    }
});


// Edit any post
app.put('/api/admin/posts/:id', requireAdmin, async (req, res) =>
{
    try
    {
        const { title, description, hashtags, imageUrl } = req.body;

        const updatedPost = await updatePost(
            req.params.id,
            {
                title,
                description,
                hashtags,
                imageUrl
            }
        );

        if (!updatedPost)
        {
            return res.status(404).json({
                message: 'Post not found.'
            });
        }

        res.json({
            message: 'Post updated successfully.',
            post: updatedPost
        });
    }
    catch (error)
    {
        console.error('Could not update post:', error);

        res.status(500).json({
            message: 'Unable to update post.'
        });
    }
});


// Delete any post

 // Delete any post as an admin
app.delete('/api/admin/posts/:id', requireAdmin, async (req, res) => {
  try {
    const result = await deletePost(req.params.id);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Delete comments belonging to this post
    await deleteCommentsForPost(req.params.id);

    // Delete reports belonging to this post
    await deleteReportsForPost(req.params.id);

    res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Could not delete admin post:', error);
    res.status(500).json({ message: 'Unable to delete post.' });
  }
});



// Delete any activity
app.delete('/api/admin/activity/:id', requireAdmin, async (req, res) =>
{
    try
    {
        const db = getDB();

        const result = await db.collection('activities').deleteOne({
            _id: req.params.id
        });

        if (result.deletedCount === 0)
        {
            return res.status(404).json({
                message: 'Activity not found.'
            });
        }

        res.json({
            message: 'Activity deleted successfully.'
        });
    }
    catch (error)
    {
        console.error('Could not delete activity:', error);

        res.status(500).json({
            message: 'Unable to delete activity.'
        });
    }
});


// Get report reasons
app.get('/api/admin/report-reasons', requireAdmin, async (req, res) =>
{
    try
    {
        const db = getDB();

        const reasons = await db
            .collection('reportReasons')
            .find({})
            .toArray();

        res.json({
            reasons
        });
    }
    catch (error)
    {
        console.error('Could not load report reasons:', error);

        res.status(500).json({
            message: 'Unable to load report reasons.'
        });
    }
});


// Add a new report reason
app.post('/api/admin/report-reasons', requireAdmin, async (req, res) =>
{
    try
    {
        const { reason } = req.body;

        if (!reason || !reason.trim())
        {
            return res.status(400).json({
                message: 'Report reason is required.'
            });
        }

        const db = getDB();

        const newReason = {
            _id: makeId('reason'),
            reason: reason.trim(),
            createdAt: new Date()
        };

        await db.collection('reportReasons').insertOne(
            newReason
        );

        res.status(201).json({
            message: 'Report reason added successfully.',
            reason: newReason
        });
    }
    catch (error)
    {
        console.error('Could not add report reason:', error);

        res.status(500).json({
            message: 'Unable to add report reason.'
        });
    }
});



/* =========================
   REPORT REASONS
========================= */

// Public route: get all reasons for the Post page dropdown
app.get('/api/report-reasons', async (req, res) => {
    try {
        const db = getDB();

        const reasons = await db.collection('reportReasons')
            .find({})
            .sort({ reason: 1 })
            .toArray();

        res.json({ reasons });
    } catch (error) {
        console.error('Could not load report reasons:', error);

        res.status(500).json({
            message: 'Unable to load report reasons.'
        });
    }
});


// Admin route: get all reasons for the Admin page
app.get('/api/admin/report-reasons', requireAdmin, async (req, res) => {
    try {
        const db = getDB();

        const reasons = await db.collection('reportReasons')
            .find({})
            .sort({ reason: 1 })
            .toArray();

        res.json({ reasons });
    } catch (error) {
        console.error('Could not load admin report reasons:', error);

        res.status(500).json({
            message: 'Unable to load report reasons.'
        });
    }
});


// Admin route: add a reason
app.post('/api/admin/report-reasons', requireAdmin, async (req, res) => {
    try {
        const reason = req.body.reason?.trim();

        if (!reason) {
            return res.status(400).json({
                message: 'Please enter a report reason.'
            });
        }

        const db = getDB();
        const collection = db.collection('reportReasons');

        const existingReason = await collection.findOne({
            reason: { $regex: `^${reason.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
        });

        if (existingReason) {
            return res.status(409).json({
                message: 'That report reason already exists.'
            });
        }

        const newReason = {
            reason,
            createdAt: new Date()
        };

        const result = await collection.insertOne(newReason);

        res.status(201).json({
            message: 'Report reason added successfully.',
            reason: {
                _id: result.insertedId,
                ...newReason
            }
        });
    } catch (error) {
        console.error('Could not add report reason:', error);

        res.status(500).json({
            message: 'Unable to add report reason.'
        });
    }
});


// Admin route: delete a reason
app.delete('/api/admin/report-reasons/:id', requireAdmin, async (req, res) => {
    try {
        const { ObjectId } = await import('mongodb');

        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid report reason ID.'
            });
        }

        const db = getDB();

        const result = await db.collection('reportReasons').deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: 'Report reason not found.'
            });
        }

        res.json({
            message: 'Report reason deleted successfully.'
        });
    } catch (error) {
        console.error('Could not delete report reason:', error);

        res.status(500).json({
            message: 'Unable to delete report reason.'
        });
    }
});



/* =========================
   REPORTS
========================= */


/*
    REPORT A POST
*/
app.post(
  '/api/posts/:id/reports',
  requireLogin,
  async (req, res) => {
    try
    {
      const postId = req.params.id;
      const reporterId = req.session.userId;

      const post =
        await getPostById(postId);

      if (!post)
      {
        return res.status(404).json({
          message: 'Post not found.'
        });
      }

      /*
          Users cannot report their own post.
      */
      if (post.authorId === reporterId)
      {
        return res.status(400).json({
          message: 'You cannot report your own post.'
        });
      }

      const {
        reason
      } = req.body;

      if (!reason)
      {
        return res.status(400).json({
          message: 'A report reason is required.'
        });
      }

      /*
          Prevent duplicate reports from
          the same User for the same post.
      */
      const alreadyReported =
        await hasUserReported(
          reporterId,
          'post',
          postId
        );

      if (alreadyReported)
      {
        return res.status(400).json({
          message: 'You have already reported this post.'
        });
      }

      const report = {
        _id: makeId('r'),

        reporterId,

        targetType: 'post',

        targetId: postId,

        reason: reason.trim(),

        createdAt: new Date()
      };

      await createReport(report);

      res.status(201).json({
        message: 'Post reported successfully.',
        report
      });
    }
    catch (error)
    {
      console.error(
        'Report post error:',
        error
      );

      res.status(500).json({
        message: 'Unable to report post.'
      });
    }
  }
);


/*
    REPORT A USER
*/
app.post(
  '/api/users/:id/reports',
  requireLogin,
  async (req, res) => {
    try
    {
      const targetUserId =
        req.params.id;

      const reporterId =
        req.session.userId;

      /*
          Users cannot report themselves.
      */
      if (targetUserId === reporterId)
      {
        return res.status(400).json({
          message: 'You cannot report yourself.'
        });
      }

      const targetUser =
        await getUserById(
          targetUserId
        );

      if (!targetUser)
      {
        return res.status(404).json({
          message: 'User not found.'
        });
      }

      const {
        reason
      } = req.body;

      if (!reason)
      {
        return res.status(400).json({
          message: 'A report reason is required.'
        });
      }

      /*
          Prevent duplicate User reports.
      */
      const alreadyReported =
        await hasUserReported(
          reporterId,
          'user',
          targetUserId
        );

      if (alreadyReported)
      {
        return res.status(400).json({
          message: 'You have already reported this User.'
        });
      }

      const report = {
        _id: makeId('r'),

        reporterId,

        targetType: 'user',

        targetId: targetUserId,

        reason: reason.trim(),

        createdAt: new Date()
      };

      await createReport(report);

      res.status(201).json({
        message: 'User reported successfully.',
        report
      });
    }
    catch (error)
    {
      console.error(
        'Report User error:',
        error
      );

      res.status(500).json({
        message: 'Unable to report User.'
      });
    }
  }
);


// User asks to be verified
app.post('/api/verification-request', requireLogin, async (req, res) => {
  try {
    const user = await getUserById(req.session.userId);

    if (user.verified) {
      return res.status(400).json({ message: 'Your account is already verified.' });
    }
    if (user.verificationStatus === 'pending') {
      return res.status(400).json({ message: 'You already have a pending request.' });
    }

    await getDB().collection('users').updateOne(
      { _id: user._id },
      { $set: { verificationStatus: 'pending', verificationRequestedAt: new Date() } }
    );

    res.json({
      message: 'Verification request sent.',
      verificationStatus: 'pending'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to send verification request.' });
  }
});

// Admin: list pending requests
app.get('/api/admin/verification-requests', requireAdmin, async (req, res) => {
  try {
    const users = await getDB()
      .collection('users')
      .find({ verificationStatus: 'pending' })
      .project({ password: 0 })
      .sort({ verificationRequestedAt: 1 })
      .toArray();

    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load verification requests.' });
  }
});

// Admin: approve
app.post('/api/admin/users/:id/verify', requireAdmin, async (req, res) => {
  try {
    const result = await getDB().collection('users').updateOne(
      { _id: req.params.id },
      { $set: { verified: true, verificationStatus: 'approved' } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await createNotification(
      req.params.id,
      'verification_approved',
      'Your account has been verified. A verified badge now appears on your profile.'
    );

    res.json({ message: 'User verified.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to verify user.' });
  }
});

// Admin: reject
app.post('/api/admin/users/:id/reject-verification', requireAdmin, async (req, res) => {
  try {
    const result = await getDB().collection('users').updateOne(
      { _id: req.params.id },
      { $set: { verified: false, verificationStatus: 'rejected' } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await createNotification(
      req.params.id,
      'verification_rejected',
      'Your verification request was not approved. You can submit a new request later.'
    );

    res.json({ message: 'Verification request rejected.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to reject request.' });
  }
});


/*
    ADMIN: GET ALL REPORTS
*/
app.get(
    '/api/admin/reports',
    requireAdmin,
    async (req, res) =>
    {
        try
        {
            const reports = await getAllReports();

            const enrichedReports =
                await Promise.all(
                    reports.map(async report =>
                    {
                        const reporter =
                            await getUserById(
                                report.reporterId
                            );

                        let target = null;

                        if (
                            report.targetType === 'post'
                        )
                        {
                            const post =
                                await getPostById(
                                    report.targetId
                                );

                            if (post)
                            {
                                const author =
                                    await getUserById(
                                        post.authorId
                                    );

                                target = {
                                    ...post,
                                    author: author
                                        ? {
                                            _id: author._id,
                                            name: author.name,
                                            username:
                                                author.username
                                        }
                                        : null
                                };
                            }
                        }

                        if (
                            report.targetType === 'user'
                        )
                        {
                            const targetUser =
                                await getUserById(
                                    report.targetId
                                );

                            if (targetUser)
                            {
                                const {
                                    password,
                                    ...safeUser
                                } = targetUser;

                                target = safeUser;
                            }
                        }

                        return {
                            ...report,

                            reporter: reporter
                                ? {
                                    _id: reporter._id,
                                    name: reporter.name,
                                    username:
                                        reporter.username
                                }
                                : null,

                            target
                        };
                    })
                );

            res.json({
                reports: enrichedReports
            });
        }
        catch (error)
        {
            console.error(
                'Could not load admin reports:',
                error
            );

            res.status(500).json({
                message:
                    'Unable to load reports.'
            });
        }
    }
);


/* =========================
   ADMIN ALBUMS
========================= */

// Get all albums
app.get('/api/admin/albums', requireAdmin, async (req, res) => {
  try {
    const albums = await getAllAlbums();
    const users = await getAllUsers();

    const albumsWithOwners = albums.map(album => {
      const owner = users.find(
        user => user._id === album.ownerId
      );

      return {
        ...album,
        owner: owner
          ? {
              _id: owner._id,
              name: owner.name,
              username: owner.username
            }
          : null
      };
    });

    res.json({
      albums: albumsWithOwners
    });
  } catch (error) {
    console.error('Could not load admin albums:', error);

    res.status(500).json({
      message: 'Unable to load albums.'
    });
  }
});


// Delete any album as an admin
app.delete('/api/admin/albums/:id', requireAdmin, async (req, res) => {
  try {
    const album = await getAlbumById(req.params.id);

    if (!album) {
      return res.status(404).json({
        message: 'Album not found.'
      });
    }

    await deleteAlbum(req.params.id);

    res.json({
      message: 'Album deleted successfully.'
    });
  } catch (error) {
    console.error('Could not delete admin album:', error);

    res.status(500).json({
      message: 'Unable to delete album.'
    });
  }
});



/* =========================
   START SERVER
========================= */

async function startServer() {
  try
  {
    await connectDB();

    app.listen(
      PORT,
      '0.0.0.0',
      () => {
        console.log(
          `Server running on port ${PORT}`
        );
      }
    );

  } 
  catch (error)
  {
    console.error('Could not start server:', error);
    process.exit(1);
  }
}

startServer();