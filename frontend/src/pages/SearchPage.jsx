import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import SearchInput from '../components/SearchInput';
import ProfilePreview from '../components/ProfilePreview';

function SearchPage() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('q') || '';

  const results = [
    {
      id: 2,
      name: 'Jemma Smith',
      troop: '8th Pretoria • South Africa',
      mutualFriends: 12
    },
    {
      id: 3,
      name: 'Jemma Brown',
      troop: 'Pretoria Scouts • South Africa',
      mutualFriends: 8
    }
  ];

  return (
    <div>

      <Header />

      <main className="container">

        <h1 className="page-title">
          Search
        </h1>

        <SearchInput />

        <h2>
          Search Results
          {query && ` ("${query}")`}
        </h2>

        <div className="search-tabs">
          <button>Users</button>
          <button>Posts</button>
          <button>Albums</button>
          <button>Hashtags</button>
        </div>

        {results.map((user) => (
          <ProfilePreview
            key={user.id}
            user={user}
            actionLabel="Add"
          />
        ))}

      </main>

    </div>
  );
}

export default SearchPage;