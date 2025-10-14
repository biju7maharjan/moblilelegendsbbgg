// Heroes Database Interactive Features - Enhanced
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the heroes database
    initHeroesDatabase();
    
    // Initialize particles
    initParticles();
    
    // Initialize event listeners
    initEventListeners();
    
    // Initialize filters
    initFilters();
    
    // Load initial heroes
    loadHeroes();
});

// Global variables
let allHeroes = [];
let filteredHeroes = [];
let currentHero = null;
let currentGalleryIndex = 0;
let currentSkinSeries = 'all';
let currentPage = 1;
const heroesPerPage = 12;
let activeRoleFilter = 'all'; // Track active role filter

// Initialize heroes database
async function initHeroesDatabase() {
    try {
        // In a real application, this would fetch from an API
        const response = await fetch('data/heroes.json');
        const data = await response.json();
        allHeroes = data.heroes;
        filteredHeroes = [...allHeroes];
        
        // Update total counts
        document.getElementById('total-heroes').textContent = allHeroes.length;
        document.getElementById('total-skins').textContent = calculateTotalSkins();
        updateResultsCount();
        
    } catch (error) {
        console.error('Error loading heroes data:', error);
        // Fallback to sample data
        loadSampleData();
    }
}

// Calculate total skins
function calculateTotalSkins() {
    return allHeroes.reduce((total, hero) => total + (hero.skins ? hero.skins.length : 0), 0);
}

// Load sample data (fallback)
function loadSampleData() {
    // This would be replaced with actual sample data
    allHeroes = [];
    filteredHeroes = [];
    document.getElementById('total-heroes').textContent = '0';
    document.getElementById('total-skins').textContent = '0';
}

