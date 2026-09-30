/**
 * NX Studio - Premium Interactive UI Components
 * Houses logic for dynamic search filters, sliders, modal dialog systems,
 * project wizard states, animated counters, FAQ grids, and dynamic tab panels.
 */

/* ==========================================================================
   ANIMATED STATS COUNTERS
   ========================================================================== */
function initStatsCounters() {
  const statsElements = document.querySelectorAll('.counter-number');
  if (statsElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetVal = parseInt(target.getAttribute('data-target'), 10);
        animateCounter(target, targetVal);
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  statsElements.forEach(el => observer.observe(el));
}

function animateCounter(element, targetVal) {
  let currentVal = 0;
  const duration = 2000; // 2 seconds
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease-out cubic formula
    const ease = 1 - Math.pow(1 - progress, 3);
    
    currentVal = Math.floor(ease * targetVal);
    element.textContent = currentVal;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = targetVal;
    }
  }

  requestAnimationFrame(update);
}

/* ==========================================================================
   TESTIMONIAL CAROUSEL SLIDER
   ========================================================================== */
function initTestimonialSlider() {
  const viewport = document.querySelector('.slider-viewport');
  const track = document.querySelector('.slider-track');
  const dotsContainer = document.querySelector('.slider-dots');

  if (!viewport || !track) return;

  // Clear existing static items (if any) and render dynamically
  const testimonials = window.NX_DATA ? window.NX_DATA.testimonials : [];
  if (testimonials.length === 0) return;

  track.innerHTML = testimonials.map(item => {
    // Generate star SVGs based on rating
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
      starsHtml += '★';
    }

    return `
      <div class="slider-slide">
        <div class="testimonial-card">
          <div class="testimonial-quote-icon">“</div>
          <div class="testimonial-rating">${starsHtml}</div>
          <p class="testimonial-review">"${item.review}"</p>
          <div class="testimonial-profile">
            <div class="testimonial-avatar">
              <img src="${item.photo}" alt="${item.name}" loading="lazy">
            </div>
            <div class="testimonial-meta">
              <h4>${item.name}</h4>
              <p>${item.company} &bull; ${item.industry}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const slides = Array.from(track.children);
  const slideCount = slides.length;
  let activeIndex = 0;

  // Create dot indicators
  dotsContainer.innerHTML = testimonials.map((_, idx) => `
    <div class="slider-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></div>
  `).join('');

  const dots = Array.from(dotsContainer.children);

  // Position slides side-by-side
  slides.forEach((slide) => {
    slide.style.width = `${100 / slideCount}%`;
  });
  track.style.width = `${slideCount * 100}%`;

  const updateSlider = (index) => {
    activeIndex = index;
    track.style.transform = `translateX(-${activeIndex * (100 / slideCount)}%)`;
    
    dots.forEach(dot => dot.classList.remove('active'));
    dots[activeIndex].classList.add('active');
  };

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const targetIndex = parseInt(e.target.dataset.index, 10);
      updateSlider(targetIndex);
    });
  });

  // Touch/Drag Support variables
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  viewport.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    isDragging = true;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - currentX;
    if (Math.abs(diff) > 80) { // Drag threshold
      if (diff > 0 && activeIndex < slideCount - 1) {
        updateSlider(activeIndex + 1);
      } else if (diff < 0 && activeIndex > 0) {
        updateSlider(activeIndex - 1);
      }
    }
  });

  // Mobile Touch Support
  viewport.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  });

  viewport.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
  });

  viewport.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - currentX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeIndex < slideCount - 1) {
        updateSlider(activeIndex + 1);
      } else if (diff < 0 && activeIndex > 0) {
        updateSlider(activeIndex - 1);
      }
    }
  });

  // Auto-scroll loop
  let autoScroll = setInterval(() => {
    let nextIndex = activeIndex + 1;
    if (nextIndex >= slideCount) nextIndex = 0;
    updateSlider(nextIndex);
  }, 7000);

  viewport.addEventListener('mouseenter', () => clearInterval(autoScroll));
  viewport.addEventListener('mouseleave', () => {
    autoScroll = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= slideCount) nextIndex = 0;
      updateSlider(nextIndex);
    }, 7000);
  });
}

/* ==========================================================================
   FAQ ACCORDION TRIGGERS
   ========================================================================== */
function initFaqAccordions() {
  const container = document.getElementById('faq-accordion-container');
  if (!container) return;

  const faqs = window.NX_DATA ? window.NX_DATA.faqs : [];
  if (faqs.length === 0) return;

  // Filter based on active page category defaults or list all
  const currentPage = window.location.pathname.split("/").pop();
  let filteredFaqs = faqs;
  if (currentPage === 'services.html') {
    filteredFaqs = faqs.filter(f => f.category === 'services' || f.category === 'workflow');
  } else if (currentPage === 'studio.html') {
    filteredFaqs = faqs.filter(f => f.category === 'equipment' || f.category === 'agency');
  }

  container.innerHTML = filteredFaqs.map(faq => `
    <div class="faq-item">
      <button class="faq-trigger">
        <span>${faq.question}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      <div class="faq-panel">
        <p>${faq.answer}</p>
      </div>
    </div>
  `).join('');

  // Add click toggle logic
  const items = container.querySelectorAll('.faq-item');
  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close other accordions
      items.forEach(i => i.classList.remove('active'));

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   EQUIPMENT TABS DISPLAY (Studio Page)
   ========================================================================== */
function initEquipmentTabs() {
  const tabsContainer = document.getElementById('equipment-tabs');
  const panelsContainer = document.getElementById('equipment-panels');

  if (!tabsContainer || !panelsContainer) return;

  const equipment = window.NX_DATA ? window.NX_DATA.equipment : [];
  if (equipment.length === 0) return;

  // Render tabs
  tabsContainer.innerHTML = equipment.map((eq, idx) => `
    <button class="equipment-tab ${idx === 0 ? 'active' : ''}" data-tab="${idx}">${eq.category}</button>
  `).join('');

  // Render panels
  panelsContainer.innerHTML = equipment.map((eq, idx) => `
    <div class="equipment-panel ${idx === 0 ? 'active' : ''}" id="eq-panel-${idx}">
      <div class="equipment-grid">
        ${eq.items.map(item => `
          <div class="equipment-item">
            <div class="equipment-item-bullet"></div>
            <div class="equipment-item-text">${item}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  // Tab click toggle logic
  const tabs = tabsContainer.querySelectorAll('.equipment-tab');
  const panels = panelsContainer.querySelectorAll('.equipment-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const idx = tab.dataset.tab;
      document.getElementById(`eq-panel-${idx}`).classList.add('active');
    });
  });
}

/* ==========================================================================
   DYNAMIC PORTFOLIO GRID (Search, Filters, Sort)
   ========================================================================== */
let activePortfolioFilter = 'all';
let activePortfolioSort = 'newest';
let portfolioSearchQuery = '';
let portfolioViewMode = 'grid'; // 'grid' or 'masonry'

function initPortfolioFilters() {
  const grid = document.getElementById('portfolio-grid');
  const filtersContainer = document.getElementById('portfolio-filters-container');
  const searchInput = document.getElementById('portfolio-search-input');
  const sortSelect = document.getElementById('portfolio-sort-select');
  const viewToggle = document.getElementById('portfolio-view-toggle');

  if (!grid) return;

  const projects = window.NX_DATA ? window.NX_DATA.portfolio : [];
  if (projects.length === 0) return;

  // Render filters dynamically (categories present in database)
  if (filtersContainer) {
    const categories = ['all', 'branding', 'films', 'ads', 'photography', 'editing', 'motiongraphics', 'uiux', 'webdesign'];
    const friendlyNames = {
      all: 'All', branding: 'Branding', films: 'Films', ads: 'Ads', 
      photography: 'Photography', editing: 'Editing', motiongraphics: 'Motion Graphics',
      uiux: 'UI/UX', webdesign: 'Web Design'
    };

    filtersContainer.innerHTML = categories.map(cat => `
      <button class="btn btn-secondary ${cat === activePortfolioFilter ? 'btn-primary' : ''}" data-filter="${cat}" style="padding: 0.5rem 1.25rem; font-size: 0.75rem; text-transform: uppercase;">
        ${friendlyNames[cat] || cat}
      </button>
    `).join('');

    // Click handler for category filters
    filtersContainer.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        filtersContainer.querySelectorAll('button').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');

        activePortfolioFilter = btn.dataset.filter;
        renderPortfolioGrid(grid, projects);
      });
    });
  }

  // Live search handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      portfolioSearchQuery = e.target.value.toLowerCase().trim();
      renderPortfolioGrid(grid, projects);
    });
  }

  // Sort handler
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activePortfolioSort = e.target.value;
      renderPortfolioGrid(grid, projects);
    });
  }

  // View toggle layout handler
  if (viewToggle) {
    viewToggle.addEventListener('click', () => {
      portfolioViewMode = portfolioViewMode === 'grid' ? 'masonry' : 'grid';
      viewToggle.textContent = portfolioViewMode === 'grid' ? 'Masonry View' : 'Standard Grid';
      grid.className = portfolioViewMode === 'grid' ? 'portfolio-grid-layout' : 'portfolio-masonry-layout';
      renderPortfolioGrid(grid, projects);
    });
  }

  // Initial draw
  renderPortfolioGrid(grid, projects);
}

function renderPortfolioGrid(container, items) {
  // Show skeletons loader initially
  container.innerHTML = Array(3).fill(0).map(() => `
    <div style="height: 380px; border-radius: 8px; overflow: hidden;">
      <div class="skeleton-box"></div>
    </div>
  `).join('');

  setTimeout(() => {
    // 1. Filter by category
    let filtered = items;
    if (activePortfolioFilter !== 'all') {
      filtered = filtered.filter(item => item.category === activePortfolioFilter);
    }

    // 2. Filter by search query (title, tags, client, industry)
    if (portfolioSearchQuery) {
      filtered = filtered.filter(item => {
        return item.title.toLowerCase().includes(portfolioSearchQuery) ||
               item.client.toLowerCase().includes(portfolioSearchQuery) ||
               item.industry.toLowerCase().includes(portfolioSearchQuery) ||
               item.tags.some(tag => tag.toLowerCase().includes(portfolioSearchQuery)) ||
               item.technologies.some(tech => tech.toLowerCase().includes(portfolioSearchQuery));
      });
    }

    // 3. Sort logic
    if (activePortfolioSort === 'newest') {
      filtered.sort((a, b) => b.year - a.year);
    } else if (activePortfolioSort === 'oldest') {
      filtered.sort((a, b) => a.year - b.year);
    }

    if (filtered.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--color-grey-light);">No projects found matching the criteria.</div>`;
      return;
    }

    // Render cards
    container.innerHTML = filtered.map(item => {
      const friendlyCats = {
        branding: 'Branding', films: 'Film', ads: 'Ad Campaign',
        photography: 'Photography', editing: 'Post Production', motiongraphics: 'Motion Graphics',
        uiux: 'UI/UX', webdesign: 'Web Design'
      };

      return `
        <div class="portfolio-card reveal-scale-up revealed" data-project-id="${item.id}">
          <div class="portfolio-card-media">
            <span class="portfolio-card-badge">${friendlyCats[item.category] || item.category}</span>
            <img src="${item.featuredImage}" alt="${item.title}" loading="lazy">
            <div class="portfolio-card-overlay"></div>
          </div>
          <div class="portfolio-card-body">
            <p class="portfolio-card-client">${item.client} &bull; ${item.industry}</p>
            <h3 class="portfolio-card-title">${item.title}</h3>
            <p class="portfolio-card-desc">${item.summary}</p>
            <div class="portfolio-card-tags">
              ${item.tags.map(t => `<span>#${t}</span>`).join('')}
            </div>
            <div class="portfolio-card-footer">
              <span class="portfolio-card-year">${item.year}</span>
              <button class="btn-link view-case-btn" data-project-id="${item.id}">View Case Study</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click triggers to open project detail modals
    container.querySelectorAll('.portfolio-card, .view-case-btn').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = trigger.dataset.projectId;
        openProjectModal(id);
      });
    });
  }, 400);
}

