$(window).load(function() {

  var ItemView = Backbone.View.extend({
    initialize: function() {
      this.render( this.options.data );
    },
    render: function( data ) {
      var template = _.template($('#item-template').html())(data);
      console.log( data );
      this.$el.append( template );
    }
  });

  var Mesa = function() {
    this.itemsData = loadJson('/fake-data/items.html');
    this.itemsArray = [];

    for(i in this.itemsData) {
      var item = new ItemView({
        el: $('#item-container'),
        data: this.itemsData[i],
      });

      this.itemsArray.push(item);
    }

    //console.log(this.itemsArray[0]['options']['data'])

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