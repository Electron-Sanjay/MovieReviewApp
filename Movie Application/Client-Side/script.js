const API_BASE_URL = 'http://localhost:8080/api/movies';
const REVIEW_API_URL = 'http://localhost:8080/api/reviews';

// Fetch all movies
async function fetchMovies() {
    try {
        const response = await fetch(API_BASE_URL);
        const movies = await response.json();
        displayMovies(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

// Display movies
function displayMovies(movies) {
    const container = document.getElementById('movies-container');
    if (!container) {
        console.error('Movies container not found');
        return;
    }
    container.innerHTML = '';
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie-card');
        movieElement.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title} poster" class="movie-poster">
            <h3>${movie.title}</h3>
            <p>${movie.releaseDate}</p>
        `;
        movieElement.addEventListener('click', () => fetchMovieDetails(movie.imdbId));
        container.appendChild(movieElement);
    });
}

// Fetch movie details
async function fetchMovieDetails(imdbId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${imdbId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const movie = await response.json();
        if (!movie) {
            throw new Error('No data received from the server');
        }
        displayMovieDetails(movie);
    } catch (error) {
        console.error('Error fetching movie details:', error);
        const detailsElement = document.getElementById('movie-details');
        if (detailsElement) {
            detailsElement.innerHTML = '<p>Error loading movie details. Please try again later.</p>';
        }
    }
}

// Display movie details
function displayMovieDetails(movie) {
    const movieList = document.getElementById('movie-list');
    const movieDetails = document.getElementById('movie-details');
    const movieTitle = document.getElementById('movie-title');
    const movieDescription = document.getElementById('movie-description');
    const trailerContainer = document.getElementById('trailer-container');
    const addReviewBtn = document.getElementById('add-review-btn');

    if (!movieList || !movieDetails || !movieTitle || !movieDescription || !trailerContainer || !addReviewBtn) {
        console.error('One or more required elements not found');
        return;
    }

    movieList.classList.add('hidden');
    movieDetails.classList.remove('hidden');
    
    movieTitle.textContent = movie.title || 'Title not available';
    movieDescription.textContent = movie.description || 'Description not available';
    
    if (movie.trailerLink) {
        const embedUrl = getYouTubeEmbedUrl(movie.trailerLink);
        trailerContainer.innerHTML = embedUrl 
            ? `<iframe width="560" height="315" src="${embedUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
            : '<p>Trailer not available</p>';
    } else {
        trailerContainer.innerHTML = '<p>Trailer not available</p>';
    }
    
    displayReviews(movie.reviews);
    
    addReviewBtn.onclick = () => showReviewForm(movie.imdbId);
}

// Helper function to convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

// Display reviews
function displayReviews(reviews) {
    const container = document.getElementById('reviews-container');
    if (!container) {
        console.error('Reviews container not found');
        return;
    }
    container.innerHTML = '';
    
    if (Array.isArray(reviews) && reviews.length > 0) {
        reviews.forEach(review => {
            if (review && review.body) {
                const reviewElement = document.createElement('div');
                reviewElement.classList.add('review');
                reviewElement.textContent = review.body;
                container.appendChild(reviewElement);
            }
        });
    } else {
        container.innerHTML = '<p>No reviews available for this movie.</p>';
    }
}

// Show review form
function showReviewForm(imdbId) {
    const form = document.getElementById('review-form');
    const reviewForm = document.getElementById('new-review-form');
    if (!form || !reviewForm) {
        console.error('Review form not found');
        return;
    }
    form.classList.remove('hidden');
    reviewForm.onsubmit = (e) => {
        e.preventDefault();
        submitReview(imdbId);
    };
}

// Submit review
async function submitReview(imdbId) {
    const reviewText = document.getElementById('review-text');
    const form = document.getElementById('review-form');
    if (!reviewText || !form) {
        console.error('Review text input or form not found');
        return;
    }
    const reviewBody = reviewText.value;
    try {
        const response = await fetch(`${REVIEW_API_URL}/${imdbId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                reviewBody: reviewBody,
                imdbId: imdbId
            }),
        });
        
        if (response.ok) {
            const savedReview = await response.json();
            console.log('Review saved:', savedReview);
            
            // Immediately add the new review to the display
            const reviewsContainer = document.getElementById('reviews-container');
            const newReviewElement = document.createElement('div');
            newReviewElement.classList.add('review');
            newReviewElement.textContent = reviewBody;
            reviewsContainer.appendChild(newReviewElement);
            
            // Remove the "No reviews available" message if it exists
            const noReviewsMessage = reviewsContainer.querySelector('p');
            if (noReviewsMessage && noReviewsMessage.textContent === 'No reviews available for this movie.') {
                noReviewsMessage.remove();
            }
            
            form.classList.add('hidden');
            reviewText.value = ''; // Clear the form
            alert('Review submitted successfully!');
            
            // Refresh movie details to ensure all data is up to date
            await fetchMovieDetails(imdbId);
        } else {
            const errorText = await response.text();
            throw new Error(`Server responded with ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert(`Error submitting review: ${error.message}`);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    fetchMovies();
});