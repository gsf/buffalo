$(window).load(function() {

  window.isLoading = false;

  var ItemView = Backbone.View.extend({
    newId: 0,
    initialize: function() {
      var rand = Math.floor((Math.random()*4)+1);
      this.newId = moment(this.options.data.date).format('hmmss');

      var data = {
        // convert timestamp to something nice looking:
        date: moment(this.options.data.date).format('MMM Do YYYY'),
        name: 'https://s3.amazonaws.com/milesbuffalo/' + this.options.data.name,
        modifier: (rand == 1 ? 'two-up' : 'normal'),
        id: this.newId
      }
      this.render( data );
    },
    render: function( data ) {
      var template = _.template($('#item-template').html())(data);
      this.$el.append( template );
      $('#'+this.newId).animate({opacity: 1}, 1000);
    }
  });

  var Mesa = function() {
    this.itemsData = loadJson('/images/');
    this.itemsLength = this.itemsData.images.length;
    this.itemsArray = [];
    this.pageLength = 2; // how many images are loaded at a time
    this.currentPage = 0;
    this.pageCount = Math.round(this.itemsLength / this.pageLength) -1;

    this.loadPage = function() {
      console.log(this.currentPage)
      if(this.currentPage < this.pageCount+1) {
        for(var i = 0; i < this.pageLength; i ++) {
          var item = new ItemView({
            el: $('#item-container'),
            data: this.itemsData['images'][this.pageLength * this.currentPage + i],
          });

          this.itemsArray.push(item);
        }
        this.currentPage++;
        var t = window.setTimeout( "window.isLoading = false", 1500);
      } else if(this.currentPage == this.pageCount +1) {
        console.log('last page')
        var lastItems = (this.pageLength * this.pageCount-1) - this.itemsLength;

        for(var i = 0; i < lastItems; i++) {
           var item = new ItemView({
            el: $('#item-container'),
            data: this.itemsData['images'][this.pageLength * this.currentPage + i],
          });

          this.itemsArray.push(item);
        }

        this.currentPage++;
      } else if(this.currentPage > this.pageCount) {
        console.log('nope')
      }
    }

    this.loadPage();

    $(window).bind('scroll', function() {
      //console.log($(window).height() + $(window).scrollTop() - $('#item-container').outerHeight(true)  )
      if( $(window).height() + $(window).scrollTop() - $('#item-container').outerHeight(true) > -30){
        if(!window.isLoading) {
          window.isLoading = true;
          mesa.loadPage();
        }
      }
    })

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