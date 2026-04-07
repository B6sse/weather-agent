async function fetchWeather() {
    const location = document.getElementById('location').value.trim();
    const query = document.getElementById('query').value.trim();
    const btn = document.getElementById('btn');
    const errorEl = document.getElementById('error');
    const resultEl = document.getElementById('result');

    if (!location || !query) {
      showError('Please fill in both fields.');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="display:inline-block"></div>';
    errorEl.classList.remove('visible');
    resultEl.classList.remove('visible');

    try {
      const res = await fetch('/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location }),
      });

      if (!res.ok) throw new Error('Something went wrong. Try again.');

      const data = await res.json();

      document.getElementById('conditions').textContent = data.weather_conditions ?? '';
      document.getElementById('conditions').style.display = data.weather_conditions ? 'block' : 'none';
      document.getElementById('response').textContent = data.punny_response;
      resultEl.classList.add('visible');
    } catch (e) {
      showError(e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Get Weather';
    }
  }

  function showError(msg) {
    const el = document.getElementById('error');
    el.textContent = msg;
    el.classList.add('visible');
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') fetchWeather();
  });