// Particle System
function initParticles() {
    const container = document.getElementById('particles-container');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random properties
    const size = Math.random() * 3 + 1;
    const left = Math.random() * 100;
    const animationDuration = Math.random() * 15 + 10;
    const animationDelay = Math.random() * 5;
    
    // Apply styles
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}%`;
    particle.style.animationDuration = `${animationDuration}s`;
    particle.style.animationDelay = `${animationDelay}s`;
    
    // Random color based on MLBB theme
    const colors = ['#1a5fdf', '#8b5cf6', '#ec4899', '#fbbf24'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.background = randomColor;
    
    container.appendChild(particle);
    
    // Remove particle after animation completes and create new one
    setTimeout(() => {
        particle.remove();
        createParticle(container);
    }, animationDuration * 1000);
}

// Initialize event listeners
function initEventListeners() {
    // Search input
    const searchInput = document.getElementById('hero-search');
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Filter changes
    document.getElementById('role-filter').addEventListener('change', applyFilters);
    document.getElementById('difficulty-filter').addEventListener('change', applyFilters);
    document.getElementById('specialty-filter').addEventListener('change', applyFilters);
    document.getElementById('lane-filter').addEventListener('change', applyFilters);
    document.getElementById('sort-by').addEventListener('change', applyFilters);
    
    // Quick filters
    document.querySelectorAll('.quick-filter').forEach(button => {
        button.addEventListener('click', handleQuickFilter);
    });
    
    // Role showcase - FIXED: Now properly filters heroes by role
    document.querySelectorAll('.role-item').forEach(item => {
        item.addEventListener('click', handleRoleFilter);
    });
    
    // Reset filters
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    
    // Load more
    document.getElementById('load-more').addEventListener('click', loadMoreHeroes);
    
    // Modal close events - ENHANCED: Better modal management
    setupModalEvents();
    
    // Mobile menu
    initMobileMenu();
}

// Initialize filters
function initFilters() {
    // Set current time for last updated
    const now = new Date();
    document.getElementById('updated-time').textContent = 'Just Now';
}

// Handle search input with debouncing
function handleSearch(event) {
    applyFilters();
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle quick filters
function handleQuickFilter(event) {
    const filter = event.target.getAttribute('data-filter');
    
    // Update active state
    document.querySelectorAll('.quick-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Apply filter logic
    switch(filter) {
        case 'new':
            filteredHeroes = allHeroes.filter(hero => hero.isNew);
            break;
        case 'popular':
            filteredHeroes = allHeroes.filter(hero => hero.popularity > 8);
            break;
        case 'meta':
            filteredHeroes = allHeroes.filter(hero => hero.metaTier === 'S' || hero.metaTier === 'A');
            break;
        case 'free':
            filteredHeroes = allHeroes.filter(hero => hero.isFreeRotation);
            break;
        default:
            filteredHeroes = [...allHeroes];
    }
    
    currentPage = 1;
    renderHeroes();
}

// Handle role filter from showcase - FIXED: Now properly filters
function handleRoleFilter(event) {
    const role = event.currentTarget.getAttribute('data-role');
    
    // Update active state in role showcase
    document.querySelectorAll('.role-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Update active role filter
    activeRoleFilter = role;
    
    // Update role filter dropdown to match
    const roleFilter = document.getElementById('role-filter');
    roleFilter.value = role === 'all' ? 'all' : role;
    
    applyFilters();
}

// Apply all filters - ENHANCED: Support for multiple roles, lanes, specialties
function applyFilters() {
    const searchTerm = document.getElementById('hero-search').value.toLowerCase();
    const roleFilter = document.getElementById('role-filter').value;
    const difficultyFilter = document.getElementById('difficulty-filter').value;
    const specialtyFilter = document.getElementById('specialty-filter').value;
    const laneFilter = document.getElementById('lane-filter').value;
    const sortBy = document.getElementById('sort-by').value;
    
    filteredHeroes = allHeroes.filter(hero => {
        // Search term matching (name, role, specialty)
        const matchesSearch = hero.name.toLowerCase().includes(searchTerm) || 
                             (Array.isArray(hero.roles) ? 
                                 hero.roles.some(r => r.toLowerCase().includes(searchTerm)) :
                                 hero.role.toLowerCase().includes(searchTerm)) ||
                             (Array.isArray(hero.specialties) ? 
                                 hero.specialties.some(s => s.toLowerCase().includes(searchTerm)) :
                                 (hero.specialty && hero.specialty.toLowerCase().includes(searchTerm)));
        
        // Role filter - ENHANCED: Support for multiple roles
        const matchesRole = roleFilter === 'all' || 
                           (Array.isArray(hero.roles) ? 
                               hero.roles.includes(roleFilter) :
                               hero.role === roleFilter);
        
        // Difficulty filter
        const matchesDifficulty = difficultyFilter === 'all' || hero.difficulty === difficultyFilter;
        
        // Specialty filter - ENHANCED: Support for multiple specialties
        const matchesSpecialty = specialtyFilter === 'all' || 
                               (Array.isArray(hero.specialties) ? 
                                   hero.specialties.includes(specialtyFilter) :
                                   (hero.specialty && hero.specialty.includes(specialtyFilter)));
        
        // Lane filter - ENHANCED: Support for multiple lanes
        const matchesLane = laneFilter === 'all' || 
                           (Array.isArray(hero.lanes) ? 
                               hero.lanes.includes(laneFilter) :
                               hero.lane === laneFilter);
        
        return matchesSearch && matchesRole && matchesDifficulty && matchesSpecialty && matchesLane;
    });
    
    // Sort heroes
    sortHeroes(sortBy);
    
    currentPage = 1;
    renderHeroes();
}

// Sort heroes
function sortHeroes(sortBy) {
    switch(sortBy) {
        case 'name':
            filteredHeroes.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredHeroes.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'difficulty':
            const difficultyOrder = { 'Low': 1, 'Moderate': 2, 'High': 3 };
            filteredHeroes.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
            break;
        case 'role':
            // Sort by primary role
            filteredHeroes.sort((a, b) => {
                const roleA = Array.isArray(a.roles) ? a.roles[0] : a.role;
                const roleB = Array.isArray(b.roles) ? b.roles[0] : b.role;
                return roleA.localeCompare(roleB);
            });
            break;
        case 'popularity':
            filteredHeroes.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
            break;
    }
}

// Reset all filters
function resetFilters() {
    document.getElementById('hero-search').value = '';
    document.getElementById('role-filter').value = 'all';
    document.getElementById('difficulty-filter').value = 'all';
    document.getElementById('specialty-filter').value = 'all';
    document.getElementById('lane-filter').value = 'all';
    document.getElementById('sort-by').value = 'name';
    
    // Reset quick filters
    document.querySelectorAll('.quick-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.quick-filter[data-filter="all"]').classList.add('active');
    
    // Reset role showcase
    document.querySelectorAll('.role-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector('.role-item[data-role="all"]').classList.add('active');
    
    // Reset active role filter
    activeRoleFilter = 'all';
    
    applyFilters();
}

// Load heroes
function loadHeroes() {
    const loadingState = document.getElementById('loading-state');
    const heroesGrid = document.getElementById('heroes-grid');
    const noResults = document.getElementById('no-results');
    const loadMoreBtn = document.getElementById('load-more');
    
    // Show loading state
    loadingState.style.display = 'block';
    heroesGrid.style.display = 'none';
    noResults.style.display = 'none';
    loadMoreBtn.style.display = 'none';
    
    // Simulate loading delay
    setTimeout(() => {
        loadingState.style.display = 'none';
        
        if (filteredHeroes.length === 0) {
            noResults.style.display = 'block';
        } else {
            heroesGrid.style.display = 'grid';
            renderHeroes();
        }
    }, 1000);
}

// Render heroes to grid - ENHANCED: Support for multiple roles and lanes
function renderHeroes() {
    const heroesGrid = document.getElementById('heroes-grid');
    const loadMoreBtn = document.getElementById('load-more');
    
    // Clear existing heroes
    heroesGrid.innerHTML = '';
    
    // Calculate pagination
    const startIndex = 0;
    const endIndex = Math.min(currentPage * heroesPerPage, filteredHeroes.length);
    const heroesToShow = filteredHeroes.slice(startIndex, endIndex);
    
    // Render heroes
    heroesToShow.forEach(hero => {
        const heroCard = createHeroCard(hero);
        heroesGrid.appendChild(heroCard);
    });
    
    // Show/hide load more button
    if (endIndex < filteredHeroes.length) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
    
    updateResultsCount();
}

// Create hero card element - ENHANCED: Support for multiple roles and lanes
function createHeroCard(hero) {
    const card = document.createElement('div');
    card.className = 'hero-card';
    card.setAttribute('data-id', hero.id);
    
    // Calculate stats (in a real app, these would come from the data)
    const popularity = hero.popularity || Math.floor(Math.random() * 10) + 1;
    const winRate = hero.winRate || (Math.random() * 10 + 45).toFixed(1);
    const pickRate = hero.pickRate || (Math.random() * 5 + 1).toFixed(1);
    
    // Handle multiple roles - display primary role and show count if multiple
    const roles = Array.isArray(hero.roles) ? hero.roles : [hero.role];
    const primaryRole = roles[0];
    const hasMultipleRoles = roles.length > 1;
    
    // Handle multiple lanes
    const lanes = Array.isArray(hero.lanes) ? hero.lanes : [hero.lane];
    const primaryLane = lanes[0];
    const hasMultipleLanes = lanes.length > 1;
    
    card.innerHTML = `
        <div class="hero-card-header">
            <img class="hero-card-image" src="${hero.cardImage}" alt="${hero.name}" onerror="this.src='assets/heroes/placeholder.jpg'">
            <div class="hero-card-badges">
                <div class="role-badge ${primaryRole.toLowerCase()} ${hasMultipleRoles ? 'multiple' : ''}" title="${hasMultipleRoles ? 'Roles: ' + roles.join(', ') : primaryRole}">
                    ${primaryRole}${hasMultipleRoles ? '+' : ''}
                </div>
                <div class="difficulty-badge ${hero.difficulty.toLowerCase()}">${hero.difficulty}</div>
            </div>
        </div>
        <div class="hero-card-body">
            <h3 class="hero-card-name">${hero.name}</h3>
            <p class="hero-card-specialty">${Array.isArray(hero.specialties) ? hero.specialties.join(', ') : hero.specialty}</p>
            <div class="hero-card-stats">
                <div class="hero-stat">
                    <div class="stat-value">${popularity}/10</div>
                    <div class="stat-label">Popularity</div>
                </div>
                <div class="hero-stat">
                    <div class="stat-value">${winRate}%</div>
                    <div class="stat-label">Win Rate</div>
                </div>
                <div class="hero-stat">
                    <div class="stat-value">${pickRate}%</div>
                    <div class="stat-label">Pick Rate</div>
                </div>
            </div>
            <div class="hero-card-lane ${hasMultipleLanes ? 'multiple' : ''}" title="${hasMultipleLanes ? 'Lanes: ' + lanes.join(', ') : primaryLane}">
                ${primaryLane}${hasMultipleLanes ? '+' : ''}
            </div>
        </div>
    `;
    
    // Add click event
    card.addEventListener('click', () => showHeroDetails(hero.id));
    
    return card;
}

// Load more heroes
function loadMoreHeroes() {
    currentPage++;
    renderHeroes();
}

// Update results count
function updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    const totalCount = document.getElementById('total-count');
    const endIndex = Math.min(currentPage * heroesPerPage, filteredHeroes.length);
    
    resultsCount.textContent = endIndex;
    totalCount.textContent = filteredHeroes.length;
}

// Show hero details - ENHANCED: Support for multiple roles, lanes, specialties
function showHeroDetails(heroId) {
    const hero = allHeroes.find(h => h.id === heroId);
    if (!hero) return;
    
    currentHero = hero;
    
    const modal = document.getElementById('hero-modal');
    const content = document.querySelector('.hero-details');
    
    // Create hero details content
    content.innerHTML = createHeroDetailsContent(hero);
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Add event listeners to action buttons
    setupHeroDetailEvents();
}

// Create hero details content - ENHANCED: Support for multiple roles, lanes, specialties
// Enhanced hero details with comprehensive information
function createHeroDetailsContent(hero) {
    // Calculate stats (in a real app, these would come from the data)
    const stats = hero.stats || {
        durability: Math.floor(Math.random() * 5) + 6,
        offense: Math.floor(Math.random() * 5) + 6,
        skill: Math.floor(Math.random() * 5) + 6,
        difficulty: Math.floor(Math.random() * 5) + 6
    };
    
    // Handle multiple roles, lanes, and specialties
    const roles = Array.isArray(hero.roles) ? hero.roles : [hero.role];
    const lanes = Array.isArray(hero.lanes) ? hero.lanes : [hero.lane];
    const specialties = Array.isArray(hero.specialties) ? hero.specialties : [hero.specialty];
    
    return `
        <div class="hero-detail-header">
            <div class="hero-detail-title">
                <h1 class="hero-detail-name">${hero.name}</h1>
                <div class="hero-detail-badges">
                    ${roles.map(role => `<div class="role-badge ${role.toLowerCase()}">${role}</div>`).join('')}
                    <div class="difficulty-badge ${hero.difficulty.toLowerCase()}">${hero.difficulty}</div>
                    ${lanes.map(lane => `<span class="hero-card-lane">${lane}</span>`).join('')}
                </div>
            </div>
            <div class="hero-detail-actions">
                <button class="action-btn" id="view-skills-btn">
                    <span>View Skills</span>
                </button>
                <button class="action-btn secondary" id="view-gallery-btn">
                    <span>View Gallery</span>
                </button>
            </div>
        </div>
        
        <div class="hero-detail-content">
            <div class="hero-detail-visual">
                <div class="hero-detail-image">
                    <img src="${hero.detailImage}" alt="${hero.name}" onerror="this.src='assets/heroes/placeholder.jpg'">
                </div>
                <div class="hero-detail-stats">
                    <h3>Hero Stats</h3>
                    <div class="stat-bars">
                        <div class="stat-bar">
                            <label>Durability</label>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${stats.durability * 10}%"></div>
                            </div>
                            <span>${stats.durability}/10</span>
                        </div>
                        <div class="stat-bar">
                            <label>Offense</label>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${stats.offense * 10}%"></div>
                            </div>
                            <span>${stats.offense}/10</span>
                        </div>
                        <div class="stat-bar">
                            <label>Skill Effects</label>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${stats.skill * 10}%"></div>
                            </div>
                            <span>${stats.skill}/10</span>
                        </div>
                        <div class="stat-bar">
                            <label>Difficulty</label>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${stats.difficulty * 10}%"></div>
                            </div>
                            <span>${stats.difficulty}/10</span>
                        </div>
                    </div>
                    
                    ${hero.attributes ? `
                    <div class="attribute-stats">
                        <h4>Attributes</h4>
                        <div class="attribute-grid">
                            ${Object.entries(hero.attributes).map(([key, value]) => `
                                <div class="attribute-item">
                                    <span class="attribute-name">${formatAttributeName(key)}</span>
                                    <span class="attribute-value">${value}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="hero-detail-info">
                <div class="info-section">
                    <h3>About</h3>
                    <div class="info-content">
                        <p><strong>Roles:</strong> ${roles.join(', ')}</p>
                        <p><strong>Specialties:</strong> ${specialties.join(', ')}</p>
                        <p><strong>Lanes:</strong> ${lanes.join(', ')}</p>
                        <p><strong>Difficulty:</strong> ${hero.difficulty}</p>
                        <p><strong>Release Date:</strong> ${hero.releaseDate || 'Unknown'}</p>
                        ${hero.price ? `<p><strong>Price:</strong> ${hero.price}</p>` : ''}
                        ${hero.metaTier ? `<p><strong>Meta Tier:</strong> <span class="tier-${hero.metaTier.toLowerCase()}">${hero.metaTier}</span></p>` : ''}
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Lore</h3>
                    <div class="info-content">
                        <p>${hero.lore}</p>
                        ${hero.background ? `<p><strong>Background:</strong> ${hero.background}</p>` : ''}
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Playstyle</h3>
                    <div class="info-content">
                        <p>${hero.playstyle}</p>
                        
                        ${hero.pros ? `
                        <div class="pros-cons">
                            <div class="pros">
                                <h4>Strengths</h4>
                                <ul>
                                    ${hero.pros.map(pro => `<li>${pro}</li>`).join('')}
                                </ul>
                            </div>
                            ${hero.cons ? `
                            <div class="cons">
                                <h4>Weaknesses</h4>
                                <ul>
                                    ${hero.cons.map(con => `<li>${con}</li>`).join('')}
                                </ul>
                            </div>
                            ` : ''}
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                ${hero.recommendedBuilds ? `
                <div class="info-section">
                    <h3>Recommended Builds</h3>
                    <div class="builds-grid">
                        ${hero.recommendedBuilds.map(build => `
                            <div class="build-card">
                                <h4>${build.name}</h4>
                                <span class="build-role">${build.role}</span>
                                <div class="build-items">
                                    ${build.items.map(item => `<span class="build-item">${item}</span>`).join('')}
                                </div>
                                <p class="build-description">${build.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="info-section">
                    <h3>Skills</h3>
                    <div class="skills-grid">
                        ${hero.skills ? hero.skills.map(skill => `
                            <div class="skill-item ${skill.video ? 'has-video' : ''}" data-skill="${skill.name}">
                                <div class="skill-header">
                                    <div class="skill-icon">
                                        <img src="${skill.icon}" alt="${skill.name}" onerror="this.src='assets/skills/placeholder.jpg'">
                                    </div>
                                    <div>
                                        <div class="skill-name">${skill.name}</div>
                                        <div class="skill-type">${skill.type}</div>
                                    </div>
                                </div>
                                <div class="skill-description">${skill.description}</div>
                                ${skill.cooldown ? `<div class="skill-meta"><strong>Cooldown:</strong> ${skill.cooldown}</div>` : ''}
                                ${skill.manaCost ? `<div class="skill-meta"><strong>Mana Cost:</strong> ${skill.manaCost}</div>` : ''}
                            </div>
                        `).join('') : '<p>No skills data available.</p>'}
                    </div>
                </div>
                
                ${hero.counters ? `
                <div class="info-section">
                    <h3>Counters</h3>
                    <div class="counters-content">
                        <div class="counter-section">
                            <h4>Strong Against</h4>
                            <div class="counter-list">
                                ${hero.counters.strongAgainst.map(hero => `<span class="counter-hero strong">${hero}</span>`).join('')}
                            </div>
                        </div>
                        <div class="counter-section">
                            <h4>Weak Against</h4>
                            <div class="counter-list">
                                ${hero.counters.weakAgainst.map(hero => `<span class="counter-hero weak">${hero}</span>`).join('')}
                            </div>
                        </div>
                        ${hero.counters.tips ? `
                        <div class="counter-tips">
                            <h4>Battle Tips</h4>
                            <ul>
                                ${hero.counters.tips.map(tip => `<li>${tip}</li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Helper function to format attribute names
function formatAttributeName(key) {
    const names = {
        movementSpeed: 'Movement Speed',
        physicalAttack: 'Physical Attack',
        magicPower: 'Magic Power',
        armor: 'Armor',
        magicResistance: 'Magic Resistance',
        hp: 'HP',
        mana: 'Mana',
        attackSpeed: 'Attack Speed',
        hpRegen: 'HP Regen',
        manaRegen: 'Mana Regen'
    };
    return names[key] || key;
}

// Setup hero detail events - ENHANCED: Better modal management
function setupHeroDetailEvents() {
    document.getElementById('view-skills-btn').addEventListener('click', openSkillsModal);
    document.getElementById('view-gallery-btn').addEventListener('click', openGalleryModal);
    
    // Add click events to skill items
    document.querySelectorAll('.skill-item').forEach(item => {
        item.addEventListener('click', function() {
            const skillName = this.getAttribute('data-skill');
            // In a real app, this would show skill details
            console.log('Selected skill:', skillName);
        });
    });
}

// Open skills modal - ENHANCED: Better modal stacking
function openSkillsModal() {
    if (!currentHero || !currentHero.skills) return;
    
    const modal = document.getElementById('skills-modal');
    const title = document.getElementById('skills-title');
    const skillsList = document.getElementById('skills-list');
    
    title.textContent = `${currentHero.name} Skills`;
    skillsList.innerHTML = '';
    
    currentHero.skills.forEach(skill => {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        
        skillItem.innerHTML = `
            <div class="skill-header">
                <div class="skill-icon">
                    <img src="${skill.icon}" alt="${skill.name}" onerror="this.src='assets/skills/placeholder.jpg'">
                </div>
                <div>
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-type">${skill.type}</div>
                </div>
            </div>
            <div class="skill-description">${skill.description}</div>
            ${skill.cooldown ? `<div class="skill-meta"><strong>Cooldown:</strong> ${skill.cooldown}</div>` : ''}
            ${skill.manaCost ? `<div class="skill-meta"><strong>Mana Cost:</strong> ${skill.manaCost}</div>` : ''}
        `;
        
        skillsList.appendChild(skillItem);
    });
    
    // Hide hero modal and show skills modal
    document.getElementById('hero-modal').style.display = 'none';
    modal.style.display = 'block';
}

// Open gallery modal - ENHANCED: Better modal stacking
function openGalleryModal() {
    if (!currentHero) return;
    
    const modal = document.getElementById('gallery-modal');
    const title = document.getElementById('gallery-title');
    
    title.textContent = `${currentHero.name} Gallery`;
    currentGalleryIndex = 0;
    currentSkinSeries = 'all';
    
    // Switch to skins tab by default
    switchGalleryTab('skins');
    
    // Populate skin series
    populateSkinSeries();
    
    // Update gallery with current skin series
    updateGallery();
    
    // Hide hero modal and show gallery modal
    document.getElementById('hero-modal').style.display = 'none';
    modal.style.display = 'block';
}

// Populate skin series filter
function populateSkinSeries() {
    if (!currentHero || !currentHero.skins) return;
    
    const skinSeriesList = document.getElementById('skin-series-list');
    skinSeriesList.innerHTML = '';
    
    // Add "All" option
    const allBadge = document.createElement('div');
    allBadge.className = `series-badge ${currentSkinSeries === 'all' ? 'active' : ''}`;
    allBadge.textContent = 'All';
    allBadge.setAttribute('data-series', 'all');
    allBadge.addEventListener('click', () => {
        currentSkinSeries = 'all';
        updateGallery();
        updateSkinSeriesBadges();
    });
    skinSeriesList.appendChild(allBadge);
    
    // Add series options
    const seriesList = [...new Set(currentHero.skins.map(skin => skin.series))];
    
    seriesList.forEach(series => {
        const seriesBadge = document.createElement('div');
        seriesBadge.className = `series-badge ${currentSkinSeries === series ? 'active' : ''}`;
        seriesBadge.textContent = series;
        seriesBadge.setAttribute('data-series', series);
        seriesBadge.addEventListener('click', () => {
            currentSkinSeries = series;
            updateGallery();
            updateSkinSeriesBadges();
        });
        skinSeriesList.appendChild(seriesBadge);
    });
}

// Update skin series badges active state
function updateSkinSeriesBadges() {
    const badges = document.querySelectorAll('.series-badge');
    badges.forEach(badge => {
        const series = badge.getAttribute('data-series');
        if (series === currentSkinSeries) {
            badge.classList.add('active');
        } else {
            badge.classList.remove('active');
        }
    });
}

// Update gallery display
function updateGallery() {
    if (!currentHero || !currentHero.skins) return;
    
    // Filter skins by current series
    const filteredSkins = currentSkinSeries === 'all' 
        ? currentHero.skins 
        : currentHero.skins.filter(skin => skin.series === currentSkinSeries);
    
    if (filteredSkins.length === 0) {
        // Handle no skins case
        document.getElementById('gallery-main-image').src = '';
        document.getElementById('skin-name').textContent = 'No Skins Available';
        document.getElementById('skin-series').textContent = '';
        document.getElementById('gallery-counter').textContent = `0 / 0`;
        document.getElementById('gallery-thumbnails').innerHTML = '';
        return;
    }
    
    const skin = filteredSkins[currentGalleryIndex];
    document.getElementById('gallery-main-image').src = skin.image;
    document.getElementById('skin-name').textContent = skin.name;
    document.getElementById('skin-series').textContent = skin.series;
    
    // Update rarity badge
    const rarityBadge = document.querySelector('.rarity-badge');
    rarityBadge.textContent = skin.rarity || 'Common';
    rarityBadge.className = `rarity-badge ${(skin.rarity || 'common').toLowerCase()}`;
    
    document.getElementById('gallery-counter').textContent = `${currentGalleryIndex + 1} / ${filteredSkins.length}`;
    
    // Update thumbnails
    updateThumbnails(filteredSkins);
    
    // Update button states
    document.getElementById('gallery-prev').disabled = filteredSkins.length <= 1;
    document.getElementById('gallery-next').disabled = filteredSkins.length <= 1;
}

// Update thumbnails
function updateThumbnails(skins) {
    const thumbnailsContainer = document.getElementById('gallery-thumbnails');
    thumbnailsContainer.innerHTML = '';
    
    skins.forEach((skin, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${index === currentGalleryIndex ? 'active' : ''}`;
        thumbnail.innerHTML = `<img src="${skin.thumbnail || skin.image}" alt="${skin.name}">`;
        thumbnail.addEventListener('click', () => {
            currentGalleryIndex = index;
            updateGallery();
        });
        thumbnailsContainer.appendChild(thumbnail);
    });
}

// Navigate gallery
function navigateGallery(direction) {
    if (!currentHero || !currentHero.skins) return;
    
    // Filter skins by current series
    const filteredSkins = currentSkinSeries === 'all' 
        ? currentHero.skins 
        : currentHero.skins.filter(skin => skin.series === currentSkinSeries);
    
    if (filteredSkins.length === 0) return;
    
    currentGalleryIndex += direction;
    
    // Loop around
    if (currentGalleryIndex < 0) {
        currentGalleryIndex = filteredSkins.length - 1;
    } else if (currentGalleryIndex >= filteredSkins.length) {
        currentGalleryIndex = 0;
    }
    
    updateGallery();
}

// Switch gallery tab
function switchGalleryTab(tabName) {
    // Update tabs
    document.querySelectorAll('.gallery-tab').forEach(tab => {
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        if (pane.id === `${tabName}-tab`) {
            pane.classList.add('active');
            
            // If switching to dialogues tab, populate dialogues
            if (tabName === 'dialogues' && currentHero && currentHero.dialogues) {
                populateDialogues();
            }
            
            // If switching to abilities tab, populate abilities
            if (tabName === 'abilities' && currentHero && currentHero.skills) {
                populateAbilities();
            }
        } else {
            pane.classList.remove('active');
        }
    });
}

// Populate dialogues
function populateDialogues() {
    if (!currentHero || !currentHero.dialogues) return;
    
    const dialoguesList = document.getElementById('dialogues-list');
    dialoguesList.innerHTML = '';
    
    currentHero.dialogues.forEach((dialogue, index) => {
        const dialogueItem = document.createElement('div');
        dialogueItem.className = 'dialogue-item';
        
        dialogueItem.innerHTML = `
            <div class="dialogue-text">${dialogue.text}</div>
            <button class="dialogue-play" data-audio="${dialogue.audio}">
                ▶
            </button>
        `;
        
        dialoguesList.appendChild(dialogueItem);
    });
    
    // Add event listeners to play buttons
    const playButtons = document.querySelectorAll('.dialogue-play');
    playButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const audioSrc = e.target.getAttribute('data-audio');
            playDialogue(audioSrc);
        });
    });
}

// Video playback functionality for abilities
function initVideoPlayback() {
    const videoPlayer = document.getElementById('ability-video-player');
    const videoPlaceholder = document.querySelector('.video-placeholder');
    
    if (!videoPlayer) {
        // Create video player if it doesn't exist
        const videoContainer = document.querySelector('.ability-video');
        videoContainer.innerHTML = `
            <video id="ability-video-player" controls style="width: 100%; display: none;">
                Your browser does not support the video tag.
            </video>
            <div class="video-placeholder">
                <div class="play-icon">▶</div>
                <p>Click on an ability to play its video</p>
            </div>
        `;
    }
}

// Enhanced populateAbilities function with video support
function populateAbilities() {
    if (!currentHero || !currentHero.skills) return;
    
    const abilitiesInfo = document.getElementById('abilities-info');
    abilitiesInfo.innerHTML = '';
    
    // Initialize video player
    initVideoPlayback();
    const videoPlayer = document.getElementById('ability-video-player');
    const videoPlaceholder = document.querySelector('.video-placeholder');
    
    currentHero.skills.forEach(skill => {
        const abilityItem = document.createElement('div');
        abilityItem.className = 'skill-item';
        
        abilityItem.innerHTML = `
            <div class="skill-header">
                <div class="skill-icon">
                    <img src="${skill.icon}" alt="${skill.name}" onerror="this.src='assets/skills/placeholder.jpg'">
                </div>
                <div>
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-type">${skill.type}</div>
                </div>
            </div>
            <div class="skill-description">${skill.description}</div>
            ${skill.cooldown ? `<div class="skill-meta"><strong>Cooldown:</strong> ${skill.cooldown}</div>` : ''}
            ${skill.manaCost ? `<div class="skill-meta"><strong>Mana Cost:</strong> ${skill.manaCost}</div>` : ''}
            ${skill.detailedDescription ? `<div class="skill-details">${skill.detailedDescription}</div>` : ''}
            ${skill.tips ? `<div class="skill-tips"><strong>Tips:</strong> ${skill.tips.join(', ')}</div>` : ''}
        `;
        
        // Add click event to play video if available
        if (skill.video) {
            abilityItem.classList.add('has-video');
            abilityItem.addEventListener('click', () => {
                // Hide placeholder and show video player
                videoPlaceholder.style.display = 'none';
                videoPlayer.style.display = 'block';
                
                // Set video source and play
                videoPlayer.src = skill.video;
                videoPlayer.play().catch(error => {
                    console.log('Video play failed:', error);
                    // Fallback to placeholder if video fails
                    videoPlayer.style.display = 'none';
                    videoPlaceholder.style.display = 'flex';
                    videoPlaceholder.innerHTML = `
                        <div class="play-icon">⚠️</div>
                        <p>Video unavailable. Check your connection.</p>
                    `;
                });
            });
        }
        
        abilitiesInfo.appendChild(abilityItem);
    });
}

// Play dialogue audio
function playDialogue(audioSrc) {
    // In a real app, this would play the audio file
    console.log('Playing dialogue:', audioSrc);
    // const audio = new Audio(audioSrc);
    // audio.play().catch(error => {
    //     console.log('Audio play failed:', error);
    // });
}

// Setup modal events - ENHANCED: Better modal management
function setupModalEvents() {
    // Close buttons with specific handlers for each modal
    document.querySelector('.hero-modal .close-btn').addEventListener('click', closeHeroModal);
    document.querySelector('.skills-modal .close-btn').addEventListener('click', closeSkillsModal);
    document.querySelector('.gallery-modal .close-btn').addEventListener('click', closeGalleryModal);
    
    // Modal background clicks
    document.getElementById('hero-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeHeroModal();
        }
    });
    
    document.getElementById('skills-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSkillsModal();
        }
    });
    
    document.getElementById('gallery-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeGalleryModal();
        }
    });
    
    // ESC key to close modals - ENHANCED: Better modal stacking
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('skills-modal').style.display === 'block') {
                closeSkillsModal();
            } else if (document.getElementById('gallery-modal').style.display === 'block') {
                closeGalleryModal();
            } else if (document.getElementById('hero-modal').style.display === 'block') {
                closeHeroModal();
            }
        }
    });
    
    // Gallery controls
    document.getElementById('gallery-prev').addEventListener('click', () => navigateGallery(-1));
    document.getElementById('gallery-next').addEventListener('click', () => navigateGallery(1));
    
    // Gallery tabs
    document.querySelectorAll('.gallery-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchGalleryTab(tabName);
        });
    });
}

// Close hero modal
function closeHeroModal() {
    document.getElementById('hero-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close skills modal - ENHANCED: Returns to hero modal
function closeSkillsModal() {
    document.getElementById('skills-modal').style.display = 'none';
    document.getElementById('hero-modal').style.display = 'block';
}

// Close gallery modal - ENHANCED: Returns to hero modal
function closeGalleryModal() {
    document.getElementById('gallery-modal').style.display = 'none';
    document.getElementById('hero-modal').style.display = 'block';
}

// Initialize mobile menu
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuBtn || !navLinks) return;
    
    menuBtn.addEventListener('click', function() {
        const isVisible = navLinks.style.display === 'flex';
        navLinks.style.display = isVisible ? 'none' : 'flex';
        menuBtn.classList.toggle('active');
        
        // Add animation class for smooth transition
        if (!isVisible) {
            navLinks.classList.add('menu-open');
        } else {
            navLinks.classList.remove('menu-open');
        }
    });
    
    // FIXED: Close menu when clicking on any navigation link
    document.querySelectorAll('.nav-links a, .main-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Close mobile menu for ALL links
            navLinks.style.display = 'none';
            menuBtn.classList.remove('active');
            navLinks.classList.remove('menu-open');
            
            // Only prevent default and handle smooth scroll for same-page hash links
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                // Smooth scroll to target
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
            navLinks.style.display = 'none';
            menuBtn.classList.remove('active');
            navLinks.classList.remove('menu-open');
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navLinks.style.display = 'flex';
        } else {
            navLinks.style.display = 'none';
            menuBtn.classList.remove('active');
            navLinks.classList.remove('menu-open');
        }
    });
}

// Add CSS for additional styles
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .skill-meta {
        margin-top: 0.5rem;
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    
    .skill-details {
        margin-top: 0.75rem;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        font-size: 0.9rem;
        color: var(--text-secondary);
        border-left: 3px solid var(--primary-purple);
    }
    
    .hero-detail-stats h3 {
        margin-bottom: 1rem;
        color: var(--text-primary);
        font-size: 1.25rem;
    }
    
    /* Enhanced styles for multiple roles and lanes */
    .role-badge.multiple, .hero-card-lane.multiple {
        position: relative;
    }
    
    .role-badge.multiple::after, .hero-card-lane.multiple::after {
        content: '+';
        margin-left: 2px;
        font-weight: bold;
    }
    
    .hero-detail-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
    }
    
    @media (max-width: 768px) {
        .nav-links {
            position: fixed;
            top: 80px;
            left: 0;
            width: 100%;
            background: var(--dark-bg);
            flex-direction: column;
            padding: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: none;
        }
        
        .nav-links.active {
            display: flex;
        }
        
        .mobile-menu-btn.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-menu-btn.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-btn.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;
document.head.appendChild(additionalStyles);