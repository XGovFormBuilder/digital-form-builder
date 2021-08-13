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
    var cookiesPolicy = GOVUK.getCookie('cookies_policy');

    try {
      cookiesPolicy = JSON.parse(atob(cookiesPolicy));
    } catch (error) {
      cookiesPolicy = {};
    }
    
    if (message && !cookiesPolicy.essential) {
      message.style.display = 'block';
      GOVUK.setCookie('cookies_policy', btoa(JSON.stringify({ "essential":true })), { days: 28 });
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
