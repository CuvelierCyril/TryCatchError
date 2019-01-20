$(document).ready(function(){
    //gestion ici du hashage afin de simuler une naviguation avec la pagination et pouvoir envoyer son url a quelqu'un et tombé sur les meme resultats
    var nbpage;
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
       $.ajax({ //envoie du formulaire en ajax et gestion des erreurs
            url: page,
            method: "POST",
            dataType: 'json',
            timeout: 4000,
            data: {
                filter: value
            },
            success:function(data){
                nbpage = data[data.length - 2];
                if (!data.nan){
                    createDisplay(data);
                } else {
                    $('#main-container').html(`<h1 class="text-center text-light">Liste des sujets</h1>
                    <div  class="p-2" id="headingThree">
                        <h5 class="mb-0">
                            <p class="alert alert-danger">Aucun article trouvé !</p>
                        </h5>
                </div>`);
                $('#displayPagination').html('');
                $('#next-current').click(function(){ //gestion de tous les boutons de filtres et de pages
                    nb++;
                    if (filter == ''){
                        window.location.hash = nb;
                    } else {
                        window.location.hash = nb+'&'+filter;
                    }
                });
                $('#previous-current').click(function(){
                    nb--;
                    if (filter == ''){
                        window.location.hash = nb;
                    } else {
                        window.location.hash = nb+'&'+filter;
                    }
                });
                $('#previous-2-current').click(function(){
                    nb = (parseInt(nb) - 2);
                    if (filter == ''){
                        window.location.hash = nb;
                    } else {
                        window.location.hash = nb+'&'+filter;
                    }
                });
                $('#next-2-current').click(function(){
                    nb = (parseInt(nb) + 2);
                    if (filter == ''){
                        window.location.hash = nb;
                    } else {
                        window.location.hash = nb+'&'+filter;
                    }
                });
                $('#first-page').click(function(){
                    nb = 1;
                    if (filter == ''){
                        window.location.hash = nb;
                    } else {
                        window.location.hash = nb+'&'+filter;
                    }
                });
                $('#last-page').click(function(){
                    nb = nbpage;
                    if (filter == ''){
                        window.location.hash = nb;
                    } else {
                        window.location.hash = nb+'&'+filter;
                    }
                });
                $('#filtrePhp').click(function(){
                    filter = 'php';
                    nb = 1;
                    window.location.hash = nb+'&'+filter;
                });
                $('#filtreBoostrap').click(function(){
                    filter = 'bootstrap';
                    nb = 1;
                    window.location.hash = nb+'&'+filter;
                });
                $('#filtreSymfony').click(function(){
                    filter = 'symfony';
                    nb = 1;
                    window.location.hash = nb+'&'+filter;
                });
                $('#filtreHtml').click(function(){
                    filter = 'html';
                    nb = 1;
                    window.location.hash = nb+'&'+filter;
                });
                $('#filtreJs').click(function(){
                    filter = 'js';
                    nb = 1;
                    window.location.hash = nb+'&'+filter;
                });
                $('#filtreCss').click(function(){
                    filter = 'css';
                    nb = 1;
                    window.location.hash = nb+'&'+filter;
                });
                $('#filtreJquery').click(function(){
                    filter = 'jquery';
                    nb = 1;
                    window.location.hash = nb+'&'+filter;
                });
                $('#FiltreMysql').click(function(){
                    filter = 'mySql';
                    nb = 1;
                    window.location.hash = nb+'&'+filter;
                });
                $('#filtreNone').click(function(){
                    filter = '';
                    nb = 1;
                    window.location.hash = nb;
                });
                }
            },
            error:function(){
            },
            beforeSend:function(){
                 setOverlay();
            },
            complete:function(){
                $('.view-title').html(`<h1 class="text-center text-light">Liste des sujets</h1>`);
                 removeOverlay();
            }
        });
    }
    function createDisplay(tableau){ //modification de l'affichage
        var maxindex = $(tableau).length - 3;
        var pagi = true;
        var str = `<h1 class="m-auto text-center text-light police-text">Liste des articles</h1>`;
        var str2 = "";
        if (tableau[0].title){
            $(tableau).each(function(index, element){
                if(index < maxindex){
                    str = str + `
                    <div class="card page-trans">
                        <div class="row p-2" id="headingThree">
                            <div class="col-8">
                                <h5 class="mb-0">
                                    <p class="title text-light">` + element.title + `</p>
                                </h5>
                                <p class="text-light">` + element.desc + `</p>
                                <a href="../sujet/`+ element.id +`" class="btn btn-color active m-2" role="button">Voir l'article</a>
                            </div>
                            <div class="col-12 offset-xl-3 col-xl-1 col-md-2 offset-md-2 text-center">
                                <p class="border bg-white">Vues : ` + element.view + `</p>
                                <p class="border bg-white">Réponses : ` + element.answer + `</p>
                            </div>
                        </div>
                    </div>`;
                }
            });
        } else {
            str = str + `<div class="p-2" id="headingThree">
                    <h5 class="mb-0">
                        <p class="alert alert-danger">Aucun article trouvé !</p>
                    </h5>
                </div>`;
    pagi = false;
    $('#displayPagination').html('');
        }
        if(pagi){ //gestion de la pagination
            if (nb == 1){
                if(nb == nbpage -1){
                    str2 = `<li class="page-item">
                <span class="page-link page-item" id='first-page'>Première</span>
            </li>
            <li class="page-item disabled">
                <span class="page-link" id='current'>`+ nb +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='next-current'>`+ (parseInt(nb) + 1) +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='last-page'>Dernière</span>
            </li>`;
                } else if(nb == nbpage){
                    str2 = `<li class="page-item">
                <span class="page-link page-item" id='first-page'>Première</span>
            </li>
            <li class="page-item disabled">
                <span class="page-link" id='current'>`+ nb +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='last-page'>Dernière</span>
            </li>`;
                } else {
                    str2 = `<li class="page-item">
                <span class="page-link page-item" id='first-page'>Première</span>
            </li>
            <li class="page-item disabled">
                <span class="page-link" id='current'>`+ nb +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='next-current'>`+ (parseInt(nb) + 1) +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='next-2-current'>`+ (parseInt(nb) + 2) +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='last-page'>Dernière</span>
            </li>`;
                }
                
            } else if(nb == 2){
                if(nb == nbpage - 1){
                    str2 = `<li class="page-item">
                <span class="page-link page-item" id='first-page'>Première</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='previous-current'>`+ (parseInt(nb) - 1) +`</span>
            </li>
            <li class="page-item disabled">
                <span class="page-link" id='current'>`+ nb +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='next-current'>`+ (parseInt(nb) + 1) +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='last-page'>Dernière</span>
            </li>`;
                } else if(nb == nbpage){
                    str2 = `<li class="page-item">
                <span class="page-link page-item" id='first-page'>Première</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='previous-current'>`+ (parseInt(nb) - 1) +`</span>
            </li>
            <li class="page-item disabled">
                <span class="page-link" id='current'>`+ nb +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='last-page'>Dernière</span>
            </li>`;
                } else {
                    str2 = `<li class="page-item">
                <span class="page-link page-item" id='first-page'>Première</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='previous-current'>`+ (parseInt(nb) - 1) +`</span>
            </li>
            <li class="page-item disabled">
                <span class="page-link" id='current'>`+ nb +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='next-current'>`+ (parseInt(nb) + 1) +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='next-2-current'>`+ (parseInt(nb) + 2) +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='last-page'>Dernière</span>
            </li>`;
                }
            }  else {
                if(nb == nbpage - 1){
                    str2 = `<li class="page-item">
                <span class="page-link page-item" id='first-page'>Première</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='previous-2-current'>`+ (parseInt(nb) - 2) +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='previous-current'>`+ (parseInt(nb) - 1) +`</span>
            </li>
            <li class="page-item disabled">
                <span class="page-link" id='current'>`+ nb +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='next-current'>`+ (parseInt(nb) + 1) +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='last-page'>Dernière</span>
            </li>`;
                } else if(nb == nbpage){
                    str2 = `<li class="page-item">
                    <span class="page-link page-item" id='first-page'>Première</span>
                </li>
                <li class="page-item">
                    <span class="page-link" id='previous-2-current'>`+ (parseInt(nb) - 2) +`</span>
                </li>
                <li class="page-item">
                    <span class="page-link" id='previous-current'>`+ (parseInt(nb) - 1) +`</span>
                </li>
                <li class="page-item disabled">
                    <span class="page-link" id='current'>`+ nb +`</span>
                </li>
                <li class="page-item">
                    <span class="page-link" id='last-page'>Dernière</span>
                </li>`;
                } else {
                    str2 = `<li class="page-item">
                <span class="page-link page-item" id='first-page'>Première</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='previous-2-current'>`+ (parseInt(nb) - 2) +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='previous-current'>`+ (parseInt(nb) - 1) +`</span>
            </li>
            <li class="page-item disabled">
                <span class="page-link" id='current'>`+ nb +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='next-current'>`+ (parseInt(nb) + 1) +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='next-2-current'>`+ (parseInt(nb) + 2) +`</span>
            </li>
            <li class="page-item">
                <span class="page-link" id='last-page'>Dernière</span>
            </li>`;
                }
                
            }
        }

        $('#displayPagination').html(str2);
        $('#main-container').html(str);
        $('#next-current').click(function(){ //gestion de tous les boutons de filtres et de pages
            nb++;
            if (filter == ''){
                window.location.hash = nb;
            } else {
                window.location.hash = nb+'&'+filter;
            }
        });
        $('#previous-current').click(function(){
            nb--;
            if (filter == ''){
                window.location.hash = nb;
            } else {
                window.location.hash = nb+'&'+filter;
            }
        });
        $('#previous-2-current').click(function(){
            nb = (parseInt(nb) - 2);
            if (filter == ''){
                window.location.hash = nb;
            } else {
                window.location.hash = nb+'&'+filter;
            }
        });
        $('#next-2-current').click(function(){
            nb = (parseInt(nb) + 2);
            if (filter == ''){
                window.location.hash = nb;
            } else {
                window.location.hash = nb+'&'+filter;
            }
        });
        $('#first-page').click(function(){
            nb = 1;
            if (filter == ''){
                window.location.hash = nb;
            } else {
                window.location.hash = nb+'&'+filter;
            }
        });
        $('#last-page').click(function(){
            nb = nbpage;
            if (filter == ''){
                window.location.hash = nb;
            } else {
                window.location.hash = nb+'&'+filter;
            }
        });
        $('#filtrePhp').click(function(){
            filter = 'php';
            nb = 1;
            window.location.hash = nb+'&'+filter;
        });
        $('#filtreBootstrap').click(function(){
            filter = 'bootstrap';
            nb = 1;
            window.location.hash = nb+'&'+filter;
        });
        $('#filtreSymfony').click(function(){
            filter = 'symfony';
            nb = 1;
            window.location.hash = nb+'&'+filter;
        });
        $('#filtreHtml').click(function(){
            filter = 'html';
            nb = 1;
            window.location.hash = nb+'&'+filter;
        });
        $('#filtreJs').click(function(){
            filter = 'js';
            nb = 1;
            window.location.hash = nb+'&'+filter;
        });
        $('#filtreCss').click(function(){
            filter = 'css';
            nb = 1;
            window.location.hash = nb+'&'+filter;
        });
        $('#filtreJquery').click(function(){
            filter = 'jquery';
            nb = 1;
            window.location.hash = nb+'&'+filter;
        });
        $('#FiltreMysql').click(function(){
            filter = 'mySql';
            nb = 1;
            window.location.hash = nb+'&'+filter;
        });
        $('#filtreNone').click(function(){
            filter = '';
            nb = 1;
            window.location.hash = nb;
        });
    }

});