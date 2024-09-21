$(document).ready(function () {
    const cardsPerPage = 100;
    let currentPage = 1;
    let totalPages = 0;
    let allData = [];  // To hold all the card data

    const baseUrl1 = 'https://ik.imagekit.io/Cartel/1/';
    const baseUrl2 = 'https://ik.imagekit.io/Cartel/2/';

    // Function to open the modal with the clicked card's data
    function openModal(item) {
        const modalHtml = `
            <div class="modal-overlay"></div>
            <div class="modal-card">
                <h3>${item.name}</h3>
                <img src="${item.imageUrl}" alt="${item.name}" width="272" height="360">
                <p>Rank: ${item.rank}</p>
                <button class="close-modal">Close</button>
            </div>
        `;
        $('body').append(modalHtml);

        // Close the modal when clicking the close button or the overlay
        $('.close-modal, .modal-overlay').click(function () {
            $('.modal-card, .modal-overlay').remove();
        });
    }

    // Function to render cards
    function renderCards(data) {
        const cardsGrid = $('#cardsGrid');
        cardsGrid.empty();

        data.forEach(item => {
            let imageUrl;
            const cleanImageName = item.image.replace(/^\//, '');
            const imageNumber = parseInt(cleanImageName.replace('.png', ''), 10);

            if (imageNumber > 0 && imageNumber <= 5000) {
                imageUrl = `${baseUrl1}${cleanImageName}`;
            } else if (imageNumber > 5000) {
                imageUrl = `${baseUrl2}${cleanImageName}`;
            }

            const cardHtml = `
                <div class="card" data-image-url="${imageUrl}" data-name="${item.name}" data-rank="${item.rank}">
                    <h3>${item.name}</h3>
                    <img src="${imageUrl}" alt="${item.name}" width="136" height="180">
                    <p>Rank: ${item.rank}</p>
                </div>
            `;
            cardsGrid.append(cardHtml);
        });

        // Add click event to open modal when a card is clicked
        $('.card').off('click').on('click', function () {
            const cardData = {
                name: $(this).data('name'),
                rank: $(this).data('rank'),
                imageUrl: $(this).data('image-url')
            };
            openModal(cardData);
        });
    }

    // Fetch the external JSON file and initialize the data
    $.getJSON('json/sorteddata.json', function (data) {
        allData = data;
        allData.sort((a, b) => a.rank - b.rank);
        totalPages = Math.ceil(allData.length / cardsPerPage);

        // Initial render of all cards
        renderCards(allData);
    });

    // Search functionality
    $('#searchButton').on('click', function () {
        const searchTerm = $('#searchBar').val().trim();

        // Check if the search term is a valid number
        if (searchTerm !== "" && !isNaN(searchTerm)) {
            const filteredData = allData.filter(item => item.name.includes(`#${searchTerm}`));
            
            if (filteredData.length > 0) {
                renderCards(filteredData);
            } else {
                alert("No items found with that number.");
            }
        } else {
            alert("Please enter a valid item number.");
        }
    });

    // Optional: Handle pressing "Enter" in the search bar
    $('#searchBar').on('keypress', function (e) {
        if (e.which === 13) {
            $('#searchButton').click();  // Trigger search on pressing Enter
        }
    });
});