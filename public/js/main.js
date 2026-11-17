const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');
const menuClose = document.querySelector('#mobile-nav-close');

function closeMobileMenu() {
  if (backdrop) backdrop.style.display = 'none';
  if (sideDrawer) {
    sideDrawer.classList.remove('open');
    sideDrawer.setAttribute('aria-hidden', 'true');
  }
  if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
  }
  document.body.classList.remove('mobile-menu-open');
}

function openMobileMenu() {
  if (backdrop) backdrop.style.display = 'block';
  if (sideDrawer) {
    sideDrawer.classList.add('open');
    sideDrawer.setAttribute('aria-hidden', 'false');
  }
  if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close navigation menu');
  }
  document.body.classList.add('mobile-menu-open');
  if (menuClose) menuClose.focus();
}

if (backdrop) backdrop.addEventListener('click', closeMobileMenu);
if (menuClose) menuClose.addEventListener('click', closeMobileMenu);
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    if (sideDrawer && sideDrawer.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
}
if (sideDrawer) {
  sideDrawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
}
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && sideDrawer && sideDrawer.classList.contains('open')) {
    closeMobileMenu();
    if (menuToggle) menuToggle.focus();
  }
});

const imageInput = document.querySelector('#image');
const imagePreview = document.querySelector('#product-image-preview');
const uploadPlaceholder = document.querySelector('.image-upload__placeholder');

if (imageInput && imagePreview) {
  imageInput.addEventListener('change', event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = loadEvent => {
      imagePreview.src = loadEvent.target.result;
      imagePreview.classList.add('is-visible');
      if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  });
}

const productSearch = document.querySelector('#admin-product-search');
const productCards = document.querySelectorAll('.admin-product-card');
const noSearchResults = document.querySelector('#admin-product-no-results');

if (productSearch) {
  productSearch.addEventListener('input', () => {
    const query = productSearch.value.trim().toLowerCase();
    let visibleProducts = 0;

    productCards.forEach(card => {
      const matches = card.dataset.search.includes(query);
      card.hidden = !matches;
      if (matches) visibleProducts += 1;
    });

    if (noSearchResults) noSearchResults.hidden = visibleProducts > 0;
  });
}
