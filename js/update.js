
var url = 'https://proxy.hxlstandard.org/data.json?filter02=replace-map&clean-whitespace-tags01=service%2Btype&replace-map-url02=https%3A//docs.google.com/spreadsheets/d/1J_f0bnJEfE87d13_brOyvLjKw4q1xMmHNAHzJc_kmpA/pub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv&filter01=clean&strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/1C9fmpzb3VhoGOsCnRAnhbXZNkKd3sVZIN0Ha1VOBQjk/export%3Fformat%3Dcsv%26id%3D1C9fmpzb3VhoGOsCnRAnhbXZNkKd3sVZIN0Ha1VOBQjk%26gid%3D1142452757&force=1';

$.ajax(url, {
    success: function(data) {
      	$('#status').text('Updated');
    },
    error: function(e,err) {
        $('#status').text('Error');
        console.log(e);
        console.log(err);
    }
});