// ==================== UI INTERACTIONS ====================

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

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

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

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

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
        
        if (!name || !email || !type || !subject || !message) {
            showFeedbackMessage('Please fill in all fields!', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showFeedbackMessage('Please enter a valid email address!', 'error');
            return;
        }
        
        const submitBtn = document.getElementById('feedbackSubmitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        const result = await sendFeedbackToEmail({
            name, email, type, subject, message, page_url: pageUrl
        });
        
        if (result.success) {
            showFeedbackMessage(result.message, 'success');
            feedbackForm.reset();
        } else {
            showFeedbackMessage(result.message, 'error');
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// ==================== VS SECTION UI ====================

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

async function addLike(user) {
    if (!user) return;
    
    const result = await addLikeToDatabase(user);
    
    if (result.success) {
        const btns = document.querySelectorAll('.like-btn');
        btns.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.add('animate');
                setTimeout(() => icon.classList.remove('animate'), 500);
            }
        });
        showToast(result.message);
    } else {
        showToast(result.message, true);
    }
}

function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = isError ? 'var(--danger)' : 'var(--gradient)';
    toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ==================== NEWS UI ====================

async function displayNewsUI() {
    const newsGrid = document.getElementById('newsGrid');
    const news = await loadNews();
    const adminStatus = getAdminStatus();
    const isAdmin = adminStatus.isAdmin;
    
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
    
    setTimeout(() => {
        document.querySelectorAll('.progress').forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = `${width}%`;
        });
    }, 100);
}

// ==================== ADMIN MANAGEMENT UI ====================

async function displayAdminsList() {
    const adminsContainer = document.getElementById('adminsList');
    if (!adminsContainer) return;
    
    const admins = await getAdminsList();
    const currentAdmin = getCurrentAdmin();
    
    if (!admins || admins.length === 0) {
        adminsContainer.innerHTML = '<p>No admins found.</p>';
        return;
    }
    
    adminsContainer.innerHTML = admins.map(admin => `
        <div class="admin-card">
            <div class="admin-card-header">
                <i class="fas fa-user-circle"></i>
                <h5>${escapeHtml(admin.displayName)}</h5>
            </div>
            <div><small>@${escapeHtml(admin.username)}</small></div>
            <div><small>${escapeHtml(admin.email)}</small></div>
            <div class="admin-card-role role-${admin.role}">${admin.role === 'super_admin' ? '👑 Super Admin' : '👤 Admin'}</div>
            ${admin.createdAt ? `<div><small>Joined: ${admin.createdAt}</small></div>` : ''}
            ${currentAdmin?.role === 'super_admin' && admin.id !== currentAdmin?.id ? `
                <div class="admin-card-actions">
                    <button class="btn-danger" onclick="handleDeleteAdmin(${admin.id})"><i class="fas fa-trash"></i> Delete</button>
                    <button class="btn-warning" onclick="handleResetAdminPassword(${admin.id})"><i class="fas fa-key"></i> Reset</button>
                </div>
            ` : ''}
            ${admin.id === currentAdmin?.id ? '<div class="admin-badge-current"><i class="fas fa-check-circle"></i> You</div>' : ''}
        </div>
    `).join('');
}

async function handleAddAdmin(e) {
    e.preventDefault();
    
    const username = document.getElementById('newAdminUsername')?.value.trim();
    const email = document.getElementById('newAdminEmail')?.value.trim();
    const password = document.getElementById('newAdminPassword')?.value;
    const displayName = document.getElementById('newAdminDisplayName')?.value.trim();
    const role = document.getElementById('newAdminRole')?.value;
    
    if (!username || !email || !password || !displayName) {
        showToast("Please fill in all fields!", true);
        return;
    }
    
    if (password.length < 4) {
        showToast("Password must be at least 4 characters!", true);
        return;
    }
    
    const result = await addAdmin({ username, email, password, displayName, role });
    
    if (result.success) {
        showToast(result.message);
        document.getElementById('addAdminForm').reset();
        await displayAdminsList();
    } else {
        showToast(result.message, true);
    }
}

async function handleDeleteAdmin(adminId) {
    if (confirm("Are you sure you want to delete this admin?")) {
        const result = await deleteAdmin(adminId);
        if (result.success) {
            showToast(result.message);
            await displayAdminsList();
        } else {
            showToast(result.message, true);
        }
    }
}

async function handleResetAdminPassword(adminId) {
    const newPassword = prompt("Enter new password (min 4 characters):");
    if (newPassword && newPassword.length >= 4) {
        const result = await updateAdmin(adminId, { password: newPassword });
        if (result.success) {
            showToast("Password reset successfully!");
        } else {
            showToast(result.message, true);
        }
    } else if (newPassword) {
        showToast("Password must be at least 4 characters!", true);
    }
}

// ==================== ADMIN LOGIN UI ====================

