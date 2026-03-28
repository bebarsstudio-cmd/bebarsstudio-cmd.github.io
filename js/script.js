// ==================== FIREBASE CONFIGURATION ====================
// REPLACE THIS with your Firebase config from the console
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ==================== DATABASE SYSTEM ====================
let isAdmin = false;
let currentUser = null;

// Collections
const COLLECTIONS = {
    NEWS: 'news',
    PROJECTS: 'projects',
    SKILLS: 'skills',
    USERS: 'users'
};

// ==================== AUTHENTICATION ====================

// Admin login with Firebase Auth
async function adminLogin(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        
        // Check if user is admin
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(currentUser.uid).get();
        if (!userDoc.exists || !userDoc.data().isAdmin) {
            await auth.signOut();
            isAdmin = false;
            currentUser = null;
            showToast("You don't have admin privileges!", true);
            return false;
        }
        
        isAdmin = true;
        showToast("Welcome back, Admin!");
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('adminButton').innerHTML = '<div class="admin-btn" style="background: #4caf50;"><i class="fas fa-check"></i></div>';
        displayNews(); // Refresh to show admin buttons
        return true;
    } catch (error) {
        showToast(error.message, true);
        return false;
    }
}

// Admin logout
async function adminLogout() {
    try {
        await auth.signOut();
        isAdmin = false;
        currentUser = null;
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('adminButton').innerHTML = '<div class="admin-btn"><i class="fas fa-lock"></i></div>';
        displayNews(); // Refresh to remove admin buttons
        showToast("Logged out successfully!");
    } catch (error) {
        showToast(error.message, true);
    }
}

// Check auth state
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        try {
            const userDoc = await db.collection(COLLECTIONS.USERS).doc(user.uid).get();
            if (userDoc.exists && userDoc.data().isAdmin) {
                isAdmin = true;
                document.getElementById('adminPanel').style.display = 'block';
                document.getElementById('adminButton').innerHTML = '<div class="admin-btn" style="background: #4caf50;"><i class="fas fa-check"></i></div>';
                displayNews(); // Refresh to show admin buttons
            } else {
                await auth.signOut();
            }
        } catch (error) {
            console.error("Auth error:", error);
        }
    } else {
        isAdmin = false;
        currentUser = null;
    }
});

// ==================== DATA OPERATIONS ====================

// Load news from Firestore
async function loadNews() {
    try {
        const snapshot = await db.collection(COLLECTIONS.NEWS)
            .orderBy('date', 'desc')
            .get();
        
        const news = [];
        snapshot.forEach(doc => {
            news.push({ id: doc.id, ...doc.data() });
        });
        
        return news;
    } catch (error) {
        console.error("Error loading news:", error);
        showToast("Error loading news", true);
        return [];
    }
}

// Load projects from Firestore
async function loadProjects() {
    try {
        const snapshot = await db.collection(COLLECTIONS.PROJECTS)
            .orderBy('order', 'asc')
            .get();
        
        const projects = [];
        snapshot.forEach(doc => {
            projects.push({ id: doc.id, ...doc.data() });
        });
        
        return projects;
    } catch (error) {
        console.error("Error loading projects:", error);
        showToast("Error loading projects", true);
        return [];
    }
}

// Load skills from Firestore
async function loadSkills() {
    try {
        const doc = await db.collection(COLLECTIONS.SKILLS).doc('main').get();
        if (doc.exists) {
            return doc.data();
        } else {
            // Create default skills if not exists
            const defaultSkills = {
                skills: [
                    {
                        category: "Frontend",
                        icon: "fa-code",
                        skills: [
                            { name: "HTML5/CSS3", level: 100 },
                            { name: "JavaScript", level: 34 },
                            { name: "React.js", level: 0 }
                        ]
                    },
                    {
                        category: "Backend",
                        icon: "fa-server",
                        skills: [
                            { name: "Python/Flask", level: 4 },
                            { name: "SQLite/PostgreSQL", level: 0 },
                            { name: "Node.js", level: 0 }
                        ]
                    },
                    {
                        category: "Game Dev",
                        icon: "fa-gamepad",
                        skills: [
                            { name: "Unity/C++ (learning)", level: 0 },
                            { name: "Game Design", level: 50 },
                            { name: "2D/3D Animation (learning)", level: 0 }
                        ]
                    },
                    {
                        category: "Tools",
                        icon: "fa-tools",
                        skills: [
                            { name: "Git/GitHub", level: 100 },
                            { name: "Windows", level: 100 },
                            { name: "Linux/Fedora", level: 100 }
                        ]
                    }
                ],
                stats: [
                    { name: "Python", value: 22 },
                    { name: "JavaScript", value: 34 },
                    { name: "Flask", value: 1 }
                ]
            };
            await db.collection(COLLECTIONS.SKILLS).doc('main').set(defaultSkills);
            return defaultSkills;
        }
    } catch (error) {
        console.error("Error loading skills:", error);
        return { skills: [], stats: [] };
    }
}

