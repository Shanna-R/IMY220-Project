import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchInput({ placeholder = 'Search...' }) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    if(!search.trim()) {
      return;
    }

    navigate(`/search?q=${encodeURIComponent(search)}`);
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={placeholder}
      />

      <button className="btn btn-primary">
        Search
      </button>
    </form>
  );
}

export default SearchInput;