function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (!modal) return;
    
    modal.classList.add('active');
    modal.innerHTML = `
        <div class="modal-content">
            <h2><i class="fas fa-shield-alt"></i> Admin Login</h2>
            <input type="text" id="adminUsername" placeholder="Username or Email" autocomplete="username">
            <input type="password" id="adminPassword" placeholder="Password" autocomplete="current-password">
            <button class="btn-primary" onclick="handleAdminLogin()">Login</button>
            <button class="btn-secondary" onclick="closeLoginModal()">Cancel</button>
        </div>
    `;
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('active');
}

async function handleAdminLogin() {
    const usernameOrEmail = document.getElementById('adminUsername')?.value;
    const password = document.getElementById('adminPassword')?.value;
    
    if (!usernameOrEmail || !password) {
        showToast("Please enter username/email and password!", true);
        return;
    }
    
    const result = await adminLogin(usernameOrEmail, password);
    
    if (result.success) {
        closeLoginModal();
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) adminPanel.style.display = 'block';
        
        const adminBtn = document.getElementById('adminButton');
        if (adminBtn) {
            adminBtn.innerHTML = '<div class="admin-btn" style="background: #4caf50;"><i class="fas fa-user-check"></i></div>';
        }
        
        const adminPanelTitle = document.querySelector('#adminPanel h3');
        if (adminPanelTitle && result.admin) {
            adminPanelTitle.innerHTML = `<i class="fas fa-user-shield"></i> Welcome, ${result.admin.displayName}! - Admin Panel`;
        }
        
        const addAdminSection = document.getElementById('addAdminSection');
        if (addAdminSection && result.admin) {
            addAdminSection.style.display = result.admin.role === 'super_admin' ? 'block' : 'none';
        }
        
        await displayNewsUI();
        await displayAdminsList();
        showToast(result.message);
    } else {
        showToast(result.message, true);
    }
}

async function handleAdminLogout() {
    const result = await adminLogout();
    if (result.success) {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) adminPanel.style.display = 'none';
        
        const adminBtn = document.getElementById('adminButton');
        if (adminBtn) {
            adminBtn.innerHTML = '<div class="admin-btn"><i class="fas fa-lock"></i></div>';
        }
        
        await displayNewsUI();
        showToast(result.message);
    } else {
        showToast(result.message, true);
    }
}

// ==================== INITIALIZATION ====================

async function initUI() {
    console.log("🚀 Initializing UI...");
    
    // Wait a bit for database to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check admin session and update UI
    const adminStatus = getAdminStatus();
    if (adminStatus.isAdmin) {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) adminPanel.style.display = 'block';
        
        const adminBtn = document.getElementById('adminButton');
        if (adminBtn) {
            adminBtn.innerHTML = '<div class="admin-btn" style="background: #4caf50;"><i class="fas fa-user-check"></i></div>';
        }
        
        const currentAdmin = getCurrentAdmin();
        const addAdminSection = document.getElementById('addAdminSection');
        if (addAdminSection && currentAdmin) {
            addAdminSection.style.display = currentAdmin.role === 'super_admin' ? 'block' : 'none';
        }
        
        const adminPanelTitle = document.querySelector('#adminPanel h3');
        if (adminPanelTitle && currentAdmin) {
            adminPanelTitle.innerHTML = `<i class="fas fa-user-shield"></i> Welcome, ${currentAdmin.displayName}! - Admin Panel`;
        }
    }
    
    // Load all content
    await displayNewsUI();
    await displayProjectsUI();
    await displaySkillsUI();
    await displayAdminsList();
    
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
    
    // Add admin form handler
    const addAdminForm = document.getElementById('addAdminForm');
    if (addAdminForm) {
        addAdminForm.addEventListener('submit', handleAddAdmin);
    }
    
    // Admin button handler
    if (adminButton) {
        adminButton.addEventListener('click', () => {
            const adminStatus = getAdminStatus();
            if (adminStatus.isAdmin) {
                const panel = document.getElementById('adminPanel');
                if (panel) {
                    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                    if (panel.style.display === 'block') {
                        displayAdminsList();
                    }
                }
            } else {
                openLoginModal();
            }
        });
    }
    
    // Add logout button to admin panel if not exists
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel && !document.getElementById('adminLogoutBtn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'adminLogoutBtn';
        logoutBtn.className = 'btn-secondary';
        logoutBtn.style.marginTop = '1rem';
        logoutBtn.style.width = '100%';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.onclick = handleAdminLogout;
        adminPanel.appendChild(logoutBtn);
    }
    
    console.log("✅ UI Initialized");
}

// Make functions globally available
window.addLike = addLike;
window.handleDeleteNews = handleDeleteNews;
window.handleEditNews = handleEditNews;
window.handleAdminLogin = handleAdminLogin;
window.handleAdminLogout = handleAdminLogout;
window.handleAddAdmin = handleAddAdmin;
window.handleDeleteAdmin = handleDeleteAdmin;
window.handleResetAdminPassword = handleResetAdminPassword;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.showToast = showToast;

// Start the application
document.addEventListener('DOMContentLoaded', initUI);