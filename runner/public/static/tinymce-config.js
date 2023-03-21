tinymce.init({
    selector: `input.free-text`,  // change this value according to your HTML
    skin: 'tinymce-5',
    branding: false,
    elementpath: false,
    content_css: 'default',
    height: 150,
    menubar: false,
    plugins: [
      'advlist','autolink',
      'lists','link','image','charmap','preview','anchor','searchreplace','visualblocks',
      'fullscreen','insertdatetime','media','table','help','wordcount'

    ],
    toolbar: 'undo redo | casechange blocks | bold italic backcolor | ' +
      'alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help'
  });