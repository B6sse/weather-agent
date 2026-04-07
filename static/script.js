async function fetchWeather() {
    const location = document.getElementById('location').value.trim();
    const query = document.getElementById('query').value.trim();
    const btn = document.getElementById('btn');
    const errorEl = document.getElementById('error');
    const resultEl = document.getElementById('result');
    const statusEl = document.getElementById('status');

    if (!location || !query) {
      showError('Please fill in both fields.');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="display:inline-block"></div>';
    errorEl.classList.remove('visible');
    resultEl.classList.remove('visible');
    statusEl.textContent = '';
    statusEl.classList.remove('visible');

    try {
      const res = await fetch('/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location }),
      });

      if (!res.ok) throw new Error('Something went wrong. Try again.');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop();

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue;
          const data = JSON.parse(part.slice(6));

          if (data.type === 'status') {
            statusEl.textContent = data.message;
            statusEl.classList.add('visible');
          } else if (data.type === 'result') {
            statusEl.classList.remove('visible');
            document.getElementById('conditions').textContent = data.weather_conditions ?? '';
            document.getElementById('conditions').style.display = data.weather_conditions ? 'block' : 'none';
            resultEl.classList.add('visible');
            typewrite(document.getElementById('response'), data.punny_response);
          }
        }
      }
    } catch (e) {
      showError(e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Get Weather';
      statusEl.classList.remove('visible');
    }
  }

  function typewrite(el, text, delay = 20) {
    el.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) clearInterval(interval);
    }, delay);
  }

  function showError(msg) {
    const el = document.getElementById('error');
    el.textContent = msg;
    el.classList.add('visible');
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') fetchWeather();
  });

  // Scroll animations
  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.section-title, .section-subtitle', {
    scrollTrigger: { trigger: '.features', start: 'top 85%' },
    y: 24, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out',
  });

  function snapIfPast(st) {
    if (st.progress === 1 && st.animation) st.animation.progress(1);
  }

  gsap.utils.toArray('.feature-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play reverse play reverse',
        onRefresh: self => snapIfPast(self),
      },
      y: 50, scale: 0.93, opacity: 0, duration: 0.9, delay: i * 0.12, ease: 'power3.out',
    });
  });

  gsap.utils.toArray('.step').forEach((step, i) => {
    gsap.from(step, {
      scrollTrigger: {
        trigger: step,
        start: 'top 88%',
        toggleActions: 'play reverse play reverse',
        onRefresh: self => snapIfPast(self),
      },
      x: -30, opacity: 0, duration: 0.6, delay: i * 0.08, ease: 'power2.out',
    });
  });

  gsap.from('.tech-stack', {
    scrollTrigger: { trigger: '.tech-stack', start: 'top 92%' },
    y: 20, opacity: 0, duration: 0.6, ease: 'power2.out',
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());