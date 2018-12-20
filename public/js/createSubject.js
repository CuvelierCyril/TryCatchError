$(document).ready(function(){
    var language;
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
        $('#errorTitle').html('');
        $('#Success').html('');
        $('#errorContent').html('');
        $('#errorTraitement').html('');
        $.ajax({
            url: form.attr('action'),
            method: form.attr('method'),
            dataType: "json",
            timeout: 4000,
            data: form.serialize(),
            success:function(data){
                if(data.success){
                    $('form').remove();
                    $('#success').html('<span style="color:green; font-size : 2rem;">Félicitation, votre article est créé !</span>')
                }
                if (data.title){
                    $('#errorTitle').html('<span style="color:red;">Format du titre invalide</span>');
                }
                if(data.content){
                    $('#errorContent').html('<span style="color:red;">Format du contenu invalide</span>');
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