/* ============================================================
   2FA MARKET — Logique Interactivité
   Panier | Filtres | WhatsApp | Animations
   ============================================================ */

// ── DONNÉES PRODUITS ──
const PRODUITS = [
    { id: 1, nom: "Riz Local Long Grain", prix: 17500, cat: "cereales", desc: "Sac de 25kg, riz local du Burkina, parfumé et naturel.", img: "images/image copy.png" },
    { id: 2, nom: "Huile Végétale SN-CITEC", prix: 1250, cat: "epicerie", desc: "Bouteille de 1L, huile raffinée de production locale.", img: "images/image copy 2.png" },
    { id: 3, nom: "Farine de Maïs Fin", prix: 500, cat: "cereales", desc: "Sachet de 1kg, idéal pour le tô et les bouillies.", img: "images/image copy 12.png" },
    { id: 4, nom: "Sucre Granulé SOSUCO", prix: 750, cat: "epicerie", desc: "Sachet de 1kg, sucre blanc pur du Burkina.", img: "images/image copy 3.png" },
    { id: 5, nom: "Lait en Poudre Bonnet Rouge", prix: 2800, cat: "epicerie", desc: "Boîte de 400g, riche en vitamines.", img: "images/image copy 4.png" },
    { id: 6, nom: "Café Faso Café", prix: 3500, cat: "boissons", desc: "Paquet de 250g, café burkinabè torréfié artisanalement.", img: "images/image copy 5.png" },
    { id: 7, nom: "Eau Minérale Lafi", prix: 500, cat: "boissons", desc: "Pack de 6 bouteilles 1.5L, eau de source naturelle.", img: "images/image copy 6.png" },
    { id: 8, nom: "Bière Brakina", prix: 700, cat: "boissons", desc: "Bouteille 65cl, la bière nationale du Faso.", img: "images/image copy 7.png" },
    { id: 9, nom: "Miel Naturel du Nahouri", prix: 4500, cat: "local", desc: "Pot de 500g, miel pur de forêt sans additifs.", img: "images/image copy 8.png" },
    { id: 10, nom: "Beurre de Karité Alimentaire", prix: 1500, cat: "local", desc: "Pot de 250g, beurre de karité filtré pour la cuisine.", img: "images/image copy 9.png" },
    { id: 11, nom: "Savon de Marseille (Box)", prix: 8500, cat: "hygiene", desc: "Carton de 12 morceaux pour l'hygiène familiale.", img: "images/image copy 10.png" },
    { id: 12, nom: "Poisson Tilapia Surgelé", prix: 2200, cat: "surgeles", desc: "Le kg, poisson frais nettoyé et congelé.", img: "images/image copy 11.png" }
];

// ── ÉTAT GLOBAL ──
let panier = JSON.parse(localStorage.getItem('panier_bf_market')) || [];
let categorieActive = 'tous';
let rechercheActive = '';

// Pagination state
let currentPage = 1;
const itemsPerPage = 12;

// ── ÉLÉMENTS DOM ──
const grid = document.getElementById('productsGrid');
const cartBadge = document.getElementById('cartBadge');
const cartBadgeMobile = document.getElementById('cartBadgeMobile');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsList = document.getElementById('cartItemsList');
const cartTotal = document.getElementById('cartTotal');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartEmpty = document.getElementById('cartEmpty');
const cartFooter = document.getElementById('cartFooterEl');
const toastContainer = document.getElementById('toastContainer');
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
const navbar = document.getElementById('navbar');
const bttBtn = document.getElementById('backToTop');
const bottomNavLinks = document.querySelectorAll('.bottom-nav-link');

