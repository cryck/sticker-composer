// Listen for scroll events on the window
window.addEventListener('scroll', function() {
  if (window.scrollY >= 100) {
    // Fade in the back-to-top button
    document.getElementById('back-to-top').style.display = 'block';
    document.getElementById('back-to-top').style.opacity = 1;
    document.getElementById('back-to-top').style.transition = 'opacity 200ms';
  } else {
    // Fade out the back-to-top button
    document.getElementById('back-to-top').style.opacity = 0;
    setTimeout(function() {
      document.getElementById('back-to-top').style.display = 'none';
    }, 200);
  }
});

document.getElementById('back-to-top').addEventListener('click', function() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});