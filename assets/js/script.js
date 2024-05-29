document.addEventListener("DOMContentLoaded", () => {
    const uploadButton = document.querySelector("#upload-receipt-button");
    const groceryListElement = document.querySelector("#grocery-list");
    const recipeListElement = document.querySelector("#recipe-list");

    // uploadButton.addEventListener("click", () => {
    //     // Placeholder for file input
    //     const fileInput = document.createElement("input");
    //     fileInput.type = "file";
    //     fileInput.accept = "image/*";
    //     fileInput.onchange = async (event) => {
    //         const file = event.target.files[0];
    //         if (file) {
    //             await scanReceipt(file);
    //         }
    //     };
    //     fileInput.click();
    // });

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

    // Get the modal element
    const modal = document.getElementById('itemModal');
    const btn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');


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

});

// Increment & Decrement
document.getElementById('decreaseBtn').addEventListener('click', function() {
    var quantityInput = document.getElementById('quantity');
    var currentValue = parseInt(quantityInput.value);
    if (!isNaN(currentValue) && currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });

  document.getElementById('increaseBtn').addEventListener('click', function() {
    var quantityInput = document.getElementById('quantity');
    var currentValue = parseInt(quantityInput.value);
    if (!isNaN(currentValue)) {
      quantityInput.value = currentValue + 1;
    }
  });

// Dropdown icon selection
const dropdownItems = document.querySelectorAll('.dropdown-item');
const iconDropdownButton = document.getElementById('iconDropdown');

dropdownItems.forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault();
        const selectedIcon = this.querySelector('i').cloneNode(true); // Clone the icon element
        iconDropdownButton.innerHTML = ''; // Clear existing content
        iconDropdownButton.appendChild(selectedIcon); // Append the selected icon
    });
});