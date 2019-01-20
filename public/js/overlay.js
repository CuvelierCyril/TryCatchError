function setOverlay(){ // création de l'overlay
    $('body').css('overflow', 'hidden');
    $('body').prepend('<div id="overlay"><img src="https://loading.io/spinners/square/index.svg" class="zoom3"></img></div>');
}
function removeOverlay(){ // suppression de l'overlay
    $('body').css('overflow', 'visible');
    $('#overlay').remove();
}