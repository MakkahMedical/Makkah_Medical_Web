const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQy2tYawcUXtytRXFLfJXigXxS_I-ZD7_gO5G6lpaKrKJwBxfPd5gSkLteRN7VZqkdmpr1IIerzo54a/pub?output=csv';

let allProducts = [];
let currentImageIndex = 0;
let currentProductImages = [];

const productsContainer = document.getElementById('products-container');
const themeToggle = document.getElementById('theme-toggle');
const modal = document.getElementById('product-modal');
const aboutBtn = document.getElementById('about-btn');
const aboutModal = document.getElementById('about-modal');

// --- 1. الوضع الليلي (Dark Mode) ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.body.removeAttribute('data-theme');
        if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

if (themeToggle) {
    themeToggle.onclick = () => {
        const isDark = document.body.hasAttribute('data-theme');
        if (isDark) {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    };
}

// --- 2. جلب البيانات من الشيت ---
async function loadData() {
    try {
        const response = await fetch(SHEET_URL);
        const csvData = await response.text();
        const rows = csvData.split('\n').slice(1);
        
        allProducts = rows.map(row => {
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return {
                id: cols[0]?.replace(/"/g, '').trim(),
                name: cols[1]?.replace(/"/g, '').trim(),
                category: cols[2]?.replace(/"/g, '').trim(),
                price: cols[3]?.replace(/"/g, '').trim(),
                images: cols[4]?.replace(/"/g, '').split('|').map(img => img.trim()),
                desc: cols[5]?.replace(/"/g, '').trim()
            };
        }).filter(p => p.name);

        displayProducts(allProducts);
    } catch (error) {
        productsContainer.innerHTML = '<p>حدث خطأ أثناء تحميل البيانات. تأكد من اتصالك بالإنترنت.</p>';
        console.error(error);
    }
}

function displayProducts(items) {
    if (items.length === 0) {
        productsContainer.innerHTML = '<p style="grid-column:1/-1; text-align:center;">لا توجد منتجات.</p>';
        return;
    }
    productsContainer.innerHTML = items.map(product => `
        <div class="product-card" onclick="openModal('${product.id}')">
            <img src="${product.images[0]}" class="product-img" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
            <div class="product-info">
                <div>
                    <span class="product-cat">${getCategoryName(product.category)}</span>
                    <h3 class="product-title">${product.name}</h3>
                </div>
                <div class="product-footer">
                    <span style="font-weight:bold; color: #38bdf8 ">${product.price} ج.م</span>
                    <button class="details-btn-arrow"><i class="fa-solid fa-chevron-left"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

function getCategoryName(cat) {
    const names = { 'devices': 'أجهزة طبية', 'supplies': 'مستلزمات', 'masks': 'وقاية' };
    return names[cat] || cat;
}

// --- 3. المودال والسلايدر (منتجات) ---
function openModal(id) {
    const product = allProducts.find(p => p.id == id);
    if (!product) return;

    currentProductImages = product.images;
    currentImageIndex = 0;

    modal.querySelector('.modal-body').innerHTML = `
        <div class="slider-container">
            ${currentProductImages.length > 1 ? `
                <button class="slider-btn prev-btn" onclick="changeSlide(1); event.stopPropagation();">&#10094;</button>
                <button class="slider-btn next-btn" onclick="changeSlide(-1); event.stopPropagation();">&#10095;</button>
            ` : ''}
            ${currentProductImages.map((img, i) => `<img src="${img}" class="slider-image ${i===0?'active':''}">`).join('')}
            <div class="dots-container">
                ${currentProductImages.length > 1 ? currentProductImages.map((_, i) => `<span class="dot ${i===0?'active':''}" onclick="goToSlide(${i}); event.stopPropagation();"></span>`).join('') : ''}
            </div>
        </div>
        <div class="modal-text-content">
            <h2>${product.name}</h2>
            <p style="margin:10px 0; color:#666;">${product.desc}</p>
            <h3 style="color:var(--primary-color);">${product.price} جنيه مصري</h3>
        </div>
    `;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

window.changeSlide = function(step) {
    const imgs = document.querySelectorAll('.slider-image');
    const dots = document.querySelectorAll('.dot');
    if(!imgs.length) return;
    imgs[currentImageIndex].classList.remove('active');
    if(dots.length) dots[currentImageIndex].classList.remove('active');
    currentImageIndex = (currentImageIndex + step + currentProductImages.length) % currentProductImages.length;
    imgs[currentImageIndex].classList.add('active');
    if(dots.length) dots[currentImageIndex].classList.add('active');
};

window.goToSlide = function(index) {
    const imgs = document.querySelectorAll('.slider-image');
    const dots = document.querySelectorAll('.dot');
    imgs[currentImageIndex].classList.remove('active');
    if(dots.length) dots[currentImageIndex].classList.remove('active');
    currentImageIndex = index;
    imgs[currentImageIndex].classList.add('active');
    if(dots.length) dots[currentImageIndex].classList.add('active');
};

// --- 4. التحكم في "حولنا" (About Us) وأزرار الإغلاق ---
if (aboutBtn) {
    aboutBtn.onclick = () => {
        if (aboutModal) {
            aboutModal.style.display = "block";
            document.body.style.overflow = "hidden";
        }
    };
}

// تأكد من استخدام الكلاس الصحيح (close-btn) أو (close-about-btn) بناءً على الـ HTML الخاص بك
const closeAboutBtn = document.querySelector('.close-about-btn');
if (closeAboutBtn) {
    closeAboutBtn.onclick = () => {
        aboutModal.style.display = "none";
        document.body.style.overflow = "auto";
    };
}

const closeProductBtn = document.querySelector('.close-btn');
if (closeProductBtn) {
    closeProductBtn.onclick = () => {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    };
}

window.onclick = (e) => {
    if (e.target == modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
    if (e.target == aboutModal) {
        aboutModal.style.display = "none";
        document.body.style.overflow = "auto";
    }
};

// --- 5. الفلترة والبحث ---
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
        const activeBtn = document.querySelector('.filter-btn.active');
        if (activeBtn) activeBtn.classList.remove('active');
        btn.classList.add('active');
        const cat = btn.dataset.category;
        displayProducts(cat === 'all' ? allProducts : allProducts.filter(p => p.category === cat));
    };
});

const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        displayProducts(allProducts.filter(p => p.name.toLowerCase().includes(term)));
    };
}

// تشغيل التهيئة
initTheme();
loadData();