// ==================== UI INTERACTIONS ====================
// This file handles ONLY animations, navigation, and UI updates
// All database operations are in database.js

// ==================== DOM ELEMENTS ====================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const typedText = document.querySelector('.typed-text');
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const feedbackForm = document.getElementById('feedbackForm');
const newsForm = document.getElementById('newsForm');
const adminButton = document.getElementById('adminButton');
const loginModal = document.getElementById('loginModal');

// ==================== NAVIGATION ====================

// Mobile menu toggle
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu on link click
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
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 200) {
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

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
});

// ==================== TYPING ANIMATION ====================

const texts = ['Game Developer', 'Web Developer', 'Python Enthusiast', 'Open Source Contributor'];
let textIndex = 0, charIndex = 0, isDeleting = false;

function type() {
    if (!typedText) return;
    
    const currentText = texts[textIndex];
    typedText.textContent = isDeleting 
        ? currentText.substring(0, charIndex - 1) 
        : currentText.substring(0, charIndex + 1);
    
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

// ==================== PROGRESS BARS ANIMATION ====================

const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const width = entry.target.getAttribute('data-width');
            entry.target.style.width = `${width}%`;
            progressObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.progress').forEach(bar => progressObserver.observe(bar));

// ==================== CIRCLE PROGRESS ANIMATION ====================

const circleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const circles = document.querySelectorAll('.stat-circle circle:last-child');
            circles.forEach(circle => {
                const percent = parseInt(circle.parentElement.querySelector('span').textContent);
                const circumference = 2 * Math.PI * 45;
                const dashOffset = circumference - (percent / 100) * circumference;
                circle.style.strokeDasharray = circumference;
                circle.style.strokeDashoffset = dashOffset;
            });
            circleObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsContainer = document.querySelector('.about-stats');
if (statsContainer) circleObserver.observe(statsContainer);

// ==================== REVEAL ANIMATION ON SCROLL ====================

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

// ==================== MOUSE PARALLAX EFFECT ====================

document.addEventListener('mousemove', (e) => {
    const shapes = document.querySelectorAll('.shape');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    shapes.forEach((shape, i) => {
        const speed = (i + 1) * 20;
        shape.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
});

// ==================== CONTACT FORM ====================

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        formMessage.innerHTML = '<p style="color: #667eea;"><i class="fas fa-spinner fa-spin"></i> Sending...</p>';
        
        setTimeout(() => {
            formMessage.innerHTML = '<p style="color: #4caf50;"><i class="fas fa-check-circle"></i> Message sent successfully!</p>';
            contactForm.reset();
            setTimeout(() => formMessage.innerHTML = '', 3000);
        }, 1000);
    });
}

// ==================== FEEDBACK FORM ====================

