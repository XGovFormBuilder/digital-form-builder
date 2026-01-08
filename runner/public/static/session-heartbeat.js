(function (global) {
  function SessionHeartbeat(intervalMinutes, endpoint) {
    this.lastPing = 0;
    this.intervalMs = (intervalMinutes || 2) * 60 * 1000;
    this.endpoint = endpoint || '/session/keep-alive';
    this.initListeners();
  }

  SessionHeartbeat.prototype.initListeners = function () {
    var self = this;
    ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach(function (e) {
      document.addEventListener(e, function () {
        self.handleActivity();
      }, { passive: true });
    });
  };

  SessionHeartbeat.prototype.handleActivity = function () {
    var now = Date.now();
    if (now - this.lastPing < this.intervalMs) return;
    this.lastPing = now;
    this.pingBackend();
  };

  SessionHeartbeat.prototype.pingBackend = function () {
    fetch(this.endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRF-Token':
          document.querySelector('meta[name="csrf-token"]')?.content || ''
      }
    });
  };

  global.SessionHeartbeat = SessionHeartbeat;
})(window);
