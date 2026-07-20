/* =========================================================
   Saffron & Gold — script.js
   Vanilla JS: nav, scroll reveal, menu filter, gallery
   lightbox, review carousel, form validation, scroll-top
   ========================================================= */
/* Base path for the backend API. Same-origin because the Express server
   also serves this static site — override if you host the frontend
   separately from the API (e.g. `window.API_BASE = 'https://api.example.com/api'`
   before this script loads). */
const API_BASE = window.API_BASE || '/api';

/** Small fetch wrapper: parses JSON, throws with the server's message on failure. */
async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed.');
    err.errors = data.errors || null;
    err.status = res.status;
    throw err;
  }
  return data;
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Sticky / transparent navbar ---------- */
  const header = document.getElementById('siteHeader');
  const toggleHeaderState = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  };
  toggleHeaderState();
  window.addEventListener('scroll', toggleHeaderState, { passive: true });

  /* ---------- Mobile hamburger menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('mainNav');

  function closeMenu(){
    hamburger.classList.remove('open');
    mainNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  hamburger.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const setActiveLink = () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 140;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active-link', link.getAttribute('href') === `#${current}`);
    });
  };
  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Scroll to top button ---------- */
  const scrollTopBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* =========================================================
     INTERACTIVE MENU — data + filtering
     ========================================================= */
  const menuData = [
    { name: 'Vegetable Samosa', desc: 'Crisp pastry filled with spiced potato and peas.', price: '₹150', cat: ['starters','veg'], img: 'https://in.pinterest.com/pin/1122451907166729035/' },
    { name: 'Chicken Seekh Kebab', desc: 'Minced chicken skewers, char-grilled with garam masala.', price: '₹280', cat: ['starters','nonveg'], img: 'https://loremflickr.com/160/160/kebab/all?lock=42' },
    { name: 'Tandoori Prawns', desc: 'Jumbo prawns marinated in yoghurt, chilli and lime.', price: '₹420', cat: ['starters','nonveg'], img: 'https://loremflickr.com/160/160/tandoori,prawns/all?lock=43' },
    { name: 'Paneer Tikka', desc: 'House paneer, char-grilled over live coals.', price: '₹320', cat: ['starters','veg'], img: 'https://loremflickr.com/160/160/paneertikka/all?lock=44' },
    { name: 'Chicken Tikka', desc: 'Marinated chicken chunks grilled until smoky and juicy.', price: '₹340', cat: ['starters','nonveg'], img: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=400&q=80' },
    { name: 'Malai Tikka', desc: 'Creamy chicken tikka with cashew-rich marinade and charred edges.', price: '₹360', cat: ['starters','nonveg'], img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80' },
    { name: 'Crispy Corn', desc: 'Sweet corn tossed with chilli, garlic and a smoky Indo-Chinese glaze.', price: '₹250', cat: ['starters','veg'], img: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=400&q=80' },
    { name: 'Mushroom 65', desc: 'Golden-fried mushroom bites with curry leaves, chilli and a tandoori kick.', price: '₹280', cat: ['starters','veg'], img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
    { name: 'Chicken Lollipop', desc: 'Crisp drumette-style chicken bites, tossed in spicy garlic sauce.', price: '₹320', cat: ['starters','nonveg'], img: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=400&q=80' },
    { name: 'Chicken 65', desc: 'Boneless chicken pieces tossed in a fiery south-style masala batter.', price: '₹340', cat: ['starters','nonveg'], img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400&q=80' },
    { name: 'Fish Fingers', desc: 'Crunchy fish strips served with tartar dip and lemon wedges.', price: '₹360', cat: ['starters','nonveg'], img: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=400&q=80' },
    { name: 'Veg Manchurian', desc: 'Soft vegetable dumplings tossed in a glossy sweet-spicy sauce.', price: '₹260', cat: ['starters','veg'], img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80' },
    { name: 'Chicken Noodles Soup', desc: 'A comforting noodle broth with chicken, vegetables and ginger.', price: '₹240', cat: ['soups','nonveg'], img: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80' },
    { name: 'Murgh Shorba', desc: 'Classic clear chicken soup simmered with pepper, herbs and roasted spice.', price: '₹230', cat: ['soups','nonveg'], img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80' },
    { name: 'Mutton Bone Broth', desc: 'Slow-simmered bone broth with black pepper, bay leaf and rustic spice.', price: '₹260', cat: ['soups','nonveg'], img: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=400&q=80' },
    { name: 'Tomato Basil Soup', desc: 'Slow-roasted tomato soup finished with basil and cream.', price: '₹210', cat: ['soups','veg'], img: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80' },
    { name: 'Sweet Corn Soup', desc: 'Velvety sweet corn soup with fresh herbs and a subtle pepper finish.', price: '₹220', cat: ['soups','veg'], img: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=400&q=80' },
    { name: 'Vegetable Clear Soup', desc: 'Light broth with carrot, cabbage, beans and spring onion.', price: '₹200', cat: ['soups','veg'], img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80' },
    { name: 'Dal Makhani', desc: 'Black lentils, slow-simmered overnight with butter and cream.', price: '₹300', cat: ['veg'], img: 'https://loremflickr.com/160/160/dal,lentils/all?lock=45' },
    { name: 'Palak Paneer', desc: 'Cottage cheese in a silky spiced spinach gravy.', price: '₹310', cat: ['veg'], img: 'https://loremflickr.com/160/160/palakpaneer,spinach/all?lock=46' },
    { name: 'Malai Kofta', desc: 'Vegetable and paneer dumplings in a rich cashew gravy.', price: '₹320', cat: ['veg'], img: 'https://in.pinterest.com/pin/1098878377853830184/' },
    { name: 'Butter Chicken', desc: 'Tandoor chicken finished in a velvet tomato-butter gravy.', price: '₹380', cat: ['nonveg'], img: 'https://loremflickr.com/160/160/butterchicken/all?lock=48' },
    { name: 'Godavari Fish Curry', desc: 'Coastal Andhra-style fish curry simmered with tamarind, curry leaves and spice.', price: '₹420', cat: ['nonveg'], img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80' },
    { name: 'Royyala Kodi Kura', desc: 'Prawn curry with a rich gravy of onion, tomato and roasted spice.', price: '₹450', cat: ['nonveg'], img: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80' },
    { name: 'Andhra Chepala Pulusu', desc: 'Tangy fish stew made with river fish, tamarind and chilli.', price: '₹430', cat: ['nonveg'], img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80' },
    { name: 'Rogan Josh', desc: 'Kashmiri lamb braised in a deep red chilli gravy.', price: '₹440', cat: ['nonveg'], img: 'https://loremflickr.com/160/160/roganjosh,curry/all?lock=49' },
    { name: 'Chettinad Chicken', desc: 'Fiery South Indian curry with roasted whole spice.', price: '₹360', cat: ['nonveg'], img: 'https://loremflickr.com/160/160/chettinad,chicken/all?lock=50' },
    { name: 'Hyderabadi Biryani', desc: 'Dum-cooked basmati layered with mutton and saffron.', price: '₹420', cat: ['biryani','nonveg'], img: 'https://images.unsplash.com/photo-1661610860326-4c3ed86e69b8?auto=format&fit=crop&w=900&q=80' },
    { name: 'Chicken Dum Biryani', desc: 'Aromatic basmati layered with spiced chicken, saffron and fried onions.', price: '₹410', cat: ['biryani','nonveg'], img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80' },
    { name: 'Mutton Dum Biryani', desc: 'Slow-cooked dum biryani with tender mutton, herbs and deep spice.', price: '₹460', cat: ['biryani','nonveg'], img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80' },
    { name: 'Vegetable Biryani', desc: 'Fragrant basmati with garden vegetables and fried onion.', price: '₹300', cat: ['biryani','veg'], img: 'https://loremflickr.com/160/160/vegbiryani,rice/all?lock=52' },
    { name: 'Paneer Biryani', desc: 'Basmati rice layered with paneer cubes, mint and rich North Indian spice.', price: '₹340', cat: ['biryani','veg'], img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80' },
    { name: 'Prawn Biryani', desc: 'Coastal-style biryani layered with spiced tiger prawns.', price: '₹450', cat: ['biryani','nonveg'], img: 'https://loremflickr.com/160/160/prawn,biryani/all?lock=53' },
    { name: 'Gulab Jamun', desc: 'Milk dumplings soaked in cardamom-rose syrup.', price: '₹180', cat: ['desserts'], img: 'https://i.pinimg.com/736x/d7/57/aa/d757aaadf9cb57a72ee0143984c7338b.jpg' },
    { name: 'Kesar Kulfi', desc: 'Saffron-pistachio frozen dessert, churned the traditional way.', price: '₹200', cat: ['desserts'], img: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=400&q=80' },
    { name: 'Gajar Ka Halwa', desc: 'Slow-cooked carrot pudding with ghee, khoya and nuts.', price: '₹220', cat: ['desserts'], img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80' },
    { name: 'Rasmalai', desc: 'Soft cheese dumplings soaked in chilled saffron milk and pistachio.', price: '₹230', cat: ['desserts'], img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9583?auto=format&fit=crop&w=400&q=80' },
    { name: 'Mysore Pak', desc: 'Rich ghee-based sweet with a melt-in-the-mouth crumbly texture.', price: '₹210', cat: ['desserts'], img: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Rabri', desc: 'Slow-reduced sweet milk topped with nuts and a fragrant cardamom note.', price: '₹240', cat: ['desserts'], img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80' },
    { name: 'Shahi Tukda', desc: 'Crisp bread pudding soaked in saffron milk and finished with nuts.', price: '₹250', cat: ['desserts'], img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9583?auto=format&fit=crop&w=400&q=80' },
    { name: 'Besan Ladoo', desc: 'Roasted gram flour laddoos bound with ghee, cardamom and nuts.', price: '₹190', cat: ['desserts'], img: 'https://images.unsplash.com/photo-1631377676267-7fe0f96782ab?auto=format&fit=crop&w=400&q=80' },
    { name: 'Moong Dal Halwa', desc: 'A slow-cooked, caramelized lentil sweet with a deep saffron aroma.', price: '₹260', cat: ['desserts'], img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80' },
    { name: 'Masala Chai', desc: 'Spiced black tea simmered with milk and whole spice.', price: '₹90', cat: ['beverages'], img: 'https://loremflickr.com/160/160/masalachai,tea/all?lock=57' },
    { name: 'Mango Lassi', desc: 'Churned yoghurt with Alphonso mango pulp.', price: '₹140', cat: ['beverages'], img: 'https://loremflickr.com/160/160/mangolassi/all?lock=58' },
    { name: 'Jal Jeera', desc: 'Tangy cumin-mint cooler, served ice cold.', price: '₹110', cat: ['beverages'], img: 'https://loremflickr.com/160/160/jaljeera,drink/all?lock=59' },
    { name: 'Cold Coffee', desc: 'A chilled café-style coffee shake topped with frothy cream.', price: '₹170', cat: ['beverages'], img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Mango Smoothie', desc: 'A tropical mango blend with yogurt, honey and ice.', price: '₹175', cat: ['beverages'], img: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Vanilla Milkshake', desc: 'Creamy vanilla shake blended with chilled milk and ice cream.', price: '₹180', cat: ['beverages'], img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80' },
    { name: 'Chocolate Milkshake', desc: 'Rich chocolate blend with thick milk, cocoa and soft serve.', price: '₹190', cat: ['beverages'], img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80' },
    { name: 'Strawberry Milkshake', desc: 'Fresh strawberry shake with cold milk and whipped cream.', price: '₹185', cat: ['beverages'], img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80' },
  ];

  const menuGrid = document.getElementById('menuGrid');
  const filterBar = document.getElementById('menuFilters');
  let activeMenuData = menuData; // replaced with live API data once it loads, if available

  function vegDot(cat){
    return cat.includes('veg') && !cat.includes('nonveg')
      ? '<span class="veg-dot"></span>'
      : (cat.includes('nonveg') ? '<span class="nonveg-dot"></span>' : '');
  }

  function formatPrice(price){
    return typeof price === 'number' ? `₹${price}` : price;
  }

  function renderMenu(items){
    menuGrid.innerHTML = items.map(item => `
      <div class="menu-item" data-cat="${item.cat.join(' ')}">
        <div class="menu-item-img"><img src="${item.img}" alt="${item.name}" loading="lazy"></div>
        <div class="menu-item-info">
          <div class="menu-item-top">
            <h4>${vegDot(item.cat)}${item.name}</h4>
            <span class="price">${formatPrice(item.price)}</span>
          </div>
          <p>${item.desc}</p>
        </div>
      </div>
    `).join('');
  }
  renderMenu(activeMenuData);

  // Try the live API first; silently keep the bundled static menu if the
  // backend isn't running (e.g. index.html opened directly as a file).
  apiRequest('/menu')
    .then(data => {
      if (Array.isArray(data.items) && data.items.length){
        activeMenuData = data.items;
        const currentFilter = filterBar.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        const filtered = currentFilter === 'all' ? activeMenuData : activeMenuData.filter(i => i.cat.includes(currentFilter));
        renderMenu(filtered);
      }
    })
    .catch(() => { /* offline / no backend — static fallback already rendered */ });

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterBar.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    const filter = btn.dataset.filter;
    const filtered = filter === 'all' ? activeMenuData : activeMenuData.filter(i => i.cat.includes(filter));
    // smooth fade transition
    menuGrid.style.opacity = '0';
    setTimeout(() => {
      renderMenu(filtered);
      menuGrid.style.transition = 'opacity .35s ease';
      menuGrid.style.opacity = '1';
    }, 200);
  });

  /* =========================================================
     GALLERY LIGHTBOX
     ========================================================= */
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  let currentIndex = 0;

  function openLightbox(index){
    currentIndex = index;
    updateLightboxImage();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function updateLightboxImage(){
    const img = galleryItems[currentIndex].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function showNext(){ currentIndex = (currentIndex + 1) % galleryItems.length; updateLightboxImage(); }
  function showPrev(){ currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length; updateLightboxImage(); }

  galleryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxNext').addEventListener('click', showNext);
  document.getElementById('lightboxPrev').addEventListener('click', showPrev);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

  /* =========================================================
     REVIEW CAROUSEL (auto-sliding)
     ========================================================= */
  const track = document.getElementById('reviewTrack');
  const dotsWrap = document.getElementById('reviewDots');
  let slides = [];
  let dots = [];
  let slideIndex = 0;
  let autoplayTimer;

  function starString(rating){
    const r = Math.max(0, Math.min(5, Math.round(rating)));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  }

  function renderReviews(items){
    track.innerHTML = items.map(r => `
      <article class="review-card">
        <div class="stars" aria-label="${r.rating} out of 5 stars">${starString(r.rating)}</div>
        <p>"${r.text}"</p>
        <div class="reviewer">
          <span class="reviewer-name">${r.name}</span>
          <span class="reviewer-meta">${r.source || 'Guest Review'}</span>
        </div>
      </article>
    `).join('');

    dotsWrap.innerHTML = '';
    items.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Go to review ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsWrap.appendChild(dot);
    });

    slides = Array.from(track.children);
    dots = Array.from(dotsWrap.children);
    slideIndex = 0;
    track.style.transform = 'translateX(0)';
    resetAutoplay();
  }

  function goToSlide(i){
    if (!slides.length) return;
    slideIndex = i;
    track.style.transform = `translateX(-${slideIndex * 100}%)`;
    dots.forEach((d, idx) => d.classList.toggle('active', idx === slideIndex));
    resetAutoplay();
  }
  function nextSlide(){ if (slides.length) goToSlide((slideIndex + 1) % slides.length); }
  function resetAutoplay(){
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(nextSlide, 5000);
  }

  // Initialize from the static markup already in index.html, then swap
  // in live data from the API if it's reachable.
  slides = Array.from(track.children);
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Go to review ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });
  dots = Array.from(dotsWrap.children);
  resetAutoplay();

  apiRequest('/reviews')
    .then(data => {
      if (Array.isArray(data.items) && data.items.length) renderReviews(data.items);
    })
    .catch(() => { /* offline / no backend — static reviews already shown */ });

  /* =========================================================
     RESERVATION FORM VALIDATION
     ========================================================= */
  const form = document.getElementById('reservationForm');
  const successModal = document.getElementById('successModal');
  const modalClose = document.getElementById('modalClose');

  const validators = {
    resName: v => v.trim().length >= 2 || 'Please enter your full name.',
    resPhone: v => /^[\d\s+()-]{7,15}$/.test(v.trim()) || 'Enter a valid phone number.',
    resEmail: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Enter a valid email address.',
    resDate: v => v !== '' || 'Please choose a date.',
    resTime: v => v !== '' || 'Please choose a time.',
    resGuests: v => v !== '' || 'Please select number of guests.',
  };

  function validateField(id){
    const field = document.getElementById(id);
    const errorEl = document.getElementById(`err-${id}`);
    const result = validators[id](field.value);
    const wrap = field.closest('.form-field');
    if (result === true){
      wrap.classList.remove('invalid');
      errorEl.textContent = '';
      return true;
    } else {
      wrap.classList.add('invalid');
      errorEl.textContent = result;
      return false;
    }
  }

  Object.keys(validators).forEach(id => {
    const field = document.getElementById(id);
    field.addEventListener('blur', () => validateField(id));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let allValid = true;
    Object.keys(validators).forEach(id => {
      if (!validateField(id)) allValid = false;
    });

    if (!allValid){
      const firstInvalid = form.querySelector('.invalid input, .invalid select');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const payload = {
      name: document.getElementById('resName').value,
      phone: document.getElementById('resPhone').value,
      email: document.getElementById('resEmail').value,
      date: document.getElementById('resDate').value,
      time: document.getElementById('resTime').value,
      guests: document.getElementById('resGuests').value,
      notes: document.getElementById('resNotes').value,
    };

    try {
      const data = await apiRequest('/reservations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      document.getElementById('modalMessage').textContent =
        data.message || 'Thank you! Your table has been requested.';
      successModal.classList.add('open');
      successModal.setAttribute('aria-hidden', 'false');
      form.reset();
    } catch (err) {
      if (err.errors){
        // Map backend field errors onto the same inputs the client already validated.
        Object.entries(err.errors).forEach(([field, msg]) => {
          const id = `res${field.charAt(0).toUpperCase()}${field.slice(1)}`;
          const el = document.getElementById(id);
          const errorEl = document.getElementById(`err-${id}`);
          if (el && errorEl){
            el.closest('.form-field').classList.add('invalid');
            errorEl.textContent = msg;
          }
        });
      } else {
        document.getElementById('modalMessage').textContent =
          err.message || "We couldn't reach the server. Please call us to reserve, or try again shortly.";
        successModal.classList.add('open');
        successModal.setAttribute('aria-hidden', 'false');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });

  function closeModal(){
    successModal.classList.remove('open');
    successModal.setAttribute('aria-hidden', 'true');
  }
  modalClose.addEventListener('click', closeModal);
  successModal.addEventListener('click', (e) => { if (e.target === successModal) closeModal(); });

  /* set min date to today */
  const dateInput = document.getElementById('resDate');
  dateInput.min = new Date().toISOString().split('T')[0];

  /* =========================================================
     NEWSLETTER FORM
     ========================================================= */
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterMsg = document.getElementById('newsletterMsg');
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const submitBtn = newsletterForm.querySelector('button');
    submitBtn.disabled = true;

    try {
      const data = await apiRequest('/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email: emailInput.value }),
      });
      newsletterMsg.textContent = data.message || "You're subscribed!";
      newsletterForm.reset();
    } catch (err) {
      newsletterMsg.textContent = err.errors?.email || err.message || 'Something went wrong. Please try again.';
    } finally {
      submitBtn.disabled = false;
      setTimeout(() => { newsletterMsg.textContent = ''; }, 5000);
    }
  });

  /* =========================================================
     CONTACT FORM
     ========================================================= */
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');

  const contactValidators = {
    msgName: v => v.trim().length >= 2 || 'Please enter your name.',
    msgEmail: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Enter a valid email address.',
    msgText: v => v.trim().length >= 5 || 'Message must be at least 5 characters.',
  };

  function validateContactField(id){
    const field = document.getElementById(id);
    const errorEl = document.getElementById(`err-${id}`);
    const result = contactValidators[id](field.value);
    const wrap = field.closest('.form-field');
    if (result === true){
      wrap.classList.remove('invalid');
      errorEl.textContent = '';
      return true;
    }
    wrap.classList.add('invalid');
    errorEl.textContent = result;
    return false;
  }

  Object.keys(contactValidators).forEach(id => {
    document.getElementById(id).addEventListener('blur', () => validateContactField(id));
  });

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let allValid = true;
    Object.keys(contactValidators).forEach(id => { if (!validateContactField(id)) allValid = false; });
    if (!allValid) return;

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    contactStatus.textContent = '';
    contactStatus.classList.remove('success');

    try {
      const data = await apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: document.getElementById('msgName').value,
          email: document.getElementById('msgEmail').value,
          phone: document.getElementById('msgPhone').value,
          message: document.getElementById('msgText').value,
        }),
      });
      contactStatus.textContent = data.message || 'Message sent!';
      contactStatus.classList.add('success');
      contactForm.reset();
    } catch (err) {
      if (err.errors){
        Object.entries(err.errors).forEach(([field, msg]) => {
          const id = `msg${field.charAt(0).toUpperCase()}${field.slice(1)}`;
          const el = document.getElementById(id);
          const errorEl = document.getElementById(`err-${id}`);
          if (el && errorEl){
            el.closest('.form-field').classList.add('invalid');
            errorEl.textContent = msg;
          }
        });
      } else {
        contactStatus.textContent = err.message || "We couldn't send that. Please try again or call us directly.";
      }
    } finally {
      submitBtn.disabled = false;
    }
  });

});