/* ==========================================================================
   DYNAMIC CONTENT GENERATION ON HERO & OTHER PAGES
   ========================================================================== */
function initFeaturedServices() {
  const homeGrid = document.getElementById('services-grid-home');
  const services = window.NX_DATA ? window.NX_DATA.services : [];
  if (services.length === 0) return;

  if (homeGrid) {
    homeGrid.innerHTML = services.slice(0, 6).map(item => `
      <div class="service-card reveal-scale-up">
        <div class="service-card-image">
          <img src="https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=90&w=2400&auto=format&fit=crop" alt="${item.name}" loading="lazy">
          <div class="service-card-icon">${item.iconSvg}</div>
        </div>
        <div class="service-card-body">
          <h3 class="service-card-title">${item.name}</h3>
          <p class="service-card-tagline">${item.tagline}</p>
          <p class="service-card-desc">${item.description}</p>
          <ul class="service-card-features">
            ${item.features.slice(0, 5).map(f => `<li>${f}</li>`).join('')}
          </ul>
          <div class="service-card-footer">
            <div class="service-card-meta">
              <span>Timeline</span> ${item.timeline}
            </div>
            <a href="services.html#${item.id}" class="btn-link">Details</a>
          </div>
        </div>
      </div>
    `).join('');
  }

  const creativeGrid = document.getElementById('services-grid-creative');
  const digitalGrid = document.getElementById('services-grid-digital');
  const strategyGrid = document.getElementById('services-grid-strategy');

  if (creativeGrid && digitalGrid && strategyGrid) {
    const renderServiceBlock = (targetGrid, filteredItems) => {
      targetGrid.innerHTML = filteredItems.map(item => `
        <div class="service-card reveal-scale-up" id="${item.id}">
          <div class="service-card-image">
            <img src="https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=90&w=2400&auto=format&fit=crop" alt="${item.name}">
            <div class="service-card-icon">${item.iconSvg}</div>
          </div>
          <div class="service-card-body">
            <h3 class="service-card-title">${item.name}</h3>
            <p class="service-card-tagline">${item.tagline}</p>
            <p class="service-card-desc">${item.description}</p>
            
            <div style="margin-bottom:1.5rem;">
              <strong style="font-size:0.75rem; text-transform:uppercase; color:var(--color-red); display:block; margin-bottom:0.5rem; letter-spacing:0.05em;">Key Deliverables</strong>
              <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                ${item.deliverables.map(d => `<span style="font-size:0.75rem; background-color:var(--color-black); border:1px solid var(--color-grey-dark); padding:0.25rem 0.5rem; border-radius:3px;">${d}</span>`).join('')}
              </div>
            </div>

            <ul class="service-card-features">
              ${item.features.map(f => `<li>${f}</li>`).join('')}
            </ul>

            <div style="background-color:var(--color-charcoal-deep); padding:1rem; border-radius:4px; margin-bottom:2rem; font-size:0.85rem;">
              <strong style="color:var(--color-white);">Best For:</strong> ${item.bestFor}
            </div>

            <div class="service-card-footer">
              <div class="service-card-meta">
                <span>Timeline</span> ${item.timeline}
              </div>
              <a href="contact.html?service=${item.id}" class="btn btn-primary" style="padding: 0.6rem 1.25rem; font-size: 0.75rem;">Get Started</a>
            </div>
          </div>
        </div>
      `).join('');
    };

    renderServiceBlock(creativeGrid, services.filter(s => s.category === 'creative-film'));
    renderServiceBlock(digitalGrid, services.filter(s => s.category === 'digital-dev'));
    renderServiceBlock(strategyGrid, services.filter(s => s.category === 'brand-strategy'));
  }
}

