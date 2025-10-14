// Landing Page Interactive Features
document.addEventListener('DOMContentLoaded', function () {
    // Initialize particles
    initParticles();

    // Initialize counter animations
    initCounters();

    // Initialize interactive heroes
    initInteractiveHeroes();

    // Initialize scroll animations
    initScrollAnimations();

    // Initialize mobile menu
    initMobileMenu();
});

// Particle System
function initParticles() {
    const container = document.getElementById('particles-container');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random properties
    const size = Math.random() * 4 + 1;
    const left = Math.random() * 100;
    const animationDuration = Math.random() * 20 + 10;
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

// Counter Animation
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 5000; // 5 seconds
        const step = target / (duration / 16); // 60fps

        let current = 0;

        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        // Start animation when element is in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(counter);
    });
}

// Interactive Heroes
function initInteractiveHeroes() {
    const heroOrbs = document.querySelectorAll('.hero-orb');
    const heroCards = document.querySelectorAll('.hero-card.interactive');
    const modal = document.getElementById('hero-preview-modal');
    const closeBtn = modal.querySelector('.close-btn');

    // Hero data (in a real app, this would come from an API)
    const heroData = {
        alucard: {
            name: "Alucard",
            role: "Fighter",
            specialty: "Chase/Charge",
            difficulty: "Moderate",
            description: "The Demon Hunter who seeks vengeance with his massive sword. Once human, now a half-demon hunting those who betrayed him.",
            abilities: ["Pursuit", "Groundsplitter", "Fission Wave"],
            stats: {
                durability: 7,
                offense: 9,
                skill: 6,
                difficulty: 7
            }
        },
        miya: {
            name: "Miya",
            role: "Marksman",
            specialty: "Reap/Charge",
            difficulty: "Low",
            description: "The Moon Elf Archer protecting her tribe with precise arrows. Chosen as the Moonlight Archer to maintain balance.",
            abilities: ["Fission Shot", "Arrow of Eclipse", "Turret Mode"],
            stats: {
                durability: 4,
                offense: 8,
                skill: 5,
                difficulty: 4
            }
        },
        tigreal: {
            name: "Tigreal",
            role: "Tank",
            specialty: "Initiator/Guard",
            difficulty: "Low",
            description: "The Holy Knight defending the Moniyan Empire with unwavering loyalty. Captain of the Imperial Knights.",
            abilities: ["Attack Wave", "Sacred Hammer", "Implosion"],
            stats: {
                durability: 9,
                offense: 5,
                skill: 6,
                difficulty: 5
            }
        },
        eudora: {
            name: "Eudora",
            role: "Mage",
            specialty: "Burst/Control",
            difficulty: "Low",
            description: "The Lightning Sorceress commanding elemental forces with cheerful power. Member of the Magic Academy.",
            abilities: ["Forked Lightning", "Electric Arrow", "Superconductor"],
            stats: {
                durability: 3,
                offense: 9,
                skill: 7,
                difficulty: 5
            }
        }
    };

    // Add click events to hero orbs
    heroOrbs.forEach(orb => {
        orb.addEventListener('click', function () {
            const heroName = this.getAttribute('data-hero');
            showHeroPreview(heroData[heroName]);
        });
    });

    // Add click events to hero cards
    heroCards.forEach(card => {
        card.addEventListener('click', function () {
            const heroName = this.getAttribute('data-hero');
            showHeroPreview(heroData[heroName]);
        });
    });

    // Close modal events
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with ESC key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    function showHeroPreview(hero) {
        const content = document.getElementById('preview-content');

        content.innerHTML = `
            <div class="preview-header">
                <h2>${hero.name}</h2>
                <span class="preview-role ${hero.role.toLowerCase()}">${hero.role}</span>
            </div>
            <div class="preview-content-grid">
                <div class="preview-image">
                    <img src="assets/heroes/${hero.name.toLowerCase()}/detail-potrait.jpg" alt="${hero.name}">
                </div>
                <div class="preview-info">
                    <div class="preview-description">
                        <p>${hero.description}</p>
                    </div>
                    <div class="preview-stats">
                        <h4>Hero Stats</h4>
                        <div class="stat-bars">
                            <div class="stat-bar">
                                <label>Durability</label>
                                <div class="bar-container">
                                    <div class="bar-fill" style="width: ${hero.stats.durability * 10}%"></div>
                                </div>
                                <span>${hero.stats.durability}/10</span>
                            </div>
                            <div class="stat-bar">
                                <label>Offense</label>
                                <div class="bar-container">
                                    <div class="bar-fill" style="width: ${hero.stats.offense * 10}%"></div>
                                </div>
                                <span>${hero.stats.offense}/10</span>
                            </div>
                            <div class="stat-bar">
                                <label>Skill Effects</label>
                                <div class="bar-container">
                                    <div class="bar-fill" style="width: ${hero.stats.skill * 10}%"></div>
                                </div>
                                <span>${hero.stats.skill}/10</span>
                            </div>
                            <div class="stat-bar">
                                <label>Difficulty</label>
                                <div class="bar-container">
                                    <div class="bar-fill" style="width: ${hero.stats.difficulty * 10}%"></div>
                                </div>
                                <span>${hero.stats.difficulty}/10</span>
                            </div>
                        </div>
                    </div>
                    <div class="preview-abilities">
                        <h4>Abilities</h4>
                        <div class="abilities-list">
                            ${hero.abilities.map(ability => `<span class="ability-tag">${ability}</span>`).join('')}
                        </div>
                    </div>
                    <div class="preview-actions">
                        <a href="heroes.html" class="cta-button primary">
                            <span>View Full Profile</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements to animate
    const elementsToAnimate = document.querySelectorAll('.feature-card, .hero-card, .stat');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}

// Mobile Menu
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', function () {
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
            // Close mobile menu for ALL links (not just hash links)
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
            // External links and page navigation will work normally
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
            navLinks.style.display = 'none';
            menuBtn.classList.remove('active');
            navLinks.classList.remove('menu-open');
        }
    });

    // Handle window resize
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            navLinks.style.display = 'flex';
        } else {
            navLinks.style.display = 'none';
            menuBtn.classList.remove('active');
            navLinks.classList.remove('menu-open');
        }
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .feature-card, .hero-card, .stat {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .feature-card.animate-in, .hero-card.animate-in, .stat.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .preview-header h2 {
        margin: 0;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
    }
    
    .preview-role {
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 700;
        text-transform: uppercase;
    }
    
    .preview-role.tank {
        background: rgba(52, 152, 219, 0.2);
        color: var(--tank-color);
        border: 1px solid rgba(52, 152, 219, 0.5);
    }
    
    .preview-role.fighter {
        background: rgba(231, 76, 60, 0.2);
        color: var(--fighter-color);
        border: 1px solid rgba(231, 76, 60, 0.5);
    }
    
    .preview-role.mage {
        background: rgba(241, 196, 15, 0.2);
        color: var(--mage-color);
        border: 1px solid rgba(241, 196, 15, 0.5);
    }
    
    .preview-role.marksman {
        background: rgba(46, 204, 113, 0.2);
        color: var(--marksman-color);
        border: 1px solid rgba(46, 204, 113, 0.5);
    }
    
    .preview-content-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 2rem;
        align-items: start;
    }
    
    .preview-image {
        text-align: center;
    }
    
    .preview-image img {
        max-width: 100%;
        height: auto;
        border-radius: 12px;
    }
    
    .preview-info {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .preview-description p {
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0;
    }
    
    .preview-stats h4, .preview-abilities h4 {
        color: var(--text-primary);
        margin-bottom: 1rem;
        font-size: 1.1rem;
    }
    
    .stat-bars {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .stat-bar {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .stat-bar label {
        width: 100px;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    
    .bar-container {
        flex: 1;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
    }
    
    .bar-fill {
        height: 100%;
        background: var(--gradient-primary);
        border-radius: 4px;
        transition: width 1s ease;
    }
    
    .stat-bar span {
        width: 40px;
        text-align: right;
        color: var(--text-secondary);
        font-size: 0.9rem;
        font-weight: 600;
    }
    
    .abilities-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .ability-tag {
        background: rgba(139, 92, 246, 0.1);
        color: var(--primary-purple);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
        border: 1px solid rgba(139, 92, 246, 0.3);
    }
    
    .preview-actions {
        margin-top: 1rem;
    }
    
    @media (max-width: 768px) {
        .preview-content-grid {
            grid-template-columns: 1fr;
        }
        
        .preview-image {
            order: -1;
        }
        
        .stat-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
        
        .stat-bar label {
            width: auto;
        }
        
        .bar-container {
            width: 100%;
        }
    }
`;
document.head.appendChild(style);