if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('feedbackName')?.value.trim();
        const email = document.getElementById('feedbackEmail')?.value.trim();
        const type = document.getElementById('feedbackType')?.value;
        const subject = document.getElementById('feedbackSubject')?.value.trim();
        const message = document.getElementById('feedbackMessage')?.value.trim();
        const attachUrl = document.getElementById('feedbackAttachUrl')?.checked;
        const pageUrl = attachUrl ? window.location.href : '';
        
        // Validate
        if (!name || !email || !type || !subject || !message) {
            showFeedbackMessage('Please fill in all fields!', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showFeedbackMessage('Please enter a valid email address!', 'error');
            return;
        }
        
        // Disable button
        const submitBtn = document.getElementById('feedbackSubmitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Send feedback using database.js function
        const result = await sendFeedbackToEmail({
            name, email, type, subject, message, page_url: pageUrl
        });
        
        if (result.success) {
            showFeedbackMessage(result.message, 'success');
            feedbackForm.reset();
        } else {
            showFeedbackMessage(result.message, 'error');
        }
        
        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// Email validation helper
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Show feedback message
function showFeedbackMessage(message, type) {
    const messageDiv = document.getElementById('feedbackMessageResult');
    if (!messageDiv) return;
    
    messageDiv.innerHTML = `
        <div class="feedback-alert feedback-${type}">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            ${message}
        </div>
    `;
    
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}

// ==================== VS SECTION UI ====================

// Update VS section UI with like counts
function updateVSUI(likes) {
    const bebarsCount = document.getElementById('bebarsLikes');
    const ahmedCount = document.getElementById('ahmedLikes');
    const progressBebars = document.getElementById('progressBebars');
    const progressAhmed = document.getElementById('progressAhmed');
    const bebarsPercentSpan = document.getElementById('bebarsPercent');
    const ahmedPercentSpan = document.getElementById('ahmedPercent');
    
    const bebars = likes?.bebars || 0;
    const ahmed = likes?.ahmed || 0;
    const total = bebars + ahmed;
    
    let bebarsPercent = 50;
    let ahmedPercent = 50;
    
    if (total > 0) {
        bebarsPercent = (bebars / total) * 100;
        ahmedPercent = (ahmed / total) * 100;
    }
    
    if (bebarsCount) bebarsCount.textContent = bebars;
    if (ahmedCount) ahmedCount.textContent = ahmed;
    if (progressBebars) progressBebars.style.width = `${bebarsPercent}%`;
    if (progressAhmed) progressAhmed.style.width = `${ahmedPercent}%`;
    if (bebarsPercentSpan) bebarsPercentSpan.textContent = Math.round(bebarsPercent);
    if (ahmedPercentSpan) ahmedPercentSpan.textContent = Math.round(ahmedPercent);
}

// Handle like button click
async function addLike(user) {
    if (!user) return;
    
    const result = await addLikeToDatabase(user);
    
    if (result.success) {
        // Animate the heart
        const btn = event?.currentTarget;
        if (btn) {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.add('animate');
                setTimeout(() => icon.classList.remove('animate'), 500);
            }
        }
        showToast(result.message);
    } else {
        showToast(result.message, true);
    }
}

// Show toast message
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = isError ? 'var(--danger)' : 'var(--gradient)';
    toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ==================== NEWS UI ====================

// Display news on page
async function displayNewsUI() {
    const newsGrid = document.getElementById('newsGrid');
    const news = await loadNews();
    const isAdmin = typeof isUserAdmin === 'function' ? isUserAdmin() : false;
    
    if (!news || news.length === 0) {
        newsGrid.innerHTML = '<div class="empty-news"><i class="fas fa-newspaper"></i><p>No news yet. Check back soon!</p></div>';
        return;
    }
    
    newsGrid.innerHTML = news.map(item => `
        <div class="news-card" data-id="${item.id}">
            <div class="news-badge ${item.category || 'general'}">${getCategoryName(item.category)}</div>
            <div class="news-date"><i class="far fa-calendar-alt"></i> ${formatDate(item.date)}</div>
            <h3 class="news-title">${escapeHtml(item.title)}</h3>
            <p class="news-content">${escapeHtml(item.content)}</p>
            ${item.author ? `<div class="news-author"><i class="fas fa-user"></i> ${escapeHtml(item.author)}</div>` : ''}
            ${isAdmin ? `
                <div class="news-actions">
                    <button class="btn-danger" onclick="handleDeleteNews('${item.id}')"><i class="fas fa-trash"></i> Delete</button>
                    <button class="btn-warning" onclick="handleEditNews('${item.id}')"><i class="fas fa-edit"></i> Edit</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Handle delete news
async function handleDeleteNews(id) {
    if (confirm("Are you sure you want to delete this news?")) {
        const result = await deleteNews(id);
        if (result.success) {
            await displayNewsUI();
            showToast(result.message);
        } else {
            showToast(result.message, true);
        }
    }
}

// Handle edit news
async function handleEditNews(id) {
    const item = await getNewsById(id);
    if (item) {
        const newTitle = prompt("Edit title:", item.title);
        if (newTitle !== null && newTitle.trim()) {
            const newContent = prompt("Edit content:", item.content);
            if (newContent !== null && newContent.trim()) {
                const result = await editNews(id, newTitle, newContent);
                if (result.success) {
                    await displayNewsUI();
                    showToast(result.message);
                } else {
                    showToast(result.message, true);
                }
            }
        }
    }
}

// ==================== PROJECTS UI ====================

// Display projects on page
async function displayProjectsUI() {
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

// ==================== SKILLS UI ====================

// Display skills on page
async function displaySkillsUI() {
    const skillsGrid = document.getElementById('skillsGrid');
    const aboutStats = document.getElementById('aboutStats');
    const data = await loadSkills();
    
    if (!data.skills || data.skills.length === 0) {
        skillsGrid.innerHTML = '<div class="empty-news"><i class="fas fa-chart-line"></i><p>Skills data not available.</p></div>';
        return;
    }
    
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
    
    if (aboutStats && data.stats) {
        aboutStats.innerHTML = data.stats.map(stat => `
            <div class="stat-item">
                <div class="stat-circle">
                    <svg viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#667eea"/>
                                <stop offset="100%" stop-color="#764ba2"/>
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="45"></circle>
                        <circle cx="50" cy="50" r="45" style="stroke: url(#gradient);"></circle>
                    </svg>
                    <span>${stat.value}%</span>
                </div>
                <p>${escapeHtml(stat.name)}</p>
            </div>
        `).join('');
        
        // Trigger circle animation
        setTimeout(() => {
            const circles = document.querySelectorAll('.stat-circle circle:last-child');
            circles.forEach(circle => {
                const percent = parseInt(circle.parentElement.querySelector('span').textContent);
                const circumference = 2 * Math.PI * 45;
                const dashOffset = circumference - (percent / 100) * circumference;
                circle.style.strokeDasharray = circumference;
                circle.style.strokeDashoffset = dashOffset;
            });
        }, 100);
    }
    
    // Trigger progress bar animation
    setTimeout(() => {
        document.querySelectorAll('.progress').forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = `${width}%`;
        });
    }, 100);
}

// ==================== ADMIN UI ====================

// Open login modal
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (!modal) return;
    
    modal.classList.add('active');
    modal.innerHTML = `
        <div class="modal-content">
            <h2><i class="fas fa-shield-alt"></i> Admin Login</h2>
            <input type="email" id="adminEmail" placeholder="Email" autocomplete="email">
            <input type="password" id="adminPassword" placeholder="Password" autocomplete="current-password">
            <button class="btn-primary" onclick="handleAdminLogin()">Login</button>
            <button class="btn-secondary" onclick="closeLoginModal()">Cancel</button>
        </div>
    `;
}

// Close login modal
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('active');
}

