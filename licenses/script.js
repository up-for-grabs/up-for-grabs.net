$(document).ready(function(e){
  
  $win = $(window);
  $navbar = $("#header");
  $toggle = $(".toggle-button");
  var width = $navbar.width();
  
  toggle_onclick($win, $navbar, width);  
  $win.resize(function(){
    toggle_onclick($win, $navbar, width);  
  });// -window.resize()

  $toggle.click(function(e){
    $navbar.toggleClass("toggle-left");
  });

});
 
 var typed = new Typed('#typed', {
    stringsElement: '#typed-strings',
    strings : [
        'Web Developer',
        'Freelancer'
    ],
    typeSpeed: 50,
    backSpeed: 50,
  });

  var typed = new Typed('#typed_2', {
    stringsElement: '#typed-strings',
    strings : [
        'Web Developer',
        'Freelancer'
    ],
    typeSpeed: 50,
    backSpeed: 50,
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
  });


  function toggle_onclick($win, $navbar, width){
    if ($win.width() <= 768) {  
      $navbar.css({left: `-${width}px`})
    }else{
      $navbar.css({left: `0px`})
    }
  }
