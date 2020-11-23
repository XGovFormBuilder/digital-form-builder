var $components = document.querySelectorAll(".uk-address-component");

$components.forEach(function (component) {
  var form = component.parentNode.parentNode;
  var lookup = component.querySelector(".uk-address-lookup");
  var manual = component.querySelector(".uk-address-manual");
  var submitButton = form.querySelector("button[type=submit]");
  var lookupQuery = form.querySelector(".uk-address-query");
  var lookupSelector = form.querySelector(".uk-address-selector");
  var postcode = lookupQuery.querySelector("input.postcode-query");
  var lookupButton = lookupQuery.querySelector("button.postcode-lookup");
  var postcodeDisplay = lookupSelector.querySelector(".postcode-query-display");
  var selector = lookupSelector.querySelector(".uk-address-selector select");
  var lookupLinks = form.querySelectorAll(".postcode-query-link");
  var manualLink = form.querySelector(".postcode-manual-link");

  if (!component.querySelector(".uk-address-manual .govuk-form-group--error")) {
    showLookup();
  } else {
    showManual();
  }

  lookupButton.addEventListener("click", function (e) {
    e.preventDefault();
    var postcodeQuery = postcode.value.trim().toUpperCase();

    if (!postcodeQuery) {
      return showManual();
    }

    getJSON("/__/find-address?postcode=" + postcodeQuery, function (
      err,
      results
    ) {
      if (err) {
        showManual();
        return;
      }

      var label =
        results.length +
        " Address" +
        (results.length > 1 ? "es" : "") +
        " found";

      var options = "<option>" + label + "</option>";

      results.forEach(function (result) {
        options +=
          '<option value="' + result.uprn + '">' + result.address + "</option>";
      });

      selector.innerHTML = options;

      postcodeDisplay.textContent = postcodeQuery;
      submitButton.style.display = "";
      lookupQuery.style.display = "none";
      lookupSelector.style.display = "";
      selector._results = results;
    });
  });

  selector.addEventListener("change", function (e) {
    var results = selector._results;
    var value = selector.value;
    var result = results.find((result) => result.uprn === value).item;
    form.querySelector('[name$="premises"]').value =
      result.BUILDING_NUMBER || result.BUILDING_NAME || "";
    form.querySelector('[name$="street"]').value =
      result.THOROUGHFARE_NAME || "";
    form.querySelector('[name$="locality"]').value =
      result.DEPENDENT_LOCALITY || "";
    form.querySelector('[name$="town"]').value = result.POST_TOWN || "";
    form.querySelector('[name$="postcode"]').value = result.POSTCODE || "";
  });

  lookupLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      showLookup();
      lookupQuery.style.display = "";
      lookupSelector.style.display = "none";
    });
  });

  manualLink.addEventListener("click", function (e) {
    e.preventDefault();
    showManual();
  });

  function showManual() {
    lookup.style.display = "none";
    manual.style.display = "";
    submitButton.style.display = "";
  }

  function showLookup() {
    lookup.style.display = "";
    manual.style.display = "none";
    submitButton.style.display = "none";
  }
});

function getJSON(url, callback) {
  var request = new window.XMLHttpRequest();
  request.open("GET", url, true);

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      try {
        var data = JSON.parse(request.responseText);
      } catch (err) {
        callback(err);
        return;
      }

      callback(null, data);
    } else {
      // It returned an error code
      callback(request.status);
    }
  };

  request.onerror = function (err) {
    callback(err);
  };

  request.send();
}
