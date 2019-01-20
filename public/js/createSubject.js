$(document).ready(function(){
    //création de variables
    var language; 
    var category = [];
    var style;
    var language_possible = ['html', 'css', 'js', 'php'];
    var style_possible = ['error', 'underline', 'mark', 'overline'];

    $('.btn-category').click(function(e){ // ajout/suppression de catégorie lors de la création d'un sujet
        e.preventDefault();
        var cat = $(this).val();
        if ($.inArray(cat, category) == -1){
            category.push(cat);
            $(this).removeClass('btn-secondary');
            $(this).addClass('btn-color');
        } else {
            category = jQuery.grep(category, function(n){
                return n !== cat;
            });
            $(this).removeClass('btn-color');
            $(this).addClass('btn-secondary');
        }
    });
    $('#selected-style').change(function(){ //modification du type de style, et de la simulation
        style = $(this).val();
        switch(style){
            case 'error':
                $('#simulation-style').html('<span id="simu" style="color:red; font-weight:bold; background-color:white;"></span>');
                $('#simu').append(escapeHtml($('#txt-style').val()));
                break;
            case 'underline':
                $('#simulation-style').html('<span id="simu" style="text-decoration:underline;"></span>');
                $('#simu').append(escapeHtml($('#txt-style').val()));
                break;
            case 'mark':
                $('#simulation-style').html('<mark id="simu"></mark>');
                $('#simu').append(escapeHtml($('#txt-style').val()));
                break;
            case 'overline':
                $('#simulation-style').html('<span id="simu" style="text-decoration: line-through;"></span>');
                $('#simu').append(escapeHtml($('#txt-style').val()));
                break;
            default:
                $('#simulation-style').text(escapeHtml($('#txt-style').val()));
                break;
        }
    });
    $('#selected-language').change(function(){ //modification du langage de code, et de la simulation
        language = $(this).val();
        $('#simulation-code').removeClass();
        $('#simulation-code').text('');
        $('#simulation-code').addClass('language-'+ language);
        $('#simulation-code').text($('#txt-code').val());
        Prism.highlightAll();
    });
    $('#txt-code').keyup(function(){ //mise a jour de la simulation a chaque lettre
        $('#simulation-code').text($(this).val());
        Prism.highlightAll();
    });
    $('#txt-style').keyup(function(){ //mise a jour de la simulation a chaque lettre
        switch(style){
            case 'error':
                $('#simulation-style').html('<span id="simu" style="color:red; font-weight:bold; background-color:white;"></span>');
                $('#simu').append(escapeHtml($('#txt-style').val()));
                break;
            case 'underline':
                $('#simulation-style').html('<span id="simu" style="text-decoration:underline;"></span>');
                $('#simu').append(escapeHtml($('#txt-style').val()));
                break;
            case 'mark':
                $('#simulation-style').html('<mark id="simu"></mark>');
                $('#simu').append(escapeHtml($('#txt-style').val()));
                break;
            case 'overline':
                $('#simulation-style').html('<span id="simu" style="text-decoration: line-through;"></span>');
                $('#simu').append(escapeHtml($('#txt-style').val()));
                break;
            default:
                $('#simulation-style').text(escapeHtml($('#txt-style').val()));
                break;
        }
    });
    $('#valider').click(function(){ //validation de la modal
        if ($.inArray(language, language_possible) != -1){
            $('#content').val($('#content').val()+parsebbcode($('#txt-code').val()));
        } else {
            $('#content').val($('#content').val()+escapeHtml($('#txt-code').val()));
        }
    });

    $('#valider-style').click(function(){ //validation de la modal
        if ($.inArray(style, style_possible) != -1){
            $('#content').val($('#content').val()+parsebbstyle($('#txt-style').val()));
        } else {
            $('#content').val($('#content').val()+escapeHtml($('#txt-style').val()));
        }
    });
    function parsebbstyle(str){ //bbcode pour les deux types d'ajout (style)
        switch (style){
            case 'error':
                str = '[error]' + escapeHtml(str) + '[/error]';
                break;
            case 'underline':
                str = '[underline]' + escapeHtml(str) + '[/underline]';
                break;
            case 'mark':
                str = '[mark]' + escapeHtml(str) + '[/mark]';
                break;
            case 'overline':
                str = '[overline]' + escapeHtml(str) + '[/overline]';
                break;
        }
        return str;
    }
    function parsebbcode(str){ //bbcode pour les deux types d'ajout (code)
        str = '[code='+language+'"]' + escapeHtml(str) + '[/code]';
        return str;
    }
    $('#form-subject').submit(function(e){ //envoie en ajax du formulaire et gestion des erreurs
        var form = $(this);
        e.preventDefault();
        $('#errorTitle').html('');
        $('#Success').html('');
        $('#errorContent').html(``);
        $('#errorTraitement').html('');
        $('#errorDescription').html('');
        $('#errorCategories').html('');
        $.ajax({
            url: form.attr('action'),
            method: form.attr('method'),
            dataType: "json",
            timeout: 4000,
            data: form.serialize()+'&categories='+category,
            success:function(data){
                if(data.success){
                    $('#form-subject').remove();
                    $('#success').html('<p class="alert alert-success">Félicitation, votre article a été posté !</p>')
                }
                if (data.title){
                    $('#errorTitle').html('<p class="alert alert-danger">Le titre doit être entre 5 et 100 caractères</p>');
                }
                if(data.content){
                    $('#errorContent').html(`<p class="alert alert-danger">Le contenu doit être entre 5 et 10 000 caractères</p>`);
                }
                if(data.description){
                    $('#errorDescription').html('<p class="alert alert-danger">La description doit être entre 5 et 100 caractères</p>');
                }
                if(data.category){
                    $('#errorCategories').html('<p class="alert alert-danger">Une ou plusieurs categorie(s) est invalide(s)</p>');
                }
            }, error:function(){

            },
            beforeSend:function(){
                setOverlay();
            },
            complete:function(){
                removeOverlay();
            }
        });
    });
    function escapeHtml(text) { //permet d'echapper les caractères speciaux html
        var map = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
      }
}); 