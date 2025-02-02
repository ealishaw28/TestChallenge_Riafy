(function() {
  // Function to fetch available slots from the backend
  const fetchAvailableSlots = async (date) => {
    try {
      // Convert DD-MM-YYYY to YYYY-MM-DD format
      const formattedDate = convertDateToBackendFormat(date);
      
      const response = await fetch(`/available_slots?date=${formattedDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }
      const data = await response.json();
      console.log('Fetched available slots:', data);  // Log the fetched slots
      return data;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  };

  // Function to convert DD-MM-YYYY to YYYY-MM-DD format
  const convertDateToBackendFormat = (date) => {
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`;  // Convert to YYYY-MM-DD format
  };

  // Function to update available slots dropdown
  const updateAvailableSlots = async (date) => {
    const slots = await fetchAvailableSlots(date);
    console.log('Updating available slots dropdown with:', slots);  // Log before updating

    const selectElement = document.getElementById('time-slot');
    
    // Clear existing options
    selectElement.innerHTML = '';

    if (slots.length === 0) {
      const noSlotsOption = document.createElement('option');
      noSlotsOption.textContent = 'No slots available';
      selectElement.appendChild(noSlotsOption);
      return;
    }

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Select Time Slot';
    selectElement.appendChild(defaultOption);

    // Add available slots
    slots.forEach((slot) => {
      const option = document.createElement('option');
      option.value = slot;
      option.textContent = slot;
      selectElement.appendChild(option);
    });
  };

  // Handle form submission
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time-slot').value;

    if (!name || !phone || !date || !time) {
      alert("Please fill in all fields.");
      return;
    }

    const response = await fetch('/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, date, time_slot: time }),
    });

    const data = await response.json();
    const messageElement = document.getElementById('message');
    
    if (data.message) {
      messageElement.textContent = data.message;
      messageElement.style.color = 'green';
    } else {
      messageElement.textContent = data.error;
      messageElement.style.color = 'red';
    }
  };

  // Event listener to update slots when a date is selected
  document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    dateInput.addEventListener('change', (event) => {
      console.log('Date selected:', event.target.value);  // Log selected date
      updateAvailableSlots(event.target.value);
    });

    const form = document.getElementById('appointment-form');
    form.addEventListener('submit', handleFormSubmit);
  });
})();
