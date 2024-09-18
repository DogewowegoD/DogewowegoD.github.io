$(document).ready(function () {
  const cardsPerPage = 100;
  let currentPage = 1;
  let totalPages = 0;
  const maxVisiblePages = 10;  // Number of visible page buttons

  const baseUrl1 = 'https://ik.imagekit.io/Cartel/1/';
  const baseUrl2 = 'https://ik.imagekit.io/Cartel/2/';

  // Function to open the modal with the clicked card's data
  function openModal(item) {
      const modalHtml = `
          <div class="modal-overlay"></div>
          <div class="modal-card">
              <b><h3>${item.name}</h3></b>
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

  // Fetch the external JSON file
  $.getJSON('json/sorteddata.json', function (data) {
      data.sort((a, b) => a.rank - b.rank);
      totalPages = Math.ceil(data.length / cardsPerPage);

      function renderPage(page) {
          const start = (page - 1) * cardsPerPage;
          const end = start + cardsPerPage;
          const paginatedData = data.slice(start, end);
          const cardsGrid = $('#cardsGrid');
          cardsGrid.empty();

          paginatedData.forEach(item => {
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

          renderPaginationControls();
      }

      // Function to render pagination controls
      function renderPaginationControls() {
          const paginationContainer = $('#pagination');
          paginationContainer.empty();

          let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
          let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

          // Adjust start and end if near the limits
          if (currentPage > totalPages - Math.floor(maxVisiblePages / 2)) {
              startPage = Math.max(1, totalPages - maxVisiblePages + 1);
              endPage = totalPages;
          }

          // Previous button
          if (currentPage > 1) {
              paginationContainer.append(`<button class="page-btn" data-page="${currentPage - 1}">Prev</button>`);
          }

          // Page number buttons
          for (let i = startPage; i <= endPage; i++) {
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

      // Initial render
      renderPage(currentPage);
  }).fail(function () {
      console.error("Failed to load JSON data.");
  });
});
