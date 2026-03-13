// Smooth Scroll implementation for all internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Update active link
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');

            // Close mobile menu if open
            const navLinks = document.querySelector('.nav-links');
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        }
    });
});

// Mobile Menu Toggle logic
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Interactivity: Parallax Glow effect on mouse move
document.addEventListener('mousemove', (e) => {
    const glows = document.querySelectorAll('.bg-glow');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    glows.forEach((glow, index) => {
        const speed = (index + 1) * 20;
        const xOffset = (x - 0.5) * speed;
        const yOffset = (y - 0.5) * speed;
        glow.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
});

// Scroll Reveal Animations using Intersection Observer
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

// Initialize all features on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    // Start observing reveal elements
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // Initial Navbar state check
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    }
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Active link on scroll
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const top = section.offsetTop - 100;
        const height = section.offsetHeight;
        if (window.scrollY >= top && window.scrollY < top + height) {
            const id = section.getAttribute('id');
            document.querySelectorAll('.nav-links a').forEach(a => {
                a.classList.remove('active');
                if (a.getAttribute('href') === `#${id}`) {
                    a.classList.add('active');
                }
            });
        }
    });
});

// Premium Console Branding
console.log('%c🐄 AGRO-MASTER v3.5 Ultra-Premium', 'color: #10b981; font-size: 24px; font-weight: 900; text-shadow: 0 0 10px rgba(16,185,129,0.5);');
console.log('%cInnovación Ganadera & Inteligencia de Datos', 'color: #3b82f6; font-size: 16px; font-weight: 600;');
console.log('%c--------------------------------------------', 'color: #475569;');
console.log('%cDesarrollador: Cristian J. García', 'color: #94a3b8; font-size: 12px;');
