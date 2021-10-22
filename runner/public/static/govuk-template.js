/* eslint-disable no-undef */
(function () {
  var root = this
  if (typeof root.GOVUK === 'undefined') {
    root.GOVUK = {}
  }

  /*
    Cookie methods
    ==============

    Usage:

      Setting a cookie:
      GOVUK.cookie('hobnob', 'tasty', { days: 30 });

      Reading a cookie:
      GOVUK.cookie('hobnob');

      Deleting a cookie:
      GOVUK.cookie('hobnob', null);
  */
  GOVUK.cookie = function (name, value, options) {
    if (typeof value !== 'undefined') {
      if (value === false || value === null) {
        return GOVUK.setCookie(name, '', { days: -1 })
      } else {
        return GOVUK.setCookie(name, value, options)
      }
    } else {
      return GOVUK.getCookie(name)
    }
  }
  GOVUK.setCookie = function (name, value, options) {
    if (typeof options === 'undefined') {
      options = {}
    }
    var cookieString = name + '=' + value + '; path=/'
    if (options.days) {
      var date = new Date()
      date.setTime(date.getTime() + (options.days * 24 * 60 * 60 * 1000))
      cookieString = cookieString + '; expires=' + date.toGMTString()
    }
    if (document.location.protocol === 'https:') {
      cookieString = cookieString + ';SameSite=Strict; Secure'
    }
    document.cookie = cookieString
  }
  GOVUK.getCookie = function (name) {
    var nameEQ = name + '='
    var cookies = document.cookie.split(';')
    
    for (var i = 0, len = cookies.length; i < len; i++) {
      var cookie = cookies[i]
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length)
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length))
      }
    }
    return null
  }
}).call(this);
(function () {
  'use strict'
  var root = this
  if (typeof root.GOVUK === 'undefined') {
    root.GOVUK = {}
  }

  GOVUK.addCookieMessage = function () {
    var message = document.getElementById('global-cookie-message');
    var form = document.getElementById('global-cookie-message-form');

    if (form) {
      // A cookie form exists so progressively enhance it if JS is enabled
      var formData = new FormData(form);
      var buttons = form.querySelectorAll('button[name="cookies"]');

      // FormData doesn't pick up the value of buttons so you need to set this using a button click event
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          formData.set(button.name, button.value);
        });
      });

      // Submit cookie preferences via AJAX if JS is enabled
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var action = e.target.getAttribute('action');
        var body = Object.fromEntries(Array.from(formData));

        fetch(action, {
          method: "POST",
          credentials: 'same-origin',
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body),
        }).then(() => {
          message.style.display = 'none';
        });
      });
    }
  }
}).call(this);
(function () {
  'use strict'

  // add cookie message
  if (window.GOVUK && GOVUK.addCookieMessage) {
    GOVUK.addCookieMessage()
  }

  // header navigation toggle
  if (document.querySelectorAll && document.addEventListener) {
    var els = document.querySelectorAll('.js-header-toggle')

    var i; var _i
    for (i = 0, _i = els.length; i < _i; i++) {
      els[i].addEventListener('click', function (e) {
        e.preventDefault()
        var target = document.getElementById(this.getAttribute('href').substr(1))

        var targetClass = target.getAttribute('class') || ''

        var sourceClass = this.getAttribute('class') || ''

        if (targetClass.indexOf('js-visible') !== -1) {
          target.setAttribute('class', targetClass.replace(/(^|\s)js-visible(\s|$)/, ''))
        } else {
          target.setAttribute('class', targetClass + ' js-visible')
        }
        if (sourceClass.indexOf('js-hidden') !== -1) {
          this.setAttribute('class', sourceClass.replace(/(^|\s)js-hidden(\s|$)/, ''))
        } else {
          this.setAttribute('class', sourceClass + ' js-hidden')
        }
      })
    }
  }
}).call(this)
