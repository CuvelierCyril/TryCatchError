$(document).ready(function(){
    $('form').submit(function(e){
        e.preventDefault();
        var form = $(this);
        $.ajax({ //envoie du formulaire en ajax et gestion des erreurs
            url: form.attr('action'),
            method: form.attr('method'),
            dataType: 'json',
            timeout: 4000,
            data: form.serialize()+"&id="+id,
            success:function(data){
                if(data.passwordSameCurrent){
                    $('.SamePassword').html('<p class="alert alert-danger"> Le mot de passe doit être différent de l\'ancien </p>');
                }
                if(data.passIncorrect){
                    $('.SamePassword').html('<p class="alert alert-danger"> Votre mot de passe doit être en 5 et 300 caractères </p>');
                }
                if(data.passDiff){
                    $('.SamePassword').html('<p class="alert alert-danger"> Les mot de passe sont différent !</p>');
                }
                if(data.success){
                    form.hide();
                    $('.PasswordChanged').html('<p class="alert alert-success text-center col-6 offset-3 mt-3"> Votre mot de passe à bien été changer </p>');
                }
            },
            error:function(){

            },
            beforeSend:function(){
                setOverlay();
            },
            complete:function(){
                removeOverlay();
            }
        });
    });
});