// Add new news
async function addNews(title, content, category) {
    if (!isAdmin) {
        showToast("Admin access required!", true);
        return;
    }
    
    try {
        const newNews = {
            title: title,
            content: content,
            date: new Date().toISOString().split('T')[0],
            category: category,
            author: "BEBARS",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection(COLLECTIONS.NEWS).add(newNews);
        showToast("News published successfully!");
        displayNews();
    } catch (error) {
        console.error("Error adding news:", error);
        showToast("Error publishing news", true);
    }
}

// Delete news
async function deleteNews(id) {
    if (!isAdmin) {
        showToast("Admin access required!", true);
        return;
    }
    
    if (confirm("Are you sure you want to delete this news?")) {
        try {
            await db.collection(COLLECTIONS.NEWS).doc(id).delete();
            showToast("News deleted successfully!");
            displayNews();
        } catch (error) {
            console.error("Error deleting news:", error);
            showToast("Error deleting news", true);
        }
    }
}

// Edit news
async function editNews(id) {
    if (!isAdmin) {
        showToast("Admin access required!", true);
        return;
    }
    
    const doc = await db.collection(COLLECTIONS.NEWS).doc(id).get();
    if (doc.exists) {
        const item = doc.data();
        const newTitle = prompt("Edit title:", item.title);
        if (newTitle !== null && newTitle.trim()) {
            const newContent = prompt("Edit content:", item.content);
            if (newContent !== null && newContent.trim()) {
                try {
                    await db.collection(COLLECTIONS.NEWS).doc(id).update({
                        title: newTitle,
                        content: newContent,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    showToast("News updated successfully!");
                    displayNews();
                } catch (error) {
                    console.error("Error updating news:", error);
                    showToast("Error updating news", true);
                }
            }
        }
    }
}

// ==================== DISPLAY FUNCTIONS ====================

// Display news
async function displayNews() {
    const newsGrid = document.getElementById('newsGrid');
    const news = await loadNews();
    
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
                    <button class="btn-danger" onclick="deleteNews('${item.id}')"><i class="fas fa-trash"></i> Delete</button>
                    <button class="btn-warning" onclick="editNews('${item.id}')"><i class="fas fa-edit"></i> Edit</button>
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
        
        // Animate circles after adding to DOM
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

// ==================== LOGIN MODAL ====================

function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('active');
    modal.innerHTML = `
        <div class="modal-content">
            <h2><i class="fas fa-shield-alt"></i> Admin Login</h2>
            <input type="email" id="adminEmail" placeholder="Email" autocomplete="email">
            <input type="password" id="adminPassword" placeholder="Password" autocomplete="current-password">
            <button class="btn-primary" onclick="handleLogin()">Login</button>
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
        </div>
    `;
}

async function handleLogin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const success = await adminLogin(email, password);
    if (success) {
        closeModal();
    }
}

function closeModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('active');
}

// ==================== INITIALIZATION ====================

async function init() {
    await displayNews();
    await displayProjects();
    await displaySkills();
    
    // News form
    const newsForm = document.getElementById('newsForm');
    if (newsForm) {
        newsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('newsTitle').value.trim();
            const content = document.getElementById('newsContent').value.trim();
            const category = document.getElementById('newsCategory').value;
            if (title && content) {
                await addNews(title, content, category);
                document.getElementById('newsTitle').value = '';
                document.getElementById('newsContent').value = '';
            } else {
                showToast("Please fill in both title and content!", true);
            }
        });
    }
    
    // Admin button
    const adminButton = document.getElementById('adminButton');
    if (adminButton) {
        adminButton.addEventListener('click', () => {
            if (isAdmin) {
                const panel = document.getElementById('adminPanel');
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            } else {
                openLoginModal();
            }
        });
    }
}

// Start the application when page loads
document.addEventListener('DOMContentLoaded', init);