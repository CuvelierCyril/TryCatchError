$(document).ready(function(){
    $('#delete-subject').click(function(){
        $.ajax({ //envoie du formulaire en ajax et gestion des erreurs
            url: apiDeleteSubject,
            method: "POST",
            dataType: 'json',
            timeout: 4000,
            data: {
                subjectId: subjectId
            },
            success:function(data){
                window.location.assign("../");
            }
        });
    });
    $('.delete-answer').click(function(){
        $.ajax({ //envoie du formulaire en ajax et gestion des erreurs
            url: apiDeleteAnswer,
            method: "POST",
            dataType: 'json',
            timeout: 4000,
            data: {
                answerId: $(this).attr('id')
            },
            success:function(data){
                location.reload(true);
            }
        });
    });
    $('.validate-answer').click(function(){
        var id = $(this).attr('id');
        $.ajax({ //envoie du formulaire en ajax et gestion des erreurs
            url: apiVerifiedAnswer,
            method: "POST",
            dataType: 'json',
            timeout: 4000,
            data: {
                answerId: id,
                subjectId: subjectId
            },
            success:function(data){
                if (data.success){
                    $('.answer'+id).addClass('bg-success');
                    location.reload(true);
                }
            }
        });
    });
    $('.annulate-answer').click(function(){
        var id = $(this).attr('id');
        $.ajax({ //envoie du formulaire en ajax et gestion des erreurs
            url: apiAnnulateAnswer,
            method: "POST",
            dataType: 'json',
            timeout: 4000,
            data: {
                answerId: id
            },
            success:function(data){
                if (data.success){
                    $('.answer'+id).removeClass('bg-success');
                    location.reload(true);
                }
            }
        });
    });
});