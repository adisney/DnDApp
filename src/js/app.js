App = {
  web3Provider: null,
  contracts: {},
  GMToken: null,
  ipfs: null,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    return $.getJSON('data/GMToken.json', function(data) {
      var GMTokenArtifact = data;
      App.contracts.GMToken = TruffleContract(GMTokenArtifact);

      App.contracts.GMToken.setProvider(App.web3Provider);
    });
  },

  displayView: function() {
    App.GMToken.hasToken.call().then(function(res) {
      if (res) {
        ChronicleView.displayView(App.ipfs);
      } else {
        GMTokenView.displayView(App.GMToken);
      }
    }).catch(function(err) {
      //noop
    });
  },
};

$(function() {
  $(window).load(function() {
    App.init().then(function() {
      App.contracts.GMToken.deployed().then(function(instance) {
        App.GMToken = instance;
        App.ipfs = new IPFS({ host: 'ipfs.infura.io', protocol: 'https' });
        App.displayView();
      })
      .catch(function(err) {
        console.log(err);
        $('.container').append($('.templates .no-contract').clone())
      });
    });
  });
});
