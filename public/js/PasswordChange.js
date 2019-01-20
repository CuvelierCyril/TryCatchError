$(document).ready(function(){
    $('#FormChangePassword').submit(function(e){
        var form = $(this);
        e.preventDefault();
        $('.currentpass').html("");
        $('.newpassword').html("");
        $.ajax({ //envoie du formulaire en ajax et gestion des erreurs
            url: form.attr('action'),
            method: form.attr('method'),
            dataType: "json",
            timeout: 4000,
            data: form.serialize(),
            success:function(data){
                console.log(data);
                if (data.success){
                    form.hide();
                    $('.message').html('<p class="success alert-success"> votre mot de passse à bien été changer ! </p>');
                }
                if(data.emptypassword){
                    $('.currentpass').html('<p class="alert alert-danger"> Veuillez remplir tous les champs </p>');
                }
                if(data.passwordhash){
                    $('.currentpass').html('<p class="alert alert-danger"> Le mot de passe est incorrect </p>');
                }
                if(data.newPassPregMatch){
                    $('.newpassword').html('<p class="alert alert-danger"> Votre mot de passe doit être entre 5 et 300 caractères </p>');  
                }
                if(data.newpass){ 
                    $('.newpassword').html('<p class="alert alert-danger"> Les mot de passes sont différent </p>');
                }
                if(data.CurrentPass){   
                    $('.newpassword').html('<p class="alert alert-danger"> L\'ancien et le nouveau mot de passe doivent être différent ! </p>');
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

