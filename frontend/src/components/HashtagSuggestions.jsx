import { useEffect, useState } from 'react';

function HashtagSuggestions({ value, onChange }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetch('/api/albums/hashtag-suggestions', { credentials: 'include' })
      .then(response => response.json())
      .then(data => setSuggestions(data.suggestions || []))
      .catch(() => setSuggestions([]));
  }, []);

  const current = value
    .split(',')
    .map(tag => tag.trim().replace(/^#/, '').toLowerCase())
    .filter(Boolean);

  const available = suggestions.filter(item => !current.includes(item.tag));

  function addTag(tag) {
    const base = value.trim().replace(/,$/, '');
    onChange(base ? `${base}, ${tag}` : tag);
  }

  if (available.length === 0) return null;

  return (
    <div className="mt-2 mb-3">
      <p className="text-sm opacity-80">Suggested from your most-used hashtags:</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {available.map(item => (
          <button
            key={item.tag}
            type="button"
            onClick={() => addTag(item.tag)}
            className="rounded-full border border-[#d4a537] px-3 py-1 text-sm hover:bg-[#d4a537] hover:text-white"
          >
            #{item.tag} ({item.count})
          </button>
        ))}
      </div>
    </div>
  );
}

export default HashtagSuggestions;