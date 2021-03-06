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
    $('.jumbotron h1').text("Register As GM");
    form = $(".templates .gm-register").clone();
    $('.chronicle-container').append(form);
    $('.chronicle-container .gm-submit').click(function() {
      form.find('.loading').show();
      GMTokenView.createGMToken(GMToken).then(function() {
        ChronicleView.displayView(GMToken, ipfs);
      });
    });
    $('.chronicle-container .player-button').click(function() {
      PlayerView.displayView(GMToken, ipfs);
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
    $('.jumbotron h1').text("Record Session");
    ChronicleView.initScenarioList(ipfs);

    $('.chronicle-container .chronicle-submit').click(function() {
      form.find('.loading').show();
      ChronicleView.pushChronicleToIPFS(GMToken, ipfs);
    });

    $('.chronicle-container .player-switch').click(function() {
      PlayerView.displayView(GMToken, ipfs);
    });
  },

  initScenarioList: function(ipfs) {
    var lookupHash = "QmQDWye3YnbEA1mySHYXGJrjHxwiPcQFYNptKhyNuhvMEy";

    ipfs.cat(lookupHash, (err, result) => {
      if (err) {
        console.log('Hmm.. there was an error: ' + String(err)); 
      } else {
        scenarios = _.sortBy(JSON.parse(result), function(scenario) { return scenario.name });
        _.each(scenarios , function(scenario) {
          li = $('.templates .listing').clone();
          a = $("<a>").attr("role", "menuitem").text(scenario.name);
          li.append(a);
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
        a = $("<a>").attr("role", "menuitem").text(tier);
        li.append(a);
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
    chronicle_data = $.extend({}, ChronicleView.currentChronicle);
    // delete chronicle_data.boons;
    // delete chronicle_data.tiers;
    chronicle_data.tierPlayed = form.find('.tier-dropdown .selected').text();
    chronicle_data.slow = form.find('.slow-checkbox input').is(':checked');
    chronicle_data.characterName = form.find('#character-name').val();
    chronicle_data.characterClass = form.find('#character-class').val();

    items = chronicle_data.items_found[chronicle_data.tierPlayed];

    maxGold = parseInt( chronicle_data.max_gold[chronicle_data.tierPlayed + (chronicle_data.slow ? "_slow" : "_fast")].replace(/,/g, ""));
    gpScenario = parseInt(form.find('#gp-scenario').val());

    if (maxGold < gpScenario)
    {
      gpScenario = maxGold;
    } 

    // delete chronicle_data.items_found;
    // delete chronicle_data.max_gold;

    chronicle_data.items = items;
    chronicle_data.xpGained = form.find('#xp').val();
    chronicle_data.fameGained = form.find('#fame').val();
    chronicle_data.gpScenario = gpScenario;
    chronicle_data.gpDayJob = form.find('#gp-day-job').val();
    
    chronicle_data.boonsReceived = _.map(form.find('.boons input:checkbox:checked'), function(cb) {
      return $(cb).parent().find('.boon-name').text();
    });
    console.log(chronicle_data);
    return ipfs.add(JSON.stringify(chronicle_data), function(err, result) {
      if (err) {
        form.find('.alert').addClass('alert-danger').text("There was an error sending your chronicle sheet! Please try again.").show();
        console.log("Something broke: " + err);
      } else {
        hash = result;
        buf32Hash = ChronicleView.ipfsHashToBytes32(hash);
        GMToken.addChronicle(buf32Hash, form.find('#player-address').val())
          .then(function(err, res) {
            form.find('.loading').hide();
            form.find('.alert').addClass('alert-success').text("Chronicle sent!").show();
          }).catch(function(err) {
            form.find('.loading').hide();
            form.find('.alert').addClass('alert-danger').text("There was an error sending your chronicle sheet! Please try again.").show();
          });
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
    $('.jumbotron h1').text("Character Sheet");
    $('.chronicle-container .gm-button').click(function() {
      GMToken.hasToken.call().then(function(res) {
        if (res) {
          ChronicleView.displayView(App.GMToken, App.ipfs);
        } else {
          GMTokenView.displayView(App.GMToken, App.ipfs);
        }
      });
    });
    PlayerView.getHashesFromAddress(GMToken, ipfs, web3.eth.defaultAccount, form);
  },

  getHashesFromAddress(GMToken, ipfs, myAccount, form) {
    numChronicles = GMToken.getNumChronicles.call(myAccount).then(function(result) {
      bnResult = new BigNumber(result);
      var bnIterator = new BigNumber(0);
      if (bnResult > 0) {
        for (; bnIterator.lessThan(bnResult); bnIterator = bnIterator.plus(1)) {
          shittyNumber = bnIterator.toNumber();
          GMToken.getChronicleForPlayerAt.call(myAccount, shittyNumber).then(function(result) {
            ipfsHash = ChronicleView.bytes32ToIPFSHash(result);
            ipfs.cat(ipfsHash, (err, result) => {
              if (err) {
                console.log('Hmm.. there was an error: ' + String(err)); 
              } else {
                chronicle_data = JSON.parse(result);
                
                _.each(chronicle_data.items, function(item){
                  liItems = $('.templates .listing').clone();
                  liItems.addClass('list-group-item');
                  liItems.text(item);
                  form.find('.items-available ul').append(liItems);
                });

                _.each(chronicle_data.boonsReceived, function(boon){
                  liItems = $('.templates .listing').clone();
                  liItems.addClass('list-group-item');
                  liItems.text(boon + " - " + chronicle_data.title);
                  form.find('.boons ul').append(liItems);
                });

                xp = parseInt(chronicle_data.xpGained) + parseInt(form.find('.xp').text());
                form.find('.xp').text(xp);

                fame = parseInt(chronicle_data.fameGained) + parseInt(form.find('.fame').text());
                form.find('.fame').text(fame);

                gpScenario = parseInt(chronicle_data.gpScenario)
                gpDayJob = parseInt(chronicle_data.gpDayJob)
                gp = (gpScenario ? gpScenario : 0.0) + (gpDayJob ? gpDayJob : 0.0) + 
                  parseInt(form.find('.total-gold').text());
                form.find('.total-gold').text(gp);

                form.find('.level').text( Math.min(Math.floor(xp / 3) + 1, 20));

                if (!form.find('.name').text()){
                  form.find('.name').text(chronicle_data.characterName);
                  form.find('.class').text(chronicle_data.characterClass);
                }

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

