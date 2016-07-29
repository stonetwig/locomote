$(function() {
  var server = 'http://localhost:3000/';
  var $from = $('#from');
  var $to = $('#to');
  var $date = $('#date');
  var $submit = $('#search');

  $from.focusout(function () {
    var origin = $(this).val();
    $.post(server + 'airports', {q: origin}, function(data) {
      if (data.length === 0) {
        alert('It seemes like there is no airport close to your origin! Please enter a valid city or airport.');
      }
    });
  });

  $to.focusout(function () {
    var toDestination = $(this).val();
    $.post(server + 'airports', {q: toDestination}, function(data) {
      if (data.length === 0) {
        alert('It seemes like there is no airport close to your destination! Please enter a valid city or airport.');
      }
    });
  });

  $submit.click(function(event) {
    event.preventDefault();
    $.post(server + 'search', {from: $from.val(), to: $to.val(), date: $date.val()}, function(data) {
      console.log(data);
    });
  });


});
