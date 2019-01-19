$(document).ready(function(){
    var language;
    var category = [];
    var style;

    $('.btn-category').click(function(e){
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
    $('#selected-style').change(function(){
        style = $(this).val();
    });
    $('#selected-language').change(function(){
        language = $(this).val();
        $('#simulation-code').removeClass();
        $('#simulation-code').text('');
        $('#simulation-code').addClass('language-'+ language);
        $('#simulation-code').text($('#txt-code').val());
        Prism.highlightAll();
    });
    $('#txt-code').keyup(function(){
        $('#simulation-code').text($(this).val());
        Prism.highlightAll();
    });
    $('#valider').click(function(){
        $('#content').val($('#content').val()+parsebbcode($('#txt-code').val()));
    });

    $('#valider-style').click(function(){
        $('#content').val($('#content').val()+parsebbstyle($('#txt-style').val()));
    });
    function parsebbstyle(str){
        switch (style){
            case 'error':
                str = '[error]' + str + '[/error]';
                break;
            case 'underline':
                str = '[underline]' + str + '[/underline]';
                break;
            case 'mark':
                str = '[mark]' + str + '[/mark]';
                break;
            case 'overline':
                str = '[overline]' + str + '[/overline]';
                break;
        }
        return str;
    }
    function parsebbcode(str){
        str = '[code='+language+'"]' + escapeHtml(str) + '[/code]';
        return str;
    }
    $('#form-subject').submit(function(e){
        var form = $(this);
        e.preventDefault();
        $('#errorTitle').html('Titre : ');
        $('#Success').html('');
        $('#errorContent').html(`Contenu du sujet : <button type="button" class="btn btn-color" data-toggle="modal" data-target="#exampleModal">
        Ajouter du code
    </button>`);
        $('#errorTraitement').html('');
        $('#errorDescription').html('Description : ');
        $('#errorCategories').html('Catégories : ');
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
                    $('#errorTitle').html('Titre : <span class="alert alert-danger">Format du titre invalide</span>');
                }
                if(data.content){
                    $('#errorContent').html(`Contenu du sujet : <button type="button" class="btn btn-color" data-toggle="modal" data-target="#exampleModal">
                    Ajouter du code
                </button><span style="color:red;">Format du contenu invalide</span>`);
                }
                if(data.description){
                    $('#errorDescription').html('Description : <span class="alert alert-danger">Format de la description invalide</span>');
                }
                if(data.category){
                    $('#errorCategories').html('Catégories : <span class="alert alert-danger">Une ou plusieurs categorie(s) est invalide(s)</span>');
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
    function escapeHtml(text) {
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