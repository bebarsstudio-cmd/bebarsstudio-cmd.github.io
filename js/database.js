// Admin password (change this to your desired password)
        const ADMIN_PASSWORD = "admin123";
        let isAdmin = false;

        // News storage key
        const STORAGE_KEY = "bebars_news";

        // Sample initial news
        const defaultNews = [
            {
                id: 1,
                title: "🎉 Website Launched!",
                content: "Welcome to my new portfolio website! Stay tuned for more updates and projects.",
                date: "2026-03-24"
            },
            {
                id: 2,
                title: "🚀 Image to WebP Converter Released",
                content: "The Image to WebP Converter tool is now available! Convert images to WebP format easily.",
                date: "2026-03-23"
            },
            {
                id: 3,
                title: "📱 YouTube Downloader Coming Soon",
                content: "Working on a powerful YouTube downloader tool. Coming in the next update!",
                date: "2026-03-22"
            }
        ];

        // Load news from localStorage
        function loadNews() {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            } else {
                // Initialize with default news
                localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNews));
                return defaultNews;
            }
        }

        // Save news to localStorage
        function saveNews(news) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(news));
        }

        // Display news on page
        function displayNews() {
            const newsGrid = document.getElementById('newsGrid');
            const news = loadNews();
            
            if (news.length === 0) {
                newsGrid.innerHTML = '<div class="empty-news"><i class="fas fa-newspaper"></i><p>No news yet. Check back soon!</p></div>';
                return;
            }
            
            // Sort by date (newest first)
            news.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            newsGrid.innerHTML = news.map(item => `
                <div class="news-card" data-id="${item.id}">
                    <div class="news-badge">NEW</div>
                    <div class="news-date"><i class="far fa-calendar-alt"></i> ${formatDate(item.date)}</div>
                    <h3 class="news-title">${escapeHtml(item.title)}</h3>
                    <p class="news-content">${escapeHtml(item.content)}</p>
                    ${isAdmin ? `
                        <div class="news-actions">
                            <button class="btn-danger" onclick="deleteNews(${item.id})"><i class="fas fa-trash"></i> Delete</button>
                            <button class="btn-warning" onclick="editNews(${item.id})"><i class="fas fa-edit"></i> Edit</button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }

        // Format date
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        // Escape HTML to prevent XSS
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Add new news
        function addNews(title, content) {
            const news = loadNews();
            const newId = news.length > 0 ? Math.max(...news.map(n => n.id)) + 1 : 1;
            const newNews = {
                id: newId,
                title: title,
                content: content,
                date: new Date().toISOString().split('T')[0]
            };
            news.push(newNews);
            saveNews(news);
            displayNews();
            showToast("News published successfully!");
        }

        // Delete news
        function deleteNews(id) {
            if (confirm("Are you sure you want to delete this news?")) {
                let news = loadNews();
                news = news.filter(item => item.id !== id);
                saveNews(news);
                displayNews();
                showToast("News deleted successfully!");
            }
        }

        // Edit news
        function editNews(id) {
            const news = loadNews();
            const item = news.find(n => n.id === id);
            if (item) {
                const newTitle = prompt("Edit title:", item.title);
                if (newTitle !== null) {
                    const newContent = prompt("Edit content:", item.content);
                    if (newContent !== null) {
                        item.title = newTitle;
                        item.content = newContent;
                        saveNews(news);
                        displayNews();
                        showToast("News updated successfully!");
                    }
                }
            }
        }

        // Show toast message
        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        // Admin login
        function checkLogin() {
            const password = document.getElementById('adminPassword').value;
            if (password === ADMIN_PASSWORD) {
                isAdmin = true;
                closeModal();
                document.getElementById('adminPanel').style.display = 'block';
                displayNews(); // Refresh to show admin buttons
                showToast("Admin login successful!");
                document.getElementById('adminButton').innerHTML = '<div class="admin-btn" style="background: #4caf50;"><i class="fas fa-check"></i></div>';
            } else {
                alert("Wrong password!");
            }
        }

        function openModal() {
            document.getElementById('loginModal').classList.add('active');
            document.getElementById('adminPassword').value = '';
        }

        function closeModal() {
            document.getElementById('loginModal').classList.remove('active');
        }

        // News form submission
        document.getElementById('newsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('newsTitle').value.trim();
            const content = document.getElementById('newsContent').value.trim();
            
            if (title && content) {
                addNews(title, content);
                document.getElementById('newsTitle').value = '';
                document.getElementById('newsContent').value = '';
            } else {
                alert("Please fill in both title and content!");
            }
        });

        // Admin button click
        document.getElementById('adminButton').addEventListener('click', () => {
            if (isAdmin) {
                document.getElementById('adminPanel').style.display = 
                    document.getElementById('adminPanel').style.display === 'none' ? 'block' : 'none';
            } else {
                openModal();
            }
        });

        // Navigation
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Active link on scroll
        window.addEventListener('scroll', () => {
            let current = '';
            const sections = document.querySelectorAll('section');
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (scrollY >= sectionTop - 200) {
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
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typedText.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typedText.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }
            
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

        // Progress Bars Animation
        const progressBars = document.querySelectorAll('.progress');
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progress = entry.target;
                    const width = progress.getAttribute('data-width');
                    progress.style.width = `${width}%`;
                    observer.unobserve(progress);
                }
            });
        }, observerOptions);

        progressBars.forEach(bar => observer.observe(bar));

        // Circle Progress Animation
        const circles = document.querySelectorAll('.stat-circle circle:last-child');
        circles.forEach(circle => {
            const percent = parseInt(circle.parentElement.querySelector('span').textContent);
            const circumference = 2 * Math.PI * 45;
            const dashOffset = circumference - (percent / 100) * circumference;
            circle.style.strokeDasharray = circumference;
            circle.style.strokeDashoffset = circumference;
            
            setTimeout(() => {
                circle.style.strokeDashoffset = dashOffset;
            }, 100);
        });

        // Smooth Scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
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

        // Navbar Background on Scroll
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Contact Form Submission
        const contactForm = document.getElementById('contactForm');
        const formMessage = document.getElementById('formMessage');

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            formMessage.innerHTML = '<p style="color: #667eea;">Sending message...</p>';
            
            setTimeout(() => {
                formMessage.innerHTML = '<p style="color: #4caf50;">✓ Message sent successfully!</p>';
                contactForm.reset();
                setTimeout(() => {
                    formMessage.innerHTML = '';
                }, 3000);
            }, 1000);
        });

        // Reveal Animation
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

        revealElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'all 0.6s ease';
            revealObserver.observe(element);
        });

        // Mouse Parallax Effect
        document.addEventListener('mousemove', (e) => {
            const shapes = document.querySelectorAll('.shape');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 20;
                shape.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
            });
        });

        // Initialize news display
        displayNews();