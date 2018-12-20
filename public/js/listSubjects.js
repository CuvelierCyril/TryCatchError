$(document).ready(function(){
    var nb = window.location.hash.substr(1).split('&')[0];
        if (window.location.hash.substr(1).split('&')[1]){
            var filter = window.location.hash.substr(1).split('&')[1];
        } else {
            var filter = '';
        }
    if (window.location.hash == ''){
        window.location.hash = 1;
    } else {
        apiControllerAjax(window.location.hash.substr(1));
    }
    $(window).bind('hashchange', function() {
        nb = window.location.hash.substr(1).split('&')[0];
        if (window.location.hash.substr(1).split('&')[1]){
            filter = window.location.hash.substr(1).split('&')[1];
        } else {
            filter = '';
        }
        apiControllerAjax(window.location.hash.substr(1));
    });
    function apiControllerAjax(value){
       $.ajax({
            url: page,
            method: "POST",
            dataType: 'json',
            
            data: {
                filter: value
            },
            success:function(data){
                console.log(data);
                if (!data.nan){
                    createDisplay(data);
                }else {
                    $('.view').html('<p>Aucun article trouvé</p>');
                }
            },
            error:function(){

            },
            beforeSend:function(){
                setOverlay();
            },
            complete:function(){
                $('.view-title').html(`<h1 class="text-center">Liste des sujets</h1>`);
                removeOverlay();
            }
        });
    }

    function createDisplay(tableau){
        var str = "<p>nb article : "+ tableau[$(tableau).length-3] +", article par page : 10, nb pages : " + tableau[$(tableau).length-2] + "</p><p>fitlres : <button id='filtrePhp'>PHP</button><button id='filtreAjax'>AJAX</button><button id='filtreNone'>Pas de filtre</button></p>";
        var maxindex = $(tableau).length - 3;
        if (tableau[0].title){
            $(tableau).each(function(index, element){
                if(index < maxindex){
                    console.log(element.content);
                    element.content = element.content.replace('[code=', '<pre><code class="language-');
                    console.log(element.content);
                    element.content = element.content.replace('[/code]', '</code></pre>');
                    console.log(element.content);
                    element.content = element.content.replace(']', '>');
                    console.log(element.content);
                    $('.view').html(element.content);
                    // $('.view').html(element.content);
                    
                    str = str + "<h2>"+ element.title +"</h2>";
                    str = str + '<p>';
                    $(element.cat).each(function(index2, element2){
                        if (index2 == 0){
                            str = str + element2;
                        } else {
                            str = str + ' ' + element2;
                        }
                    });
                    str = str + '</p>';
                }
            });
            if (nb > 1){
                str = str + "<button id='previous-page'>page "+ (parseInt(nb) - 1) +"</button>";
            }
            if(maxindex == 10){
                str = str + "<button id='next-page'>page "+ (parseInt(nb) + 1) +"</button>";
            }
        } else {
            str = str + 'Aucun article trouvé';
        }
        // $('.view').html(str);
        $('#next-page').click(function(){
            nb++;
            if (filter == ''){
                window.location.hash = nb;
            } else {
                window.location.hash = nb+'&'+filter;
            }
        });
        $('#previous-page').click(function(){
            nb--;
            if (filter == ''){
                window.location.hash = nb;
            } else {
                window.location.hash = nb+'&'+filter;
            }
        });
        $('#filtrePhp').click(function(){
            $('#filtrePhp').css("background-color", "red");
            $('#filtreAjax').css("background-color", "#E1E1E1");
            $('#filtreNone').css("background-color", "#E1E1E1");
            filter = 'php';
            nb = 1;
            window.location.hash = nb+'&'+filter;
        });
        $('#filtreAjax').click(function(){
            $('#filtreAjax').css("background-color", "red");
            $('#filtreNone').css("background-color", "#E1E1E1");
            $('#filtrePhp').css("background-color", "#E1E1E1");
            filter = 'ajax';
            nb = 1;
            window.location.hash = nb+'&'+filter;
        });
        $('#filtreNone').click(function(){
            $('#filtreNone').css("background-color", "red");
            $('#filtrePhp').css("background-color", "#E1E1E1");
            $('#filtreAjax').css("background-color", "#E1E1E1");
            filter = '';
            nb = 1;
            window.location.hash = nb;
        });
    }
    function setOverlay(){
        $('body').css('overflow', 'hidden');
        $('body').prepend('<div id="overlay"><img src="https://loading.io/spinners/square/index.svg" class="zoom3"></img></div>');
    }
    function removeOverlay(){
        $('body').css('overflow', 'visible');
        $('#overlay').remove();
    }
});