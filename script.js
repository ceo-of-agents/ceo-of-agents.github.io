(function () {
  'use strict';

  // Copy buttons
  var live = document.getElementById('live');
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.hidden = false;
    var timer;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        btn.textContent = 'Copied';
        if (live) live.textContent = 'Copied';
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.textContent = 'Copy';
          if (live) live.textContent = '';
        }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      }
    });
  });

  // Clips: autoplay only when on screen and motion is allowed
  var motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
  var clips = document.querySelectorAll('video.clip-video');
  var visible = new WeakMap();
  var userPaused = new WeakMap();

  function sync(v) {
    var want = motion.matches && visible.get(v) && !userPaused.get(v);
    if (want && v.paused) {
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    } else if (!want && !v.paused) {
      v.pause();
    }
  }

  clips.forEach(function (v) {
    v.removeAttribute('controls');
    var btn = v.parentNode.querySelector('.toggle');
    if (!btn) return;
    btn.hidden = false;
    function label() {
      btn.textContent = v.paused ? 'Play' : 'Pause';
      btn.setAttribute('aria-label', (v.paused ? 'Play' : 'Pause') + ' animation');
    }
    label();
    v.addEventListener('play', label);
    v.addEventListener('pause', label);
    btn.addEventListener('click', function () {
      if (v.paused) {
        userPaused.set(v, false);
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        userPaused.set(v, true);
        v.pause();
      }
    });
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible.set(e.target, e.isIntersecting);
        sync(e.target);
      });
    }, { threshold: 0.5 });
    clips.forEach(function (v) { io.observe(v); });
  }
  var onChange = function () { clips.forEach(sync); };
  if (motion.addEventListener) motion.addEventListener('change', onChange);
  else if (motion.addListener) motion.addListener(onChange);
})();
