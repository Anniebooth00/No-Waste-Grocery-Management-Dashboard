document.addEventListener("DOMContentLoaded", () => {
    const uploadButton = document.querySelector("#upload-receipt-button");
    const groceryListElement = document.querySelector("#grocery-list");
    const recipeListElement = document.querySelector("#recipe-list");

    uploadButton.addEventListener("click", () => {
        // Placeholder for file input
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                await scanReceipt(file);
            }
        };
        fileInput.click();
    });

    const scanReceipt = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("https://api.spoonacular.com/food/images/analyze", {
                method: "POST",
                headers: {
                    "x-api-key": "YOUR_SPOONACULAR_API_KEY",
                },
                body: formData,
            });

            const data = await response.json();
            const text = data.text; // Assuming the API returns the scanned text in a property called 'text'
            await detectFoodItems(text);
        } catch (error) {
            console.error("Error scanning receipt:", error);
        }
    };

    const detectFoodItems = async (text) => {
        try {
            const response = await fetch("https://api.spoonacular.com/food/detect", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": "YOUR_SPOONACULAR_API_KEY",
                },
                body: JSON.stringify({ text: text }),
            });

            const data = await response.json();
            displayGroceryItems(data.annotations);
            checkExpirationDates(data.annotations);
        } catch (error) {
            console.error("Error detecting food items:", error);
        }
    };

    const displayGroceryItems = (items) => {
        groceryListElement.innerHTML = "";
        items.forEach((item) => {
            const listItem = document.createElement("li");
            listItem.textContent = `${item.annotation} - Quantity: 1`; // You might want to adjust the quantity logic
            groceryListElement.appendChild(listItem);
        });
    };

    const checkExpirationDates = async (items) => {
        const expirationData = await fetchShelfLifeData(items);
        displayExpirationDates(expirationData);
        fetchRecipesBasedOnItems(items);
    };

    const fetchShelfLifeData = async (items) => {
        const promises = items.map(async (item) => {
            const response = await fetch(`https://shelf-life-api.herokuapp.com/search?q=${item.annotation}`);
            const data = await response.json();
            const expiration = data.guides && data.guides[0] ? data.guides[0].shelfLife : "Unknown";
            return {
                ...item,
                expiration,
            };
        });
        return Promise.all(promises);
    };

    const displayExpirationDates = (items) => {
        groceryListElement.innerHTML = "";
        items.forEach((item) => {
            const listItem = document.createElement("li");
            listItem.textContent = `${item.annotation} - Expires in: ${item.expiration}`;
            groceryListElement.appendChild(listItem);
        });
    };

    const fetchRecipesBasedOnItems = async (items) => {
        const ingredients = items.map(item => item.annotation).join(",");
        try {
            const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=5&apiKey=YOUR_SPOONACULAR_API_KEY`);
            const data = await response.json();
            displayRecipes(data);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        }
    };

    const displayRecipes = (recipes) => {
        recipeListElement.innerHTML = "";
        recipes.forEach((recipe) => {
            const listItem = document.createElement("li");
            listItem.textContent = recipe.title;
            recipeListElement.appendChild(listItem);
        });
    };
});

$(function(){
    $('#orderModal').modal({
        keyboard: true,
        backdrop: "static",
        show:false,
    }).on('show', function(){
          var getIdFromRow = $(this).data('orderid');
        //make your ajax call populate items or what even you need
        $(this).find('#orderDetails').html($('<b> Order Id selected: ' + getIdFromRow  + '</b>'))
    });
    $(".table-striped").find('tr[data-target]').on('click', function(){
        //or do your operations here instead of on show of modal to populate values to modal.
         $('#orderModal').data('orderid',$(this).data('id'));
    });
});

function refreshTimer() {
    function countDown() {
        setTimeout(function (now) {
            var dif = (td - now) / 1000,
                ss = Math.floor(dif % 60).toString().padStart(2, "0"),
                ms = Math.floor(dif / 60 % 60).toString().padStart(2, "0"),
                hs = Math.floor(dif / 3600 % 24).toString().padStart(2, "0"),
                ds = Math.floor(dif / 86400).toString().padStart(3, "0");
            remainingTime.textContent = dif > 0 ? `${ds} Days ${hs}:${ms}:${ss}` : "Product Expired!";
            active && countDown();
            this.removeEventListener("change", kill); // possibly redundant
        }, 1000, Date.now());
    }
    var td = new Date(this.value),
        active = true,
        kill = _ => active = false;
    this.addEventListener("change", kill);
    countDown();
}
document.addEventListener("DOMContentLoaded", function () {
    var targetDateTime = document.getElementById("targetDateTime");
    var remainingTime = document.getElementById("remainingTime");
    targetDateTime.addEventListener("change", refreshTimer);
});
  $('#expirationDate').datepicker({
    changeMonth: true,
    changeYear: true,
  });

// Add script to handle user input in modal
const productLabel = document.querySelector("#productLabel");
const expirationDate = document.querySelector("#expirationDate");
const iconDropdown = document.querySelector("#iconDropdown");
const addBtn = document.querySelector(".add");
const productCards = document.querySelector("#product-cards");

let selectedIcon = ''; // Starting state of the selected icon

// Get the dropdown button and dropdown items
const dropdownButton = document.querySelector('#iconDropdown');
const dropdownItems = document.querySelectorAll('.dropdown-item');

// Listen for click events on the dropdown items
dropdownItems.forEach(item => {
  item.addEventListener('click', (event) => {
    event.preventDefault();

    // Get the icon's class
    const iconClass = event.target.querySelector('i').className;

    // Set the icon as the content of the button
    dropdownButton.innerHTML = `<i class="${iconClass}"></i>`;

    // Set the selected icon
    selectedIcon = iconClass;
  });
});

productCards.classList.add('bg-beige', 'text-dark', 'rounded', 'p-3');
addBtn.classList.add('border-light', 'btn', 'btn-outline-light');

// Load items from local storage when the page loads
document.addEventListener("DOMContentLoaded", () => {
    const items = JSON.parse(localStorage.getItem("items")) || [];
    items.forEach(item => {
        const card = document.createElement("div");
        card.classList.add('card', 'mb-3');
        card.innerHTML = `
        <div class="card-body d-flex align-items-center justify-content-between" style="font-family: 'Neue Montreal-Regular', Helvetica;">
            <i class="${item.icon}"></i>
            <h5 class="card-title">${item.product}</h5>
            <h5 class="card-text">${item.date}</h5>
            <button class="delete btn btn-danger">Delete</button>
        </div>
        `;
        productCards.appendChild(card);
    });
});

addBtn.addEventListener("click", (event) => {
    event.preventDefault();

    const product = productLabel.value;
    const date = expirationDate.value;
    const icon = selectedIcon; // Use the selected icon

    const card = document.createElement("div");
    card.classList.add('card', 'mb-3');
    card.innerHTML = `
        <div class="card-body d-flex align-items-center justify-content-between">
            <i class="${icon}"></i>
            <h5 class="card-title">${product}</h5>
            <h5 class="card-text">Expires On: ${date}</h5>
            <h5 class="card-text remainingTime"></h5>
            <button class="delete btn btn-danger">Delete</button>
        </div>
    `;
    productCards.appendChild(card);

    // Start the countdown timer for this card
    const remainingTimeElement = card.querySelector(".remainingTime");
    refreshTimer(date, remainingTimeElement);

    // Store the item in local storage
    const items = JSON.parse(localStorage.getItem("items")) || [];
    items.push({ product, date, icon });
    localStorage.setItem("items", JSON.stringify(items));

    productLabel.value = "";
    expirationDate.value = "";
    selectedIcon = ''; // Reset the selected icon

    // Reset the dropdown button text to "Select Icon"
    dropdownButton.innerHTML = 'Select Icon';
});

function refreshTimer(expirationDate, remainingTimeElement) {
    function countDown() {
        var now = Date.now();
        var dif = (new Date(expirationDate) - now) / 1000,
            ds = Math.floor(dif / 86400).toString().padStart(2, "0");
        remainingTimeElement.textContent = dif > 0 ? `${ds} Day(s) left!` : "Product Expired!";
        if (dif > 0) setTimeout(countDown, 1000);
    }
    countDown();
}

document.addEventListener("DOMContentLoaded", () => {
    const items = JSON.parse(localStorage.getItem("items")) || [];
    items.forEach(item => {
        const card = document.createElement("div");
        card.classList.add('card', 'mb-3');
        card.innerHTML = `
        <div class="card-body d-flex align-items-center justify-content-between">
            <i class="${item.icon}"></i>
            <h5 class="card-title">${item.product}</h5>
            <h5 class="card-text">Expires On: ${item.date}</h5>
            <h5 class="card-text remainingTime"></h5>
            <button class="delete btn btn-danger">Delete</button>
        </div>
        `;
        productCards.appendChild(card);

        // Start the countdown timer for this card
        const remainingTimeElement = card.querySelector(".remainingTime");
        refreshTimer(item.date, remainingTimeElement);
    });
});

productCards.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete")) {
        event.target.parentElement.parentElement.remove();
        // Remove the item from local storage
        const product = event.target.parentElement.firstChild.textContent;
        let items = JSON.parse(localStorage.getItem("items")) || [];
        items = items.filter(item => item.product !== product);
        localStorage.setItem("items", JSON.stringify(items));
    }
});