function initLatestWork() {
  const latestGrid = document.getElementById('latest-work-grid');
  if (!latestGrid) return;

  const projects = window.NX_DATA ? window.NX_DATA.portfolio : [];
  if (projects.length === 0) return;

  latestGrid.innerHTML = projects.slice(0, 3).map(item => `
    <div class="portfolio-card reveal-scale-up" data-project-id="${item.id}">
      <div class="portfolio-card-media">
        <span class="portfolio-card-badge">${item.category.toUpperCase()}</span>
        <img src="${item.featuredImage}" alt="${item.title}" loading="lazy">
        <div class="portfolio-card-overlay"></div>
      </div>
      <div class="portfolio-card-body">
        <p class="portfolio-card-client">${item.client} &bull; ${item.industry}</p>
        <h3 class="portfolio-card-title">${item.title}</h3>
        <p class="portfolio-card-desc">${item.summary}</p>
        <div class="portfolio-card-footer">
          <span class="portfolio-card-year">${item.year}</span>
          <button class="btn-link view-case-btn" data-project-id="${item.id}">View Project</button>
        </div>
      </div>
    </div>
  `).join('');

  latestGrid.querySelectorAll('.portfolio-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.projectId;
      openProjectModal(id);
    });
  });
}

function initIndustriesGrid() {
  const container = document.getElementById('industries-grid');
  if (!container) return;

  const industries = window.NX_DATA ? window.NX_DATA.industries : [];
  container.innerHTML = industries.map(ind => `
    <div class="service-card reveal-scale-up" style="padding: 2.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 220px;">
      <div style="color: var(--color-red); margin-bottom: 1.25rem;">${ind.iconSvg}</div>
      <h3 style="font-size: 1.25rem; margin-bottom: 0.75rem;">${ind.name}</h3>
      <p style="font-size: 0.9rem; line-height: 1.5; color: var(--color-grey-light);">${ind.description}</p>
    </div>
  `).join('');
}

function initProcessTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  const steps = window.NX_DATA ? window.NX_DATA.creativeProcess : [];
  container.innerHTML = steps.map(step => `
    <div class="timeline-item reveal-fade-in">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-title-row">
          <span class="timeline-number">0${step.step}</span>
          <span class="timeline-icon">${step.icon}</span>
          <h4 class="timeline-title">${step.title}</h4>
        </div>
        <p class="timeline-desc">${step.description}</p>
      </div>
    </div>
  `).join('');
}

function initWhyChooseGrid() {
  const container = document.getElementById('why-choose-grid');
  if (!container) return;

  const features = window.NX_DATA ? window.NX_DATA.whyChooseUs : [];
  container.innerHTML = features.map(feat => `
    <div class="service-card reveal-scale-up" style="padding: 2.5rem;">
      <div style="font-size: 2.5rem; color: var(--color-red); margin-bottom: 1rem;">${feat.icon}</div>
      <h3 style="font-size: 1.35rem; margin-bottom: 0.75rem;">${feat.title}</h3>
      <p style="font-size: 0.9rem; line-height: 1.5; color: var(--color-grey-light);">${feat.description}</p>
    </div>
  `).join('');
}

function initTeamGrid() {
  const container = document.getElementById('team-grid');
  if (!container) return;

  const team = window.NX_DATA ? window.NX_DATA.team : [];
  container.innerHTML = team.map(member => `
    <div class="team-card reveal-scale-up">
      <div class="team-card-image">
        <img src="${member.photo}" alt="${member.name}" loading="lazy">
      </div>
      <div class="team-card-overlay">
        <div class="team-card-details">
          <h3 class="team-card-name">${member.name}</h3>
          <p class="team-card-role">${member.position} &bull; ${member.experience}</p>
          <p class="team-card-bio">${member.bio}</p>
          <div class="team-card-skills">
            ${member.skills.map(s => `<span>${s}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function initClientLogos() {
  const track = document.getElementById('client-marquee-track');
  if (!track) return;

  const clients = window.NX_DATA ? window.NX_DATA.clients : [];
  const doubleList = [...clients, ...clients];
  
  track.innerHTML = doubleList.map(c => `
    <div style="flex-shrink: 0; padding: 0 3.5rem; display: flex; align-items: center; justify-content: center; height: 100%;">
      <span style="font-family: var(--font-display); font-size: 1.85rem; font-weight: 800; color: var(--color-grey-mid); letter-spacing: 0.08em; transition: var(--transition-fast); cursor: default;" onmouseover="this.style.color='var(--color-red)'" onmouseout="this.style.color='var(--color-grey-mid)'">${c.logoText}</span>
    </div>
  `).join('');
}

function initCareersAccordions() {
  const container = document.getElementById('careers-container');
  if (!container) return;

  const careers = window.NX_DATA ? window.NX_DATA.careers : [];
  container.innerHTML = careers.map(c => `
    <div class="faq-item" style="border-top:1px solid var(--color-grey-dark);">
      <button class="faq-trigger">
        <div>
          <span style="display:block; font-size:1.25rem; font-weight:700;">${c.title}</span>
          <span style="font-size:0.75rem; color:var(--color-grey-light); text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">${c.department} &bull; ${c.location} &bull; ${c.type}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      <div class="faq-panel">
        <div style="padding-top:1.5rem; font-size:0.95rem; line-height:1.6; color:var(--color-grey-light);">
          <p style="margin-bottom:1.5rem;">${c.description}</p>
          <strong style="color:var(--color-white); display:block; margin-bottom:0.5rem; text-transform:uppercase; font-size:0.8rem; letter-spacing:0.05em;">Key Requirements:</strong>
          <ul style="list-style:disc; padding-left:1.5rem; margin-bottom:2rem; display:grid; gap:0.5rem;">
            ${c.requirements.map(req => `<li>${req}</li>`).join('')}
          </ul>
          <a href="contact.html?career=${c.id}" class="btn btn-primary" style="padding: 0.6rem 1.5rem; font-size: 0.75rem;">Apply For This Position</a>
        </div>
      </div>
    </div>
  `).join('');

  const items = container.querySelectorAll('.faq-item');
  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    trigger.addEventListener('click', () => {
      const active = item.classList.contains('active');
      items.forEach(i => i.classList.remove('active'));
      if (!active) item.classList.add('active');
    });
  });
}

