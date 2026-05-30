(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.matchMedia('(min-width: 768px)');
    const hasHover = window.matchMedia('(hover: hover)');

    /* ── Scroll progress bar ── */
    const progressBar = document.querySelector('.scroll-progress');
    function updateScrollProgress() {
        if (!progressBar) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = docHeight > 0 ? (scrollTop / docHeight) * 100 + '%' : '0%';
    }

    /* ── Nav: shrink + hide on scroll down ── */
    const nav = document.querySelector('nav');
    let lastScrollY = 0;
    let ticking = false;

    function updateNav() {
        if (!nav) return;
        const scrollY = window.scrollY;

        nav.classList.toggle('nav-scrolled', scrollY > 60);

        if (!prefersReducedMotion && isDesktop.matches && scrollY > 200) {
            nav.classList.toggle('nav-hidden', scrollY > lastScrollY && scrollY > 300);
        } else {
            nav.classList.remove('nav-hidden');
        }

        lastScrollY = scrollY;
        ticking = false;
    }

    function onScroll() {
        updateScrollProgress();
        if (!ticking) {
            requestAnimationFrame(updateNav);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    /* ── Cursor glow (desktop only) ── */
    const glow = document.querySelector('.cursor-glow');
    if (glow && !prefersReducedMotion && hasHover.matches) {
        let glowX = 0, glowY = 0;
        let targetX = 0, targetY = 0;

        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        });

        function animateGlow() {
            glowX += (targetX - glowX) * 0.08;
            glowY += (targetY - glowY) * 0.08;
            glow.style.transform = `translate(${glowX - 240}px, ${glowY - 240}px)`;
            requestAnimationFrame(animateGlow);
        }
        animateGlow();
    }

    /* ── Intersection Observer: scroll reveals ── */
    if (!prefersReducedMotion) {
        const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );
        revealEls.forEach((el) => observer.observe(el));
    } else {
        document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
            el.classList.add('is-visible');
        });
    }

    /* ── Product card 3D tilt (desktop) + tap feedback (mobile) ── */
    document.querySelectorAll('[data-tilt]').forEach((card) => {
        const inner = card.querySelector('.product-card-inner') || card;

        if (!prefersReducedMotion && hasHover.matches) {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                inner.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                inner.style.transform = '';
            });
        } else if (!prefersReducedMotion) {
            card.addEventListener('touchstart', () => card.classList.add('is-tapped'), { passive: true });
            card.addEventListener('touchend', () => card.classList.remove('is-tapped'), { passive: true });
            card.addEventListener('touchcancel', () => card.classList.remove('is-tapped'), { passive: true });
        }
    });

    /* ── Parallax on story image ── */
    const parallaxImg = document.querySelector('[data-parallax]');
    if (parallaxImg && !prefersReducedMotion) {
        function updateParallax() {
            const rect = parallaxImg.closest('.parallax-wrap')?.getBoundingClientRect();
            if (!rect) return;
            const center = rect.top + rect.height / 2;
            const factor = isDesktop.matches ? 0.06 : 0.02;
            const scale = isDesktop.matches ? 1.08 : 1.02;
            const offset = (center - window.innerHeight / 2) * factor;
            parallaxImg.style.transform = `translateY(${offset}px) scale(${scale})`;
        }
        window.addEventListener('scroll', updateParallax, { passive: true });
        isDesktop.addEventListener('change', updateParallax);
        updateParallax();
    }

    /* ── Magnetic button hover ── */
    document.querySelectorAll('.btn-magnetic').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            btn.style.setProperty('--x', ((e.clientX - rect.left) / rect.width) * 100 + '%');
            btn.style.setProperty('--y', ((e.clientY - rect.top) / rect.height) * 100 + '%');
        });
    });

    /* ── Smooth carousel drag (desktop only) ── */
    const carousel = document.querySelector('[data-carousel]');
    if (carousel && hasHover.matches) {
        let isDown = false;
        let startX, scrollLeft;

        carousel.addEventListener('mousedown', (e) => {
            isDown = true;
            carousel.classList.add('cursor-grabbing');
            carousel.classList.remove('cursor-grab');
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });

        carousel.addEventListener('mouseleave', () => {
            isDown = false;
            carousel.classList.remove('cursor-grabbing');
            carousel.classList.add('cursor-grab');
        });

        carousel.addEventListener('mouseup', () => {
            isDown = false;
            carousel.classList.remove('cursor-grabbing');
            carousel.classList.add('cursor-grab');
        });

        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            carousel.scrollLeft = scrollLeft - (x - startX) * 1.5;
        });

        carousel.classList.add('cursor-grab');
    }

    /* ── Active nav link highlight on scroll ── */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');

    if (sections.length && navLinks.length) {
        function highlightNav() {
            let current = '';
            sections.forEach((section) => {
                const top = section.offsetTop - 120;
                if (window.scrollY >= top) current = section.id;
            });
            navLinks.forEach((link) => {
                link.classList.toggle('text-[#c9b89a]', link.dataset.section === current);
            });
        }
        window.addEventListener('scroll', highlightNav, { passive: true });
        highlightNav();
    }

    updateScrollProgress();
})();
