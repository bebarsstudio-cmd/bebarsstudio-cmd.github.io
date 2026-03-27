// ==================== DATABASE SYSTEM ====================
// Admin password
const ADMIN_PASSWORD = "bebars2026";
let isAdmin = false;

// Storage keys
const NEWS_STORAGE_KEY = "bebars_news";
const PROJECTS_STORAGE_KEY = "bebars_projects";

// Load from JSON files or localStorage
async function loadFromJSON(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(`Could not load ${file}, using localStorage or default`);
        return null;
    }
}

// Load news (localStorage first, then JSON)
async function loadNews() {
    const stored = localStorage.getItem(NEWS_STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    const jsonData = await loadFromJSON('data/news.json');
    if (jsonData && jsonData.news) {
        localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(jsonData.news));
        return jsonData.news;
    }
    return [];
}

// Load projects (localStorage first, then JSON)
async function loadProjects() {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    const jsonData = await loadFromJSON('data/projects.json');
    if (jsonData && jsonData.projects) {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(jsonData.projects));
        return jsonData.projects;
    }
    return [];
}

// Load skills from JSON
async function loadSkills() {
    const jsonData = await loadFromJSON('data/skills.json');
    if (jsonData) {
        return jsonData;
    }
    return { skills: [], stats: [] };
}

// Save news to localStorage
function saveNews(news) {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(news));
}

// Save projects to localStorage
function saveProjects(projects) {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

// Display news
async function displayNews() {
    const newsGrid = document.getElementById('newsGrid');
    const news = await loadNews();
    
    if (!news || news.length === 0) {
        newsGrid.innerHTML = '<div class="empty-news"><i class="fas fa-newspaper"></i><p>No news yet. Check back soon!</p></div>';
        return;
    }
    
    news.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    newsGrid.innerHTML = news.map(item => `
        <div class="news-card" data-id="${item.id}">
            <div class="news-badge ${item.category || 'general'}">${getCategoryName(item.category)}</div>
            <div class="news-date"><i class="far fa-calendar-alt"></i> ${formatDate(item.date)}</div>
            <h3 class="news-title">${escapeHtml(item.title)}</h3>
            <p class="news-content">${escapeHtml(item.content)}</p>
            ${item.author ? `<div class="news-author"><i class="fas fa-user"></i> ${escapeHtml(item.author)}</div>` : ''}
            ${isAdmin ? `
                <div class="news-actions">
                    <button class="btn-danger" onclick="deleteNews(${item.id})"><i class="fas fa-trash"></i> Delete</button>
                    <button class="btn-warning" onclick="editNews(${item.id})"><i class="fas fa-edit"></i> Edit</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Display projects
async function displayProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    const projects = await loadProjects();
    
    if (!projects || projects.length === 0) {
        projectsGrid.innerHTML = '<div class="empty-news"><i class="fas fa-folder-open"></i><p>No projects yet. Coming soon!</p></div>';
        return;
    }
    
    projectsGrid.innerHTML = projects.map(project => `
        <div class="project-card">
            <div class="project-image">
                <img src="${project.image || 'images/soon.png'}" alt="${escapeHtml(project.title)}" onerror="this.src='images/soon.png'">
                <div class="project-overlay">
                    <a href="${project.github}" target="_blank"><i class="fab fa-github"></i></a>
                    <a href="${project.live}" target="_blank"><i class="fas fa-external-link-alt"></i></a>
                </div>
            </div>
            <div class="project-info">
                <h3>${escapeHtml(project.title)}</h3>
                <p>${escapeHtml(project.description)}</p>
                <div class="project-tech">
                    ${project.tech.map(tech => `<span>${escapeHtml(tech)}</span>`).join('')}
                </div>
                ${project.status ? `<div class="project-status status-${project.status}">${project.status.toUpperCase()}</div>` : ''}
            </div>
        </div>
    `).join('');
}

// Display skills
async function displaySkills() {
    const skillsGrid = document.getElementById('skillsGrid');
    const aboutStats = document.getElementById('aboutStats');
    const data = await loadSkills();
    
    if (!data.skills || data.skills.length === 0) {
        skillsGrid.innerHTML = '<div class="empty-news"><i class="fas fa-chart-line"></i><p>Skills data not available.</p></div>';
        return;
    }
    
    // Skills grid
    skillsGrid.innerHTML = data.skills.map(category => `
        <div class="skill-category">
            <h3><i class="fas ${category.icon}"></i> ${category.category}</h3>
            <div class="skill-items">
                ${category.skills.map(skill => `
                    <div class="skill-item">
                        <span>${escapeHtml(skill.name)}</span>
                        <div class="progress-bar">
                            <div class="progress" data-width="${skill.level}"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    // About stats
    if (aboutStats && data.stats) {
        aboutStats.innerHTML = data.stats.map(stat => `
            <div class="stat-item">
                <div class="stat-circle">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45"></circle>
                        <circle cx="50" cy="50" r="45"></circle>
                    </svg>
                    <span>${stat.value}%</span>
                </div>
                <p>${escapeHtml(stat.name)}</p>
            </div>
        `).join('');
        
        // Animate circles
        setTimeout(() => {
            const circles = document.querySelectorAll('.stat-circle circle:last-child');
            circles.forEach(circle => {
                const percent = parseInt(circle.parentElement.querySelector('span').textContent);
                const circumference = 2 * Math.PI * 45;
                const dashOffset = circumference - (percent / 100) * circumference;
                circle.style.strokeDasharray = circumference;
                circle.style.strokeDashoffset = circumference;
                circle.style.strokeDashoffset = dashOffset;
            });
        }, 100);
    }
    
    // Animate progress bars
    setTimeout(() => {
        const progressBars = document.querySelectorAll('.progress');
        progressBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = `${width}%`;
        });
    }, 100);
}

// Helper functions
function getCategoryName(category) {
    const categories = {
        'announcement': '📢 ANNOUNCEMENT',
        'release': '🚀 RELEASE',
        'upcoming': '🔜 UPCOMING',
        'general': '📰 NEWS'
    };
    return categories[category] || '📰 NEWS';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = isError ? 'var(--danger)' : 'var(--gradient)';
    toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Admin functions
async function addNews(title, content, category) {
    const news = await loadNews();
    const newId = news.length > 0 ? Math.max(...news.map(n => n.id)) + 1 : 1;
    news.push({
        id: newId,
        title, content,
        date: new Date().toISOString().split('T')[0],
        category,
        author: "BEBARS"
    });
    saveNews(news);
    displayNews();
    showToast("News published successfully!");
}

async function deleteNews(id) {
    if (confirm("Delete this news?")) {
        let news = await loadNews();
        news = news.filter(item => item.id !== id);
        saveNews(news);
        displayNews();
        showToast("News deleted!");
    }
}

async function editNews(id) {
    const news = await loadNews();
    const item = news.find(n => n.id === id);
    if (item) {
        const newTitle = prompt("Edit title:", item.title);
        if (newTitle && newTitle.trim()) {
            const newContent = prompt("Edit content:", item.content);
            if (newContent && newContent.trim()) {
                item.title = newTitle;
                item.content = newContent;
                saveNews(news);
                displayNews();
                showToast("News updated!");
            }
        }
    }
}

// Login
function checkLogin() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        closeModal();
        document.getElementById('adminPanel').style.display = 'block';
        displayNews();
        showToast("Admin login successful!");
        document.getElementById('adminButton').innerHTML = '<div class="admin-btn" style="background: #4caf50;"><i class="fas fa-check"></i></div>';
    } else {
        showToast("Wrong password!", true);
    }
}