function initResourcesGrid() {
  const container = document.getElementById('resources-grid');
  if (!container) return;

  const resources = window.NX_DATA ? window.NX_DATA.resources : [];
  container.innerHTML = resources.map(res => `
    <div class="service-card reveal-scale-up" style="padding: 2.25rem;">
      <span style="background-color: rgba(255, 30, 39, 0.1); color: var(--color-red); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; padding: 0.35rem 0.75rem; border-radius: 3px; display: inline-block; margin-bottom: 1.25rem;">${res.type} &bull; ${res.downloadSize}</span>
      <h3 style="font-size: 1.35rem; margin-bottom: 0.75rem;">${res.title}</h3>
      <p style="font-size: 0.9rem; line-height: 1.5; color: var(--color-grey-light); margin-bottom: 2rem;">${res.description}</p>
      <a href="${res.link}" class="btn btn-secondary" style="width: 100%; font-size: 0.75rem; padding: 0.75rem;">Download Resource</a>
    </div>
  `).join('');
}

/* ==========================================================================
   BLOG DRAWER (Stub - for studio.html insights cards)
   ========================================================================== */
function openBlogDrawer(blogId) {
  var blogs = window.NX_DATA ? window.NX_DATA.blog : [];
  var post = blogs.find(function (b) { return b.id === blogId; });
  if (!post) return;
  if (typeof window.showToast === 'function') {
    window.showToast('Opening: ' + post.title);
  }
}

/* ==========================================================================
   INITIALIZE DYNAMIC SCRIPTS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initStatsCounters();
  initTestimonialSlider();
  initFaqAccordions();
  initEquipmentTabs();
  initPortfolioFilters();
  if (typeof initBlogFilters === 'function') initBlogFilters();
  initProjectWizard();

  initFeaturedServices();
  initLatestWork();
  initIndustriesGrid();
  initProcessTimeline();
  initWhyChooseGrid();
  initTeamGrid();
  initClientLogos();
  initCareersAccordions();
  initResourcesGrid();

  setTimeout(() => {
    if (typeof initScrollReveal === 'function') initScrollReveal();
  }, 600);
});

/* ==========================================================================
   DYNAMIC PROJECT DETAILS MODAL & LIGHTBOX
   ========================================================================== */
