import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import rawReviewsData from './cochrane_reviews.json';

function App() {
  const reviewsData = useMemo(() => rawReviewsData.flat(), []);
  const [reviews, setReviews] = useState([]);
  const [visibleReviews, setVisibleReviews] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Extract unique topics from all the reviewsData
  const uniqueTopics = useMemo(() => {
    const topics = new Set(reviewsData.map(review => review.topic).filter(Boolean));
    return Array.from(topics).sort();
  }, [reviewsData]);

  useEffect(() => {
    const validReviews = reviewsData.filter(review => 
      review && review.url && review.topic && review.title && review.author && review.date
    );
    setReviews(validReviews);
  }, [reviewsData]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
        setVisibleReviews(prevVisible => prevVisible + 10);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setSuggestions([]);
    } else {
      const filteredSuggestions = uniqueTopics.filter(topic =>
        topic.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    }
  };

  const handleSuggestionClick = (topic) => {
    setSearchTerm(topic);
    setSuggestions([]);
    setVisibleReviews(10); // Reset visible reviews when a new topic is selected
  };

  const filteredReviews = reviews.filter(review => 
    review && review.topic && review.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="App">
      <header>
        <h1>Cochrane Library</h1>
      </header>
      <div className="search-container">
        <input
          type="text"
            placeholder="Search by topic 🔍 "
          value={searchTerm}
          onChange={handleSearch}
          style={{ borderColor: '#962d91' }}
        />
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((suggestion, index) => (
              <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="review-list">
        {filteredReviews.slice(0, visibleReviews).map((review, index) => (
          <div key={index} className="review-item">
            <a href={review.url} target="_blank" rel="noopener noreferrer">{review.title}</a>
            <p>{review.author}</p>
            <p style={{ color: '#962d91' }}>{review.date}</p>
            <p>{review.topic}</p>
          </div>
        ))}
      </div>
      {visibleReviews < filteredReviews.length && (
        <div className="loading">Loading more reviews...</div>
      )}
    </div>
  );
}

export default App;