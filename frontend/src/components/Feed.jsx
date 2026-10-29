import PostPreview from './PostPreview';
import AlbumCard from './AlbumCard';

function Feed({ activities, scope }) {
  return (
    <section className="feed">
      {activities.map((activity) => {
        if (activity.type === 'album') {
          return (
            <AlbumCard
              key={`album-${activity._id}`}
              album={activity}
            />
          );
        }

        return (
          <PostPreview
            key={`post-${activity._id}`}
            post={activity}
            scope={scope}
          />
        );
      })}
    </section>
  );
}

export default Feed;