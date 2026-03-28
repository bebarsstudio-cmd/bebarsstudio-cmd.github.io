// ==================== FIREBASE CONFIGURATION ====================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// ==================== GLOBAL STATE ====================
let isAdmin = false;
let currentUser = null;
let currentAdmin = null;
let firebaseAvailable = true;
let db = null;
let auth = null;
let adminsList = [];
let databaseReady = false;

// Collections
const COLLECTIONS = {
    NEWS: 'news',
    PROJECTS: 'projects',
    SKILLS: 'skills',
    USERS: 'users',
    VS: 'vs',
    ADMINS: 'admins'
};

// ==================== FIREBASE INITIALIZATION ====================
async function initFirebase() {
    try {
        if (typeof firebase === 'undefined') {
            console.warn("Firebase SDK not loaded, using JSON backup");
            firebaseAvailable = false;
            return false;
        }
        
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        
        await db.collection('_test').doc('test').get();
        console.log("✅ Firebase connected successfully");
        firebaseAvailable = true;
        return true;
        
    } catch (error) {
        console.error("❌ Firebase connection failed:", error);
        firebaseAvailable = false;
        return false;
    }
}

// ==================== ADMIN MANAGEMENT ====================

// Load admins from JSON/Firebase
async function loadAdmins() {
    try {
        if (firebaseAvailable && db) {
            const snapshot = await db.collection(COLLECTIONS.ADMINS).get();
            const admins = [];
            snapshot.forEach(doc => {
                admins.push({ id: doc.id, ...doc.data() });
            });
            if (admins.length > 0) {
                adminsList = admins;
                console.log("✅ Admins loaded from Firebase");
                return admins;
            }
        }
    } catch (error) {
        console.warn("Firebase loadAdmins failed:", error);
    }
    
    try {
        const response = await fetch('data/admins.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        adminsList = data.admins;
        console.log("✅ Admins loaded from JSON");
        return adminsList;
    } catch (error) {
        console.log("⚠️ Could not load admins.json, using default");
        const defaultAdmins = [
            {
                id: 1,
                username: "bebars",
                email: "bebarsstudio@gmail.com",
                password: "admin1",
                displayName: "BEBARS",
                role: "super_admin",
                avatar: "images/Bebars.png",
                createdAt: new Date().toISOString().split('T')[0]
            },
            {
                id: 2,
                username: "ahmed",
                email: "ahmed@example.com",
                password: "admin2",
                displayName: "Ahmed",
                role: "admin",
                avatar: "images/ahmed.png",
                createdAt: new Date().toISOString().split('T')[0]
            }
        ];
        adminsList = defaultAdmins;
        return defaultAdmins;
    }
}

// Save admins to Firebase/JSON
async function saveAdmins(admins) {
    adminsList = admins;
    
    if (firebaseAvailable && db) {
        try {
            const snapshot = await db.collection(COLLECTIONS.ADMINS).get();
            const batch = db.batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            
            for (const admin of admins) {
                await db.collection(COLLECTIONS.ADMINS).add(admin);
            }
            console.log("✅ Admins saved to Firebase");
        } catch (error) {
            console.error("Firebase saveAdmins failed:", error);
        }
    }
    
    localStorage.setItem('admins_backup', JSON.stringify(admins));
    return true;
}

// Add new admin
async function addAdmin(adminData) {
    if (!isAdmin || currentAdmin?.role !== 'super_admin') {
        return { success: false, message: "Only super admin can add new admins!" };
    }
    
    const existing = adminsList.find(a => 
        a.username === adminData.username || a.email === adminData.email
    );
    
    if (existing) {
        return { success: false, message: "Username or email already exists!" };
    }
    
    const newAdmin = {
        id: Date.now(),
        username: adminData.username,
        email: adminData.email,
        password: adminData.password,
        displayName: adminData.displayName,
        role: adminData.role || "admin",
        avatar: adminData.avatar || "images/default-avatar.png",
        createdBy: currentAdmin.username,
        createdAt: new Date().toISOString().split('T')[0]
    };
    
    adminsList.push(newAdmin);
    await saveAdmins(adminsList);
    
    return { success: true, message: `Admin ${newAdmin.displayName} added successfully!` };
}

// Update admin
async function updateAdmin(adminId, updates) {
    if (!isAdmin) {
        return { success: false, message: "Admin access required!" };
    }
    
    const index = adminsList.findIndex(a => a.id === adminId);
    if (index === -1) {
        return { success: false, message: "Admin not found!" };
    }
    
    if (currentAdmin.role !== 'super_admin' && adminsList[index].id !== currentAdmin.id) {
        return { success: false, message: "You can only edit your own profile!" };
    }
    
    adminsList[index] = { ...adminsList[index], ...updates };
    await saveAdmins(adminsList);
    
    if (adminsList[index].id === currentAdmin.id) {
        currentAdmin = adminsList[index];
    }
    
    return { success: true, message: "Admin updated successfully!" };
}

// Delete admin
async function deleteAdmin(adminId) {
    if (!isAdmin || currentAdmin?.role !== 'super_admin') {
        return { success: false, message: "Only super admin can delete admins!" };
    }
    
    if (adminId === currentAdmin.id) {
        return { success: false, message: "You cannot delete yourself!" };
    }
    
    const index = adminsList.findIndex(a => a.id === adminId);
    if (index === -1) {
        return { success: false, message: "Admin not found!" };
    }
    
    adminsList.splice(index, 1);
    await saveAdmins(adminsList);
    
    return { success: true, message: "Admin deleted successfully!" };
}

// Verify admin credentials
async function verifyAdminCredentials(usernameOrEmail, password) {
    await loadAdmins();
    
    const admin = adminsList.find(a => 
        (a.username === usernameOrEmail || a.email === usernameOrEmail) && 
        a.password === password
    );
    
    if (admin) {
        return {
            success: true,
            admin: admin,
            message: `Welcome back, ${admin.displayName}!`
        };
    }
    
    return {
        success: false,
        message: "Invalid username/email or password!"
    };
}

// Admin login
async function adminLogin(usernameOrEmail, password) {
    const jsonResult = await verifyAdminCredentials(usernameOrEmail, password);
    
    if (!jsonResult.success) {
        return jsonResult;
    }
    
    currentAdmin = jsonResult.admin;
    isAdmin = true;
    
    if (firebaseAvailable && auth) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(
                currentAdmin.email, 
                password
            );
            currentUser = userCredential.user;
            
            await db.collection(COLLECTIONS.USERS).doc(currentUser.uid).set({
                email: currentAdmin.email,
                username: currentAdmin.username,
                displayName: currentAdmin.displayName,
                role: currentAdmin.role,
                isAdmin: true
            }, { merge: true });
        } catch (firebaseError) {
            console.warn("Firebase auth failed, using JSON only:", firebaseError);
        }
    }
    
    // Store session for this browser tab only (not auto-restored on refresh)
    sessionStorage.setItem('admin_session', JSON.stringify({
        id: currentAdmin.id,
        username: currentAdmin.username,
        displayName: currentAdmin.displayName,
        role: currentAdmin.role,
        loginTime: new Date().toISOString()
    }));
    
    return {
        success: true,
        message: jsonResult.message,
        admin: currentAdmin
    };
}

