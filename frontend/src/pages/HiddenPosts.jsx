
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';
import Feed from '../components/Feed';

function HiddenPosts() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHiddenPosts() {
      try {
        const response = await fetch('/api/hidden-posts', {
          credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'Could not load hidden posts.'
          );
        }

        setActivities(data.activities || []);
      } 
      catch (error)
      {
        setError(error.message);
      } 
      finally
      {
        setLoading(false);
      }
    }

    loadHiddenPosts();
  }, []);

  return (
    <div className="page">

      <Header />

      <main className="container">

        <h1 className="page-title">
          Hidden Posts
        </h1>

        <p className="text-gray-600 mb-5">
          These posts were hidden from the normal feed
          because they received at least three reports.
        </p>

        <div className="mb-6">
          <Link
            to="/"
            className="inline-block rounded-md bg-[#e3d8c3] px-3 py-1.5 text-sm font-medium text-[#5c5143] transition-colors hover:bg-[#d5c6ad] hover:text-[#4a4035]"
          >
            Back to Home
          </Link>
        </div>

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        {loading ? (
          <p className="loading">
            Loading hidden posts...
          </p>
        ) : activities.length === 0 ? (
          <div className="empty-state">
            <p>
              You have no hidden posts.
            </p>
          </div>
        ) : (
          <Feed activities={activities} />
        )}

      </main>

    </div>
  );
}

export default HiddenPosts;