function openProjectModal(projectId) {
  const projects = window.NX_DATA ? window.NX_DATA.portfolio : [];
  const project = projects.find(p => p.id === projectId);
  if (!project) return;

  let modal = document.getElementById('project-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'project-detail-modal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content-container">
      <button class="modal-close-btn" id="modal-close-btn">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <!-- Banner image -->
      <div style="width:100%; height: 380px; position:relative; overflow:hidden;">
        <img src="${project.featuredImage}" style="width:100%; height:100%; object-fit:cover;" alt="${project.title}">
        <div style="position:absolute; bottom:0; left:0; width:100%; height:100%; background:linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 80%);"></div>
        <div style="position:absolute; bottom:2.5rem; left:2.5rem; right:2.5rem;">
          <span style="background-color:var(--color-red); color:var(--color-white); font-size:0.75rem; font-weight:700; text-transform:uppercase; padding:0.4rem 0.8rem; border-radius:3px; letter-spacing:0.05em; display:inline-block; margin-bottom:1rem;">${project.category}</span>
          <h2 style="font-size: clamp(2rem, 4vw, 3rem); font-weight:800; line-height:1.1;">${project.title}</h2>
        </div>
      </div>

      <!-- Case study details -->
      <div style="padding:3.5rem 2.5rem;">
        
        <!-- Grid: Core Metrics and info -->
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:3rem; margin-bottom:4rem;">
          
          <!-- Column 1: Narrative sections -->
          <div>
            <div style="margin-bottom:2.5rem;">
              <h3 style="font-size:1.5rem; margin-bottom:1rem; border-bottom:1px solid var(--color-grey-dark); padding-bottom:0.5rem; color:var(--color-red);">Project Overview</h3>
              <p style="color:var(--color-grey-light); font-size:1rem; line-height:1.7;">${project.overview}</p>
            </div>

            <div style="margin-bottom:2.5rem;">
              <h3 style="font-size:1.5rem; margin-bottom:1rem; border-bottom:1px solid var(--color-grey-dark); padding-bottom:0.5rem; color:var(--color-red);">The Challenge</h3>
              <p style="color:var(--color-grey-light); font-size:1rem; line-height:1.7;">${project.problem}</p>
            </div>

            <div style="margin-bottom:2.5rem;">
              <h3 style="font-size:1.5rem; margin-bottom:1rem; border-bottom:1px solid var(--color-grey-dark); padding-bottom:0.5rem; color:var(--color-red);">The Solution</h3>
              <p style="color:var(--color-grey-light); font-size:1rem; line-height:1.7;">${project.solution}</p>
            </div>
          </div>

          <!-- Column 2: Specs & Metrics -->
          <div style="background-color:var(--color-charcoal-deep); border:1px solid var(--color-grey-dark); padding:2rem; border-radius:6px; height:fit-content;">
            <h4 style="font-size:1rem; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:1.5rem; color:var(--color-white);">Project Info</h4>
            
            <div style="margin-bottom:1.25rem;">
              <span style="display:block; font-size:0.75rem; text-transform:uppercase; color:var(--color-grey-light);">Client</span>
              <span style="font-size:0.95rem; font-weight:600; color:var(--color-white);">${project.client}</span>
            </div>

            <div style="margin-bottom:1.25rem;">
              <span style="display:block; font-size:0.75rem; text-transform:uppercase; color:var(--color-grey-light);">Industry</span>
              <span style="font-size:0.95rem; font-weight:600; color:var(--color-white);">${project.industry}</span>
            </div>

            <div style="margin-bottom:1.25rem;">
              <span style="display:block; font-size:0.75rem; text-transform:uppercase; color:var(--color-grey-light);">Year</span>
              <span style="font-size:0.95rem; font-weight:600; color:var(--color-white);">${project.year}</span>
            </div>

            <div style="margin-bottom:1.25rem;">
              <span style="display:block; font-size:0.75rem; text-transform:uppercase; color:var(--color-grey-light);">Technologies</span>
              <div style="display:flex; flex-wrap:wrap; gap:0.3rem; margin-top:0.3rem;">
                ${project.technologies.map(t => `<span style="font-size:0.7rem; background:var(--color-black); border:1px solid var(--color-grey-dark); padding:0.2rem 0.4rem; border-radius:3px;">${t}</span>`).join('')}
              </div>
            </div>

            <div style="border-top:1px solid var(--color-grey-dark); padding-top:1.25rem; margin-top:1.5rem;">
              <span style="display:block; font-size:0.75rem; text-transform:uppercase; color:var(--color-red); margin-bottom:0.5rem; font-weight:700;">Key Result Metric</span>
              <p style="font-size:0.95rem; font-weight:600; color:var(--color-white);">${project.metrics}</p>
            </div>
          </div>

        </div>

        <!-- Gallery Grid -->
        <div>
          <h3 style="font-size:1.5rem; margin-bottom:1.5rem; color:var(--color-white);">Gallery & Deliverables</h3>
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:1.5rem;">
            ${(project.images || project.gallery || []).map(img => `
              <div style="border-radius:6px; overflow:hidden; border:1px solid var(--color-grey-dark); height:220px;">
                <img src="${img}" style="width:100%; height:100%; object-fit:cover; transition:var(--transition-fast);" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'" alt="Gallery item">
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  const closeBtn = document.getElementById('modal-close-btn');
  closeBtn.addEventListener('click', () => closeProjectModal());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeProjectModal();
  });
}

function closeProjectModal() {
  const modal = document.getElementById('project-detail-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   PROJECT STARTER WIZARD LOGIC & EMAILJS INTEGRATION
   ========================================================================== */
window.wizardState = {
  category: '',
  budget: '',
  timeline: '',
  services: []
};

function initProjectWizard() {
  const wizard = document.getElementById('project-starter-wizard');
  if (!wizard) return;

  let currentStep = 1;
  const totalSteps = 8;
  
  const nextBtn = document.getElementById('wizard-next-btn');
  const prevBtn = document.getElementById('wizard-prev-btn');
  const progressText = document.getElementById('progress-text-step');
  const progressBar = wizard.querySelector('.wizard-progress-bar');
  const steps = wizard.querySelectorAll('.wizard-step');

  // Single select cards listener
  wizard.querySelectorAll('[data-single-select]').forEach(card => {
    card.addEventListener('click', () => {
      const group = card.dataset.stateKey;
      wizard.querySelectorAll(`[data-state-key="${group}"]`).forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      window.wizardState[group] = card.dataset.value;
    });
  });

  // Multi select cards listener
  wizard.querySelectorAll('[data-multi-select]').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('active');
      const val = card.querySelector('.selection-card-title').textContent.trim();
      if (card.classList.contains('active')) {
        if (!window.wizardState.services.includes(val)) window.wizardState.services.push(val);
      } else {
        window.wizardState.services = window.wizardState.services.filter(s => s !== val);
      }
    });
  });

  function updateWizardView() {
    steps.forEach((stepEl, idx) => {
      stepEl.classList.toggle('active', idx === currentStep - 1);
    });

    if (progressText) progressText.textContent = currentStep;
    if (progressBar) progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;

    if (prevBtn) {
      prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    }

    if (nextBtn) {
      if (currentStep === totalSteps) {
        nextBtn.textContent = 'Submit Proposal 🚀';
      } else {
        nextBtn.textContent = 'Next Step ➔';
      }
    }

    // Populate review step if we are on step 8
    if (currentStep === 8) {
      const reviewContainer = document.getElementById('wizard-review-summary');
      if (reviewContainer) {
        reviewContainer.innerHTML = `
          <div style="background-color:var(--color-black); border:1px solid var(--color-grey-dark); padding:1.25rem; border-radius:6px; font-size:0.9rem;">
            <p style="margin-bottom:0.5rem;"><strong style="color:var(--color-red);">Contact:</strong> ${document.getElementById('w-name').value || 'N/A'}</p>
            <p style="margin-bottom:0.5rem;"><strong style="color:var(--color-red);">Email:</strong> ${document.getElementById('w-email').value || 'N/A'}</p>
            <p style="margin-bottom:0.5rem;"><strong style="color:var(--color-red);">Company:</strong> ${document.getElementById('w-company').value || 'N/A'}</p>
            <p style="margin-bottom:0;"><strong style="color:var(--color-red);">Country:</strong> ${document.getElementById('w-country').value || 'N/A'}</p>
          </div>
          <div style="background-color:var(--color-black); border:1px solid var(--color-grey-dark); padding:1.25rem; border-radius:6px; font-size:0.9rem;">
            <p style="margin-bottom:0.5rem;"><strong style="color:var(--color-red);">Category:</strong> ${window.wizardState.category || 'N/A'}</p>
            <p style="margin-bottom:0.5rem;"><strong style="color:var(--color-red);">Budget:</strong> ${window.wizardState.budget || 'N/A'}</p>
            <p style="margin-bottom:0.5rem;"><strong style="color:var(--color-red);">Timeline:</strong> ${window.wizardState.timeline || 'N/A'}</p>
            <p style="margin-bottom:0;"><strong style="color:var(--color-red);">Services:</strong> ${window.wizardState.services.join(', ') || 'None selected'}</p>
          </div>
        `;
      }
    }
  }

  function clearWizardErrors() {
    wizard.querySelectorAll('.form-error-msg').forEach(function (el) {
      el.textContent = '';
      el.style.display = 'none';
    });
    wizard.querySelectorAll('.form-control').forEach(function (el) {
      el.style.borderColor = '';
    });
  }

  function showWizardFieldError(input, message) {
    input.style.borderColor = 'var(--color-red)';
    var errorEl = input.parentElement.querySelector('.form-error-msg');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
    input.focus({ preventScroll: true });
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function validateStep() {
    clearWizardErrors();
    if (currentStep === 1) {
      var name = document.getElementById('w-name').value.trim();
      var email = document.getElementById('w-email').value.trim();
      if (!name) {
        showWizardFieldError(document.getElementById('w-name'), 'Please enter your full name.');
        return false;
      }
      if (!email) {
        showWizardFieldError(document.getElementById('w-email'), 'Please enter your email address.');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showWizardFieldError(document.getElementById('w-email'), 'Please enter a valid email address.');
        return false;
      }
    }
    if (currentStep === 2) {
      var company = document.getElementById('w-company').value.trim();
      var country = document.getElementById('w-country').value;
      if (!company) {
        showWizardFieldError(document.getElementById('w-company'), 'Please enter your company name.');
        return false;
      }
      if (!country) {
        showWizardFieldError(document.getElementById('w-country'), 'Please select your country.');
        return false;
      }
    }
    if (currentStep === 7) {
      var desc = document.getElementById('w-description').value.trim();
      if (!desc) {
        showWizardFieldError(document.getElementById('w-description'), 'Please describe your project.');
        return false;
      }
    }
    if (currentStep === 8) {
      var terms = document.getElementById('w-terms');
      if (terms && !terms.checked) {
        if (typeof window.showToast === 'function') {
          window.showToast('Please agree to the Terms & Conditions and Privacy Policy to submit.');
        }
        return false;
      }
    }
    return true;
  }

  function scrollToActiveStep() {
    var active = wizard.querySelector('.wizard-step.active');
    if (active) {
      var rect = active.getBoundingClientRect();
      var headerH = 100;
      var isVisible = rect.top >= headerH && rect.bottom <= window.innerHeight;
      if (!isVisible) {
        active.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.scrollBy(0, -headerH);
      }
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!validateStep()) return;

      if (currentStep < totalSteps) {
        currentStep++;
        updateWizardView();
        scrollToActiveStep();
      } else {
        submitWizardProposal();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentStep > 1) {
        currentStep--;
        updateWizardView();
        scrollToActiveStep();
      }
    });
  }

  updateWizardView();
}

function submitWizardProposal() {
  var cfg = (typeof NX_EMAILJS !== 'undefined') ? NX_EMAILJS : null;
  if (!cfg || typeof emailjs === 'undefined') {
    alert('Email service is not configured. Please contact us directly at nx.studio.net@outlook.com.');
    return;
  }

  var formData = {
    from_name: document.getElementById('w-name').value,
    from_email: document.getElementById('w-email').value,
    phone: document.getElementById('w-phone').value || 'N/A',
    company: document.getElementById('w-company').value,
    country: document.getElementById('w-country').value,
    category: window.wizardState.category || 'N/A',
    budget: window.wizardState.budget || 'N/A',
    timeline: window.wizardState.timeline || 'N/A',
    services: window.wizardState.services.join(', ') || 'N/A',
    description: document.getElementById('w-description').value || 'N/A',
    subject: 'New Project Proposal - ' + (document.getElementById('w-company').value || 'Unknown'),
    message: 'Project proposal submitted via the NX Studio Project Starter Wizard.',
    reply_to: document.getElementById('w-email').value,
    to_name: 'NX Studio',
    date: new Date().toLocaleString(),
    admin_email: cfg.ADMIN_EMAIL,
    ref_number: document.getElementById('ref-number') ? document.getElementById('ref-number').textContent : 'N/A'
  };

  var nextBtn = document.getElementById('wizard-next-btn');
  if (nextBtn) {
    nextBtn.disabled = true;
    nextBtn.textContent = 'Sending Proposal...';
  }

  emailjs.send(cfg.SERVICE_ID, cfg.CONTACT_TEMPLATE_ID, formData)
    .then(function () {
      return emailjs.send(cfg.SERVICE_ID, cfg.AUTOREPLY_TEMPLATE_ID, formData);
    })
    .then(function () {
      document.querySelector('.wizard-success-overlay').classList.add('active');
    })
    .catch(function (error) {
      if (typeof console !== 'undefined') console.error('[NX Studio] Wizard EmailJS error:', error);
      if (typeof window.showToast === 'function') {
        var msg = 'Unable to submit your proposal. ';
        if (error && error.status === 402) {
          msg += 'Email service limit reached. Please try again later.';
        } else if (error && error.status === 429) {
          msg += 'Too many requests. Please wait a moment and try again.';
        } else {
          msg += 'Please check your connection and try again, or email us directly at nx.studio.net@outlook.com.';
        }
        window.showToast(msg);
      } else {
        alert('There was an error submitting your proposal. Please check your connection or contact us directly at nx.studio.net@outlook.com.');
      }
    })
    .finally(function () {
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.textContent = 'Submit Proposal';
      }
    });
}