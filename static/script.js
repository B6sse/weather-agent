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