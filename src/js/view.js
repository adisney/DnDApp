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
    var lookupHash = "QmRyEAukZR4ZPyZNfFZg3c78AdmMKfYpuPU4PkedPu8YcN";
    
    ipfs.cat(lookupHash, (err, result) => {
      if (err) {
        console.log('Hmm.. there was an error: ' + String(err)); 
      } else {
        scenarios = _.sortBy(JSON.parse(result), function(scenario) { return scenario.name });
        _.each(scenarios , function(scenario) {
          li = $('.templates .listing').clone();
          li.text(scenario.name);
          li.click(function() {
            form.find('#scenario-dropdown .selected').text($(this).text());
            ChronicleView.onScenarioChanged(ipfs, scenario, form);
          });
          form.find('.scenario-list').append(li);
        });
      }
    });
  },

  onScenarioChanged: function(ipfs, scenario, form) {
    ipfs.cat(scenario.location, function(err, response) {
      if (err) {
        console.log("Error getting chronicle: " + err);
      } else {
        chronicle = JSON.parse(response)[0];
        _.each(chronicle.tiers, function(tier) {
          li = $('.templates .listing').clone();
          li.text(tier);
          li.click(function() {
            form.find('#tier-dropdown .selected').text($(this).text());
          });
          form.find(".tier-list").append(li);
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
    var buf = new bs58.Buffer(hash_hex.replace(/^0x/, '1220'), 'hex')
    return bs58.encode(buf)
}
}

PlayerView = 
{
  getHashesFromAddress(GMToken, userAddress) {
    numChronicles = GMToken.getNumChronicles.call(userAddress).then(function(result) {
      bnResult = new BigNumber(result);
      var bnIterator = new BigNumber(0);
      if (bnResult > 0) {
        for (; bnIterator.lessThan(bnResult); bnIterator = bnIterator.add(1)) {
          GMToken.getChronicleForPlayerAt.call(userAddress, bnIterator.toNumber()).then(function(result) {
            ipfsHash = ChronicleView.bytes32ToIPFSHash(result);
            console.log("Found Hash:" + ipfsHash)
          });
        }
      }
      else
      {
        console.log("You don't have any chronicles.");
      }
    });
  }
}

