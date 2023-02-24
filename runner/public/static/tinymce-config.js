tinymce.init({
    selector: `textarea`,  // change this value according to your HTML
    skin: 'oxide-dark',
    content_css: 'default',
    height: 150,
    menubar: false,
    plugins: [
      'advlist','autolink',
      'lists','link','image','charmap','preview','anchor','searchreplace','visualblocks',
      'fullscreen','insertdatetime','media','table','help','wordcount'
 
    ],
    toolbar: 'undo redo'
  });
