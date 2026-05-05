document.addEventListener('DOMContentLoaded', () => {
// ── CURSOR
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
function animCursor() {
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
  rx += (mx - rx) * 0.14;
  ry += (my - ry) * 0.14;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();
  document.querySelectorAll('a, button, .service-card, .gallery-item, .feature-item, .close-lightbox, .lightbox-nav').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '20px';
    cursor.style.height = '20px';
    ring.style.width = '60px';
    ring.style.height = '60px';
    ring.style.opacity = '0.8';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '12px';
    cursor.style.height = '12px';
    ring.style.width = '40px';
    ring.style.height = '40px';
    ring.style.opacity = '0.5';
  });
});

// ── NAV SCROLL
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// ── SCROLL REVEAL
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── SIZE SELECTOR
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Actualizar el valor del input oculto para el envío
    document.getElementById('selectedSize').value = btn.getAttribute('data-value') || btn.textContent;
  });
});

// ── LIGHTBOX LOGIC
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
let currentGalleryImages = [];
let lightboxIndex = 0;

// ── GALLERY HOVER CYCLING
document.querySelectorAll('.gallery-item').forEach(item => {
  const imgAttr = item.getAttribute('data-images');
  const defaultImg = item.getAttribute('data-default');
  if (!imgAttr && !defaultImg) return;
  
  const images = imgAttr ? imgAttr.split(',') : [];
  const placeholder = item.querySelector('.gallery-placeholder');
  let interval;
  let currentIndex = 0;

  // Establecer imagen por defecto al cargar
  if (defaultImg) {
    placeholder.style.backgroundImage = `url(${defaultImg})`;
    placeholder.classList.add('has-image');
  }

  item.addEventListener('mouseenter', () => {
    if (images.length === 0) return;
    const nextImage = () => {
      placeholder.style.backgroundImage = `url(${images[currentIndex]})`;
      placeholder.classList.add('has-image');
      currentIndex = (currentIndex + 1) % images.length;
    };
    
    nextImage(); // Mostrar la primera de inmediato
    interval = setInterval(nextImage, 1000); // Cambiar cada segundo
  });

  item.addEventListener('mouseleave', () => {
    clearInterval(interval);
    if (defaultImg) {
      placeholder.style.backgroundImage = `url(${defaultImg})`;
      placeholder.classList.add('has-image');
    } else {
      placeholder.style.backgroundImage = '';
      placeholder.classList.remove('has-image');
    }
    currentIndex = 0;
  });

  // CLICK TO OPEN LIGHTBOX
  item.addEventListener('click', () => {
    currentGalleryImages = imgAttr ? imgAttr.split(',') : (defaultImg ? [defaultImg] : []);
    if (currentGalleryImages.length === 0) return;
    
    lightboxIndex = 0;
    updateLightboxImage();
    lightbox.style.display = 'flex';
    setTimeout(() => lightbox.classList.add('active'), 10);
  });
});

const updateLightboxImage = () => {
  lightboxImg.src = currentGalleryImages[lightboxIndex];
};

document.getElementById('closeLightbox')?.addEventListener('click', () => {
  lightbox.classList.remove('active');
  setTimeout(() => lightbox.style.display = 'none', 400);
});

document.getElementById('prevBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  lightboxIndex = (lightboxIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
  updateLightboxImage();
});

document.getElementById('nextBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  lightboxIndex = (lightboxIndex + 1) % currentGalleryImages.length;
  updateLightboxImage();
});

// Close on background click
lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) document.getElementById('closeLightbox').click();
});

// ── QUANTITY
const changeQty = (delta) => {
  const input = document.getElementById('cantidad');
  const val = Math.max(1, (parseInt(input.value) || 1) + delta);
  input.value = val;
};

document.getElementById('qtyMinus')?.addEventListener('click', () => changeQty(-1));
document.getElementById('qtyPlus')?.addEventListener('click', () => changeQty(1));

// ── FORM SUBMIT (FormSubmit.co AJAX)
const setupFormSubmission = () => {
  const form = document.getElementById('orderForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btnSubmit = document.getElementById('btnEnviar');
      const originalText = btnSubmit.innerHTML;
      
      // Deshabilitar botón mientras envía
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = "<span>ENVIANDO...</span>"; // Cambiar texto del botón

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch(form.action, {
          method: "POST",
          headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json' 
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          // Mostrar éxito
          document.getElementById('formContent').style.display = 'none';
          document.getElementById('successMsg').style.display = 'block';
        } else {
          // Si la respuesta no es OK, intentar leer el mensaje de error de FormSubmit
          const errorData = await response.json(); // FormSubmit a menudo devuelve JSON con un mensaje de error
          throw new Error(errorData.message || "Error desconocido al enviar el formulario.");
        }
      } catch (error) {
        console.error("Error al enviar el formulario:", error); // Log the actual error
        alert(`Hubo un problema al enviar el pedido: ${error.message || 'Por favor, inténtalo de nuevo.'}`);
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText; // Restaurar texto del botón
      }
    });
  }
};

setupFormSubmission(); // Llamar a la función para configurar el envío del formulario
});