// ── INITIALISATION ──
window.addEventListener('scroll', () => {
    // Navbar effect
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    // Back to top button
    if (window.scrollY > 500) bttBtn.classList.add('visible');
    else bttBtn.classList.remove('visible');

    // Bottom Nav Sync
    let current = "";
    document.querySelectorAll('section').forEach((section) => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 150) {
            current = section.getAttribute("id");
        }
    });

    bottomNavLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("data-target") === current) {
            link.classList.add("active");
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    renderProduits();
    updatePanierUI();
    
    // Filtres catégories
    document.querySelectorAll('.cat-card').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.cat-card.active').classList.remove('active');
            btn.classList.add('active');
            categorieActive = btn.dataset.cat;
            currentPage = 1; // Reset to page 1 on filter change
            renderProduits();
        });
    });

    // Recherche
    document.getElementById('searchInput').addEventListener('input', (e) => {
        rechercheActive = e.target.value.toLowerCase();
        currentPage = 1; // Reset to page 1 on search
        renderProduits();
    });

    // Menu Mobile (Desktop mode legacy or side menu)
    const burgerBtn = document.getElementById('burgerBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const closeDrawer = document.getElementById('closeDrawer');

    if (burgerBtn) {
        burgerBtn.addEventListener('click', () => {
            burgerBtn.classList.toggle('open');
            mobileDrawer.classList.toggle('open');
            drawerOverlay.classList.toggle('active');
            document.body.style.overflow = mobileDrawer.classList.contains('open') ? 'hidden' : '';
        });
    }

    const fermerMenu = () => {
        burgerBtn.classList.remove('open');
        mobileDrawer.classList.remove('open');
        drawerOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (closeDrawer) closeDrawer.addEventListener('click', fermerMenu);
    if (drawerOverlay) drawerOverlay.addEventListener('click', fermerMenu);

    // Close drawer on link click
    document.querySelectorAll('.drawer-link').forEach(link => {
        link.addEventListener('click', fermerMenu);
    });

    // Panier listeners
    document.getElementById('cartBtn').addEventListener('click', toggleCart);
    document.getElementById('bottomCartBtn').addEventListener('click', toggleCart);
    document.getElementById('cartClose').addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    
    // Modal Validation
    const checkoutOverlay = document.getElementById('checkoutModalOverlay');
    if (checkoutOverlay) checkoutOverlay.addEventListener('click', closeCheckoutModal);

    bttBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});

