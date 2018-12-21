$(document).ready(function(){
    var language;
    var category = [];
    $('.btn-category').click(function(e){
        e.preventDefault();
        var cat = $(this).val();
        if ($.inArray(cat, category) == -1){
            category.push(cat);
            $(this).removeClass('btn-secondary');
            $(this).addClass('btn-danger');
        } else {
            category = jQuery.grep(category, function(n){
                return n !== cat;
            });
            $(this).removeClass('btn-danger');
            $(this).addClass('btn-secondary');
        }
        console.log(category);
    });
    $('#selected-language').change(function(e){
        language = $(this).val();
        $('#simulation').removeClass();
        $('#simulation').text('');
        $('#simulation').addClass('language-'+ language);
        $('#simulation').text($('#txt').val());
        Prism.highlightAll();
    });
    $('#txt').keyup(function(){
        $('#simulation').text($(this).val());
        Prism.highlightAll();
    });
    $('#valider').click(function(){
        $('#content').val($('#content').val()+parsebbcode($('#txt').val()));
   
    });

    function parsebbcode(str){
        str = '[code='+language+'"]' + escapeHtml(str) + '[/code]';
        return str;
    }
    $('#form-subject').submit(function(e){
        var form = $(this);
        e.preventDefault();
        $('#errorTitle').html('Titre : ');
        $('#Success').html('');
        $('#errorContent').html(`Contenu du sujet : <button type="button" class="btn btn-danger" data-toggle="modal" data-target="#exampleModal">
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
                console.log(data);
                if(data.success){
                    $('#form-subject').remove();
                    $('#success').html('<p class="alert alert-success">Félicitation, votre article a été posté !</p>')
                }
                if (data.title){
                    $('#errorTitle').html('Titre : <span style="color:red;">Format du titre invalide</span>');
                }
                if(data.content){
                    $('#errorContent').html(`Contenu du sujet : <button type="button" class="btn btn-danger" data-toggle="modal" data-target="#exampleModal">
                    Ajouter du code
                </button><span style="color:red;">Format du contenu invalide</span>`);
                }
                if(data.description){
                    $('#errorDescription').html('Description : <span style="color:red;">Format de la description invalide</span>');
                }
                if(data.category){
                    $('#errorCategories').html('Catégories : <span style="color:red;">Une ou plusieurs categorie(s) est invalide(s)</span>');
                }
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