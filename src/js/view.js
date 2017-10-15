GMTokenView = {
  displayView: function(GMToken) {
    form = $(".templates .gm-register").clone();
    $('.container').append(form);
    $('.container .gm-submit').click(function() {
      GMTokenView.createGMToken(GMToken).then(function() {
        ChronicleView.displayView();
      });
    });
  },

  createGMToken: function(GMToken) {
    form = $('.container .gm-register');
    return GMToken.newGM(form.find(".gm-name").val(), parseInt(form.find(".gm-id").val()));
  },
}

ChronicleView = {
  displayView: function(ipfs) {
    $('.container .gm-register').remove();
    form = $(".templates .chronicle-register").clone();
    $('.container').append(form);
    ChronicleView.initScenarioList(ipfs);
  },

  initScenarioList: function(ipfs) {
    console.log("Getting scenarios");
    
    var lookupHash = "QmRFYddkKY2hWXrfkcAE5FCMe785DjHFyXa8CwL24uctGE";
    
    ipfs.cat(lookupHash, (err, result) => {
      if (err) {
        console.log('Hmm.. there was an error: ' + String(err)); 
      } else {
        console.log(result);
        jsonified = JSON.parse(result);
        _.each(jsonified, function(scenario) {
          li = $('.templates .scenario-listing').clone();
          li.text(scenario.name);
          $('.scenario-list').append(li);
        });
      }
    });

     console.log("here");
  }
}