// ── FONCTIONS CATALOGUE ──
function renderProduits() {
    let html = '';
    const filtres = PRODUITS.filter(p => {
        const matchesCat = categorieActive === 'tous' || p.cat === categorieActive;
        const matchesSearch = p.nom.toLowerCase().includes(rechercheActive);
        return matchesCat && matchesSearch;
    });

    const paginationContainer = document.getElementById('paginationContainer');
    const noResults = document.getElementById('noResults');

    if (filtres.length === 0) {
        noResults.classList.remove('hidden');
        paginationContainer.classList.add('hidden');
        grid.innerHTML = '';
        return;
    }

    noResults.classList.add('hidden');

    // Pagination logic
    const totalPages = Math.ceil(filtres.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filtres.slice(startIndex, endIndex);

    paginatedItems.forEach(p => {
        const inCart = panier.find(item => item.id === p.id);
        html += `
            <div class="product-card" style="animation: fadeInUp 0.5s ease backwards">
                <div class="product-img-wrap">
                    <img src="${p.img}" alt="${p.nom}" class="product-img" onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden')">
                    <div class="product-img-placeholder hidden">
                        <i class="fas fa-image"></i>
                    </div>
                </div>
                <div class="product-body">
                    <h3 class="product-name">${p.nom}</h3>
                    <div class="product-price">${p.prix.toLocaleString()} FCFA</div>
                    <button class="btn-add-cart" onclick="ajouterAuPanier(${p.id}, this)">
                        <i class="fas ${inCart ? 'fa-check' : 'fa-plus'}"></i>
                    </button>
                </div>
            </div>
        `;
    });
    grid.innerHTML = html;

    renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
    const paginationContainer = document.getElementById('paginationContainer');
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    if (totalPages <= 1) {
        paginationContainer.classList.add('hidden');
        return;
    }

    paginationContainer.classList.remove('hidden');
    
    // Update Prev/Next buttons state
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    // Remove old listeners to prevent duplicates
    const newPrevBtn = prevBtn.cloneNode(true);
    const newNextBtn = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    
    newPrevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderProduits();
            window.scrollTo({ top: document.getElementById('produits').offsetTop - 100, behavior: 'smooth' });
        }
    });

    newNextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderProduits();
            window.scrollTo({ top: document.getElementById('produits').offsetTop - 100, behavior: 'smooth' });
        }
    });

    // Render page numbers
    let pagesHtml = '';
    for (let i = 1; i <= totalPages; i++) {
        pagesHtml += `<button class="page-num ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    pageNumbers.innerHTML = pagesHtml;

    // Add click listeners to page numbers
    document.querySelectorAll('.page-num').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentPage = parseInt(e.target.dataset.page);
            renderProduits();
            window.scrollTo({ top: document.getElementById('produits').offsetTop - 100, behavior: 'smooth' });
        });
    });
}

// ── FONCTION REVEAL ON SCROLL ──
function revealOnScroll() {
    const sections = document.querySelectorAll('section, .feature-item, .promo-inner');
    sections.forEach(sec => {
        const top = sec.getBoundingClientRect().top;
        const h = window.innerHeight;
        if (top < h * 0.85) {
            sec.style.opacity = "1";
            sec.style.transform = "translateY(0)";
        }
    });
}
// Init opacity/transform for reveal
document.querySelectorAll('section, .feature-item, .promo-inner').forEach(s => {
    s.style.opacity = "0";
    s.style.transform = "translateY(30px)";
    s.style.transition = "all 0.8s ease-out";
});
window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // Initial check

// Helper for Category Filter from Footer
function filterByCategory(cat) {
    categorieActive = cat;
    window.scrollTo({ top: document.getElementById('produits').offsetTop - 100, behavior: 'smooth' });
    renderProduits();
    // Update active state in UI cards
    document.querySelectorAll('.cat-card').forEach(card => {
        card.classList.remove('active');
        if (card.dataset.cat === cat) card.classList.add('active');
    });
}

// ── FONCTIONS PANIER ──
function toggleCart() {
    cartDrawer.classList.toggle('open');
    cartOverlay.classList.toggle('active');
    document.body.style.overflow = cartDrawer.classList.contains('open') ? 'hidden' : '';
}

function ajouterAuPanier(id, btn) {
    const p = PRODUITS.find(x => x.id === id);
    const index = panier.findIndex(x => x.id === id);

    if (index > -1) {
        panier[index].qty++;
    } else {
        panier.push({ ...p, qty: 1 });
    }

    // Animation feedback
    if (btn) {
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => btn.style.transform = 'scale(1)', 200);
    }

    sauvegarderEtRefresh();
    showToast(`${p.nom} ajouté au panier`);
}

function modifierQty(id, delta) {
    const index = panier.findIndex(x => x.id === id);
    if (index === -1) return;

    panier[index].qty += delta;
    if (panier[index].qty <= 0) {
        panier.splice(index, 1);
        renderProduits();
    }
    sauvegarderEtRefresh();
}

function supprimerDuPanier(id) {
    panier = panier.filter(x => x.id !== id);
    sauvegarderEtRefresh();
    renderProduits();
}

function viderPanier() {
    if (confirm('Voulez-vous vraiment vider votre panier ?')) {
        panier = [];
        sauvegarderEtRefresh();
        renderProduits();
        showToast('Panier vidé', 'warn');
    }
}

function sauvegarderEtRefresh() {
    localStorage.setItem('panier_bf_market', JSON.stringify(panier));
    updatePanierUI();
}

function updatePanierUI() {
    const count = panier.reduce((acc, x) => acc + x.qty, 0);
    
    // Update both badges
    if (cartBadge) {
        cartBadge.textContent = count;
        cartBadge.style.display = count > 0 ? 'flex' : 'none';
    }
    if (cartBadgeMobile) {
        cartBadgeMobile.textContent = count;
        cartBadgeMobile.style.display = count > 0 ? 'block' : 'none';
    }

    if (panier.length === 0) {
        cartEmpty.classList.remove('hidden');
        cartItemsList.classList.add('hidden');
        cartFooter.classList.add('hidden');
    } else {
        cartEmpty.classList.add('hidden');
        cartItemsList.classList.remove('hidden');
        cartFooter.classList.remove('hidden');

        let html = '';
        let total = 0;
        panier.forEach(item => {
            const st = item.prix * item.qty;
            total += st;
            html += `
                <div class="cart-item">
                    <div class="cart-item-img">
                        <img src="${item.img}" alt="${item.nom}" onerror="this.parentElement.innerHTML='<i class=\'fas fa-box\'></i>'">
                    </div>
                    <div class="cart-item-info">
                        <h4 class="cart-item-name">${item.nom}</h4>
                        <div class="cart-item-price">${item.prix.toLocaleString()} FCFA</div>
                        <div class="cart-item-controls">
                            <button class="qty-btn" onclick="modifierQty(${item.id}, -1)">-</button>
                            <span>${item.qty}</span>
                            <button class="qty-btn" onclick="modifierQty(${item.id}, 1)">+</button>
                        </div>
                    </div>
                </div>
            `;
        });
        cartItemsList.innerHTML = html;
        cartSubtotal.textContent = `${total.toLocaleString()} FCFA`;
        cartTotal.textContent = `${total.toLocaleString()} FCFA`;
    }
}

// ── CHECKOUT MODAL ──
function openCheckoutModal() {
    if (panier.length === 0) {
        showToast('Votre panier est vide !', 'warn');
        return;
    }
    const overlay = document.getElementById('checkoutModalOverlay');
    const modal = document.getElementById('checkoutModal');
    if(overlay && modal) {
        overlay.classList.add('active');
        modal.classList.add('active');
    }
}

function closeCheckoutModal() {
    const overlay = document.getElementById('checkoutModalOverlay');
    const modal = document.getElementById('checkoutModal');
    if(overlay && modal) {
        overlay.classList.remove('active');
        modal.classList.remove('active');
    }
}

// ── FONCTION WHATSAPP (FACTURE) ──
function passerCommande() {
    if (panier.length === 0) {
        showToast('Votre panier est vide !', 'warn');
        return;
    }

    const nom = document.getElementById('clientName').value.trim();
    const quartier = document.getElementById('clientNeighborhood').value.trim();
    const tel = document.getElementById('clientPhone').value.trim();

    if (!nom || !quartier || !tel) {
        showToast('Infos de livraison requises', 'warn');
        return;
    }

    let message = "🛒 *2FA MARKET*\n";
    message += "---------------------------\n";
    message += `👤 *CLIENT :* ${nom}\n`;
    message += `📍 *QUARTIER :* ${quartier}\n`;
    message += `📞 *TEL :* ${tel}\n`;
    message += "---------------------------\n";
    
    let total = 0;
    panier.forEach(item => {
        const st = item.prix * item.qty;
        total += st;
        message += `• ${item.nom} (x${item.qty})\n`;
    });

    message += "---------------------------\n";
    message += `💰 *TOTAL : ${total.toLocaleString()} FCFA*\n`;
    message += "---------------------------\n";
    message += "Merci ! 🙏";

    window.open(`https://wa.me/22607142862?text=${encodeURIComponent(message)}`, '_blank');
    
    closeCheckoutModal();
    if (cartDrawer.classList.contains('open')) {
        toggleCart();
    }
}

// ── TOAST ──
function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
