$(document).ready(function(){
    $('#answer-form').submit(function(e){
        var form = $(this);
        e.preventDefault();
        $.ajax({
            url: form.attr('action'),
            method: form.attr('method'),
            dataType: 'json',
            timeout: 4000,
            data: form.serialize()+'&subjectId='+subjectId,
            success:function(data){
                if (data.success){
                    form.remove();
                    $('#formSuccess').html(`<p style="color : green;">Réponse créé</p>`);
                    location.reload(true);
                }
                if (data.content){
                    $('#contentError').html('<span style="color:red;">Contenu invalide</span>');
                }
                if (data.id){
                    $('#divFailed').html('<span style="color:red;">Veuillez rentrer un identifiant valide</span>');
                }
            },
            error:function(){
                $('#divFailed').html('<span style="color:red;">Erreur lors du traitement des donées</span>');
            },
            beforeSend:function(){

            },
            complete:function(){

            }
        });
    });
});