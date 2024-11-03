var clip = new Clipboard('.copy');

clip.on("success", function(e) {
  document.getElementById('copyresults').innerHTML = '<p style="font-size:var(--small);opacity:50%">Copied! Share your results with friends.</p>';
  e.clearSelection();
});

clip.on("error", function() {
  document.getElementById('copyresults').innerHTML = '<p style="font-size:var(--small);opacity:50%">Error. Please copy manually...</p>';
});