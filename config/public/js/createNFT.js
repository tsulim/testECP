$(function() {
    $('#uploadBtn').addClass('dragging').removeClass('dragging');
});

$('#uploadBtn').on('dragover', function() {
    $('#uploadBtn').addClass('dragging')
}).on('dragleave', function() {
    $('#uploadBtn').removeClass('dragging')
}).on('drop', function(e) {
  $('#uploadBtn').removeClass('dragging hasImage');
  if (e.originalEvent) {
    var file = e.originalEvent.dataTransfer.files[0];
    console.log(file);

    var reader = new FileReader();

    //attach event handlers here...

    reader.readAsDataURL(file);
    reader.onload = function(e) {
      console.log(reader.result);
      $('#uploadBtn').css('background-image', 'url(' + reader.result + ')').addClass('hasImage');
      $('#uploadSpan').css('display', 'none');
      $('#uploadLabel').css('display', 'none');

    }

  }
})


$('#uploadBtn').on('click', function(e) {
    console.log('clicked')
    $('#mediaFile').click();
  });
  window.addEventListener("dragover", function(e) {
    e = e || event;
    e.preventDefault();
  }, false);
  window.addEventListener("drop", function(e) {
    e = e || event;
    e.preventDefault();
  }, false);
  $('#mediaFile').change(function(e) {
  
    var input = e.target;
    if (input.files && input.files[0]) {
      var file = input.files[0];
  
      var reader = new FileReader();
  
      reader.readAsDataURL(file);
      reader.onload = function(e) {
        console.log(reader.result);
        $('#uploadBtn').css('background-image', 'url(' + reader.result + ')').addClass('hasImage');
        $('#uploadSpan').css('display', 'none');
        $('#uploadLabel').css('display', 'none');

      }
    }
  })