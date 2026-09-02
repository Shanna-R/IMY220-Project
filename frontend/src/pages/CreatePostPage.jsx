import Header from '../components/Header';
import CreatePost from '../components/CreatePost';

function CreatePostPage() {
  return (
    <div>
      <Header />

      <main className="container">
        <CreatePost />
      </main>
    </div>
  );
}

export default CreatePostPage;