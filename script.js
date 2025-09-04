// Get references to all necessary DOM elements(Elements)
const depIataInput = document.getElementById('depIata');
const arrIataInput = document.getElementById('arrIata');
const flightDateInput = document.getElementById('flightDate'); // <-- ADD THIS LINE
const flightNumberInput = document.getElementById('flightNumber'); // NEW: Get reference to the flight number input
const searchBtn = document.getElementById('searchBtn');
const swapBtn = document.getElementById('swapBtn'); // Assuming you might add this button back
const flightDataContainer = document.getElementById('flightData');
const messageDiv = document.getElementById('message');


const API_KEY = '20c2ee983697333376c95d614acbb07c'; 

// --- START: Interactive Form Logic (NEW SECTION) ---
// This entire section adds the smart disabling/enabling of input fields

const handleRouteInput = () => {
    if (depIataInput.value.trim() !== '' || arrIataInput.value.trim() !== '') {
        flightNumberInput.disabled = true;
        flightNumberInput.value = ''; // Clear the other input
    } else {
        flightNumberInput.disabled = false;
    }
};


const handleFlightNumberInput = () => {
    if (flightNumberInput.value.trim() !== '') {
        depIataInput.disabled = true;
        arrIataInput.disabled = true;
        depIataInput.value = ''; // Clear the other inputs
        arrIataInput.value = '';
    } else {
        depIataInput.disabled = false;
        arrIataInput.disabled = false;
    }
};
//when event is triggered on input field the function is called

depIataInput.addEventListener('input', handleRouteInput);
arrIataInput.addEventListener('input', handleRouteInput);
flightNumberInput.addEventListener('input', handleFlightNumberInput);
// --- END: Interactive Form Logic ---


// Function to show a message to the user (Your existing code)
// updates the message div with text and color class
const showMessage = (text, colorClass) => {
    messageDiv.textContent = text; 
    messageDiv.className = `message ${colorClass}`;
};

// Function to create and display a single flight card (Your existing code)
const createFlightCard = (flight) => {
    const formatTime = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            // Using Indian locale for time display
            return date.toLocaleString('en-IN', {
                dateStyle: 'short',
                timeStyle: 'short',
            });
        } catch {
            return 'N/A';
        }
    };
// Destructure necessary flight details
    const { departure, arrival, airline, flight_status, flight: flightInfo } = flight;
    const flightCard = document.createElement('div');
    flightCard.className = 'flight-card';
    flightCard.innerHTML = `
        <div class="flight-card-header">
            <div class="flight-info">${airline.name} - ${flightInfo.iata || flightInfo.number}</div>
            <div class="flight-status">${flight_status.toUpperCase()}</div>
        </div>
        <div class="flight-details-grid">
            <div class="detail-item">Route: <strong>${departure.airport} (${departure.iata}) to ${arrival.airport} (${arrival.iata})</strong></div>
            <div class="detail-item">Scheduled Departure: <strong>${formatTime(departure.scheduled)}</strong></div>
            <div class="detail-item">Estimated Arrival: <strong>${formatTime(arrival.estimated)}</strong></div>
            ${departure.gate ? `<div class="detail-item">Departure Gate: <strong>${departure.gate}</strong></div>` : ''}
            ${arrival.baggage ? `<div class="detail-item">Baggage Claim: <strong>${arrival.baggage}</strong></div>` : ''}
        </div>
    `;
    return flightCard;
};


// Main function to triggers, fetches and display flight data (MODIFIED)
const fetchFlights = async (searchParams) => {
    flightDataContainer.innerHTML = ''; // Clear previous results
    showMessage('Fetching flight data...', 'text-blue');

    // Build the API URL with the provided search parameters
    const params = new URLSearchParams({
        access_key: API_KEY,
        ...searchParams
    });
    const apiUrl = `https://api.aviationstack.com/v1/flights?${params.toString()}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.info || 'API request failed.');
        }

        if (!data.data || data.data.length === 0) {
            showMessage('No flights found for your search.', 'text-gray');
            return;
        }

        data.data.forEach(flight => {
            const flightCard = createFlightCard(flight);
            flightDataContainer.appendChild(flightCard);
        });

        showMessage(`Found ${data.data.length} results.`, 'text-green');
    } catch (error) {
        console.error('Fetch error:', error);
        showMessage(`Error: ${error.message || 'Failed to fetch flight data.'}`, 'text-red');
    }
};

// NEW: Main handler function for the search button click
const handleSearch = () => {
    const depValue = depIataInput.value.trim();
    const arrValue = arrIataInput.value.trim();
    const flightNumValue = flightNumberInput.value.trim();

    if (flightNumValue) {
        // If flight number is provided, search by flight number
        fetchFlights({ flight_iata: flightNumValue, limit: 5 });
    } else if (depValue && arrValue) {
        // If route is provided, search by route
        fetchFlights({ dep_iata: depValue, arr_iata: arrValue, limit: 10 });
    } else {
        // If neither is valid, show an error
        showMessage('Please enter a "From" and "To" destination, OR a "Flight Number".', 'text-red');
    }
};


// MODIFIED: Event listeners
searchBtn.addEventListener('click', handleSearch);



// Scroll-based navbar search (Your existing code)
// ... (no changes needed here, can be left as is) ...