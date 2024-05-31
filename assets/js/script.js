// Get the modal element
const modal = document.getElementById('itemModal');
const btn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const addItemBtn = document.getElementById('addItemBtn');
const itemNameInput = document.getElementById('itemName');
const quantityInput = document.getElementById('quantity');
const expDateInput = document.getElementById('expDate');
const iconDropdownButton = document.getElementById('iconDropdown');
const dropdownItems = document.querySelectorAll('.dropdown-item');
const sampleImage = document.getElementById('sampleImage');

// Category containers
const beveragesCategory = document.querySelector('#beveragesCategory .items');
const fruitsCategory = document.querySelector('#fruitsCategory .items');
const vegetablesCategory = document.querySelector('#vegetablesCategory .items');
const animalProductsCategory = document.querySelector('#animalProductsCategory .items');

// Load items from local storage when the page loads
document.addEventListener('DOMContentLoaded', loadItemsFromLocalStorage);

// When the user clicks the button, open the modal
btn.onclick = function() {
    modal.style.display = 'block';
}

// When the user clicks on the close button, close the modal
closeModalBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Increment & Decrement
document.getElementById('decreaseBtn').addEventListener('click', function() {
    var currentValue = parseInt(quantityInput.value);
    if (!isNaN(currentValue) && currentValue > 1) {
        quantityInput.value = currentValue - 1;
    }
});

document.getElementById('increaseBtn').addEventListener('click', function() {
    var currentValue = parseInt(quantityInput.value);
    if (!isNaN(currentValue)) {
        quantityInput.value = currentValue + 1;
    }
});

// Dropdown icon selection
dropdownItems.forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault();
        const selectedIcon = this.querySelector('i').cloneNode(true); // Clone the icon element
        iconDropdownButton.innerHTML = ''; // Clear existing content
        iconDropdownButton.appendChild(selectedIcon); // Append the selected icon
    });
});

// Handle form submission
addItemBtn.addEventListener('click', function(event) {
    event.preventDefault();
    
    const itemName = itemNameInput.value;
    const quantity = quantityInput.value;
    const expDate = new Date(expDateInput.value);
    const selectedIconHtml = iconDropdownButton.innerHTML;
    const selectedIconClass = iconDropdownButton.querySelector('i').className;

    if (itemName && quantity && expDate && selectedIconHtml) {
        // Hide the gif
        sampleImage.style.display = 'none';

        // Create item object with unique id
        const item = {
            id: Date.now(), // Unique identifier
            name: itemName,
            quantity: quantity,
            expDate: expDate.toISOString(),
            iconHtml: selectedIconHtml,
            iconClass: selectedIconClass
        };

        // Save item to local storage
        saveItemToLocalStorage(item);

        // Clear the form fields
        itemNameInput.value = '';
        quantityInput.value = '1';
        expDateInput.value = '';
        iconDropdownButton.innerHTML = 'Select Icon';

        // Close the modal
        modal.style.display = 'none';

        // Add item to the page
        addItemToPage(item);
    } else {
        alert('Please fill out all fields and select an icon.');
    }
});

function saveItemToLocalStorage(item) {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    items.push(item);
    localStorage.setItem('items', JSON.stringify(items));
}

function loadItemsFromLocalStorage() {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    if (items.length > 0) {
        sampleImage.style.display = 'none';
    }
    items.forEach(addItemToPage);
}

function addItemToPage(item) {
    // Create a new item element with a unique id
    const itemElement = document.createElement('div');
    itemElement.classList.add('item');
    itemElement.setAttribute('data-id', item.id); // Set unique id attribute
    itemElement.innerHTML = `
        <div class="item-icon">${item.iconHtml}</div>
        <div class="item-details">
            <div class="item-name">${item.name}</div>
            <div class="item-quantity">Quantity: ${item.quantity}</div>
            <div class="item-expdate" data-expdate="${item.expDate}"></div>
        </div>
    `;

    // Append the new item to the corresponding category
    if (item.iconClass.includes('fa-wine-bottle')) {
        beveragesCategory.appendChild(itemElement);
    } else if (item.iconClass.includes('fa-apple-alt')) {
        fruitsCategory.appendChild(itemElement);
    } else if (item.iconClass.includes('fa-carrot')) {
        vegetablesCategory.appendChild(itemElement);
    } else if (item.iconClass.includes('fa-drumstick-bite')) {
        animalProductsCategory.appendChild(itemElement);
    }

    // Start countdown
    startCountdown(itemElement.querySelector('.item-expdate'), new Date(item.expDate));
}

function startCountdown(element, expDate) {
    let timer; // Declare timer variable
    function updateCountdown() {
        const now = new Date();
        const timeDiff = expDate - now;
        if (timeDiff <= 0) {
            element.innerHTML = `Expired <button class="delete-btn">Delete</button>`;
            element.classList.add('expired');
            clearInterval(timer);

            // Add delete button event listener
            const deleteBtn = element.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                const itemElement = deleteBtn.closest('.item');
                const itemId = itemElement.getAttribute('data-id'); // Get unique id
                removeItemFromLocalStorage(itemId);
                itemElement.remove();
            });
        } else {
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            if (days > 0) {
                element.textContent = `Expires in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
            } else {
                element.textContent = `Expires in: ${hours}h ${minutes}m ${seconds}s`;
            }
        }
    }

    updateCountdown();
    timer = setInterval(updateCountdown, 1000); // Initialize timer variable
}

function removeItemFromLocalStorage(itemId) {
    let items = JSON.parse(localStorage.getItem('items')) || [];
    items = items.filter(item => item.id != itemId); // Filter by unique id
    localStorage.setItem('items', JSON.stringify(items));
}