// Admin logout
async function adminLogout() {
    if (firebaseAvailable && auth) {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Logout error:", error);
        }
    }
    
    isAdmin = false;
    currentUser = null;
    currentAdmin = null;
    sessionStorage.removeItem('admin_session');
    
    return { success: true, message: "Logged out successfully!" };
}

// Get admin list
async function getAdminsList() {
    if (adminsList.length === 0) {
        await loadAdmins();
    }
    return adminsList;
}

// Get current admin
function getCurrentAdmin() {
    return currentAdmin;
}

function isUserAdmin() {
    return isAdmin;
}

function getAdminStatus() {
    return { 
        isAdmin: isAdmin, 
        user: currentUser,
        admin: currentAdmin
    };
}

// ==================== JSON BACKUP LOADERS ====================

async function loadFromJSONFile(filename) {
    try {
        const response = await fetch(`data/${filename}.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        console.log(`✅ Loaded ${filename}.json backup`);
        return data;
    } catch (error) {
        console.log(`⚠️ Could not load ${filename}.json:`, error);
        return null;
    }
}

async function loadNewsFromJSON() {
    const data = await loadFromJSONFile('news');
    return data?.news || [];
}

async function loadProjectsFromJSON() {
    const data = await loadFromJSONFile('projects');
    return data?.projects || [];
}

async function loadSkillsFromJSON() {
    const data = await loadFromJSONFile('skills');
    if (data) {
        return { skills: data.skills || [], stats: data.stats || [] };
    }
    return {
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
}

async function loadLikesFromLocal() {
    try {
        const saved = localStorage.getItem('vs_likes_backup');
        if (saved) {
            return JSON.parse(saved);
        }
        return { bebars: 0, ahmed: 0 };
    } catch (error) {
        return { bebars: 0, ahmed: 0 };
    }
}

async function saveLikesToLocal(likes) {
    try {
        localStorage.setItem('vs_likes_backup', JSON.stringify(likes));
    } catch (error) {
        console.error("Error saving likes to localStorage:", error);
    }
}

// ==================== NEWS OPERATIONS ====================

async function loadNews() {
    if (firebaseAvailable && db) {
        try {
            const snapshot = await db.collection(COLLECTIONS.NEWS)
                .orderBy('date', 'desc')
                .get();
            
            const news = [];
            snapshot.forEach(doc => {
                news.push({ id: doc.id, ...doc.data() });
            });
            
            if (news.length > 0) {
                return news;
            }
        } catch (error) {
            console.warn("Firebase loadNews failed, trying JSON backup:", error);
        }
    }
    
    console.log("📁 Using JSON backup for news");
    return await loadNewsFromJSON();
}

async function addNews(title, content, category) {
    if (!isAdmin) {
        return { success: false, message: "Admin access required!" };
    }
    
    const newNews = {
        id: Date.now(),
        title: title,
        content: content,
        date: new Date().toISOString().split('T')[0],
        category: category,
        author: currentAdmin?.displayName || "Admin",
        authorUsername: currentAdmin?.username || "admin",
        createdAt: new Date().toISOString()
    };
    
    if (firebaseAvailable && db) {
        try {
            await db.collection(COLLECTIONS.NEWS).add(newNews);
            return { success: true, message: "News published successfully!" };
        } catch (error) {
            console.error("Firebase addNews failed:", error);
        }
    }
    
    try {
        const localNews = JSON.parse(localStorage.getItem('news_backup') || '[]');
        localNews.unshift(newNews);
        localStorage.setItem('news_backup', JSON.stringify(localNews));
        return { success: true, message: "News saved locally! (Backup Mode)" };
    } catch (error) {
        return { success: false, message: "Error saving news" };
    }
}

async function deleteNews(id) {
    if (!isAdmin) {
        return { success: false, message: "Admin access required!" };
    }
    
    if (firebaseAvailable && db) {
        try {
            await db.collection(COLLECTIONS.NEWS).doc(id).delete();
            return { success: true, message: "News deleted successfully!" };
        } catch (error) {
            console.error("Firebase delete failed:", error);
        }
    }
    
    try {
        let localNews = JSON.parse(localStorage.getItem('news_backup') || '[]');
        localNews = localNews.filter(item => item.id.toString() !== id.toString());
        localStorage.setItem('news_backup', JSON.stringify(localNews));
        return { success: true, message: "News deleted locally! (Backup Mode)" };
    } catch (error) {
        return { success: false, message: "Error deleting news" };
    }
}

async function editNews(id, newTitle, newContent) {
    if (!isAdmin) {
        return { success: false, message: "Admin access required!" };
    }
    
    if (firebaseAvailable && db) {
        try {
            await db.collection(COLLECTIONS.NEWS).doc(id).update({
                title: newTitle,
                content: newContent,
                updatedBy: currentAdmin?.username || "admin",
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, message: "News updated successfully!" };
        } catch (error) {
            console.error("Firebase edit failed:", error);
        }
    }
    
    try {
        let localNews = JSON.parse(localStorage.getItem('news_backup') || '[]');
        const index = localNews.findIndex(item => item.id.toString() === id.toString());
        if (index !== -1) {
            localNews[index].title = newTitle;
            localNews[index].content = newContent;
            localNews[index].updatedBy = currentAdmin?.username || "admin";
            localStorage.setItem('news_backup', JSON.stringify(localNews));
        }
        return { success: true, message: "News updated locally! (Backup Mode)" };
    } catch (error) {
        return { success: false, message: "Error updating news" };
    }
}

async function getNewsById(id) {
    if (firebaseAvailable && db) {
        try {
            const doc = await db.collection(COLLECTIONS.NEWS).doc(id).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
        } catch (error) {
            console.error("Error getting news:", error);
        }
    }
    
    try {
        const localNews = JSON.parse(localStorage.getItem('news_backup') || '[]');
        return localNews.find(item => item.id.toString() === id.toString()) || null;
    } catch (error) {
        return null;
    }
}

// ==================== PROJECTS & SKILLS ====================

async function loadProjects() {
    if (firebaseAvailable && db) {
        try {
            const snapshot = await db.collection(COLLECTIONS.PROJECTS)
                .orderBy('order', 'asc')
                .get();
            
            const projects = [];
            snapshot.forEach(doc => {
                projects.push({ id: doc.id, ...doc.data() });
            });
            
            if (projects.length > 0) {
                return projects;
            }
        } catch (error) {
            console.warn("Firebase loadProjects failed:", error);
        }
    }
    
    return await loadProjectsFromJSON();
}

async function loadSkills() {
    if (firebaseAvailable && db) {
        try {
            const doc = await db.collection(COLLECTIONS.SKILLS).doc('main').get();
            if (doc.exists) {
                return doc.data();
            }
        } catch (error) {
            console.warn("Firebase loadSkills failed:", error);
        }
    }
    
    return await loadSkillsFromJSON();
}

// ==================== VS SECTION ====================

async function loadLikes() {
    if (firebaseAvailable && db) {
        try {
            const doc = await db.collection(COLLECTIONS.VS).doc('likes').get();
            if (doc.exists) {
                return doc.data();
            }
            const defaultLikes = { bebars: 0, ahmed: 0 };
            await db.collection(COLLECTIONS.VS).doc('likes').set(defaultLikes);
            return defaultLikes;
        } catch (error) {
            console.warn("Firebase loadLikes failed:", error);
        }
    }
    
    return await loadLikesFromLocal();
}

async function addLikeToDatabase(user) {
    if (!user || (user !== 'bebars' && user !== 'ahmed')) {
        return { success: false, message: "Invalid user" };
    }
    
    const lastVote = localStorage.getItem(`vote_${user}`);
    const today = new Date().toDateString();
    
    if (lastVote === today) {
        return { success: false, message: `You already voted for ${user.toUpperCase()} today!` };
    }
    
    if (firebaseAvailable && db) {
        try {
            const vsRef = db.collection(COLLECTIONS.VS).doc('likes');
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(vsRef);
                const currentLikes = doc.exists ? doc.data() : { bebars: 0, ahmed: 0 };
                currentLikes[user] = (currentLikes[user] || 0) + 1;
                transaction.set(vsRef, currentLikes);
            });
            
            localStorage.setItem(`vote_${user}`, today);
            return { success: true, message: `Thanks for supporting ${user.toUpperCase()}! 🎉` };
        } catch (error) {
            console.error("Firebase addLike failed:", error);
        }
    }
    
    try {
        let likes = await loadLikesFromLocal();
        likes[user] = (likes[user] || 0) + 1;
        await saveLikesToLocal(likes);
        localStorage.setItem(`vote_${user}`, today);
        return { success: true, message: `Thanks for supporting ${user.toUpperCase()}! (Offline Mode) 🎉` };
    } catch (error) {
        return { success: false, message: "Error adding like!" };
    }
}

async function getLikeCounts() {
    return await loadLikes();
}

function setupVSLiveListener(callback) {
    if (firebaseAvailable && db) {
        return db.collection(COLLECTIONS.VS).doc('likes').onSnapshot((doc) => {
            if (doc.exists && callback) {
                callback(doc.data());
            }
        });
    }
    return null;
}

// ==================== FEEDBACK ====================

async function sendFeedbackToEmail(feedbackData) {
    if (typeof emailjs !== 'undefined') {
        try {
            emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");
            const response = await emailjs.send(
                "YOUR_SERVICE_ID",
                "YOUR_TEMPLATE_ID",
                {
                    from_name: feedbackData.name,
                    from_email: feedbackData.email,
                    feedback_type: feedbackData.type,
                    subject: feedbackData.subject,
                    message: feedbackData.message,
                    page_url: feedbackData.page_url || '',
                    to_email: "bebarsstudio@gmail.com"
                }
            );
            if (response.status === 200) {
                return { success: true, message: "Feedback sent successfully!" };
            }
        } catch (error) {
            console.error("EmailJS error:", error);
        }
    }
    
    try {
        const feedbacks = JSON.parse(localStorage.getItem('feedbacks_backup') || '[]');
        feedbacks.push({ ...feedbackData, timestamp: new Date().toISOString() });
        localStorage.setItem('feedbacks_backup', JSON.stringify(feedbacks));
        return { success: true, message: "Feedback saved locally! Please email: bebarsstudio@gmail.com" };
    } catch (error) {
        return { success: false, message: "Failed to send. Please email: bebarsstudio@gmail.com" };
    }
}

// ==================== HELPER FUNCTIONS ====================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getCategoryName(category) {
    const categories = {
        'announcement': '📢 ANNOUNCEMENT',
        'release': '🚀 RELEASE',
        'upcoming': '🔜 UPCOMING',
        'general': '📰 NEWS'
    };
    return categories[category] || '📰 NEWS';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== INITIALIZATION ====================

async function initDatabase() {
    console.log("🔧 Initializing database...");
    await initFirebase();
    await loadAdmins();
    
    // Check if there's a session in sessionStorage (only for this tab, not auto-restored)
    const session = sessionStorage.getItem('admin_session');
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            const admin = adminsList.find(a => a.id === sessionData.id);
            if (admin) {
                currentAdmin = admin;
                isAdmin = true;
                console.log("✅ Session restored for this tab:", admin.displayName);
            } else {
                sessionStorage.removeItem('admin_session');
            }
        } catch (error) {
            sessionStorage.removeItem('admin_session');
        }
    }
    
    if (!firebaseAvailable) {
        console.log("⚠️ Running in OFFLINE/BACKUP mode - using local JSON files");
        const notification = document.createElement('div');
        notification.className = 'backup-notification';
        notification.innerHTML = `
            <i class="fas fa-database"></i>
            Running in offline mode - using local data
            <button onclick="this.parentElement.remove()">×</button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
    
    databaseReady = true;
    console.log("✅ Database ready");
    return firebaseAvailable;
}

// Make functions globally available
window.adminLogin = adminLogin;
window.adminLogout = adminLogout;
window.addAdmin = addAdmin;
window.updateAdmin = updateAdmin;
window.deleteAdmin = deleteAdmin;
window.getAdminsList = getAdminsList;
window.getCurrentAdmin = getCurrentAdmin;
window.isUserAdmin = isUserAdmin;
window.getAdminStatus = getAdminStatus;
window.loadNews = loadNews;
window.addNews = addNews;
window.deleteNews = deleteNews;
window.editNews = editNews;
window.getNewsById = getNewsById;
window.loadProjects = loadProjects;
window.loadSkills = loadSkills;
window.addLikeToDatabase = addLikeToDatabase;
window.getLikeCounts = getLikeCounts;
window.setupVSLiveListener = setupVSLiveListener;
window.sendFeedbackToEmail = sendFeedbackToEmail;
window.formatDate = formatDate;
window.getCategoryName = getCategoryName;
window.escapeHtml = escapeHtml;
window.initDatabase = initDatabase;

// Auto-init
document.addEventListener('DOMContentLoaded', initDatabase);