$(document).ready(function () {
    const cardsPerPage = 100;
    let currentPage = 1;
    let totalPages = 0;
    let allData = [];  // To store all the card data
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

        // Render pagination after fetching data
        renderPaginationControls();
    });

    // Search functionality (dynamic filtering)
    $('#searchBar').on('input', function () {
        const searchTerm = $(this).val().trim();

        // Filter cards based on item number in name
        if (searchTerm !== "") {
            const filteredData = allData.filter(item => item.name.includes(`#${searchTerm}`));
            renderCards(filteredData);
        } else {
            // If search is empty, show all cards again
            renderCards(allData);
        }
    });

    // Pagination logic (adjusts for mobile and desktop)
    function renderPaginationControls() {
        const paginationContainer = $('#pagination');
        paginationContainer.empty();

        const maxVisiblePages = $(window).width() <= 768 ? 3 : 10;  // Mobile: 3 visible, Desktop: 10 visible
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust start and end if near the limits
        if (currentPage <= Math.floor(maxVisiblePages / 2)) {
            startPage = 1;
            endPage = maxVisiblePages;
        } else if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
            startPage = Math.max(1, totalPages - maxVisiblePages + 1);
            endPage = totalPages;
        }

        // Previous button
        if (currentPage > 1) {
            paginationContainer.append(`<button class="page-btn" data-page="${currentPage - 1}">Prev</button>`);
        }

        // Page number buttons
        for (let i = startPage; i <= endPage && i <= totalPages; i++) {
            const activeClass = (i === currentPage) ? 'active' : '';
            paginationContainer.append(`
                <button class="page-btn ${activeClass}" data-page="${i}">${i}</button>
            `);
        }

        // Next button
        if (currentPage < totalPages) {
            paginationContainer.append(`<button class="page-btn" data-page="${currentPage + 1}">Next</button>`);
        }

        // Add click event to page buttons
        $('.page-btn').off('click').on('click', function () {
            currentPage = $(this).data('page');
            renderPage(currentPage);
        });
    }

    // Function to render a specific page
    function renderPage(page) {
        currentPage = page;
        const start = (page - 1) * cardsPerPage;
        const end = start + cardsPerPage;
        const paginatedData = allData.slice(start, end);
        renderCards(paginatedData);

        // Update pagination controls
        renderPaginationControls();
    }

    // Re-render pagination when window is resized
    $(window).resize(renderPaginationControls);
});