import { useState } from 'react';

const initialComments = [
  {
    user: 'Jemma',
    text: 'Looks like an amazing trip!',
    time: '2 hours ago'
  },
  {
    user: 'Alex',
    text: 'Great photos!',
    time: '3 hours ago'
  },
  {
    user: 'Sam',
    text: 'Wish I could have joined!',
    time: 'Yesterday'
  }
];

function Comments() {
  const [comments, setComments] =
    useState(initialComments);

  const [newComment, setNewComment] =
    useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (!newComment.trim()) {
      return;
    }

    setComments([
      ...comments,
      {
        user: 'Shanna',
        text: newComment,
        time: 'Just now'
      }
    ]);

    setNewComment('');
  }

  return (
    <section>

      <h2>Comments</h2>

      {comments.map((comment, index) => (
        <div className="comment" key={index}>

          <div className="avatar">
            👤
          </div>

          <div>
            <strong>{comment.user}</strong>
            <p>{comment.text}</p>
            <small>{comment.time}</small>
          </div>

        </div>
      ))}

      <form
        className="comment-form"
        onSubmit={handleSubmit}
      >

        <input
          value={newComment}
          onChange={(event) =>
            setNewComment(event.target.value)
          }
          placeholder="Leave a comment..."
        />

        <button className="btn btn-primary">
          Post
        </button>

      </form>

    </section>
  );
}

export default Comments;