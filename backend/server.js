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
  deleteCommentsForPost
} from './repositories/commentRepository.js';

import {
  createReport,
  countReportsForPost
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

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
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

    let userIds = [];

    /*
      LOCAL FEED:
      Current user + friends

      GLOBAL FEED:
      All users
    */
    if (scope === 'global') {
      const allUsers = await db
        .collection('users')
        .find(
          {},
          {
            projection: {
              _id: 1
            }
          }
        )
        .toArray();

      userIds = allUsers.map(
        user => user._id
      );
    } else {
      userIds = [
        currentUser._id,
        ...(currentUser.friends || [])
      ];
    }

    /* =========================
       POSTS

       IMPORTANT:
       Posts use authorId
       NOT userId
    ========================= */

    let posts;

    if (sort === 'popular') {
      posts = await db
        .collection('posts')
        .find({
          authorId: {
            $in: userIds
          }
        })
        .sort({
          likes: -1
        })
        .toArray();
    } else {
      posts = await db
        .collection('posts')
        .find({
          authorId: {
            $in: userIds
          }
        })
        .sort({
          createdAt: -1
        })
        .toArray();
    }

    const activities =
      await addAuthorsToPosts(posts, req.session.userId);

    /* =========================
       ALBUMS

       IMPORTANT:
       Albums use ownerId
       NOT userId
    ========================= */

    const albums = await db
      .collection('albums')
      .find({
        ownerId: {
          $in: userIds
        }
      })
      .sort({
        createdAt: -1
      })
      .toArray();

    const albumActivities =
      await Promise.all(
        albums.map(async (album) => {
          const author = await db
            .collection('users')
            .findOne(
              {
                _id: album.ownerId
              },
              {
                projection: {
                  password: 0
                }
              }
            );

          return {
            ...album,
            type: 'album',
            author
          };
        })
      );

    const postActivities =
      activities.map(post => ({
        ...post,
        type: 'post'
      }));

    let combinedActivities = [
      ...postActivities,
      ...albumActivities
    ];

    /* =========================
       SORT COMBINED FEED
    ========================= */

    if (sort === 'popular') {
      combinedActivities.sort(
        (a, b) => {
          const aValue =
            a.type === 'post'
              ? a.likes || 0
              : a.postIds?.length || 0;

          const bValue =
            b.type === 'post'
              ? b.likes || 0
              : b.postIds?.length || 0;

          return bValue - aValue;
        }
      );
    } else {
      combinedActivities.sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );
    }

    res.json({
      scope,
      sort,
      activities: combinedActivities
    });

  } catch (error) {
    console.error(
      'Feed error:',
      error
    );

    res.status(500).json({
      error: 'Could not load feed.'
    });
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
  try {
    const user =
      await getUserById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    const {
      password,
      ...safeUser
    } = user;

    const currentUserId =
      req.session.userId || null;

    const isOwnUser =
      currentUserId === user._id;

    let isFriend = false;
    let friendRequestSent = false;
    let friendRequestReceived = false;

    if (currentUserId) {
      const currentUser =
        await getUserById(
          currentUserId
        );

      if (currentUser) {
        isFriend =
          (currentUser.friends || [])
            .includes(user._id);

        friendRequestSent =
          (currentUser.friendRequestsSent || [])
            .includes(user._id);

        friendRequestReceived =
          (currentUser.friendRequestsReceived || [])
            .includes(user._id);
      }
    }

    res.json({
      user: {
        ...safeUser,

        isOwnUser,
        isFriend,
        friendRequestSent,
        friendRequestReceived
      }
    });

  } catch (error) {
    console.error(error);

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
   SEARCH
========================= */

app.get(
  '/api/search',
  requireLogin,
  async (req, res) => {
    try {
      const searchTerm =
        (req.query.q || '').trim();

      if (!searchTerm) {
        return res.json({
          users: [],
          posts: [],
          albums: []
        });
      }

      const regex =
        new RegExp(searchTerm, 'i');

      /* =========================
         USERS

         Search by:
         - name
         - username
      ========================= */

      const users =
        await getDB()
          .collection('users')
          .find(
            {
              $or: [
                { name: regex },
                { username: regex }
              ]
            },
            {
              projection: {
                password: 0
              }
            }
          )
          .toArray();

      /* =========================
         POSTS

         Search by:
         - title
         - description
         - hashtags
      ========================= */

      const posts =
        await getDB()
          .collection('posts')
          .find({
            $or: [
              { title: regex },
              { description: regex },
              { hashtags: regex }
            ]
          })
          .toArray();

      /* =========================
         ADD AUTHORS TO POSTS
      ========================= */

      const postsWithAuthors =
        await Promise.all(
          posts.map(async (post) => {
            const author =
              await getDB()
                .collection('users')
                .findOne(
                  {
                    _id: post.authorId
                  },
                  {
                    projection: {
                      password: 0
                    }
                  }
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
          })
        );

      /* =========================
         ALBUMS

         Search by:
         - name
         - description
         - hashtags
      ========================= */

      const albums =
        await getDB()
          .collection('albums')
          .find({
            $or: [
              { name: regex },
              { description: regex },
              { hashtags: regex }
            ]
          })
          .toArray();

      /* =========================
         ADD OWNERS TO ALBUMS
      ========================= */

      const albumsWithOwners =
        await Promise.all(
          albums.map(async (album) => {
            const owner =
              await getDB()
                .collection('users')
                .findOne(
                  {
                    _id: album.ownerId
                  },
                  {
                    projection: {
                      password: 0
                    }
                  }
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
          })
        );

      res.json({
        users,
        posts: postsWithAuthors,
        albums: albumsWithOwners
      });

    } catch (error) {
      console.error(
        'Search error:',
        error
      );

      res.status(500).json({
        error: 'Search failed.'
      });
    }
  }
);


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

      const posts =
        await getPostsByAuthor(
          req.params.id
        );

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

        if (friend) {
          const {
            password,
            ...safeFriend
          } = friend;

          friends.push(safeFriend);
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

          friends.push(safeFriend);
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

        author: safeAuthor
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
          message: 'You can only delete your own posts.'
        });
      }

      await deletePost(
        req.params.id
      );

      await deleteCommentsForPost(
        req.params.id
      );

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

    const albumsWithOwners =
      await Promise.all(
        albums.map(async (album) => {
          const owner = users.find(
            user =>
              user._id === album.ownerId
          );

          let coverImage = '';

          if (
            album.postIds &&
            album.postIds.length > 0
          ) {
            const firstPost =
              await posts.findOne({
                _id: album.postIds[0]
              });

            if (firstPost) {
              coverImage =
                firstPost.imageUrl || '';
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


app.get('/api/albums/:id', async (req, res) => {
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

    const owner =
      await getUserById(
        album.ownerId
      );

    const safeOwner = owner
      ? {
          _id: owner._id,
          name: owner.name,
          username: owner.username
        }
      : null;

    res.json({
      album: {
        ...album,
        owner: safeOwner
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Unable to load album.'
    });
  }
});

app.post(
  '/api/albums',
  requireLogin,
  async (req, res) => {
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

app.put(
  '/api/albums/:id',
  requireLogin,
  async (req, res) => {
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

app.delete(
  '/api/albums/:id',
  requireLogin,
  async (req, res) => {
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

/* =========================
REPORT REASONS
========================= */

app.get(
'/api/report-reasons',
requireLogin,
(req, res) => {
res.json({
reasons: [
'Spam',
'Harassment',
'Inappropriate content',
'False information',
'Copyright violation',
'Other'
]
});
}
);


/* =========================
   REPORTS
========================= */

app.post(
  '/api/posts/:id/reports',
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
        post.authorId ===
        req.session.userId
      ) {
        return res.status(400).json({
          message: 'You cannot report your own post.'
        });
      }

      const {
        reason
      } = req.body;

      if (!reason) {
        return res.status(400).json({
          message: 'A report reason is required.'
        });
      }

      const report = {
        _id: makeId('r'),
        postId: req.params.id,
        reporterId: req.session.userId,
        reason,
        createdAt: new Date()
      };

      await createReport(
        report
      );

      res.status(201).json({
        message: 'Post reported.'
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Unable to report post.'
      });
    }
  }
);

/* =========================
   START SERVER
========================= */

async function startServer() {
  try {
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

  } catch (error) {
    console.error(
      'Could not start server:',
      error
    );
  }
}

startServer();