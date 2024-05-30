


function showSidebar(){
    const sidebar = document.querySelector(".sidebar")
    sidebar.style.display = 'flex'
}

function hideSidebar(){
    const sidebar = document.querySelector(".sidebar")
    sidebar.style.display = 'none'
}


document.addEventListener("DOMContentLoaded", function() {
    const tables = document.querySelectorAll('.table');
    const tableIdInput = document.getElementById('table-id');
    const guestNumberID = document.getElementById("guests");

    tables.forEach(table => {
        table.addEventListener('click', function() {

            tables.forEach(t => t.classList.remove('selected'));
            this.classList.add('selected');
            tableIdInput.value = this.classList[1].substring(1);
            guestNumberID.value = this.dataset.seats;
        });
    });


    const clearButton = document.getElementById('clear-reservation');
    clearButton.addEventListener('click', function() {
        localStorage.removeItem('form');
        document.getElementById('reservation-message').textContent = '';
        hideClearButtonAndMessage();
        tables.forEach(table => table.classList.remove('reserved'));
        history.pushState({}, document.title, window.location.href); // reloads the page so the reservation-message disappears
    });

    const storedData = localStorage.getItem('form');
    if (!storedData) {
        hideClearButtonAndMessage();
    }

});

function validateForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const guests = document.getElementById('guests').value;
    const tableId = document.getElementById('table-id').value;



    if (!name || !email || !phone || !date || !time || !guests) {
        alert('Please fill in all fields.');
        return false;
    }

    const phonePattern = /^[0-9]{10}$/;
    if (!phone.match(phonePattern)) {
        alert('Please enter a valid 10-digit phone number.');
        return false;
    }

    const guestsNumber = parseInt(guests, 10);
    if (guestsNumber <= 0) {
        alert('Please enter a valid number of guests.');
        return false;
    }
    if(guestsNumber > 10){
        alert('For reservations of more than 10 people, please visit the restaurant in person.')
        return false;
    }

    const inputDate = new Date(date);
    const currentDate = new Date();

    currentDate.setHours(0, 0, 0, 0);

    if (inputDate < currentDate) {
        alert('Please enter a date that is today or in the future.');
        return false;
    }

    return true;
}

const form = document.querySelector('form');

form.addEventListener('submit', (e) => {

    e.preventDefault();
    const fd = new FormData(form);

    const obj = Object.fromEntries(fd);
    const json = JSON.stringify(obj);
    localStorage.setItem('form',json);
    displayReservationMessage();

    fetch('/reserve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: json
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Reservation successful!');
            } else {
                alert('Reservation failed.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Reservation failed.');
        });


});



function displayReservationMessage() {
    const storedData = localStorage.getItem('form');
    if (storedData) {
        const reservation = JSON.parse(storedData);
        const message = `
                You have a reservation for ${reservation.name} at table ${reservation.table_id} on ${reservation.date} at ${reservation.time}\n
            `;
        const messageDiv = document.getElementById('reservation-message');
        messageDiv.textContent = message;
        showClearButtonAndMessage();

        const reservedTable = document.querySelector(`.table.t${reservation.table_id}`);
        if(reservedTable){
            reservedTable.classList.add('reserved');
        }


    }
    else{
        hideClearButtonAndMessage();
    }
}

function showClearButtonAndMessage() {
    const clearButton = document.getElementById('clear-reservation');
    const messageDiv = document.getElementById('reservation-message');
    clearButton.style.display = 'block';
    messageDiv.style.display = 'block';
}


function hideClearButtonAndMessage() {
    const clearButton = document.getElementById('clear-reservation');
    const messageDiv = document.getElementById('reservation-message');
    clearButton.style.display = 'none';
    messageDiv.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', displayReservationMessage);


function reservationConfirmation(){
    const storedData = localStorage.getItem('form');
    if(!storedData){
        console.error('No reservation data found in localStorage');
        return;
    }
    const reservation = JSON.parse(storedData);

    const reservationTime = new Date(reservation.date + 'T' + reservation.time);

    const reminderTime = new Date(reservationTime.getTime() - (60 * 60 * 1000));

    const currentTime = new Date();

    if(currentTime >= reminderTime){
        alert('You have a reservation today!')
    }
}

setInterval(reservationConfirmation, 60 * 60 * 1000);

