function showSidebar(){
    const sidebar = document.querySelector(".sidebar")
    sidebar.style.display = "flex"
}

function hideSidebar(){
    const sidebar = document.querySelector(".sidebar")
    sidebar.style.display = "none"
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

    return true;
}



