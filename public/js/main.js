$(document).ready(function() {
  var amount=900;
  var coupncode=["Banana", "Orange", "Apple", "Mango"];

  // Stripe
  if ($('#pay').length) {
    Stripe.setPublishableKey('pk_live_gAuF74Y5qXLqw5Uiqvzi8iDz');
    var handler = StripeCheckout.configure({
      key: 'pk_live_gAuF74Y5qXLqw5Uiqvzi8iDz',
      image: '../img/logo.png',
      token: function(token) {
        $('<form method="post" action="/charge" id="stripe"></form>').appendTo('body');
        $('<input type="hidden" name="stripeToken" />').val(token.id).appendTo('#stripe');
        $('#stripe').submit();
      }
    });
 
    document.getElementById('pay').addEventListener('click', function(e) {
      $("#stripePayment").html('<li><div class="coupon_accept btn btn-success" style="display:none"/></div><div style="display:none" class="errorcoupn alert alert-danger"></div><input type="text" id="counid" name="discount" placeholder="Add coupon" class="form-control"/></li><li><input role="button" type="submit" class="btn btn-default btn-primary buy reporter-button upcase"  value="Apply Coupon" id="coupncode"/><input type="submit"  name="payment" class="btn btn-default btn-primary buy reporter-button upcase" value="Buy" id="subscription"/></li>').promise().done(function(){
        $(this).removeClass('hide');
        $('html').off('click.dropdown.data-api');
        $('html').on('click.dropdown.data-api', function(e) {
          if(!$(e.target).parents().is('.dropdown-menu form')) {

            $('.dropdown').removeClass('open');
          }
        });
      });
      e.preventDefault();
    });

$('#stripePayment').click(function(e) {
     $('#stripePayment').addClass('open');
 });
$('.page-header').click(function(e) {

     $('#stripePayment').removeClass('open');
 });
    $(document).on("click", "#coupncode", function(e){ 
        var coupnid=$('#counid').val();
        if(coupnid==''){
          $('.errorcoupn').show().html('Enter coupon');
           $('.errorcoupn').delay(1000).hide(2000)
        }else{
          if(coupncode.indexOf(coupnid)!='-1'){
            $('.errorcoupn').show().html('Already use coupon');
            $('.errorcoupn').delay(1000).hide(2000)
          }else{
            $.ajax({
              type: "POST",
              url: "/coupn",
              data: {id : coupnid},
              success: function(response) {
                result = response;    
                if(result.message){
                  $('.errorcoupn').show().html(result.message);
                  $('.errorcoupn').delay(1000).hide(2000)
                }else{
                  console.log("result",result.percent_off);
                  var discount= amount*result.percent_off/100;
                  amount=amount-discount;
                  $('.coupon_accept').show().html(' Successful Coupon Add '+coupnid);
                  $('.coupon_accept').delay(1000).hide(2000)
                  coupncode.push(coupnid);
                }
              }
            });
          }
      }
      e.preventDefault();
    });

    $(document).on("click", "#subscription", function(e){ 
      handler.open({
        name: 'pressfarm',
        description: '30 day full access',
        amount: amount
      });
      e.preventDefault();
     });


    $('.pay').on('click', function(e) {
      handler.open({
        name: 'pressfarm',
        description: '30 day full access',
        amount: amount
      });
      $('#stripePayment').removeClass('open');
      e.preventDefault();
    });
  }

  // Stripe for pressfarm sale
  if ($('#sale').length) {
    Stripe.setPublishableKey('pk_live_gAuF74Y5qXLqw5Uiqvzi8iDz');

    var handler = StripeCheckout.configure({
      key: 'pk_live_gAuF74Y5qXLqw5Uiqvzi8iDz',
      image: '../img/logo.png',
      token: function(token) {
        $('<form method="post" action="/salecharge" id="stripe"></form>').appendTo('body');
        $('<input type="hidden" name="stripeToken" />').val(token.id).appendTo('#stripe');
        $('#stripe').submit();
      }
    });

    document.getElementById('sale').addEventListener('click', function(e) {
      handler.open({
        name: 'pressfarm',
        description: 'Buy pressfarm',
        amount: 400000
      });
      e.preventDefault();
    });
  }

  // BG Scrolling
  function parallax() {
    var scrolled = $(window).scrollTop();
    $('.bg').css('height', (jumboHeight-scrolled) + 'px');
  }
  if ($('.bg').length) {
    var jumboHeight = $('.bg').outerHeight();

    $(window).scroll(function(e){
        parallax();
    });
  }

  // GA
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-53243302-1', 'auto');
  ga('send', 'pageview');

});
