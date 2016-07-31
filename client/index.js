$(function() {
  var server = 'http://localhost:3000/';
  var $from = $('#from');
  var $to = $('#to');
  var $date = $('#date');
  var $submit = $('#search');
  var $resultTabs = $('#resultTabs');
  // Hide the results before the first search
  $resultTabs.hide();

  $from.focusout(function () {
    var origin = $(this).val();
    $.post(server + 'airports', {q: origin}, function(data) {
      if (!data || (data && data.length === 0)) {
        alert('It seemes like there is no airport close to your origin! Please enter a valid city or airport.');
      }
    });
  });

  $to.focusout(function () {
    var toDestination = $(this).val();
    $.post(server + 'airports', {q: toDestination}, function(data) {
      if (!data || (data && data.length === 0)) {
        alert('It seemes like there is no airport close to your destination! Please enter a valid city or airport.');
      }
    });
  });

  var renderTableData = function(flights) {
    var html = '';
    flights.forEach(function(flight) {
      html += "<tr>";
      html += '<td>' + flight.flightNum + '</td>';
      html += '<td>' + flight.start.airportName + '</td>';
      html += '<td>' + flight.finish.airportName + '</td>';
      html += '<td>' + flight.durationMin + '</td>';
      html += '<td>' + flight.airline.name + '</td>';
      html += '<td>' + flight.plane.shortName + '</td>';
      html += '<td>' + flight.price + '</td>';
      html += "</tr>";
    });
    return html;
  };

  var updateResults = function(flights) {
    if (!flights.error) {
      var tabData = [];
      for (var i = -2; i < 3; i++) {
        var currentDate = moment($date.val(), 'YYYY-MM-DD');

        if (i < 0) {
          $('#' + (i * -1) + '_days_before').text(currentDate.subtract((i * -1), 'days').format('YYYY-MM-DD'));
        } else if (i > 0) {
          $('#' + i + '_days_after').text(currentDate.add(i, 'days').format('YYYY-MM-DD'));
        } else {
          $('#date_searched').text(currentDate.format('YYYY-MM-DD'));
        }

        // Seperate flights for tabs
        // Kind of slow (since iterating over the same array several times),
        // but since so few flights it won't make a big difference
        console.log(flights);
        tabData.push(flights.filter(function(flight) {
            return moment(flight.start.dateTime).isSame(currentDate, 'day');
         }));
      }
      console.log(tabData);
      $('#2_days_before_table tbody').html($('#2_days_before_table tbody').html() + renderTableData(tabData[0]));
      $('#1_days_before_table tbody').html($('#1_days_before_table tbody').html() + renderTableData(tabData[1]));
      $('#date_searched_table tbody').html($('#date_searched_table tbody').html() + renderTableData(tabData[2]));
      $('#1_days_after_table tbody').html($('#1_days_after_table tbody').html() + renderTableData(tabData[3]));
      $('#2_days_after_table tbody').html($('#2_days_after_table tbody').html() + renderTableData(tabData[4]));
    }
  };

  var clearData = function() {
    $('#2_days_before_table tbody').html('');
    $('#1_days_before_table tbody').html('');
    $('#date_searched_table tbody').html('');
    $('#1_days_after_table tbody').html('');
    $('#2_days_after_table tbody').html('');
  };

  $submit.click(function(event) {
    event.preventDefault();
    clearData();
    $resultTabs.hide();
    var $messages = $('#messages');
    $messages.show().text("Searching");
    var animateSearch = setInterval(function() {
      $messages.text($messages.text() + '.');
    }, 300);
    $.post(server + 'search', {from: $from.val(), to: $to.val(), date: $date.val()}, function(flights) {
      clearInterval(animateSearch);
      $messages.text("Search complete, loading results..");
      updateResults(flights);
      $messages.hide();
      $resultTabs.show();
    });
    var populateOtherTabsDate = moment($date.val(), 'YYYY-MM-DD').subtract(2, 'days');
    $.post(server + 'search', {from: $from.val(), to: $to.val(), date: populateOtherTabsDate.format('YYYY-MM-DD')}, function(flights) {
      updateResults(flights);
    });
    $.post(server + 'search', {from: $from.val(), to: $to.val(), date: populateOtherTabsDate.add(1, 'days').format('YYYY-MM-DD')}, function(flights) {
      updateResults(flights);
    });
    $.post(server + 'search', {from: $from.val(), to: $to.val(), date: populateOtherTabsDate.add(2, 'days').format('YYYY-MM-DD')}, function(flights) {
      updateResults(flights);
    });
    $.post(server + 'search', {from: $from.val(), to: $to.val(), date: populateOtherTabsDate.add(1, 'days').format('YYYY-MM-DD')}, function(flights) {
      updateResults(flights);
    });


  });


});
