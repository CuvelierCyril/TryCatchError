$(document).ready(function(){
    $('#answer-form').submit(function(e){
        var form = $(this);
        e.preventDefault();
        $('#contentError').html('');
        $.ajax({
            url: form.attr('action'),
            method: form.attr('method'),
            dataType: 'json',
            timeout: 4000,
            data: form.serialize()+'&subjectId='+subjectId,
            success:function(data){
                if (data.success){
                    form.remove();
                    $('#formSuccess').html(`<p class="alert alert-success">Réponse créé</p>`);
                    location.reload(true);
                }
                if (data.content){
                    $('#contentError').html('<p class="alert alert-danger">Contenu invalide</p>');
                }
                if (data.id){
                    $('#divFailed').html('<p class="alert alert-danger">Veuillez rentrer un identifiant valide</p>');
                }
            },
            error:function(){
                $('#divFailed').html('<p class="alert alert-danger">Erreur lors du traitement des donées</p>');
            },
            beforeSend:function(){

            },
            complete:function(){

            }
        });
    });
});