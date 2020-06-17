$("input[type='file']").on('change', function () {
  $(this).parent().parent().find('.upload-dialog').show();
})
