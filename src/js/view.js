HomeView = {
  displayView: function(GMToken, ipfs) {
    form = $(".templates .home-view").clone();
    form.find('.gm-button').click(function() {
      GMToken.hasToken.call().then(function(res) {
        if (res) {
          ChronicleView.displayView(App.GMToken, App.ipfs);
        } else {
          GMTokenView.displayView(App.GMToken, App.ipfs);
        }
      });
    });
    form.find('.player-button').click(function() {
      PlayerView.displayView(GMToken, ipfs);
    });
    $('.chronicle-container').append(form);
  }
}

GMTokenView = {
  displayView: function(GMToken, ipfs) {
    $('.chronicle-container').empty();
    form = $(".templates .gm-register").clone();
    $('.chronicle-container').append(form);
    $('.chronicle-container .gm-submit').click(function() {
      GMTokenView.createGMToken(GMToken).then(function() {
        ChronicleView.displayView(GMToken, ipfs);
      });
    });
  },

  createGMToken: function(GMToken) {
    form = $('.chronicle-container .gm-register');
    return GMToken.newGM(form.find(".gm-name").val(), parseInt(form.find(".gm-id").val()));
  },
}

ChronicleView = {
  currentChronicle: {},

  displayView: function(GMToken, ipfs) {
    $('.chronicle-container').empty();
    $('.chronicle-container .gm-register').remove();
    form = $(".templates .chronicle-register").clone();
    $('.chronicle-container').append(form);
    ChronicleView.initScenarioList(ipfs);

    $('.chronicle-container .chronicle-submit').click(function() {
      ChronicleView.pushChronicleToIPFS(GMToken, ipfs);
    });

    $('.chronicle-container .player-switch').click(function() {
      PlayerView.displayView(GMToken, ipfs);
    });
  },

  initScenarioList: function(ipfs) {
    var lookupHash = "QmTypZFT95yMZrbCe96vGaaidj83996FgqMfs59ubE848U";

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
    function initTierDropdown(chronicle) {
      form.find(".tier-list").empty();
      _.each(chronicle.tiers, function(tier) {
        li = $('.templates .listing').clone();
        li.text(tier);
        li.click(function() {
          form.find('#tier-dropdown .selected').text($(this).text());
        });
        form.find(".tier-list").append(li);
      });
    }

    function initBoonCheckboxes(chronicle) {
      form.find(".boons").empty();
      _.each(chronicle.boons, function(boon) {
        li = $('.templates .listing').clone();
        checkbox = $(".templates .boon-checkbox").clone();
        checkbox.find('.boon-name').text(boon);
        li.append(checkbox);
        form.find(".boons").append(li);
      });
    }

    ipfs.cat(scenario.location, function(err, response) {
      if (err) {
        console.log("Error getting chronicle: " + err);
      } else {
        chronicle = JSON.parse(response)[0];
        initTierDropdown(chronicle);
        initBoonCheckboxes(chronicle);
        ChronicleView.currentChronicle = chronicle;
      }
    });
  },

  pushChronicleToIPFS : function(GMToken, ipfs) {
    console.log('push to ipfs');
    form = $('.chronicle-container .chronicle-register');
    chronicle_data = ChronicleView.currentChronicle;
    chronicle_data.slow = form.find('.slow-checkbox input').is(':checked');
    chronicle_data.xpGained = form.find('#xp').val();
    chronicle_data.fameGained = form.find('#fame').val();
    chronicle_data.gpScenario = form.find('#gp-scenario').val();
    chronicle_data.gpDayJob = form.find('#gp-day-job').val();
    chronicle_data.tierPlayed = form.find('.tier-dropdown .selected').text();
    chronicle_data.boonsReceived = _.map(form.find('.boons input:checkbox:checked'), function(cb) {
      return $(cb).parent().find('.boon-name').text();
    });
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
  displayView: function(GMToken, ipfs) {
    $('.chronicle-container').empty();
    $('.chronicle-container .gm-register').remove();
    $('.chronicle-container .chronicle-register').remove();
    form = $(".templates .player-view").clone();
    $('.chronicle-container').append(form);
    PlayerView.getHashesFromAddress(GMToken, ipfs, web3.eth.defaultAccount);

   /* $('.chronicle-container .chronicle-submit').click(function() {
      ChronicleView.pushChronicleToIPFS(GMToken, ipfs);
    });*/
  },

  getHashesFromAddress(GMToken, ipfs, myAccount) {
    numChronicles = GMToken.getNumChronicles.call(myAccount).then(function(result) {
      bnResult = new BigNumber(result);
      var bnIterator = new BigNumber(0);
      if (bnResult > 0) {
        for (; bnIterator.lessThan(bnResult); bnIterator = bnIterator.plus(1)) {
          shittyNumber = bnIterator.toNumber();
          GMToken.getChronicleForPlayerAt.call(myAccount, shittyNumber).then(function(result) {
            ipfsHash = ChronicleView.bytes32ToIPFSHash(result);
            form = $(".templates .player-view").clone();
            ipfs.cat(ipfsHash, (err, result) => {
              if (err) {
                console.log('Hmm.. there was an error: ' + String(err)); 
              } else {
                form.text(result);
                $('.chronicle-container').append(form);
                console.log("Found Hash:" + ipfsHash)
              }
            });
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

