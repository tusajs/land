document.addEventListener('DOMContentLoaded', () => {
    
    // ========== 1. ЧАСТИЦЫ НА ФОНЕ ==========
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const particles = [];
    for(let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.25 + 0.1
        });
    }
    
    function animateParticles() {
        if(!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            if(p.x < 0) p.x = canvas.width;
            if(p.x > canvas.width) p.x = 0;
            if(p.y < 0) p.y = canvas.height;
            if(p.y > canvas.height) p.y = 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`;
            ctx.fill();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
    
    // ========== 2. КАЛЬКУЛЯТОР БЛОКА ПИТАНИЯ ==========
    const gpuSelect = document.getElementById('gpu-select');
    const cpuSelect = document.getElementById('cpu-select');
    const totalWattsSpan = document.getElementById('total-watts');
    const psuRecommend = document.getElementById('psu-recommend');
    
    function updatePSU() {
        if(!gpuSelect || !cpuSelect) return;
        const gpuW = parseInt(gpuSelect.value);
        const cpuW = parseInt(cpuSelect.value);
        const total = Math.round((gpuW + cpuW) * 1.3 + 50);
        totalWattsSpan.textContent = total;
        
        let recommend = '';
        if(total <= 550) recommend = 'Рекомендуем: 550-600W Bronze/Gold';
        else if(total <= 750) recommend = 'Рекомендуем: 650-750W Gold';
        else if(total <= 950) recommend = 'Рекомендуем: 850-1000W Gold/Platinum';
        else recommend = 'Рекомендуем: 1000W+ Platinum';
        psuRecommend.innerHTML = recommend;
    }
    
    if(gpuSelect && cpuSelect) {
        gpuSelect.addEventListener('change', updatePSU);
        cpuSelect.addEventListener('change', updatePSU);
        updatePSU();
    }
    
    // ========== 3. АНИМИРОВАННЫЕ СЧЕТЧИКИ ==========
    const statNumbers = document.querySelectorAll('.stat-num');
    let counted = false;
    
    function startCounters() {
        statNumbers.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            if(isNaN(target)) return;
            let current = 0;
            const increment = target / 60;
            const update = () => {
                current += increment;
                if(current < target) {
                    counter.innerText = Math.floor(current);
                    requestAnimationFrame(update);
                } else {
                    counter.innerText = target.toLocaleString();
                }
            };
            update();
        });
    }
    
    const ctaSection = document.querySelector('.service-cta');
    if(ctaSection) {
        const observerStats = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting && !counted) {
                counted = true;
                startCounters();
            }
        }, { threshold: 0.4 });
        observerStats.observe(ctaSection);
    }
    
    // ========== 4. ТАБЫ ПРОИЗВОДИТЕЛЬНОСТИ ==========
    const perfTabs = document.querySelectorAll('.perf-tab');
    const scenes = document.querySelectorAll('.perf-scene');
    
    perfTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const sceneId = tab.getAttribute('data-scene');
            perfTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            scenes.forEach(scene => scene.classList.remove('active'));
            const targetScene = document.getElementById(`scene-${sceneId}`);
            if(targetScene) targetScene.classList.add('active');
        });
    });
    
    // ========== 5. АНИМАЦИЯ ПРОГРЕСС-БАРОВ (ПЛАВНАЯ) ==========
    const bars = document.querySelectorAll('.bar-fill');
    
    const barsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                const bar = entry.target;
                if(!bar.hasAttribute('data-animated')) {
                    bar.setAttribute('data-animated', 'true');
                    const fps = bar.getAttribute('data-fps');
                    let widthPercent = 0;
                    if(fps === '80') widthPercent = 40;
                    else if(fps === '115') widthPercent = 57;
                    else if(fps === '165') widthPercent = 82;
                    else if(fps === '210') widthPercent = 100;
                    
                    let currentWidth = 0;
                    const duration = 1000;
                    const startTime = performance.now();
                    
                    function animate(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(1, elapsed / duration);
                        const eased = 1 - Math.pow(1 - progress, 2);
                        currentWidth = widthPercent * eased;
                        bar.style.width = currentWidth + '%';
                        
                        if(progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            bar.style.width = widthPercent + '%';
                        }
                    }
                    
                    requestAnimationFrame(animate);
                }
                barsObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.3 });
    
    bars.forEach(bar => barsObserver.observe(bar));
    
    // ========== 6. ПЛАВНАЯ ПРОКРУТКА ДЛЯ ЯКОРЕЙ ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if(href === "#" || href === "") return;
            
            // Обработка специальных ссылок
            if(this.classList.contains('cta-btn') && href === "#prices") {
                e.preventDefault();
                const target = document.querySelector('#prices');
                if(target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
            
            const target = document.querySelector(href);
            if(target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // ========== 7. ИСПРАВЛЕННАЯ НАВИГАЦИЯ - ПОДСВЕТКА ТОЛЬКО КОГДА РАЗДЕЛ ВИДИМ ==========
    const sections = document.querySelectorAll('section[id], article section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    // Удаляем старый стиль активной ссылки
    const existingStyle = document.querySelector('#nav-active-style');
    if(existingStyle) existingStyle.remove();
    
    // Добавляем стиль для активной ссылки
    const navStyle = document.createElement('style');
    navStyle.id = 'nav-active-style';
    navStyle.textContent = `
        .active-nav {
            color: #3b82f6 !important;
            font-weight: 600;
        }
        .nav-cta.active-nav {
            background: linear-gradient(90deg, #3b82f6, #2563eb);
            color: white !important;
        }
    `;
    document.head.appendChild(navStyle);
    
    function isElementInViewport(el, offset = 150) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        
        // Элемент считается видимым, если его верхняя часть находится в пределах видимой области
        // с учетом смещения (чтобы подсветка включалась когда раздел действительно виден)
        return rect.top <= windowHeight - offset && rect.bottom >= offset;
    }
    
    function highlightActiveNav() {
        let currentSectionId = '';
        let closestSection = null;
        let closestDistance = Infinity;
        
        // Находим раздел, который находится ближе всего к верхней части экрана
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const distance = Math.abs(rect.top - 100);
            
            // Если раздел виден или находится рядом с верхней частью
            if (rect.top <= 300 && rect.bottom >= 100) {
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestSection = section;
                }
            }
        });
        
        // Если нашли видимый раздел
        if (closestSection) {
            currentSectionId = closestSection.getAttribute('id');
        } else {
            // Если нет видимых разделов, ищем тот, который ближе всего к верху
            let minTop = Infinity;
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top < minTop && rect.bottom > 0) {
                    minTop = rect.top;
                    closestSection = section;
                }
            });
            if (closestSection) {
                currentSectionId = closestSection.getAttribute('id');
            }
        }
        
        // Обновляем активную ссылку
        navLinks.forEach(link => {
            link.classList.remove('active-nav');
            const href = link.getAttribute('href').substring(1);
            if(href === currentSectionId) {
                link.classList.add('active-nav');
            }
        });
        
        // Особый случай для hero (начало страницы)
        if (window.scrollY < 100) {
            navLinks.forEach(link => {
                link.classList.remove('active-nav');
            });
        }
    }
    
    // Запускаем подсветку при скролле с небольшим debounce для производительности
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            highlightActiveNav();
        }, 50);
    });
    
    // Запускаем при загрузке и после небольших задержек для точности
    setTimeout(highlightActiveNav, 100);
    setTimeout(highlightActiveNav, 500);
    window.addEventListener('resize', () => {
        setTimeout(highlightActiveNav, 100);
    });
    
    // ========== 8. КНОПКИ СРАВНЕНИЯ ЦЕН ==========
    const compareBtns = document.querySelectorAll('#footer-compare, .cta-btn, .nav-cta');
    compareBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const href = btn.getAttribute('href');
            if(href && href.startsWith('http')) {
                return;
            }
            e.preventDefault();
            const pricesSection = document.querySelector('#prices');
            if(pricesSection) {
                pricesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                alert('🔍 Z-catalog — сервис сравнения цен!\nЗдесь вы найдете лучшие цены в магазинах электроники.');
            }
        });
    });
    
    // ========== 9. АНИМАЦИЯ ПОЯВЛЕНИЯ КАРТОЧЕК ПРИ СКРОЛЛЕ ==========
    const animatedElements = document.querySelectorAll('.component-section, .platform-compact, .gpu-tier, .storage-card, .cooling-card, .scene-card, .matrix-item');
    
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        fadeObserver.observe(el);
    });
    
    // ========== 10. HOVER ЭФФЕКТЫ ДЛЯ КАРТОЧЕК ==========
    const hoverCards = document.querySelectorAll('.platform-card, .scene-card, .matrix-item, .gpu-tier, .storage-card, .cooling-card, .ram-type, .platform-compact');
    hoverCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.transition = 'transform 0.2s ease';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    // ========== 11. ЭФФЕКТ ДЛЯ НАВБАРА ПРИ СКРОЛЛЕ ==========
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if(currentScroll > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
        }
        lastScroll = currentScroll;
    });
    
    // ========== 12. ОБНОВЛЕНИЕ КАЛЬКУЛЯТОРА ПРИ ЗАГРУЗКЕ ==========
    if(totalWattsSpan) {
        setTimeout(() => {
            updatePSU();
        }, 100);
    }
    
    // ========== 13. ПЛАВНОЕ ПОЯВЛЕНИЕ HERO КОНТЕНТА ==========
    const heroContent = document.querySelector('.hero-content');
    if(heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        heroContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        setTimeout(() => {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // ========== 14. ПОДСКАЗКА ДЛЯ КАЛЬКУЛЯТОРА ==========
    const calcGroups = document.querySelectorAll('.calc-group-simple select');
    calcGroups.forEach(select => {
        select.addEventListener('change', () => {
            const resultBlock = document.querySelector('.calc-result-simple');
            if(resultBlock) {
                resultBlock.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    resultBlock.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });
    
    // ========== 15. ОБРАБОТКА ОШИБКИ ЗАГРУЗКИ ЛОГОТИПА ==========
    const logo = document.querySelector('.logo-img');
    if(logo) {
        logo.addEventListener('error', () => {
            logo.src = 'https://placehold.co/1000x1000/3b82f6/ffffff?text=ZC';
        });
    }
    
    console.log('✅ Z-catalog: все модули загружены, навигация исправлена!');
});