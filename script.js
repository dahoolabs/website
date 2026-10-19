document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle (initial theme is applied by the inline script in <head>)
    const themeToggle = document.getElementById('themeToggle');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            try {
                localStorage.setItem('theme', newTheme);
            } catch (e) {}
        });
    }

    // Header scroll effect
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTop = document.getElementById('backToTop');

    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Back to top button visibility
        if (backToTop) {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Active nav link on scroll
        let current = '';
        const sections = document.querySelectorAll('section[id]');

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Back to top button
    if (backToTop) {
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Mobile menu toggle
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Smooth scroll for anchor links
    const projectType = document.getElementById('projectType');

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            e.preventDefault();

            // Pre-select the requested service in the contact form
            if (this.dataset.service && projectType) {
                projectType.value = this.dataset.service;
            }

            if (href === '#') {
                window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
                return;
            }

            const target = document.querySelector(href);
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: reduceMotion ? 'auto' : 'smooth'
                });
            }
        });
    });

    // Animated counters (any element with data-count)
    function animateCounter(counter) {
        const target = parseInt(counter.getAttribute('data-count'), 10);
        if (reduceMotion) {
            counter.textContent = target;
            return;
        }
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.floor(easeOut * target);

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

    // Intersection Observer for animations
    const animatedElements = document.querySelectorAll('.why-us-card');

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => revealObserver.observe(el));

    // Contact form handling
    // Set this to your form backend (e.g. https://formspree.io/f/xxxx) to receive submissions.
    const FORM_ENDPOINT = '';

    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    function showStatus(type, message) {
        formStatus.className = 'form-status ' + type;
        formStatus.textContent = message;
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const formData = new FormData(contactForm);
            const name = formData.get('name');

            submitBtn.disabled = true;
            submitBtn.textContent = 'جارٍ الإرسال...';

            try {
                if (FORM_ENDPOINT) {
                    const response = await fetch(FORM_ENDPOINT, {
                        method: 'POST',
                        body: formData,
                        headers: { 'Accept': 'application/json' }
                    });
                    if (!response.ok) throw new Error('Request failed');
                }
                showStatus('success', 'شكراً ' + name + '! تم استلام طلبك وسنتواصل معك خلال يوم عمل.');
                contactForm.reset();
            } catch (err) {
                showStatus('error', 'تعذّر إرسال الطلب. حاول مرة أخرى أو تواصل معنا عبر واتساب.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'إرسال الطلب';
            }
        });
    }

    // Newsletter form handling
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let status = newsletterForm.parentElement.querySelector('.newsletter-status');
            if (!status) {
                status = document.createElement('p');
                status.className = 'newsletter-status';
                status.setAttribute('role', 'status');
                newsletterForm.after(status);
            }
            status.textContent = 'شكراً لاشتراكك في النشرة البريدية!';
            newsletterForm.reset();
        });
    }

    // FAQ: keep one answer open at a time
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('toggle', function() {
            if (!item.open) return;
            faqItems.forEach(other => {
                if (other !== item) other.open = false;
            });
        });
    });

    // Reveal sections on scroll
    if (!reduceMotion) {
        const sections = document.querySelectorAll('.section');

        // Add initial hidden state
        sections.forEach(section => section.classList.add('reveal-hidden'));

        // threshold 0 + bottom margin so tall sections reveal as soon as their top enters
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('reveal-hidden');
                    entry.target.classList.add('revealed');
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0, rootMargin: '0px 0px -80px 0px' });

        sections.forEach(section => sectionObserver.observe(section));
    }

    // Spotlight that follows the cursor over cards (pointer devices only)
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (finePointer) {
        document.querySelectorAll('.service-card, .about-card, .testimonial-card, .contact-card, .why-us-card, .work-case').forEach(card => {
            card.classList.add('glow-card');
            card.addEventListener('pointermove', function(e) {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
                card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
            });
        });
    }

    // Magnetic primary buttons
    if (finePointer && !reduceMotion) {
        document.querySelectorAll('.btn-primary.btn-lg, .header .btn-primary').forEach(btn => {
            btn.classList.add('magnetic');
            btn.addEventListener('pointermove', function(e) {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
                btn.style.setProperty('--tx', x + 'px');
                btn.style.setProperty('--ty', y + 'px');
            });
            btn.addEventListener('pointerleave', function() {
                btn.style.setProperty('--tx', '0px');
                btn.style.setProperty('--ty', '0px');
            });
        });
    }

    // Portfolio filters
    const workFilters = document.querySelectorAll('.work-filter');
    const workCases = document.querySelectorAll('.work-case');
    workFilters.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = btn.dataset.filter;
            workFilters.forEach(b => {
                const isActive = b === btn;
                b.classList.toggle('active', isActive);
                b.setAttribute('aria-pressed', isActive);
            });
            workCases.forEach(item => {
                item.classList.toggle('is-hidden', filter !== 'all' && item.dataset.category !== filter);
            });
        });
    });
});
