async function loadHotels() {
    const name = document.getElementById('search-name').value;
    const city = document.getElementById('search-city').value;
    const state = document.getElementById('search-state').value;

    try {
        if ((name == '') && (city == '') && (state == '')) {
            alert('Please enter at least one search criteria.');
            return;
        }
        const response = await fetch(`http://localhost:3000/hotels?name=${name}&city=${city}&state=${state}`);
        if (!response.ok) { 
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const hotels = await response.json();
        if (hotels.length === 0) { 
            alert('No hotels found for the given search criteria.');
        }
        displayHotels(hotels);
    } catch (error) {
        console.error('Error fetching hotels:', error);
        alert('No hotels found for the given search criteria.');
    }
}

function displayHotels(hotels) {
  const hotelList = document.getElementById('hotel-list');
  hotelList.innerHTML = '';

  hotels.forEach(hotel => {
      const div = document.createElement('div');
      div.id = `hotel-${hotel.id}`;
      div.innerHTML = `<strong>${hotel.name}</strong> (ID: ${hotel.id}) - ${hotel.address}, ${hotel.city}, ${hotel.state}, ${hotel.phone} 
          <br><br><button onclick="showUpdateForm(${hotel.id}, '${hotel.name}', '${hotel.address}', '${hotel.city}', '${hotel.state}', '${hotel.phone}')">Update</button>
          <br><br><button onclick="deleteHotel(${hotel.id})">Delete</button>`;
      hotelList.appendChild(div);
  });
}

function showUpdateForm(id, name, address, city, state, phone) {
  const form = document.getElementById('hotel-form');
  form.reset();
  document.getElementById('name').value = name;
  document.getElementById('address').value = address;
  document.getElementById('city').value = city;
  document.getElementById('state').value = state;
  document.getElementById('phone').value = phone;

  form.onsubmit = async (event) => {
      event.preventDefault();
      await updateHotel(id);
  };    
}

async function updateHotel(id) {
  const name = document.getElementById('name').value;
  const address = document.getElementById('address').value;
  const city = document.getElementById('city').value;
  const state = document.getElementById('state').value;
  const phone = document.getElementById('phone').value;

  try {
      const response = await fetch(`http://localhost:3000/hotels/${id}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, address, city, state, phone }),
      });

      if (!response.ok) {
          const errorResponse = await response.json();
          alert(errorResponse.message);
          return;
      }
      alert('Hotel updated successfully');
      loadHotels();
  } catch (error) {
      console.error('Error updating hotel:', error);
  }
}

async function deleteHotel(id) {
  if (!confirm('Are you sure you want to delete this hotel?')) return;

  try {
      const response = await fetch(`http://localhost:3000/hotels/${id}`, {
          method: 'DELETE',
      });

      if (response.ok) {
          const hotelDiv = document.getElementById(`hotel-${id}`);
          hotelDiv.remove();
          alert('Hotel deleted successfully.');
      } else {
          alert('Failed to delete hotel.');
      }
  } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Error deleting hotel.');
  }
}

document.getElementById('hotel-form').onsubmit = async (event) => {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const address = document.getElementById('address').value;
  const city = document.getElementById('city').value;
  const state = document.getElementById('state').value;
  const phone = document.getElementById('phone').value;

  try {
      const response = await fetch('http://localhost:3000/hotels', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, address, city, state, phone }),
      });

      if (!response.ok) {
          const errorResponse = await response.json();
          alert(errorResponse.message);
          return;
      }

      const result = await response.json();
      alert(`Hotel added successfully with ID: ${result.hotelId}`);
      loadHotels();
  } catch (error) {
      console.error('Error adding hotel:', error);
  }
};

document.getElementById('search-button').addEventListener('click', loadHotels);
document.getElementById('show-all-hotels').onclick = async () => {
    try {
        const response = await fetch('http://localhost:3000/hotels');
        if (!response.ok) {
            throw new Error('Failed to fetch hotels');
        }
        const hotels = await response.json();
        if (hotels.length === 0) {
            alert('No hotels found.');
        } else {
            displayHotels(hotels);
        }
    } catch (error) {
        console.error('Error fetching hotels:', error);
        alert('Error fetching hotels.');
    }
};
