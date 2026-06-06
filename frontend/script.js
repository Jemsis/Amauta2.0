/**
 * AMAUTA MED - Landing Page Scripts
 * 
 * Contiene la interactividad del sitio web:
 * - Efectos de barra de navegación al hacer scroll.
 * - Menú hamburguesa responsivo.
 * - Navegación suave (Smooth scroll).
 * - Animaciones basadas en Intersection Observer.
 * - Sistema de pestañas interactivas de Historia/Misión/Visión.
 * - Formulario de newsletter interactivo.
 * - Resaltado dinámico del enlace activo según scroll.
 * - Parallax sutil en hero.
 * - Animación de contadores de estadísticas.
 * - Efecto de ondas (ripple) en botón principal.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. EFECTO DE SCROLL EN NAVBAR
  // ==========================================
  const navbar = document.getElementById('navbar');

  /**
   * Agrega o remueve la clase 'scrolled' en base a la posición vertical.
   */
  const handleNavScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });


  // ==========================================
  // 2. MENÚ RESPONSIVO MÓVIL (TOGGLE)
  // ==========================================
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navActions = document.getElementById('nav-actions');
  let mobileMenuOpen = false;

  /**
   * Cambia el estado del menú móvil y anima el botón hamburguesa.
   */
  navToggle.addEventListener('click', () => {
    mobileMenuOpen = !mobileMenuOpen;
    navLinks.classList.toggle('mobile-open', mobileMenuOpen);
    navActions.classList.toggle('mobile-open', mobileMenuOpen);

    // Animación del icono de hamburguesa
    const spans = navToggle.querySelectorAll('span');
    if (mobileMenuOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });

  // Cierra el menú al hacer clic en un enlace
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenuOpen) navToggle.click();
    });
  });


  // ==========================================
  // 3. DESPLAZAMIENTO SUAVE (SMOOTH SCROLL)
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        const navHeight = navbar.offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });


  // ==========================================
  // 4. ANIMACIONES AL HACER SCROLL (INTERSECTION OBSERVER)
  // ==========================================
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  /**
   * Observador para activar la animación de entrada en los elementos.
   */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const parent = entry.target.parentElement;
        const siblings = parent ? parent.querySelectorAll('.animate-on-scroll') : [];
        let delay = 0;

        // Efecto escalonado (stagger) para elementos hermanos
        if (siblings.length > 1) {
          const siblingIndex = Array.from(siblings).indexOf(entry.target);
          delay = siblingIndex * 100;
        }

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  });

  animatedElements.forEach(el => observer.observe(el));


  // ==========================================
  // 5. PESTAÑAS DE LA SECCIÓN HISTORIA
  // ==========================================
  const historyTabs = document.querySelectorAll('.history-tab');
  const tabContents = {
    historia: document.getElementById('tab-content-historia'),
    mision: document.getElementById('tab-content-mision'),
    vision: document.getElementById('tab-content-vision')
  };

  historyTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remover estado activo de pestañas
      historyTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const selectedTab = tab.getAttribute('data-tab');

      // Ocultar contenidos antiguos con transición
      Object.values(tabContents).forEach(content => {
        if (content) {
          content.style.opacity = '0';
          content.style.transform = 'translateY(10px)';
          setTimeout(() => { content.style.display = 'none'; }, 200);
        }
      });

      // Mostrar contenido activo con transición suave
      setTimeout(() => {
        const activeContent = tabContents[selectedTab];
        if (activeContent) {
          activeContent.style.display = 'block';
          requestAnimationFrame(() => {
            activeContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            activeContent.style.opacity = '1';
            activeContent.style.transform = 'translateY(0)';
          });
        }
      }, 220);
    });
  });


  // ==========================================
  // 6. FORMULARIO DE NEWSLETTER
  // ==========================================
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletter-email').value;

      if (email) {
        const btn = document.getElementById('newsletter-submit');
        const originalText = btn.textContent;
        btn.textContent = '✓';
        btn.style.background = '#059669';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          document.getElementById('newsletter-email').value = '';
        }, 2000);
      }
    });
  }


  // ==========================================
  // 7. ENLACE DE NAVEGACIÓN ACTIVO DINÁMICO
  // ==========================================
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-links a');

  /**
   * Resalta el enlace de navegación correspondiente a la sección visible.
   */
  const highlightActiveSection = () => {
    const scrollPos = window.scrollY + navbar.offsetHeight + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < bottom) {
        navLinksAll.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${id}`) {
            link.style.color = 'var(--gold-primary)';
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightActiveSection, { passive: true });


  // ==========================================
  // 8. EFECTO PARALLAX EN SECCIÓN HERO
  // ==========================================
  const heroVisual = document.querySelector('.hero-visual');

  window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight && heroVisual) {
      heroVisual.style.transform = `translateY(${window.scrollY * 0.15}px)`;
    }
  }, { passive: true });


  // ==========================================
  // 9. ANIMACIÓN DE CONTADORES DE ESTADÍSTICAS
  // ==========================================
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  /**
   * Inicia la cuenta progresiva cuando las estadísticas entran en pantalla.
   */
  const animateCounters = () => {
    if (statsAnimated) return;

    const heroSection = document.getElementById('inicio');
    const rect = heroSection.getBoundingClientRect();

    if (rect.top < window.innerHeight && rect.bottom > 0) {
      statsAnimated = true;

      statNumbers.forEach(stat => {
        const text = stat.textContent;
        const match = text.match(/([\d,]+)/);
        if (!match) return;

        const target = parseInt(match[1].replace(/,/g, ''));
        const suffix = text.replace(match[1], '').trim();
        const duration = 1500;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // Cubic Ease-Out
          const current = Math.floor(eased * target);

          stat.textContent = current.toLocaleString() + suffix;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            stat.textContent = text;
          }
        };

        requestAnimationFrame(updateCounter);
      });
    }
  };

  window.addEventListener('scroll', animateCounters, { passive: true });
  animateCounters();


  // ==========================================
  // 10. EFECTO RIPPLE (ONDA) EN EL BOTÓN CTA
  // ==========================================
  const ctaButton = document.querySelector('.cta-button');
  if (ctaButton) {
    ctaButton.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);

      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        width: ${size}px;
        height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top - size / 2}px;
        transform: scale(0);
        animation: ripple-effect 0.6s ease-out;
        pointer-events: none;
      `;

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  }

  // Inyección de estilos clave para la onda ripple
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple-effect {
      to { transform: scale(2); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
});