function openModal() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('adminPassword').value = '';
}

function closeModal() {
    document.getElementById('loginModal').classList.remove('active');
}

// ==================== UI INTERACTIONS ====================

// Initialize
async function init() {
    await displayNews();
    await displayProjects();
    await displaySkills();
    
    // News form
    document.getElementById('newsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('newsTitle').value.trim();
        const content = document.getElementById('newsContent').value.trim();
        const category = document.getElementById('newsCategory').value;
        if (title && content) {
            await addNews(title, content, category);
            document.getElementById('newsTitle').value = '';
            document.getElementById('newsContent').value = '';
        } else {
            showToast("Fill in both fields!", true);
        }
    });
    
    // Admin button
    document.getElementById('adminButton').addEventListener('click', () => {
        if (isAdmin) {
            const panel = document.getElementById('adminPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        } else {
            openModal();
        }
    });
}

// Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (hamburger) hamburger.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
    });
});

// Active link on scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 200) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// Typing Animation
const typedText = document.querySelector('.typed-text');
const texts = ['Game Developer', 'Web Developer', 'Python Enthusiast', 'Open Source Contributor'];
let textIndex = 0, charIndex = 0, isDeleting = false;

function type() {
    if (!typedText) return;
    const currentText = texts[textIndex];
    typedText.textContent = isDeleting ? currentText.substring(0, charIndex - 1) : currentText.substring(0, charIndex + 1);
    charIndex += isDeleting ? -1 : 1;
    
    if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        setTimeout(type, 2000);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        setTimeout(type, 500);
    } else {
        setTimeout(type, isDeleting ? 50 : 100);
    }
}
type();

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Navbar background
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Contact form
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        formMessage.innerHTML = '<p style="color: #667eea;"><i class="fas fa-spinner fa-spin"></i> Sending...</p>';
        setTimeout(() => {
            formMessage.innerHTML = '<p style="color: #4caf50;"><i class="fas fa-check-circle"></i> Message sent!</p>';
            contactForm.reset();
            setTimeout(() => formMessage.innerHTML = '', 3000);
        }, 1000);
    });
}

// Reveal animations
const revealElements = document.querySelectorAll('.project-card, .skill-category, .about-text, .about-stats, .news-card');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    revealObserver.observe(el);
});

// Mouse parallax
document.addEventListener('mousemove', (e) => {
    const shapes = document.querySelectorAll('.shape');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    shapes.forEach((shape, i) => {
        shape.style.transform = `translate(${x * (i + 1) * 20}px, ${y * (i + 1) * 20}px)`;
    });
});

// Start
init();

