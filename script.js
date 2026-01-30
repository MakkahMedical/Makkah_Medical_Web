const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQy2tYawcUXtytRXFLfJXigXxS_I-ZD7_gO5G6lpaKrKJwBxfPd5gSkLteRN7VZqkdmpr1IIerzo54a/pub?output=csv';

let allProducts = [];
let currentImageIndex = 0;
let currentProductImages = [];

const productsContainer = document.getElementById('products-container');
const themeToggle = document.getElementById('theme-toggle');
const modal = document.getElementById('product-modal');
const aboutBtn = document.getElementById('about-btn');
const aboutModal = document.getElementById('about-modal');

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
            <h3 style="color:var(--primary-color); font-weight:bold;">${product.price} جنيه مصري</h3>
            
            <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">
                <i class="fa-solid fa-cart-plus"></i> إضافة إلى العربة
            </button>
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

if (aboutBtn) {
    aboutBtn.onclick = () => {
        if (aboutModal) {
            aboutModal.style.display = "block";
            document.body.style.overflow = "hidden";
        }
    };
}

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

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
        const activeBtn = document.querySelector('.filter-btn.active');
        if (activeBtn) activeBtn.classList.remove('active');
        btn.classList.add('active');

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = ''; 
        }

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


const sortBtn = document.getElementById('sort-btn');
const sortModal = document.getElementById('sort-modal');
const closeSortBtn = document.querySelector('.close-sort-btn');


if (sortBtn) {
    sortBtn.onclick = () => {
        sortModal.style.display = "block";
    };
}
if (closeSortBtn) {
    closeSortBtn.onclick = () => {
        sortModal.style.display = "none";
    };
}

function parsePrice(priceString) {
    const cleaned = priceString.toString().replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
}



document.querySelectorAll('.sort-option').forEach(btn => {
    btn.onclick = () => {
        const sortType = btn.dataset.sort;


        const activeBtn = document.querySelector('.filter-btn.active');
        const currentCategory = activeBtn ? activeBtn.dataset.category : 'all';


        const searchInput = document.getElementById('search-input');
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';


        let productsToDisplay = allProducts.filter(p => {

            const matchesCategory = (currentCategory === 'all') || (p.category === currentCategory);

            const matchesSearch = p.name.toLowerCase().includes(searchTerm);
            

            return matchesCategory && matchesSearch;
        });


        if (sortType === 'high') {
   
            productsToDisplay.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        } else if (sortType === 'low') {

            productsToDisplay.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        }

        displayProducts(productsToDisplay);
        sortModal.style.display = "none";
        document.body.style.overflow = "auto";
    };
});


window.onclick = (e) => {
    if (e.target == modal) modal.style.display = "none";
    if (e.target == aboutModal) aboutModal.style.display = "none";
    if (e.target == sortModal) sortModal.style.display = "none"; 
    if (e.target == modal || e.target == aboutModal || e.target == sortModal) {
        document.body.style.overflow = "auto";
    }
};

let cart = JSON.parse(localStorage.getItem('makkah_cart')) || [];

function updateCartBadge() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cart-count').innerText = count;
    localStorage.setItem('makkah_cart', JSON.stringify(cart));
}



window.addToCart = (id) => {
    const p = allProducts.find(x => x.id == id);
    const existing = cart.find(x => x.id == id);
    
    if(existing) { 
        existing.qty++; 
    } else { 
        cart.push({...p, qty: 1}); 
    }
    
    updateCartBadge();

    showToast('تمت الإضافة للعربة بنجاح'); 
};
function renderCart() {
    const container = document.getElementById('cart-items-container');
    let total = 0;
    container.innerHTML = cart.map((item, index) => {
        total += parseFloat(item.price.replace(/[^\d.]/g, '')) * item.qty;
        return `
            <div class="cart-item">
                <img src="${item.images[0]}">
                <div><h4 style="font-size:0.8rem">${item.name}</h4><small>${item.price}</small></div>
                <div class="cart-controls">
                    <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                    <i class="fa-solid fa-trash" style="color:#ff4757; cursor:pointer;" onclick="removeItem(${index})"></i>
                </div>
            </div>`;
    }).join('');
    document.getElementById('cart-total').innerText = total + " ج.م";
}

window.updateQty = (index, change) => {
    cart[index].qty += change;
    if(cart[index].qty < 1) cart[index].qty = 1;
    updateCartBadge(); renderCart();
};

window.removeItem = (index) => {
    cart.splice(index, 1);
    updateCartBadge(); renderCart();
};

document.getElementById('checkout-messenger').onclick = () => {
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const city = document.getElementById('cust-city').value.trim(); 
    const address = document.getElementById('cust-address').value.trim();

    if(cart.length === 0) return showToast('العربة فارغة 🛒');

    if(!name || !phone || !city || !address) {
        return showToast('يرجى ملء جميع البيانات: الاسم، الموبايل، المدينة، والعنوان ⚠️');
    }

    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
        return showToast('رقم الموبايل غير صحيح! يجب أن يكون 11 رقم ويبدأ بـ 01 ❌');
    }

    let msg = `مكة ميديكال للمستلزمات الطبية\n`;
    msg += `Makkah Medical\n`;
    msg += `------------------\n\n`;
    msg += `طلب جديد من الموقع:\n`;
    msg += `👤 الاسم: ${name}\n`;
    msg += `📱 الموبايل: ${phone}\n`;
    msg += `🏙️ المدينة: ${city}\n`; 
    msg += `📍 العنوان: ${address}\n\n`;
    msg += `------------------\n`;
    msg += `الطلبات:\n`;

    cart.forEach(i => {
        msg += `- ${i.name}\n   العدد: ${i.qty}\n   السعر: ${i.price}\n   الرابط: ${i.images[0]}\n\n`;
    });

    msg += `💰 الإجمالي: ${document.getElementById('cart-total').innerText}\n`;

    const url = `https://m.me/61586511999035?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    cart = [];
    updateCartBadge();
    renderCart();
    document.getElementById('cart-modal').style.display='none'; 
    showToast('تم إرسال الطلب عبر الماسنجر بنجاح! 📩');
};

document.getElementById('cart-btn').onclick = () => { renderCart(); document.getElementById('cart-modal').style.display='block'; };
document.querySelector('.close-cart-btn').onclick = () => { document.getElementById('cart-modal').style.display='none'; };


function showToast(message) {
    const box = document.getElementById('toast-box');
    const toast = document.createElement('div');
    toast.classList.add('toast');
    
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
    
    box.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}
initTheme();
loadData();