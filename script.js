document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Частицы на фоне
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const particles = [];
    for(let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2
        });
    }
    
    function animateParticles() {
        if(!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
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
    
    // 2. Калькулятор блока питания
    const gpuSelect = document.getElementById('gpu-select');
    const cpuSelect = document.getElementById('cpu-select');
    const totalWattsSpan = document.getElementById('total-watts');
    const psuRecommend = document.getElementById('psu-recommend');
    
    function updatePSU() {
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
    
    gpuSelect.addEventListener('change', updatePSU);
    cpuSelect.addEventListener('change', updatePSU);
    updatePSU();
    
    // 3. Анимированные счетчики (реалистичные цифры)
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
                    counter.innerText = target;
                }
            };
            update();
        });
    }
    
    const ctaSection = document.querySelector('.service-cta');
    const observerStats = new IntersectionObserver((entries) => {
        if(entries[0].isIntersecting && !counted) {
            counted = true;
            startCounters();
        }
    }, { threshold: 0.4 });
    if(ctaSection) observerStats.observe(ctaSection);
    
    // 4. Табы производительности
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
    
    // 5. Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if(href === "#" || href === "") return;
            const target = document.querySelector(href);
            if(target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // 6. Кнопки сравнения цен (демо-алерт)
    const compareBtns = document.querySelectorAll('#footer-compare, .cta-btn');
    compareBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('🔍 CompareTech — сервис сравнения цен!\nСкоро здесь будет полный каталог с фильтрами и проверкой совместимости.');
        });
    });
    
    // 7. Анимация баров при скролле
    const bars = document.querySelectorAll('.bar-fill');
    const barsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => { bar.style.width = width; }, 100);
                barsObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });
    
    bars.forEach(bar => barsObserver.observe(bar));
    
    // 8. Добавляем hover эффекты для карточек
    const cards = document.querySelectorAll('.platform-card, .scene-card, .matrix-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});