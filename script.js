window.addEventListener('load', () => {
  setTimeout(() => {
    // Hide loader after 2 seconds
    document.getElementById('loader').style.display = 'none';
    // Show content
    document.getElementById('content').style.display = 'block';
    // Enable scrolling
    document.body.classList.remove('loading');
  }, 1000);  // 1000 milliseconds = 1 seconds
});

  window.addEventListener('scroll', () => {
    document.querySelectorAll('.reveal').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 50) {
        el.classList.add('active');
      }
    });
  });
