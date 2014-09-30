$(document).ready(function() {

    configBanner();
    configHovers();
});


var configBanner = function(){
    var w_height = $(window).height();
    $('.banner').find('li').css('height', w_height);
    var unslider = $('.banner').unslider(); 
    $('.unslider-arrow').click(function() {  
        var fn = this.className.split(' ')[1];
        // Either do unslider.data('unslider').next() or .prev() depending on the className 
        unslider.data('unslider')[fn](); 
    });
    if(window.chrome) {
        $('.banner li').css('background-size', '100% 100%');
    }
}

var configHovers = function(){
    var content = ''
    // $('.container').mouseover(function(){
    //     $('.hover_info').empty();
    //     content = 'Hover over different regions of the ball to see the spin that would be caused if you kicked the ball there.'; 
    //     $('.hover_info').append(content);
    // });
    $('.ball_top').mouseover(function(){
        $('.hover_info').empty();
        content = '<h4>Kicking here would give the ball topspin</h4>'; 
        $('.hover_info').append(content);
    });
    $('.ball_bottom').mouseover(function(){
        $('.hover_info').empty();
        content = '<h4>Kicking here would give the ball underspin</h4>'; 
        $('.hover_info').append(content);
    });
    $('.ball_left').mouseover(function(){
        $('.hover_info').empty();
        content = '<h4>Kicking here would cause the ball to bend to the right</h4>'; 
        $('.hover_info').append(content);
    });
    $('.ball_right').mouseover(function(){
        $('.hover_info').empty();
        content = '<h4>Kicking here would cause the ball to bend to the left</h4>'; 
        $('.hover_info').append(content);
    });
    $('.ball_middle').mouseover(function(){
        $('.hover_info').empty();
        content = '<h4>Kicking here would cause the ball to have no bend</h4>'; 
        $('.hover_info').append(content);
    });
    $('.ball').mouseleave(function(){
        $('.hover_info').empty();
        $('.hover_info').append('<h4>Hover over different regions of the ball to see the spin that would be caused if you kicked the ball there.</h4>'); 
    });
}

