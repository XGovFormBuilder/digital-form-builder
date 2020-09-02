$("input[type='ni']").on('input propertychange paste', function () {
  $(this).val($(this).val().replace(/\s/g, ''))
})