// Handle admin login
async function handleAdminLogin() {
    const email = document.getElementById('adminEmail')?.value;
    const password = document.getElementById('adminPassword')?.value;
    
    if (!email || !password) {
        showToast("Please enter email and password!", true);
        return;
    }
    
    const result = await adminLogin(email, password);
    
    if (result.success) {
        closeLoginModal();
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('adminButton').innerHTML = '<div class="admin-btn" style="background: #4caf50;"><i class="fas fa-check"></i></div>';
        await displayNewsUI();
        showToast(result.message);
    } else {
        showToast(result.message, true);
    }
}

// Handle admin logout
async function handleAdminLogout() {
    const result = await adminLogout();
    if (result.success) {
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('adminButton').innerHTML = '<div class="admin-btn"><i class="fas fa-lock"></i></div>';
        await displayNewsUI();
        showToast(result.message);
    }
}

// ==================== INITIALIZATION ====================

// Initialize all UI components
async function initUI() {
    await displayNewsUI();
    await displayProjectsUI();
    await displaySkillsUI();
    
    // Load VS likes
    const likes = await getLikeCounts();
    updateVSUI(likes);
    
    // Setup real-time listener for VS
    setupVSLiveListener((likesData) => {
        updateVSUI(likesData);
    });
    
    // News form handler
    if (newsForm) {
        newsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('newsTitle')?.value.trim();
            const content = document.getElementById('newsContent')?.value.trim();
            const category = document.getElementById('newsCategory')?.value;
            
            if (title && content) {
                const result = await addNews(title, content, category);
                if (result.success) {
                    await displayNewsUI();
                    document.getElementById('newsTitle').value = '';
                    document.getElementById('newsContent').value = '';
                    showToast(result.message);
                } else {
                    showToast(result.message, true);
                }
            } else {
                showToast("Please fill in both title and content!", true);
            }
        });
    }
    
    // Admin button handler
    if (adminButton) {
        adminButton.addEventListener('click', () => {
            const adminStatus = getAdminStatus();
            if (adminStatus.isAdmin) {
                const panel = document.getElementById('adminPanel');
                if (panel) {
                    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                }
            } else {
                openLoginModal();
            }
        });
    }
}

// Start the application when page loads
document.addEventListener('DOMContentLoaded', initUI);