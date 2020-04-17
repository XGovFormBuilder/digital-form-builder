;(function (global) {
  'use strict'

  var GOVUKFrontend = global.GOVUKFrontend || {}
  var $ = global.jQuery

  // Modal dialog prototype
  GOVUKFrontend.modalDialog = {
    containerSelector: '#content',
    redirectWarningMessage: 'You are about to be redirected',
    keepYouSecureMessage: 'We do this to keep your information secure.',
    warningMessage: 'We will reset your application if you do not respond in',
    el: document.getElementById('js-modal-dialog'),
    $el: $('#js-modal-dialog'),
    $lastFocusedEl: null,
    $openButton: $('#openModal'),
    $closeButton: $('.modal-dialog .js-dialog-close'),
    $cancelButton: $('.modal-dialog .js-dialog-cancel'),
    dialogIsOpenClass: 'dialog-is-open',
    timers: [],
    // Timer specific markup. If these are not present, timeout and redirection are disabled
    $timer: $('#js-modal-dialog .timer'),
    $accessibleTimer: $('#js-modal-dialog .at-timer'),
    // Timer specific settings. If these are not set, timeout and redirection are disabled
    idleMinutesBeforeTimeOut: $('#js-modal-dialog').data('minutes-idle-timeout'),
    timeOutRedirectUrl: $('#js-modal-dialog').data('url-redirect'),
    minutesTimeOutModalVisible: $('#js-modal-dialog').data('minutes-modal-visible'),
    timeUserLastInteractedWithPage: '',

    bindUIElements: function () {

      GOVUKFrontend.modalDialog.$openButton.on('click', function (e) {
        GOVUKFrontend.modalDialog.openDialog()
        return false
      })

      GOVUKFrontend.modalDialog.$closeButton.on('click', function (e) {
        e.preventDefault()
        GOVUKFrontend.modalDialog.closeDialog()
      })

      GOVUKFrontend.modalDialog.$cancelButton.on('click', function (e) {
        e.preventDefault()
      })
      // GOVUKFrontend.modalDialog.disableBackButtonWhenOpen()
    },
    isDialogOpen: function () {
      return GOVUKFrontend.modalDialog.el['open']
    },
    isTimerSet: function () {
      return GOVUKFrontend.modalDialog.$timer.length > 0 && GOVUKFrontend.modalDialog.$accessibleTimer.length > 0 && GOVUKFrontend.modalDialog.idleMinutesBeforeTimeOut && GOVUKFrontend.modalDialog.minutesTimeOutModalVisible && GOVUKFrontend.modalDialog.timeOutRedirectUrl
    },
    openDialog: function () {
      // TO DO: get last interactive time from server to see if modal should be opened
      if (!GOVUKFrontend.modalDialog.isDialogOpen()) {
        $('html, body').addClass(GOVUKFrontend.modalDialog.dialogIsOpenClass)
        GOVUKFrontend.modalDialog.saveLastFocusedEl()
        GOVUKFrontend.modalDialog.makePageContentInert()
        GOVUKFrontend.modalDialog.el.showModal()

        if (GOVUKFrontend.modalDialog.isTimerSet()) {
          GOVUKFrontend.modalDialog.startTimer()
        }

        // if (window.history.pushState) {
        //   window.history.pushState('', '') // This updates the History API to enable state to be "popped" to detect browser navigation for disableBackButtonWhenOpen
        // }
      }
    },
    closeDialog: function () {
      if (GOVUKFrontend.modalDialog.isDialogOpen()) {
        $('html, body').removeClass(GOVUKFrontend.modalDialog.dialogIsOpenClass)
        GOVUKFrontend.modalDialog.el.close()
        GOVUKFrontend.modalDialog.setFocusOnLastFocusedEl()
        GOVUKFrontend.modalDialog.removeInertFromPageContent()

        if (GOVUKFrontend.modalDialog.isTimerSet()) {
          GOVUKFrontend.modalDialog.clearTimers()
        }
      }
    },
    disableBackButtonWhenOpen: function () {
      window.addEventListener('popstate', function () {
        if (GOVUKFrontend.modalDialog.isDialogOpen()) {
          GOVUKFrontend.modalDialog.closeDialog()
        } else {
          window.history.go(-1)
        }
      })
    },
    saveLastFocusedEl: function () {
      GOVUKFrontend.modalDialog.$lastFocusedEl = document.activeElement
      if (!GOVUKFrontend.modalDialog.$lastFocusedEl || GOVUKFrontend.modalDialog.$lastFocusedEl === document.body) {
        GOVUKFrontend.modalDialog.$lastFocusedEl = null
      } else if (document.querySelector) {
        GOVUKFrontend.modalDialog.$lastFocusedEl = document.querySelector(':focus')
      }
    },
    // Set focus back on last focused el when modal closed
    setFocusOnLastFocusedEl: function () {
      if (GOVUKFrontend.modalDialog.$lastFocusedEl) {
        window.setTimeout(function () {
          GOVUKFrontend.modalDialog.$lastFocusedEl.focus()
        }, 0)
      }
    },
    // Set page content to inert to indicate to screenreaders it's inactive
    // NB: This will look for #content for toggling inert state
    makePageContentInert: function () {
      if (document.querySelector(this.containerSelector)) {
        document.querySelector(this.containerSelector).inert = true
        document.querySelector(this.containerSelector).setAttribute('aria-hidden', 'true')
      }
    },
    // Make page content active when modal is not open
    // NB: This will look for #content for toggling inert state
    removeInertFromPageContent: function () {
      if (document.querySelector(this.containerSelector)) {
        document.querySelector(this.containerSelector).inert = false
        document.querySelector(this.containerSelector).setAttribute('aria-hidden', 'false')
      }
    },
    // Starts a timer. If modal not closed before time out + 4 seconds grace period, user is redirected.
    startTimer: function () {
      GOVUKFrontend.modalDialog.clearTimers() // Clear any other modal timers that might have been running
      var $timer = GOVUKFrontend.modalDialog.$timer
      var $accessibleTimer = GOVUKFrontend.modalDialog.$accessibleTimer
      var minutes = GOVUKFrontend.modalDialog.minutesTimeOutModalVisible
      var timerRunOnce = false
      var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

      if (minutes) {
        // TO DO: Contact server to find last active time, in case modal is open in another tab, and update time left here accordingly

        var seconds = 60 * minutes

        $timer.text(minutes + ' minute' + (minutes > 1 ? 's' : ''));

        (function runTimer () {
          var minutesLeft = parseInt(seconds / 60, 10)
          var secondsLeft = parseInt(seconds % 60, 10)
          var timerExpired = minutesLeft < 1 && secondsLeft < 1

          var minutesText = minutesLeft > 0 ? '<span class="tabular-numbers">' + minutesLeft + '</span> minute' + (minutesLeft > 1 ? 's' : '') + '' : ' '
          var secondsText = secondsLeft >= 1 ? ' <span class="tabular-numbers">' + secondsLeft + '</span> second' + (secondsLeft > 1 ? 's' : '') + '' : ''
          var atMinutesNumberAsText = ''
          var atSecondsNumberAsText = ''

          try {
            atMinutesNumberAsText = GOVUKFrontend.modalDialog.numberToWords(minutesLeft) // Attempt to convert numerics into text as iOS VoiceOver ccassionally stalled when encountering numbers
            atSecondsNumberAsText = GOVUKFrontend.modalDialog.numberToWords(secondsLeft)
          } catch (e) {
            atMinutesNumberAsText = minutesLeft
            atSecondsNumberAsText = secondsLeft
          }

          var atMinutesText = minutesLeft > 0 ? atMinutesNumberAsText + ' minute' + (minutesLeft > 1 ? 's' : '') + '' : ''
          var atSecondsText = secondsLeft >= 1 ? ' ' + atSecondsNumberAsText + ' second' + (secondsLeft > 1 ? 's' : '') + '' : ''

          // Below string will get read out by screen readers every time the timeout refreshes (every 15 secs. See below).
          // Please add additional information in the modal body content or in below extraText which will get announced to AT the first time the time out opens
          var text = GOVUKFrontend.modalDialog.warningMessage +  ' ' + minutesText + secondsText + '.'
          var atText = GOVUKFrontend.modalDialog.warningMessage +  ' ' + atMinutesText
          if (atSecondsText) {
            if (minutesLeft > 0) {
              atText += ' and'
            }
            atText += atSecondsText + '.'
          } else {
            atText += '.'
          }
          var extraText = ' ' + GOVUKFrontend.modalDialog.keepYouSecureMessage;

          if (timerExpired) {
            $timer.text(GOVUKFrontend.modalDialog.redirectWarningMessage)
            $accessibleTimer.text(GOVUKFrontend.modalDialog.redirectWarningMessage)
            //TO DO: tell server to reset userlastinteractedwithpage
            if (window.localStorage) {
              window.localStorage.setItem('timeUserLastInteractedWithPage', '')
            }
            setTimeout(GOVUKFrontend.modalDialog.redirect, 4000)

          } else {
            seconds--

            $timer.html(text + extraText)

            if (minutesLeft < 1 && secondsLeft < 20) {
              $accessibleTimer.attr('aria-live', 'assertive')
            }

            if (!timerRunOnce) {
              // Read out the extra content only once. Don't read out on iOS VoiceOver which stalls on the longer text

              if (iOS) {
                $accessibleTimer.text(atText)
              } else {
                $accessibleTimer.text(atText + extraText)
              }
              timerRunOnce = true
            } else if (secondsLeft % 15 === 0) {
              // Update screen reader friendly content every 15 secs
              $accessibleTimer.text(atText)
            }

            // JS doesn't allow resetting timers globally so timers need to be retained for resetting.
            GOVUKFrontend.modalDialog.timers.push(setTimeout(runTimer, 1000))
          }
        })()
      }
    },
    // Clears modal timer
    clearTimers: function () {
      for (var i = 0; i < GOVUKFrontend.modalDialog.timers.length; i++) {
        clearTimeout(GOVUKFrontend.modalDialog.timers[i])
      }
    },
    // Close modal when ESC pressed
    escClose: function () {
      $(document).keydown(function (e) {
        if (GOVUKFrontend.modalDialog.isDialogOpen() && e.keyCode === 27) {
          GOVUKFrontend.modalDialog.closeDialog()
        }
      })
    },
    // Show modal after period of user inactivity
    idleTimeOut: function () {
      var idleMinutes = GOVUKFrontend.modalDialog.idleMinutesBeforeTimeOut
      var milliSeconds
      var timer

      GOVUKFrontend.modalDialog.checkIfShouldHaveTimedOut()

      if (idleMinutes) {
        milliSeconds = idleMinutes * 60000

        window.onload = resetTimer
        window.onmousemove = resetTimer
        window.onmousedown = resetTimer // Catches touchscreen presses
        window.onclick = resetTimer     // Catches touchpad clicks
        window.onscroll = resetTimer    // Catches scrolling with arrow keys
        window.onkeypress = resetTimer
        window.onkeyup = resetTimer // Catches Android keypad presses
      }

      function resetTimer () {
        clearTimeout(timer)

        // TO DO: tell server at intervals that user is active instead of storing last interaction time locally
        if (window.localStorage) {
          window.localStorage.setItem('timeUserLastInteractedWithPage', new Date())
        }

        timer = setTimeout(GOVUKFrontend.modalDialog.openDialog, milliSeconds)
      }
    },
    // Do a timestamp comparison when the page regains focus to check if the user should have been timed out already
    checkIfShouldHaveTimedOut: function () {
      window.onfocus = function () {
        // Debugging tip: Above event doesn't kick in in Chrome if you have Inspector panel open and have clicked on it
        // as it is now the active element. Click on the window to make it active before moving to another tab.
        if (window.localStorage) {
          // TO DO: timeUserLastInteractedWithPage should in fact come from the server
          var timeUserLastInteractedWithPage = new Date(window.localStorage.getItem('timeUserLastInteractedWithPage'))

          var seconds = Math.abs((timeUserLastInteractedWithPage - new Date()) / 1000)

          if (seconds > (GOVUKFrontend.modalDialog.idleMinutesBeforeTimeOut + GOVUKFrontend.modalDialog.minutesTimeOutModalVisible)  * 60) {

            //  if (seconds > 60) {
            GOVUKFrontend.modalDialog.redirect()
          }

          //   // TO DO: open modal if advised so by the server, tell modal how many seconds are left
          // else if () {
          //   GOVUKFrontend.modalDialog.openDialog()
          // }
        }
      }
    },
    redirect: function () {
      window.location.replace(GOVUKFrontend.modalDialog.timeOutRedirectUrl)
    },
    numberToWords: function (n) {
      var string = n.toString()
      var units
      var tens
      var scales
      var start
      var end
      var chunks
      var chunksLen
      var chunk
      var ints
      var i
      var word
      var words = 'and'

      if (parseInt(string) === 0) {
        return 'zero'
      }

      /* Array of units as words */
      units = [ '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen' ]

      /* Array of tens as words */
      tens = [ '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety' ]

      /* Array of scales as words */
      scales = [ '', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quatttuor-decillion', 'quindecillion', 'sexdecillion', 'septen-decillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'centillion' ]

      /* Split user arguemnt into 3 digit chunks from right to left */
      start = string.length
      chunks = []
      while (start > 0) {
        end = start
        chunks.push(string.slice((start = Math.max(0, start - 3)), end))
      }

      /* Check if function has enough scale words to be able to stringify the user argument */
      chunksLen = chunks.length
      if (chunksLen > scales.length) {
        return ''
      }

      /* Stringify each integer in each chunk */
      words = []
      for (i = 0; i < chunksLen; i++) {
        chunk = parseInt(chunks[i])

        if (chunk) {
          /* Split chunk into array of individual integers */
          ints = chunks[i].split('').reverse().map(parseFloat)

          /* If tens integer is 1, i.e. 10, then add 10 to units integer */
          if (ints[1] === 1) {
            ints[0] += 10
          }

          /* Add scale word if chunk is not zero and array item exists */
          if ((word = scales[i])) {
            words.push(word)
          }

          /* Add unit word if array item exists */
          if ((word = units[ints[0]])) {
            words.push(word)
          }

          /* Add tens word if array item exists */
          if ((word = tens[ ints[1] ])) {
            words.push(word)
          }

          /* Add hundreds word if array item exists */
          if ((word = units[ints[2]])) {
            words.push(word + ' hundred')
          }
        }
      }
      return words.reverse().join(' ')
    },
    init: function () {
      if (GOVUKFrontend.modalDialog.el) {
        // Native dialog is not supported by browser so use polyfill
        if (typeof HTMLDialogElement !== 'function') {
          window.dialogPolyfill.registerDialog(GOVUKFrontend.modalDialog.el)
        }
        GOVUKFrontend.modalDialog.bindUIElements()
        GOVUKFrontend.modalDialog.escClose()

        if (GOVUKFrontend.modalDialog.isTimerSet()) {
          GOVUKFrontend.modalDialog.idleTimeOut()
        }
      }
    }
  }
  global.GOVUKFrontend = GOVUKFrontend
})(window); // eslint-disable-line semi
