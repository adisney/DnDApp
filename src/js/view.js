GMTokenView = {
  displayView: function(GMToken, ipfs) {
    form = $(".templates .gm-register").clone();
    $('.container').append(form);
    $('.container .gm-submit').click(function() {
      GMTokenView.createGMToken(GMToken).then(function() {
        ChronicleView.displayView(GMToken, ipfs);
      });
    });
  },

  createGMToken: function(GMToken) {
    form = $('.container .gm-register');
    return GMToken.newGM(form.find(".gm-name").val(), parseInt(form.find(".gm-id").val()));
  },
}

ChronicleView = {
  displayView: function(GMToken, ipfs) {
    $('.container .gm-register').remove();
    form = $(".templates .chronicle-register").clone();
    $('.container').append(form);
    ChronicleView.initScenarioList(ipfs);

    $('.container .chronicle-submit').click(function() {
      ChronicleView.pushChronicleToIPFS(GMToken, ipfs);
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

  pushChronicleToIPFS : function(GMToken, ipfs) {
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
        buf32Hash = ChronicleView.ipfsHashToBytes32(hash);
        GMToken.addChronicle(buf32Hash, form.find('#player-address').val());
        console.log("Added file at hash: " + hash);
        // Invoke addChronicle on contract
      }
    });
  },

  ipfsHashToBytes32(ipfs_hash) {
    var h = bs58.decode(ipfs_hash).toString('hex').replace(/^1220/, '');
    if (h.length != 64) {
        console.log('invalid ipfs format', ipfs_hash, h);
        return null;
    }
    return '0x' + h;
},

bytes32ToIPFSHash(hash_hex) {
    //console.log('bytes32ToIPFSHash starts with hash_buffer', hash_hex.replace(/^0x/, ''));
    var buf = new Buffer(hash_hex.replace(/^0x/, '1220'), 'hex')
    return bs58.encode(buf)
}
}
