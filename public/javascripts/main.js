$(window).load(function() {

  var ItemView = Backbone.View.extend({
    initialize: function() {
      console.log(this.options.argo);
    }
  });

  // var item = new ItemView({
  //   argo: "blah",
  // });

  var Mesa = function() {
    //console.log('new Mesa.')

    console.log( loadJson('/fake-data/items.html') );

    this.item1 = new ItemView({
      argo: "blah",
    });

    function loadJson( targetURL ) {
      var dataRequested;

      $.ajax({
        url: targetURL,
        async: false,
        dataType: 'json',
        success: function(data) {
          dataRequested = data;
        },
        error: function(errorThrown) {
          dataRequested = errorThrown;
        }
      });
      return dataRequested;
    } // loadData

  }

  window.mesa = new Mesa();
})