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
  displayView: function() {
    $('.container .gm-register').remove();
    form = $(".templates .chronicle-register").clone();
    $('.container').append(form);
    ChronicleView.initScenarioList();
  },

  initScenarioList: function() {
    console.log("Getting scenarios");
    $.get('./chronicles/index.json', function(data) {
      console.log(data);
      _.each(data, function(scenario) {
        li = $('.templates .scenario-listing').clone();
        li.text(scenario.name);
        $('.scenario-list').append(li);
      });
    });
    console.log("here");
  }
}
