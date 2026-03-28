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
    USERS: 'users',
    VS: 'vs'
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
            return { success: false, message: "You don't have admin privileges!" };
        }
        
        isAdmin = true;
        return { success: true, message: "Welcome back, Admin!" };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Admin logout
async function adminLogout() {
    try {
        await auth.signOut();
        isAdmin = false;
        currentUser = null;
        return { success: true, message: "Logged out successfully!" };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Check if user is admin
function isUserAdmin() {
    return isAdmin;
}

// Get current admin status for UI
function getAdminStatus() {
    return { isAdmin: isAdmin, user: currentUser };
}

// ==================== NEWS OPERATIONS ====================

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
        return [];
    }
}

// Add new news
async function addNews(title, content, category) {
    if (!isAdmin) {
        return { success: false, message: "Admin access required!" };
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
        return { success: true, message: "News published successfully!" };
    } catch (error) {
        console.error("Error adding news:", error);
        return { success: false, message: "Error publishing news" };
    }
}

// Delete news
async function deleteNews(id) {
    if (!isAdmin) {
        return { success: false, message: "Admin access required!" };
    }
    
    try {
        await db.collection(COLLECTIONS.NEWS).doc(id).delete();
        return { success: true, message: "News deleted successfully!" };
    } catch (error) {
        console.error("Error deleting news:", error);
        return { success: false, message: "Error deleting news" };
    }
}

// Edit news
async function editNews(id, newTitle, newContent) {
    if (!isAdmin) {
        return { success: false, message: "Admin access required!" };
    }
    
    try {
        await db.collection(COLLECTIONS.NEWS).doc(id).update({
            title: newTitle,
            content: newContent,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, message: "News updated successfully!" };
    } catch (error) {
        console.error("Error updating news:", error);
        return { success: false, message: "Error updating news" };
    }
}

// Get single news item
async function getNewsById(id) {
    try {
        const doc = await db.collection(COLLECTIONS.NEWS).doc(id).get();
        if (doc.exists) {
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        console.error("Error getting news:", error);
        return null;
    }
}

// ==================== PROJECTS OPERATIONS ====================

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
        return [];
    }
}

// ==================== SKILLS OPERATIONS ====================

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

// ==================== VS SECTION OPERATIONS ====================

// Load likes from Firebase
async function loadLikes() {
    try {
        const doc = await db.collection(COLLECTIONS.VS).doc('likes').get();
        if (doc.exists) {
            return doc.data();
        } else {
            const defaultLikes = { bebars: 0, ahmed: 0 };
            await db.collection(COLLECTIONS.VS).doc('likes').set(defaultLikes);
            return defaultLikes;
        }
    } catch (error) {
        console.error("Error loading likes:", error);
        return { bebars: 0, ahmed: 0 };
    }
}

// Add like to a user
async function addLikeToDatabase(user) {
    if (!user || (user !== 'bebars' && user !== 'ahmed')) {
        return { success: false, message: "Invalid user" };
    }
    
    try {
        // Check if user already voted today
        const lastVote = localStorage.getItem(`vote_${user}`);
        const today = new Date().toDateString();
        
        if (lastVote === today) {
            return { success: false, message: `You already voted for ${user.toUpperCase()} today! Come back tomorrow!` };
        }
        
        const vsRef = db.collection(COLLECTIONS.VS).doc('likes');
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(vsRef);
            const currentLikes = doc.exists ? doc.data() : { bebars: 0, ahmed: 0 };
            currentLikes[user] = (currentLikes[user] || 0) + 1;
            transaction.set(vsRef, currentLikes);
        });
        
        // Save vote date
        localStorage.setItem(`vote_${user}`, today);
        return { success: true, message: `Thanks for supporting ${user.toUpperCase()}! 🎉` };
        
    } catch (error) {
        console.error("Error adding like:", error);
        return { success: false, message: "Error adding like. Please try again!" };
    }
}

// Get current like counts
async function getLikeCounts() {
    return await loadLikes();
}

// Setup real-time listener for VS likes
function setupVSLiveListener(callback) {
    return db.collection(COLLECTIONS.VS).doc('likes').onSnapshot((doc) => {
        if (doc.exists && callback) {
            callback(doc.data());
        }
    });
}

// ==================== FEEDBACK OPERATIONS ====================

// Send feedback to email via EmailJS
async function sendFeedbackToEmail(feedbackData) {
    try {
        // EmailJS configuration - Replace with your actual keys
        // Sign up at https://www.emailjs.com/ to get these
        const EMAILJS_CONFIG = {
            publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
            serviceId: "YOUR_EMAILJS_SERVICE_ID",
            templateId: "YOUR_EMAILJS_TEMPLATE_ID"
        };
        
        // Initialize EmailJS if not already done
        if (typeof emailjs !== 'undefined' && !window.emailjsInitialized) {
            emailjs.init(EMAILJS_CONFIG.publicKey);
            window.emailjsInitialized = true;
        }
        
        const templateParams = {
            from_name: feedbackData.name,
            from_email: feedbackData.email,
            feedback_type: feedbackData.type,
            subject: feedbackData.subject,
            message: feedbackData.message,
            page_url: feedbackData.page_url || '',
            to_email: "bebarsstudio@gmail.com",
            timestamp: new Date().toLocaleString()
        };
        
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );
        
        if (response.status === 200) {
            return { success: true, message: "Feedback sent successfully! I'll get back to you soon." };
        } else {
            throw new Error("Failed to send");
        }
        
    } catch (error) {
        console.error("Error sending feedback:", error);
        return { success: false, message: "Failed to send. Please email directly: bebarsstudio@gmail.com" };
    }
}

// ==================== HELPER FUNCTIONS ====================

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Get category display name
function getCategoryName(category) {
    const categories = {
        'announcement': '📢 ANNOUNCEMENT',
        'release': '🚀 RELEASE',
        'upcoming': '🔜 UPCOMING',
        'general': '📰 NEWS'
    };
    return categories[category] || '📰 NEWS';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}