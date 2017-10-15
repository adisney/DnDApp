GMTokenView = {
  displayView: function(GMToken, ipfs) {
    form = $(".templates .gm-register").clone();
    $('.container').append(form);
    $('.container .gm-submit').click(function() {
      GMTokenView.createGMToken(GMToken).then(function() {
        ChronicleView.displayView(ipfs);
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

    $('.container .chronicle-submit').click(function() {
      ChronicleView.pushChronicleToIPFS(ipfs);
    });
  },

  initScenarioList: function(ipfs) {
    console.log("Getting scenarios");
    
    var lookupHash = "QmRFYddkKY2hWXrfkcAE5FCMe785DjHFyXa8CwL24uctGE";
    
    ipfs.cat(lookupHash, (err, result) => {
      if (err) {
        console.log('Hmm.. there was an error: ' + String(err)); 
      } else {
        jsonified = JSON.parse(result);
        _.each(jsonified, function(scenario) {
          li = $('.templates .scenario-listing').clone();
          li.text(scenario.name);
          li.click(function() {
            form.find('.selected').text($(this).text());
          });
          form.find('.scenario-list').append(li);
        });
      }
    });

  },

  pushChronicleToIPFS : function(ipfs) {
    console.log('push to ipfs');
    form = $('.container .chronicle-register');
    chronicle_data = {};
    chronicle_data.xpGained = form.find('#xp').val();
    chronicle_data.fameGained = form.find('#fame').val();
    chronicle_data.gpScenario = form.find('#gp-scenario').val();
    chronicle_data.gpDayJob = form.find('#gp-day-job').val();
    chronicle_data.tier = form.find('#tier').val();
    console.log(chronicle_data);
    return ipfs.add(JSON.stringify(chronicle_data), function(err, result) {
      if (err) {
        console.log("Something broke: " + err);
      } else {
        hash = result;
        console.log("Added file at hash: " + hash);
        // Invoke addChronicle on contract
      }
    });
  }
}
