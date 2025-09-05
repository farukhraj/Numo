// location-search.js

document.addEventListener('DOMContentLoaded', () => {
    const locationInput = document.getElementById('location');
    const autocompleteList = document.getElementById('autocomplete-list');
    let debounceTimer;

    locationInput.addEventListener('input', () => {
        // Clear previous timer and suggestions
        clearTimeout(debounceTimer);
        autocompleteList.innerHTML = '';
        
        const query = locationInput.value.trim();
        
        if (query.length < 3) {
            return;
        }
        
        // Wait for 300ms after user stops typing
        debounceTimer = setTimeout(() => {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    data.forEach(place => {
                        const item = document.createElement('div');
                        item.className = 'autocomplete-item';
                        item.textContent = place.display_name;
                        item.addEventListener('click', () => {
                            locationInput.value = place.display_name;
                            autocompleteList.innerHTML = ''; // Clear suggestions after selection
                        });
                        autocompleteList.appendChild(item);
                    });
                })
                .catch(error => console.error('Error fetching location data:', error));
        }, 300); 
    });

    // Close autocomplete when clicking anywhere else on the page
    document.addEventListener('click', function (e) {
        if (e.target !== locationInput) {
            autocompleteList.innerHTML = '';
        }
    });
});
