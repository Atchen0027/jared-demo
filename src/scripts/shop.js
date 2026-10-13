import { products } from '../data/products.js';
import { categories } from '../data/categories.js';
import { storeConfig } from '../data/storeConfig.js';
import { slides } from '../data/slides.js';

// =============================================================================
// NUBETERAPIA - APLICACIÓN DE TIENDA DEMO (CONTROLLER PRINCIPAL)
// =============================================================================

class NubeterapiaShop {
  constructor() {
    this.cart = this.loadCart();
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.maxPrice = 30;
    this.stockOnly = false;
    this.sortBy = 'featured';

    this.currentSlide = 0;
    this.slideInterval = null;
    this.isSlidePaused = false;

    this.activeProduct = null;
    this.activeModalQty = 1;
    this.selectedVariant = null;

    this.init();
  }

  init() {
    // Inicializar subsistemas
    this.initHeroCarousel();
    this.initScrollFlippingDeck();
    this.initFiltersAndCatalog();
    this.initProductModal();
    this.initCartDrawer();
    this.initWhatsAppPreview();
    this.initSeasonalPromo();
    this.initAdminPanelDemo();
    this.initMobileNav();
    this.initGlobalTriggers();

    // Render inicial del carrito
    this.renderCart();
  }

  // ---------------------------------------------------------------------------
  // 1. CARRUSEL HERO PRINCIPAL
  // ---------------------------------------------------------------------------
  initHeroCarousel() {
    const wrapper = document.getElementById('carousel-wrapper');
    if (!wrapper) return;

    this.slideElements = Array.from(wrapper.querySelectorAll('.carousel-slide'));
    this.indicatorDots = Array.from(document.querySelectorAll('.indicator-dot'));
    this.prevBtn = document.getElementById('carousel-prev-btn');
    this.nextBtn = document.getElementById('carousel-next-btn');
    this.pauseBtn = document.getElementById('carousel-pause-toggle');
    this.pauseIcon = document.getElementById('pause-icon');
    this.playIcon = document.getElementById('play-icon');

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.goToSlide(this.currentSlide - 1);
        this.restartSlideTimer();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.goToSlide(this.currentSlide + 1);
        this.restartSlideTimer();
      });
    }

    this.indicatorDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        this.goToSlide(idx);
        this.restartSlideTimer();
      });
    });

    if (this.pauseBtn) {
      this.pauseBtn.addEventListener('click', () => {
        this.toggleSlideAutoplay();
      });
    }

    // Soporte táctil / swipe en móviles
    let touchStartX = 0;
    let touchEndX = 0;

    wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - 40) {
        this.goToSlide(this.currentSlide + 1);
        this.restartSlideTimer();
      } else if (touchEndX > touchStartX + 40) {
        this.goToSlide(this.currentSlide - 1);
        this.restartSlideTimer();
      }
    }, { passive: true });

    // Iniciar autoplay
    this.startSlideTimer();
  }

  goToSlide(index) {
    if (!this.slideElements || this.slideElements.length === 0) return;

    const total = this.slideElements.length;
    let newIndex = (index + total) % total;

    this.slideElements.forEach((el, idx) => {
      const isActive = idx === newIndex;
      el.classList.toggle('is-active', isActive);
      el.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    this.indicatorDots.forEach((dot, idx) => {
      const isActive = idx === newIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    this.currentSlide = newIndex;
  }

  startSlideTimer() {
    this.stopSlideTimer();
    this.slideInterval = setInterval(() => {
      if (!this.isSlidePaused) {
        this.goToSlide(this.currentSlide + 1);
      }
    }, 5500);
  }

  stopSlideTimer() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  }

  restartSlideTimer() {
    if (!this.isSlidePaused) {
      this.startSlideTimer();
    }
  }

  toggleSlideAutoplay() {
    this.isSlidePaused = !this.isSlidePaused;
    if (this.pauseBtn) {
      this.pauseBtn.setAttribute('aria-pressed', this.isSlidePaused ? 'true' : 'false');
    }
    if (this.pauseIcon && this.playIcon) {
      this.pauseIcon.style.display = this.isSlidePaused ? 'none' : 'inline-block';
      this.playIcon.style.display = this.isSlidePaused ? 'inline-block' : 'none';
    }
  }

  // ---------------------------------------------------------------------------
  // 1.5. COLECCIONES: CARRUSEL LATERAL EN MÓVIL Y GIRO 3D EN ESCRITORIO
  // ---------------------------------------------------------------------------
  initScrollFlippingDeck() {
    const track = document.getElementById('categorias');
    if (!track) return;

    const cards = Array.from(document.querySelectorAll('.flip-category-card'));
    const stepBtns = Array.from(document.querySelectorAll('.deck-step-btn'));
    const progressBar = document.getElementById('deck-progress-indicator');
    const stage = document.getElementById('deck-3d-stage');
    if (cards.length === 0) return;

    let currentCardIndex = 0;
    let isTicking = false;

    // Actualiza indicadores visuales (pestañas y barra de progreso)
    const updateIndicators = (newIndex) => {
      currentCardIndex = newIndex;

      stepBtns.forEach((btn, idx) => {
        const isActive = idx === currentCardIndex;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      if (progressBar) {
        const pct = ((currentCardIndex + 1) / cards.length) * 100;
        progressBar.style.width = `${pct}%`;
      }
    };

    // Actualiza la rotación de tarjetas 3D en escritorio
    const updateDesktopCardIndex = (newIndex) => {
      if (newIndex === currentCardIndex) return;
      updateIndicators(newIndex);

      cards.forEach((card, idx) => {
        card.classList.remove('card-active', 'card-passed', 'card-waiting');
        if (idx === currentCardIndex) {
          card.classList.add('card-active');
        } else if (idx < currentCardIndex) {
          card.classList.add('card-passed');
        } else {
          card.classList.add('card-waiting');
        }
      });
    };

    // Scroll vertical para giro 3D eliminado para permitir flujo natural sin huecos vacíos
    // Desplazamiento horizontal del carrusel lateral en modo móvil
    const scrollMobileToCard = (targetIdx, smooth = true) => {
      const idx = Math.max(0, Math.min(cards.length - 1, targetIdx));
      updateIndicators(idx);
      const targetCard = cards[idx];
      if (!targetCard || !stage) return;

      const stageWidth = stage.clientWidth;
      const cardWidth = targetCard.offsetWidth;
      const cardLeft = targetCard.offsetLeft;
      const targetScrollLeft = cardLeft - (stageWidth - cardWidth) / 2;

      stage.scrollTo({
        left: targetScrollLeft,
        behavior: smooth ? 'smooth' : 'auto'
      });
    };

    if (stage) {
      let stageScrollTicking = false;
      stage.addEventListener('scroll', () => {
        if (window.innerWidth >= 768) return;
        if (!stageScrollTicking) {
          window.requestAnimationFrame(() => {
            const scrollLeft = stage.scrollLeft;
            const stageWidth = stage.clientWidth;
            const stageCenter = scrollLeft + stageWidth / 2;

            let closestIdx = 0;
            let minDiff = Infinity;

            cards.forEach((card, idx) => {
              const cardCenter = card.offsetLeft + card.offsetWidth / 2;
              const diff = Math.abs(cardCenter - stageCenter);
              if (diff < minDiff) {
                minDiff = diff;
                closestIdx = idx;
              }
            });

            updateIndicators(closestIdx);
            stageScrollTicking = false;
          });
          stageScrollTicking = true;
        }
      }, { passive: true });

      // Soporte táctil nativo (swipe con el dedo)
      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;
      let isTouchActive = false;

      stage.addEventListener('touchstart', (e) => {
        if (window.innerWidth >= 768) return;
        if (e.touches.length !== 1) return;

        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isTouchActive = true;
      }, { passive: true });

      stage.addEventListener('touchend', (e) => {
        if (!isTouchActive || window.innerWidth >= 768) {
          isTouchActive = false;
          return;
        }
        isTouchActive = false;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const deltaTime = Date.now() - touchStartTime;

        const isFastSwipe = deltaTime < 400 && Math.abs(deltaX) > 28;
        const isStandardSwipe = Math.abs(deltaX) > 42;

        if ((isFastSwipe || isStandardSwipe) && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) {
            scrollMobileToCard(currentCardIndex + 1);
          } else {
            scrollMobileToCard(currentCardIndex - 1);
          }
        }
      }, { passive: true });

      // Soporte para arrastre con ratón en móvil
      let isMouseDown = false;
      let mouseStartX = 0;
      let mouseScrollLeft = 0;
      let hasMouseMoved = false;

      stage.addEventListener('mousedown', (e) => {
        if (window.innerWidth >= 768) return;
        isMouseDown = true;
        hasMouseMoved = false;
        mouseStartX = e.pageX - stage.offsetLeft;
        mouseScrollLeft = stage.scrollLeft;
        stage.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', (e) => {
        if (!isMouseDown || window.innerWidth >= 768) return;
        const x = e.pageX - stage.offsetLeft;
        const walk = x - mouseStartX;
        if (Math.abs(walk) > 6) {
          hasMouseMoved = true;
        }
        stage.scrollLeft = mouseScrollLeft - walk;
      });

      window.addEventListener('mouseup', (e) => {
        if (!isMouseDown) return;
        isMouseDown = false;
        stage.style.cursor = '';

        if (hasMouseMoved && window.innerWidth < 768) {
          const mouseEndX = e.pageX - stage.offsetLeft;
          const dragDist = mouseEndX - mouseStartX;
          if (dragDist < -45) {
            scrollMobileToCard(currentCardIndex + 1);
          } else if (dragDist > 45) {
            scrollMobileToCard(currentCardIndex - 1);
          } else {
            scrollMobileToCard(currentCardIndex);
          }
        }
      });
    }

    // Botones de flecha prev / next (móvil y escritorio)
    const prevArrow = document.getElementById('deck-nav-prev-btn');
    const nextArrow = document.getElementById('deck-nav-next-btn');

    if (prevArrow) {
      prevArrow.addEventListener('click', () => {
        if (window.innerWidth < 768) {
          scrollMobileToCard(currentCardIndex - 1);
        } else {
          const prev = (currentCardIndex - 1 + cards.length) % cards.length;
          updateDesktopCardIndex(prev);
        }
      });
    }

    if (nextArrow) {
      nextArrow.addEventListener('click', () => {
        if (window.innerWidth < 768) {
          scrollMobileToCard(currentCardIndex + 1);
        } else {
          const next = (currentCardIndex + 1) % cards.length;
          updateDesktopCardIndex(next);
        }
      });
    }

    // Clic en los botones de paso (01 Jabones, 02 Exfoliantes, 03 Cremas)
    stepBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const step = parseInt(btn.getAttribute('data-card-step') || '0', 10);
        if (window.innerWidth < 768) {
          scrollMobileToCard(step);
        } else {
          updateDesktopCardIndex(step);
        }
      });
    });

    // Inicialización al cargar la web
    updateIndicators(0);
    cards.forEach((card, idx) => {
      card.classList.remove('card-active', 'card-passed', 'card-waiting');
      if (idx === 0) {
        card.classList.add('card-active');
      } else {
        card.classList.add('card-waiting');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 2. CATÁLOGO, FILTROS Y ORDENACIÓN
  // ---------------------------------------------------------------------------
  initFiltersAndCatalog() {
    // Pestañas de categoría
    this.categoryPills = Array.from(document.querySelectorAll('[data-category-filter]'));
    this.categoryPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const cat = pill.getAttribute('data-category-filter') || 'all';
        this.setCategoryFilter(cat);
      });
    });

    // Buscador por nombre
    this.searchInput = document.getElementById('product-search-input');
    this.clearSearchBtn = document.getElementById('clear-search-btn');

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        if (this.clearSearchBtn) {
          this.clearSearchBtn.style.display = this.searchQuery ? 'flex' : 'none';
        }
        this.applyFilters();
      });
    }

    if (this.clearSearchBtn) {
      this.clearSearchBtn.addEventListener('click', () => {
        if (this.searchInput) {
          this.searchInput.value = '';
          this.searchQuery = '';
          this.clearSearchBtn.style.display = 'none';
          this.applyFilters();
        }
      });
    }

    // Slider de precio
    this.priceSlider = document.getElementById('max-price-range');
    this.priceDisplay = document.getElementById('price-display');

    if (this.priceSlider) {
      this.priceSlider.addEventListener('input', (e) => {
        this.maxPrice = parseFloat(e.target.value);
        if (this.priceDisplay) {
          this.priceDisplay.textContent = `${this.maxPrice.toFixed(2).replace('.', ',')}€`;
        }
        this.applyFilters();
      });
    }

    // Checkbox de stock
    this.stockCheckbox = document.getElementById('stock-only-checkbox');
    if (this.stockCheckbox) {
      this.stockCheckbox.addEventListener('change', (e) => {
        this.stockOnly = e.target.checked;
        this.applyFilters();
      });
    }

    // Selector de ordenación
    this.sortSelect = document.getElementById('catalog-sort-select');
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.applyFilters();
      });
    }

    // Botones de reseteo
    this.resetAllBtn = document.getElementById('reset-all-filters-btn');
    this.removeCatFilterBtn = document.getElementById('remove-cat-filter');
    this.emptyResetBtn = document.getElementById('empty-reset-btn');

    if (this.resetAllBtn) {
      this.resetAllBtn.addEventListener('click', () => this.resetAllFilters());
    }
    if (this.removeCatFilterBtn) {
      this.removeCatFilterBtn.addEventListener('click', () => this.setCategoryFilter('all'));
    }
    if (this.emptyResetBtn) {
      this.emptyResetBtn.addEventListener('click', () => this.resetAllFilters());
    }
  }

  setCategoryFilter(category) {
    this.activeCategory = category;

    // Actualizar estado de las pastillas
    this.categoryPills.forEach((pill) => {
      const match = (pill.getAttribute('data-category-filter') || 'all') === category;
      pill.classList.toggle('is-active', match);
      pill.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    this.applyFilters();
  }

  resetAllFilters() {
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.maxPrice = 30;
    this.stockOnly = false;
    this.sortBy = 'featured';

    if (this.searchInput) this.searchInput.value = '';
    if (this.clearSearchBtn) this.clearSearchBtn.style.display = 'none';
    if (this.priceSlider) {
      this.priceSlider.value = '30';
      if (this.priceDisplay) this.priceDisplay.textContent = '30,00€';
    }
    if (this.stockCheckbox) this.stockCheckbox.checked = false;
    if (this.sortSelect) this.sortSelect.value = 'featured';

    this.categoryPills.forEach((pill) => {
      const isAll = (pill.getAttribute('data-category-filter') || 'all') === 'all';
      pill.classList.toggle('is-active', isAll);
      pill.setAttribute('aria-selected', isAll ? 'true' : 'false');
    });

    this.applyFilters();
  }

  applyFilters() {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-catalog-state');
    const countDisplay = document.getElementById('visible-products-count');
    const activeCatTag = document.getElementById('active-category-tag');
    const activeCatName = document.getElementById('active-category-name');
    const resetBtn = document.getElementById('reset-all-filters-btn');

    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.product-card'));
    let visibleCount = 0;

    // Filtrar y ordenar
    const sortedCards = [...cards].sort((a, b) => {
      const priceA = parseFloat(a.getAttribute('data-price') || '0');
      const priceB = parseFloat(b.getAttribute('data-price') || '0');
      const nameA = a.getAttribute('data-name') || '';
      const nameB = b.getAttribute('data-name') || '';
      const featA = a.getAttribute('data-featured') === 'true' ? 1 : 0;
      const featB = b.getAttribute('data-featured') === 'true' ? 1 : 0;

      if (this.sortBy === 'price-asc') return priceA - priceB;
      if (this.sortBy === 'price-desc') return priceB - priceA;
      if (this.sortBy === 'name-asc') return nameA.localeCompare(nameB);
      // 'featured'
      if (featB !== featA) return featB - featA;
      return priceA - priceB;
    });

    sortedCards.forEach((card) => {
      const pCat = card.getAttribute('data-category');
      const pPrice = parseFloat(card.getAttribute('data-price') || '0');
      const pName = (card.getAttribute('data-name') || '').toLowerCase();
      const pStock = card.getAttribute('data-stock') === 'true';

      const matchCat = (this.activeCategory === 'all') || (pCat === this.activeCategory);
      const matchPrice = pPrice <= this.maxPrice;
      const matchStock = !this.stockOnly || pStock;
      const matchSearch = !this.searchQuery || pName.includes(this.searchQuery);

      const isVisible = matchCat && matchPrice && matchStock && matchSearch;

      if (isVisible) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }

      grid.appendChild(card);
    });

    // Actualizar contador
    if (countDisplay) {
      countDisplay.textContent = visibleCount;
    }

    // Manejar estado vacío
    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    // Etiqueta de categoría activa
    if (activeCatTag && activeCatName) {
      if (this.activeCategory !== 'all') {
        const catObj = categories.find((c) => c.id === this.activeCategory);
        activeCatName.textContent = catObj ? catObj.name : this.activeCategory;
        activeCatTag.style.display = 'inline-flex';
      } else {
        activeCatTag.style.display = 'none';
      }
    }

    // Botón de resetear filtros visible si algún filtro está modificado
    const isFiltered = (this.activeCategory !== 'all') ||
      (this.searchQuery !== '') ||
      (this.maxPrice < 30) ||
      (this.stockOnly) ||
      (this.sortBy !== 'featured');

    if (resetBtn) {
      resetBtn.style.display = isFiltered ? 'inline-flex' : 'none';
    }
  }

  // ---------------------------------------------------------------------------
  // 3. DETALLE DE PRODUCTO (MODAL DIALOG)
  // ---------------------------------------------------------------------------
  initProductModal() {
    this.modal = document.getElementById('product-modal');
    this.modalBackdrop = document.getElementById('product-modal-backdrop');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
    this.modalBodyLayout = this.modal ? this.modal.querySelector('.modal-body-layout') : null;

    this.modalTitle = document.getElementById('modal-product-title');
    this.modalImage = document.getElementById('modal-product-image');
    this.modalCategory = document.getElementById('modal-product-category');
    this.modalPrice = document.getElementById('modal-product-price');
    this.modalWeight = document.getElementById('modal-product-weight');
    this.modalDescription = document.getElementById('modal-product-description');
    this.modalPromoBox = document.getElementById('modal-promo-box');
    this.modalPromoText = document.getElementById('modal-promo-text');
    this.modalBenefitsList = document.getElementById('modal-product-benefits');
    this.modalIngredientsChips = document.getElementById('modal-product-ingredients');
    this.modalSkinType = document.getElementById('modal-product-skintype');
    this.modalThumbsStrip = document.getElementById('modal-thumbnails-strip');
    this.modalZoomBtn = document.getElementById('modal-zoom-btn');

    // Variantes de tamaño / peso / formato
    this.modalVariantsBlock = document.getElementById('modal-variants-block');
    this.modalVariantsChips = document.getElementById('modal-variants-chips');
    this.modalSelectedVariantLabel = document.getElementById('modal-selected-variant-label');

    this.modalQtyInput = document.getElementById('modal-qty-input');
    this.modalQtyDec = document.getElementById('modal-qty-decrease');
    this.modalQtyInc = document.getElementById('modal-qty-increase');
    this.modalAddCartBtn = document.getElementById('modal-add-cart-btn');
    this.modalBtnSubtotal = document.getElementById('modal-btn-subtotal');

    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', () => this.closeProductModal());
    }

    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', () => this.closeProductModal());
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('is-active')) {
        this.closeProductModal();
      }
    });

    if (this.modalZoomBtn && this.modalImage) {
      this.modalZoomBtn.addEventListener('click', () => {
        this.modalImage.classList.toggle('zoomed');
      });
      this.modalImage.addEventListener('click', () => {
        this.modalImage.classList.toggle('zoomed');
      });
    }

    if (this.modalQtyDec) {
      this.modalQtyDec.addEventListener('click', () => {
        if (this.activeModalQty > 1) {
          this.activeModalQty--;
          this.updateModalQty();
        }
      });
    }

    if (this.modalQtyInc) {
      this.modalQtyInc.addEventListener('click', () => {
        if (this.activeModalQty < 99) {
          this.activeModalQty++;
          this.updateModalQty();
        }
      });
    }

    if (this.modalAddCartBtn) {
      this.modalAddCartBtn.addEventListener('click', () => {
        if (this.activeProduct) {
          this.addToCart(this.activeProduct.id, this.activeModalQty, this.selectedVariant);
          this.closeProductModal();
          this.openCart();
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 3.1. VARIANTES DE PRODUCTO (TAMAÑOS, PESOS, PACKS)
  // ---------------------------------------------------------------------------
  getProductVariants(product) {
    if (!product) return [];

    // 1. Packs especiales o cajas de regalo
    if (product.id === 'caja-regalo-8-jabones') {
      return [
        { id: 'caja-8', label: 'Caja Completa (8 Jabones)', weight: '8 x 100g', price: 30.00 },
        { id: 'caja-4', label: 'Caja Selección (4 Jabones)', weight: '4 x 100g', price: 16.00 }
      ];
    }

    if (product.id === 'jabon-masajeador-mango-xxl') {
      return [
        { id: 'unit-1', label: '1 Unidad Masajeador XXL', weight: '180g', price: 5.50 },
        { id: 'pack-2', label: 'Pack Dúo (2x)', weight: '2 x 180g (Ahorro)', price: 10.00 }
      ];
    }

    // 2. Jabones artesanales estándar
    if (product.category === 'jabones-artesanales') {
      const basePrice = product.price;
      const xxlPrice = Math.round((basePrice + 1.70) * 100) / 100;
      return [
        { id: 'pastilla-100g', label: 'Pastilla Estándar', weight: '100g aprox.', price: basePrice },
        { id: 'pastilla-160g', label: 'Pastilla Grande XXL', weight: '160g aprox.', price: xxlPrice },
        { id: 'pack-3-promo', label: 'Pack 3 Pastillas', weight: '3 x 100g (Promo 3x10€)', price: 10.00 }
      ];
    }

    // 3. Jabones exfoliantes en tarro
    if (product.category === 'jabones-exfoliantes') {
      const basePrice = product.price;
      const familiarPrice = Math.round((basePrice * 1.8) * 100) / 100;
      const duoPrice = Math.round((basePrice * 1.9) * 100) / 100;
      return [
        { id: 'tarro-250g', label: 'Tarro Estándar', weight: '250g', price: basePrice },
        { id: 'tarro-500g', label: 'Tarro Familiar', weight: '500g (Ahorro)', price: familiarPrice },
        { id: 'pack-duo', label: 'Pack Dúo Exfoliante', weight: '2 x 250g', price: duoPrice }
      ];
    }

    // 4. Cremas botánicas y bálsamos
    if (product.category === 'cremas') {
      const basePrice = product.price;
      const xlPrice = Math.round((basePrice + 5.50) * 100) / 100;
      return [
        { id: 'tarro-100ml', label: 'Tarro Facial 100ml', weight: '100ml', price: basePrice },
        { id: 'tarro-200ml', label: 'Tarro Familiar 200ml', weight: '200ml (Ahorro)', price: xlPrice }
      ];
    }

    return [
      { id: 'std', label: 'Formato Estándar', weight: product.weight || 'Estándar', price: product.price }
    ];
  }

  applySelectedVariantToUI() {
    if (!this.selectedVariant) return;
    const v = this.selectedVariant;

    if (this.modalPrice) {
      this.modalPrice.textContent = `${v.price.toFixed(2).replace('.', ',')}€`;
    }
    if (this.modalWeight) {
      this.modalWeight.textContent = v.weight;
    }
    if (this.modalSelectedVariantLabel) {
      this.modalSelectedVariantLabel.textContent = `${v.label} • ${v.weight}`;
    }
    this.updateModalQty();
  }

  openProductModal(productId) {
    const product = products.find((p) => p.id === productId);
    if (!product || !this.modal) return;

    this.activeProduct = product;
    this.activeModalQty = 1;

    // Resetear posición de scroll al abrir un nuevo producto
    if (this.modalBodyLayout) {
      this.modalBodyLayout.scrollTop = 0;
    }

    // Obtener variantes disponibles para este producto
    const variants = this.getProductVariants(product);
    this.selectedVariant = variants.length ? variants[0] : {
      id: 'std',
      label: 'Estándar',
      weight: product.weight || '100g',
      price: product.price
    };

    // Rellenar datos
    if (this.modalTitle) this.modalTitle.textContent = product.name;
    if (this.modalCategory) this.modalCategory.textContent = product.categoryName;
    if (this.modalDescription) this.modalDescription.textContent = product.description;
    if (this.modalSkinType) this.modalSkinType.textContent = product.skinType || 'Todo tipo de piel';

    // Reflejar la variante predeterminada en precio y peso
    this.applySelectedVariantToUI();

    if (this.modalImage) {
      this.modalImage.src = product.image;
      this.modalImage.alt = product.name;
      this.modalImage.classList.remove('zoomed');
    }

    if (this.modalPromoBox && this.modalPromoText) {
      if (product.promoNote) {
        this.modalPromoText.textContent = product.promoNote;
        this.modalPromoBox.style.display = 'flex';
      } else {
        this.modalPromoBox.style.display = 'none';
      }
    }

    // Renderizar selector de variantes (tamaños, pesos, packs)
    if (this.modalVariantsChips) {
      this.modalVariantsChips.innerHTML = '';
      if (variants.length > 0) {
        if (this.modalVariantsBlock) this.modalVariantsBlock.style.display = 'block';

        variants.forEach((v, idx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `variant-chip-btn ${idx === 0 ? 'is-active' : ''}`;
          btn.setAttribute('role', 'radio');
          btn.setAttribute('aria-checked', idx === 0 ? 'true' : 'false');
          btn.setAttribute('data-variant-id', v.id);
          btn.innerHTML = `
            <span>${v.label} <small style="opacity: 0.8; font-weight: 400;">(${v.weight})</small></span>
            <span class="variant-chip-price">${v.price.toFixed(2).replace('.', ',')}€</span>
          `;

          btn.addEventListener('click', () => {
            this.selectedVariant = v;
            this.modalVariantsChips.querySelectorAll('.variant-chip-btn').forEach((b) => {
              b.classList.remove('is-active');
              b.setAttribute('aria-checked', 'false');
            });
            btn.classList.add('is-active');
            btn.setAttribute('aria-checked', 'true');
            this.applySelectedVariantToUI();
          });

          this.modalVariantsChips.appendChild(btn);
        });
      } else if (this.modalVariantsBlock) {
        this.modalVariantsBlock.style.display = 'none';
      }
    }

    // Miniaturas
    if (this.modalThumbsStrip) {
      this.modalThumbsStrip.innerHTML = '';
      const gallery = product.gallery && product.gallery.length ? product.gallery : [product.image];
      gallery.forEach((imgUrl, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `modal-thumb-btn ${idx === 0 ? 'is-active' : ''}`;
        btn.innerHTML = `<img src="${imgUrl}" alt="Miniatura ${idx + 1}" />`;
        btn.addEventListener('click', () => {
          this.modalImage.src = imgUrl;
          this.modalImage.classList.remove('zoomed');
          this.modalThumbsStrip.querySelectorAll('.modal-thumb-btn').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
        });
        this.modalThumbsStrip.appendChild(btn);
      });
    }

    // Beneficios
    if (this.modalBenefitsList) {
      this.modalBenefitsList.innerHTML = '';
      const benefits = product.benefits || [];
      benefits.forEach((benefit) => {
        const li = document.createElement('li');
        li.className = 'modal-benefit-item';
        li.innerHTML = `
          <svg class="modal-benefit-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>${benefit}</span>
        `;
        this.modalBenefitsList.appendChild(li);
      });
    }

    // Ingredientes
    if (this.modalIngredientsChips) {
      this.modalIngredientsChips.innerHTML = '';
      const ingredients = product.ingredients || [];
      ingredients.forEach((ing) => {
        const chip = document.createElement('span');
        chip.className = 'ingredient-chip';
        chip.textContent = ing;
        this.modalIngredientsChips.appendChild(chip);
      });
    }

    this.updateModalQty();

    // Mostrar
    this.modalBackdrop.classList.add('is-active');
    this.modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  closeProductModal() {
    if (!this.modal) return;
    this.modalBackdrop.classList.remove('is-active');
    this.modal.classList.remove('is-active');
    document.body.style.overflow = '';
    this.activeProduct = null;
    this.selectedVariant = null;
  }

  updateModalQty() {
    if (this.modalQtyInput) {
      this.modalQtyInput.value = this.activeModalQty;
    }
    if (this.modalBtnSubtotal) {
      const unitPrice = this.selectedVariant ? this.selectedVariant.price : (this.activeProduct ? this.activeProduct.price : 0);
      const sub = (unitPrice * this.activeModalQty).toFixed(2).replace('.', ',');
      this.modalBtnSubtotal.textContent = `(${sub}€)`;
    }
  }

  // ---------------------------------------------------------------------------
  // 4. CARRITO DE COMPRA (LOCALSTORAGE + DRAWER)
  // ---------------------------------------------------------------------------
  loadCart() {
    try {
      const saved = localStorage.getItem('nubeterapia_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem('nubeterapia_cart_v1', JSON.stringify(this.cart));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage', e);
    }
  }

  addToCart(productId, qty = 1, chosenVariant = null) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const variants = this.getProductVariants(product);
    const variant = chosenVariant || (variants.length ? variants[0] : {
      id: 'std',
      label: 'Estándar',
      weight: product.weight || '100g',
      price: product.price
    });

    const cartItemId = `${product.id}__${variant.id}`;
    const existing = this.cart.find((item) => (item.cartItemId || item.id) === cartItemId);

    if (existing) {
      existing.quantity += qty;
    } else {
      this.cart.push({
        id: cartItemId,
        cartItemId: cartItemId,
        productId: product.id,
        name: product.name,
        variantId: variant.id,
        variantName: variant.label,
        weight: variant.weight,
        price: variant.price,
        image: product.image,
        categoryName: product.categoryName,
        quantity: qty
      });
    }

    this.saveCart();
    this.renderCart();
    this.showToast(`✨ Añadido: ${product.name} [${variant.label}] (x${qty})`);
  }

  updateQuantity(itemId, delta) {
    const index = this.cart.findIndex((item) => (item.cartItemId || item.id) === itemId);
    if (index === -1) return;

    this.cart[index].quantity += delta;
    if (this.cart[index].quantity <= 0) {
      this.cart.splice(index, 1);
    }

    this.saveCart();
    this.renderCart();
  }

  removeFromCart(itemId) {
    this.cart = this.cart.filter((item) => (item.cartItemId || item.id) !== itemId);
    this.saveCart();
    this.renderCart();
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.renderCart();
    this.showToast('🗑️ Tu cesta ha sido vaciada');
  }

  calculateTotals() {
    let subtotal = 0;
    let totalItems = 0;

    this.cart.forEach((item) => {
      subtotal += item.price * item.quantity;
      totalItems += item.quantity;
    });

    // Redondeo monetario seguro a 2 decimales
    subtotal = Math.round(subtotal * 100) / 100;

    const freeThreshold = storeConfig.shipping.freeShippingThreshold;
    const isFreeShipping = subtotal >= freeThreshold;
    const shipping = subtotal > 0 ? (isFreeShipping ? 0 : storeConfig.shipping.standardFee) : 0;
    const finalTotal = Math.round((subtotal + shipping) * 100) / 100;

    return {
      subtotal,
      shipping,
      isFreeShipping,
      finalTotal,
      totalItems,
      missingForFreeShipping: Math.max(0, Math.round((freeThreshold - subtotal) * 100) / 100)
    };
  }

  renderCart() {
    const { subtotal, shipping, isFreeShipping, finalTotal, totalItems, missingForFreeShipping } = this.calculateTotals();

    // Actualizar contadores del header
    const headerCount = document.getElementById('header-cart-count');
    const headerTotal = document.getElementById('header-cart-total');
    if (headerCount) headerCount.textContent = totalItems;
    if (headerTotal) headerTotal.textContent = `${finalTotal.toFixed(2).replace('.', ',')}€`;

    // Actualizar drawer
    const drawerCount = document.getElementById('drawer-items-count');
    if (drawerCount) drawerCount.textContent = `(${totalItems} ${totalItems === 1 ? 'producto' : 'productos'})`;

    // Barra de envío gratuito
    const progressFill = document.getElementById('shipping-progress-fill');
    const progressMsg = document.getElementById('shipping-progress-msg');
    const threshold = storeConfig.shipping.freeShippingThreshold;

    if (progressFill && progressMsg) {
      if (subtotal === 0) {
        progressFill.style.width = '0%';
        progressMsg.innerHTML = `¡Añade <strong>${threshold.toFixed(2)}€</strong> más para conseguir <strong>Envío Gratis</strong>!`;
      } else if (isFreeShipping) {
        progressFill.style.width = '100%';
        progressMsg.innerHTML = `🎉 <strong>¡Enhorabuena! Has conseguido Envío Gratuito.</strong>`;
      } else {
        const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
        progressFill.style.width = `${pct}%`;
        progressMsg.innerHTML = `¡Te faltan <strong>${missingForFreeShipping.toFixed(2).replace('.', ',')}€</strong> para conseguir <strong>Envío Gratis</strong>!`;
      }
    }

    // Lista de artículos
    const listEl = document.getElementById('cart-items-list');
    const emptyEl = document.getElementById('cart-empty-state');
    const footerEl = document.getElementById('cart-drawer-footer');

    if (!listEl) return;

    if (this.cart.length === 0) {
      listEl.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'flex';
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'block';

    listEl.innerHTML = '';
    this.cart.forEach((item) => {
      const lineSubtotal = (item.price * item.quantity).toFixed(2).replace('.', ',');
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div class="cart-item-img-wrapper">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.name}</h4>
          ${item.variantName ? `<span class="cart-item-variant-badge">${item.variantName} ${item.weight ? `• ${item.weight}` : ''}</span>` : ''}
          <span class="cart-item-unit-price">${item.price.toFixed(2).replace('.', ',')}€ / unidad</span>
          <div class="cart-item-actions">
            <div class="cart-qty-controls">
              <button type="button" class="cart-qty-btn" data-cart-qty-dec="${item.id}" aria-label="Disminuir">-</button>
              <span class="cart-qty-num">${item.quantity}</span>
              <button type="button" class="cart-qty-btn" data-cart-qty-inc="${item.id}" aria-label="Aumentar">+</button>
            </div>
            <span class="cart-item-subtotal">${lineSubtotal}€</span>
          </div>
        </div>
        <button type="button" class="cart-item-remove-btn" data-cart-remove="${item.id}" aria-label="Eliminar ${item.name}">
          ✕
        </button>
      `;

      // Eventos individuales
      const decBtn = itemEl.querySelector(`[data-cart-qty-dec="${item.id}"]`);
      const incBtn = itemEl.querySelector(`[data-cart-qty-inc="${item.id}"]`);
      const remBtn = itemEl.querySelector(`[data-cart-remove="${item.id}"]`);

      if (decBtn) decBtn.addEventListener('click', () => this.updateQuantity(item.id, -1));
      if (incBtn) incBtn.addEventListener('click', () => this.updateQuantity(item.id, 1));
      if (remBtn) remBtn.addEventListener('click', () => this.removeFromCart(item.id));

      listEl.appendChild(itemEl);
    });

    // Desglose de totales
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const shippingEl = document.getElementById('cart-shipping-val');
    const totalEl = document.getElementById('cart-total-val');

    if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2).replace('.', ',')}€`;
    if (shippingEl) {
      shippingEl.textContent = isFreeShipping ? '¡GRATIS!' : `${shipping.toFixed(2).replace('.', ',')}€`;
      shippingEl.style.color = isFreeShipping ? '#2E7D32' : 'inherit';
      shippingEl.style.fontWeight = isFreeShipping ? '700' : 'normal';
    }
    if (totalEl) totalEl.textContent = `${finalTotal.toFixed(2).replace('.', ',')}€`;
  }

  initCartDrawer() {
    this.cartDrawer = document.getElementById('cart-drawer');
    this.cartBackdrop = document.getElementById('cart-drawer-backdrop');
    this.openCartBtn = document.getElementById('open-cart-btn');
    this.closeCartBtn = document.getElementById('cart-drawer-close');
    this.emptyContinueBtn = document.getElementById('empty-continue-btn');
    this.clearCartBtn = document.getElementById('cart-clear-btn');

    if (this.openCartBtn) {
      this.openCartBtn.addEventListener('click', () => this.openCart());
    }

    if (this.closeCartBtn) {
      this.closeCartBtn.addEventListener('click', () => this.closeCart());
    }

    if (this.cartBackdrop) {
      this.cartBackdrop.addEventListener('click', () => this.closeCart());
    }

    if (this.emptyContinueBtn) {
      this.emptyContinueBtn.addEventListener('click', () => {
        this.closeCart();
        const catalogEl = document.getElementById('catalogo');
        if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (this.clearCartBtn) {
      this.clearCartBtn.addEventListener('click', () => {
        if (confirm('¿Deseas vaciar tu cesta de la compra?')) {
          this.clearCart();
        }
      });
    }
  }

  openCart() {
    if (!this.cartDrawer) return;
    this.cartBackdrop.classList.add('is-active');
    this.cartDrawer.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  closeCart() {
    if (!this.cartDrawer) return;
    this.cartBackdrop.classList.remove('is-active');
    this.cartDrawer.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  // ---------------------------------------------------------------------------
  // 5. PEDIDO POR WHATSAPP Y VISTA PREVIA
  // ---------------------------------------------------------------------------
  buildWhatsAppMessage() {
    const { subtotal, shipping, isFreeShipping, finalTotal } = this.calculateTotals();

    let text = `🌿 *¡Hola Nubeterapia! Quiero realizar un pedido:*%0A`;
    text += `━━━━━━━━━━━━━━━━━━━━━%0A`;

    this.cart.forEach((item) => {
      const lineSub = (item.price * item.quantity).toFixed(2).replace('.', ',');
      const unit = item.price.toFixed(2).replace('.', ',');
      const variantText = item.variantName ? ` [${item.variantName}${item.weight ? ` - ${item.weight}` : ''}]` : '';
      text += `• *${item.quantity}x* ${item.name}${variantText}%0A   (${unit}€/u) ➔ *${lineSub}€*%0A`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━%0A`;
    text += `📦 *Subtotal:* ${subtotal.toFixed(2).replace('.', ',')}€%0A`;
    text += `🚚 *Gastos de Envío:* ${isFreeShipping ? '¡GRATIS!' : `${shipping.toFixed(2).replace('.', ',')}€`}%0A`;
    text += `✨ *TOTAL DEL PEDIDO: ${finalTotal.toFixed(2).replace('.', ',')}€*%0A`;
    text += `━━━━━━━━━━━━━━━━━━━━━%0A`;
    text += `📍 *Datos de entrega:*%0A`;
    text += `• Nombre completo:%0A`;
    text += `• Dirección de envío:%0A`;
    text += `• Localidad / Isla / CP:%0A`;
    text += `• Teléfono de contacto:%0A%0A`;
    text += `_Pedido generado desde la tienda online Nubeterapia_`;

    return text;
  }

  getHumanReadableMessage() {
    const raw = this.buildWhatsAppMessage();
    return decodeURIComponent(raw.replace(/%0A/g, '\n'));
  }

  initWhatsAppPreview() {
    this.checkoutBtn = document.getElementById('cart-checkout-whatsapp-btn');
    this.waModal = document.getElementById('whatsapp-modal');
    this.waChatCanvas = this.waModal ? this.waModal.querySelector('.wa-chat-canvas') : null;
    this.waBackdrop = document.getElementById('whatsapp-modal-backdrop');
    this.waCloseBtn = document.getElementById('wa-modal-close');
    this.waPreviewContent = document.getElementById('wa-preview-content');
    this.waTime = document.getElementById('wa-current-time');
    this.waCopyBtn = document.getElementById('wa-copy-text-btn');
    this.waLaunchLink = document.getElementById('wa-open-chat-link');
    this.copyLabel = document.getElementById('copy-btn-label');

    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener('click', () => {
        if (this.cart.length === 0) {
          alert('Tu cesta está vacía. Añade al menos un producto.');
          return;
        }
        this.openWhatsAppPreview();
      });
    }

    if (this.waCloseBtn) {
      this.waCloseBtn.addEventListener('click', () => this.closeWhatsAppPreview());
    }

    if (this.waBackdrop) {
      this.waBackdrop.addEventListener('click', () => this.closeWhatsAppPreview());
    }

    if (this.waCopyBtn) {
      this.waCopyBtn.addEventListener('click', () => {
        const readable = this.getHumanReadableMessage();
        navigator.clipboard.writeText(readable).then(() => {
          if (this.copyLabel) this.copyLabel.textContent = '¡Copiado con éxito!';
          setTimeout(() => {
            if (this.copyLabel) this.copyLabel.textContent = 'Copiar texto';
          }, 2500);
        });
      });
    }
  }

  openWhatsAppPreview() {
    if (!this.waModal) return;

    if (this.waChatCanvas) {
      this.waChatCanvas.scrollTop = 0;
    }

    const readableText = this.getHumanReadableMessage();
    if (this.waPreviewContent) {
      this.waPreviewContent.textContent = readableText;
    }

    if (this.waTime) {
      const now = new Date();
      this.waTime.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    if (this.waLaunchLink) {
      const encodedMsg = this.buildWhatsAppMessage();
      this.waLaunchLink.href = `https://wa.me/${storeConfig.whatsAppNumber}?text=${encodedMsg}`;
    }

    this.waBackdrop.classList.add('is-active');
    this.waModal.classList.add('is-active');
  }

  closeWhatsAppPreview() {
    if (!this.waModal) return;
    this.waBackdrop.classList.remove('is-active');
    this.waModal.classList.remove('is-active');
  }

  // ---------------------------------------------------------------------------
  // 6. PANEL DE CONTROL DEMO (SIMULACIÓN DE FUNCIONES PHP)
  // ---------------------------------------------------------------------------
  initAdminPanelDemo() {
    const triggers = [
      document.getElementById('open-admin-panel-btn'),
      document.getElementById('open-admin-header-btn'),
      document.getElementById('open-admin-mobile-btn')
    ];

    const adminModal = document.getElementById('admin-modal');
    const adminBackdrop = document.getElementById('admin-modal-backdrop');
    const closeBtn = document.getElementById('admin-modal-close');

    const openAdmin = () => {
      if (!adminModal || !adminBackdrop) return;
      adminBackdrop.classList.add('is-active');
      adminModal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    };

    const closeAdmin = () => {
      if (!adminModal || !adminBackdrop) return;
      adminBackdrop.classList.remove('is-active');
      adminModal.classList.remove('is-active');
      document.body.style.overflow = '';
    };

    triggers.forEach(btn => {
      if (btn) btn.addEventListener('click', openAdmin);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeAdmin);
    if (adminBackdrop) adminBackdrop.addEventListener('click', closeAdmin);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && adminModal && adminModal.classList.contains('is-active')) {
        closeAdmin();
      }
    });

    // Pestañas de administración
    const tabs = Array.from(document.querySelectorAll('.admin-tab'));
    const panes = Array.from(document.querySelectorAll('.admin-tab-pane'));

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-admin-tab');
        tabs.forEach(t => {
          const match = t === tab;
          t.classList.toggle('is-active', match);
          t.setAttribute('aria-selected', match ? 'true' : 'false');
        });

        panes.forEach(pane => {
          if (pane.id === `tab-pane-${targetTab}`) {
            pane.style.display = 'block';
            pane.classList.add('is-active');
          } else {
            pane.style.display = 'none';
            pane.classList.remove('is-active');
          }
        });
      });
    });

    // Acciones simuladas con feedback para el cliente
    const simBtns = Array.from(document.querySelectorAll('.admin-sim-btn'));
    simBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-sim-action');
        if (action === 'crear_producto') {
          this.showToast('🛠️ Simulación: En la fase PHP se abrirá el formulario para subir fotos y crear productos.');
        } else if (action === 'guardar_ajustes') {
          this.showToast('💾 Simulación: Ajustes guardados. En la fase PHP se sincronizarán en la base de datos MySQL.');
        } else if (action === 'exportar_pedidos') {
          this.showToast('📊 Simulación: Generando informe .xlsx con los pedidos registrados de WhatsApp.');
        } else if (action && action.startsWith('editar_')) {
          this.showToast('✏️ Simulación: En la fase PHP podrás editar descripción, ingredientes y fotos de este producto.');
        } else if (action && action.startsWith('precio_')) {
          this.showToast('💶 Simulación: Modificación rápida de precio lista para backend PHP.');
        } else {
          this.showToast('💡 Función de demostración para el cliente (Preparada para backend PHP).');
        }
      });
    });

    // Switches de estado
    const toggles = Array.from(document.querySelectorAll('.admin-toggle-input'));
    toggles.forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const status = e.target.checked ? 'Activado' : 'Pausado';
        this.showToast(`🔄 Simulación: Producto ${status} en el catálogo.`);
      });
    });

    // Gestión de Oferta de Temporada desde el Panel de Control
    const promoSaveBtn = document.getElementById('admin-promo-save-btn');
    const promoPreviewBtn = document.getElementById('admin-promo-preview-btn');
    const promoEnableInput = document.getElementById('admin-promo-enable');
    const promoBadgeInput = document.getElementById('admin-promo-badge-input');
    const promoDiscountInput = document.getElementById('admin-promo-discount-badge-input');
    const promoTitleInput = document.getElementById('admin-promo-title-input');
    const promoDescInput = document.getElementById('admin-promo-desc-input');
    const promoCodeInput = document.getElementById('admin-promo-code-input');
    const promoCtaInput = document.getElementById('admin-promo-cta-input');

    if (storeConfig.seasonalPromo) {
      if (promoEnableInput) promoEnableInput.checked = storeConfig.seasonalPromo.enabled !== false;
      if (promoBadgeInput && storeConfig.seasonalPromo.badge) promoBadgeInput.value = storeConfig.seasonalPromo.badge;
      if (promoDiscountInput && storeConfig.seasonalPromo.discountBadge) promoDiscountInput.value = storeConfig.seasonalPromo.discountBadge;
      if (promoTitleInput && storeConfig.seasonalPromo.title) promoTitleInput.value = storeConfig.seasonalPromo.title;
      if (promoDescInput && storeConfig.seasonalPromo.description) promoDescInput.value = storeConfig.seasonalPromo.description;
      if (promoCodeInput && storeConfig.seasonalPromo.code) promoCodeInput.value = storeConfig.seasonalPromo.code;
      if (promoCtaInput && storeConfig.seasonalPromo.ctaText) promoCtaInput.value = storeConfig.seasonalPromo.ctaText;
    }

    if (promoSaveBtn) {
      promoSaveBtn.addEventListener('click', () => {
        const newPromoConfig = {
          enabled: promoEnableInput ? promoEnableInput.checked : true,
          badge: promoBadgeInput ? promoBadgeInput.value.trim() : '🌸 Oferta Especial de Temporada',
          discountBadge: promoDiscountInput ? promoDiscountInput.value.trim() : '-15% DTO',
          title: promoTitleInput ? promoTitleInput.value.trim() : '15% DTO en tu Primer Pedido',
          description: promoDescInput ? promoDescInput.value.trim() : '',
          code: promoCodeInput ? promoCodeInput.value.trim().toUpperCase() : 'NUBETEMPORADA',
          ctaText: promoCtaInput ? promoCtaInput.value.trim() : 'Aprovechar Oferta'
        };

        storeConfig.seasonalPromo = { ...storeConfig.seasonalPromo, ...newPromoConfig };
        try {
          localStorage.setItem('nubeterapia_seasonal_promo', JSON.stringify(storeConfig.seasonalPromo));
          sessionStorage.removeItem('nubeterapia_promo_dismissed'); // Permitir previsualizar de nuevo
        } catch (e) {
          console.warn('Could not save promo config:', e);
        }

        this.updateSeasonalPromoUI(storeConfig.seasonalPromo);

        const previewCodeTag = document.getElementById('admin-preview-code-tag');
        const previewBadgeTag = document.getElementById('admin-preview-badge-tag');
        if (previewCodeTag) previewCodeTag.textContent = storeConfig.seasonalPromo.code;
        if (previewBadgeTag) previewBadgeTag.textContent = storeConfig.seasonalPromo.discountBadge;

        this.showToast('✅ ¡Oferta de temporada guardada y sincronizada en la tienda!');
      });
    }

    if (promoPreviewBtn) {
      promoPreviewBtn.addEventListener('click', () => {
        closeAdmin();
        setTimeout(() => {
          this.openSeasonalPromo();
        }, 250);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 7. NAVEGACIÓN MÓVIL Y DISPARADORES GLOBALES
  // ---------------------------------------------------------------------------
  initMobileNav() {
    const openBtn = document.getElementById('mobile-menu-open');
    const closeBtn = document.getElementById('mobile-menu-close');
    const navPanel = document.getElementById('mobile-nav');
    const navBackdrop = document.getElementById('mobile-nav-backdrop');

    const toggleNav = (open) => {
      if (!navPanel || !navBackdrop) return;
      navPanel.classList.toggle('is-active', open);
      navBackdrop.classList.toggle('is-active', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };

    if (openBtn) openBtn.addEventListener('click', () => toggleNav(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleNav(false));
    if (navBackdrop) navBackdrop.addEventListener('click', () => toggleNav(false));

    // Enlaces del menú móvil
    const mobileLinks = Array.from(document.querySelectorAll('.mobile-link'));
    mobileLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        toggleNav(false);
        const filter = link.getAttribute('data-filter');
        if (filter) {
          e.preventDefault();
          this.setCategoryFilter(filter);
          const catalogEl = document.getElementById('catalogo');
          if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  initGlobalTriggers() {
    // Escuchar clics en botones de añadir al carrito y ver detalle en cualquier parte del DOM
    document.addEventListener('click', (e) => {
      // 1. Añadir al carrito directo
      const addBtn = e.target.closest('[data-add-to-cart]');
      if (addBtn) {
        const id = addBtn.getAttribute('data-add-to-cart');
        if (id) {
          this.addToCart(id, 1);
        }
        return;
      }

      // 2. Abrir detalle de producto
      const detailBtn = e.target.closest('[data-open-detail]');
      if (detailBtn) {
        const id = detailBtn.getAttribute('data-open-detail');
        if (id) {
          this.openProductModal(id);
        }
        return;
      }

      // 3. Botones de categorías destacadas (FeaturedCategories)
      const filterTrigger = e.target.closest('[data-filter-trigger]');
      if (filterTrigger) {
        const cat = filterTrigger.getAttribute('data-filter-trigger');
        if (cat) {
          this.setCategoryFilter(cat);
          const catEl = document.getElementById('catalogo');
          if (catEl) catEl.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      // 4. Enlaces de navegación con atributo data-filter
      const navFilterLink = e.target.closest('a[data-filter]');
      if (navFilterLink) {
        const cat = navFilterLink.getAttribute('data-filter');
        if (cat) {
          this.setCategoryFilter(cat);
        }
      }
    });

    // Soporte accesible por teclado (Enter / Espacio) al enfocar la foto de producto
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const target = e.target;
        if (target && target.matches && target.matches('[data-open-detail]')) {
          e.preventDefault();
          const id = target.getAttribute('data-open-detail');
          if (id) {
            this.openProductModal(id);
          }
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 8. POP-UP DE OFERTA DE TEMPORADA (CONFIGURABLE VÍA PANEL)
  // ---------------------------------------------------------------------------
  initSeasonalPromo() {
    this.promoModal = document.getElementById('seasonal-promo-modal');
    this.promoBackdrop = document.getElementById('seasonal-promo-backdrop');
    this.promoCloseBtn = document.getElementById('seasonal-promo-close');
    this.promoDismissBtn = document.getElementById('seasonal-promo-dismiss-btn');
    this.promoCopyBtn = document.getElementById('seasonal-promo-copy-btn');
    this.promoCtaBtn = document.getElementById('seasonal-promo-cta-btn');

    // Cargar ajustes guardados en localStorage (si existen desde el panel de control)
    try {
      const savedPromo = localStorage.getItem('nubeterapia_seasonal_promo');
      if (savedPromo) {
        const parsed = JSON.parse(savedPromo);
        storeConfig.seasonalPromo = { ...storeConfig.seasonalPromo, ...parsed };
      }
    } catch (e) {
      console.warn('Error reading seasonal promo config:', e);
    }

    // Actualizar elementos en el DOM con la configuración activa
    this.updateSeasonalPromoUI(storeConfig.seasonalPromo);

    // Eventos de cierre
    if (this.promoCloseBtn) {
      this.promoCloseBtn.addEventListener('click', () => this.closeSeasonalPromo());
    }
    if (this.promoDismissBtn) {
      this.promoDismissBtn.addEventListener('click', () => this.closeSeasonalPromo());
    }
    if (this.promoBackdrop) {
      this.promoBackdrop.addEventListener('click', () => this.closeSeasonalPromo());
    }

    // Evento Copiar Código
    if (this.promoCopyBtn) {
      this.promoCopyBtn.addEventListener('click', () => {
        const code = storeConfig.seasonalPromo?.code || 'NUBETEMPORADA';
        navigator.clipboard.writeText(code).then(() => {
          this.promoCopyBtn.classList.add('is-copied');
          const label = document.getElementById('seasonal-copy-label');
          if (label) label.textContent = '¡Copiado!';
          this.showToast(`🎉 Código ${code} copiado al portapapeles.`);
          setTimeout(() => {
            this.promoCopyBtn.classList.remove('is-copied');
            if (label) label.textContent = 'Copiar';
          }, 3000);
        });
      });
    }

    // Evento Botón CTA
    if (this.promoCtaBtn) {
      this.promoCtaBtn.addEventListener('click', () => {
        const code = storeConfig.seasonalPromo?.code || 'NUBETEMPORADA';
        try {
          navigator.clipboard.writeText(code);
        } catch (_) {}
        this.closeSeasonalPromo();
        const catalogEl = document.getElementById('catalogo');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
        this.showToast(`🌿 ¡Cupón ${code} listo! Selecciona tus productos y añádelos a la cesta.`);
      });
    }

    // Lanzamiento automático tras 2.2 segundos si no fue cerrado en esta sesión y está activo
    const isDismissed = sessionStorage.getItem('nubeterapia_promo_dismissed');
    if (!isDismissed && storeConfig.seasonalPromo?.enabled !== false) {
      setTimeout(() => {
        // Solo abrir si no hay otro modal abierto
        const isAnyModalActive = document.querySelector('.product-modal.is-active, .whatsapp-modal.is-active, .admin-modal.is-active');
        if (!isAnyModalActive) {
          this.openSeasonalPromo();
        }
      }, 2200);
    }
  }

  openSeasonalPromo() {
    if (!this.promoModal || !this.promoBackdrop) return;
    this.promoBackdrop.classList.add('is-active');
    this.promoModal.classList.add('is-active');
  }

  closeSeasonalPromo() {
    if (!this.promoModal || !this.promoBackdrop) return;
    this.promoBackdrop.classList.remove('is-active');
    this.promoModal.classList.remove('is-active');
    sessionStorage.setItem('nubeterapia_promo_dismissed', 'true');
  }

  updateSeasonalPromoUI(promo) {
    if (!promo) return;
    const badgeEl = document.getElementById('seasonal-promo-badge');
    const titleEl = document.getElementById('seasonal-promo-title');
    const descEl = document.getElementById('seasonal-promo-desc');
    const codeEl = document.getElementById('seasonal-promo-code');
    const discountEl = document.getElementById('seasonal-promo-discount-text');
    const ctaEl = document.getElementById('seasonal-promo-cta-label');

    if (badgeEl && promo.badge) badgeEl.textContent = promo.badge;
    if (titleEl && promo.title) titleEl.textContent = promo.title;
    if (descEl && promo.description) descEl.textContent = promo.description;
    if (codeEl && promo.code) codeEl.textContent = promo.code;
    if (discountEl && promo.discountBadge) discountEl.textContent = promo.discountBadge;
    if (ctaEl && promo.ctaText) ctaEl.textContent = promo.ctaText;
  }

  showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
}

// Iniciar aplicación cuando el DOM esté listo
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.__NUBETERAPIA_APP__ = new NubeterapiaShop();
  });
}
