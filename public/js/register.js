$(document).ready(function(){
    $('#register-form').submit(function(e){
        $('#emailError').html('');
        $('#passwordError').html('');
        $('#divFailed').html('');
        $('#passwordConfirmError').html('');
        $('#nicknameError').html('');
        $('#recaptchaError').removeClass('alert alert-danger');
        $('#recaptchaError').text('');
        var form = $(this);
        e.preventDefault();
        console.log($('#register-form-password').val());
        $.ajax({ //envoie du formulaire en ajax et gestion des erreurs
            url: form.attr('action'),
            method: form.attr('method'),
            dataType: 'json',
            timeout: 4000,
            data: form.serialize(),
            success:function(data){
                console.log(data);
                if (data.success){
                    form.remove();
                    $('#formSuccess').html('<p class="alert alert-success">Compte crée, un email vous a été envoyé afin d\'activer votre compte !</p>');
                } else {
                    grecaptcha.reset();
                }
                if (data.email){
                    $('#emailError').html('<p class="alert alert-danger col-12"">Format adresse mail invalide</p>');
                }
                if (data.password){
                    $('#passwordError').html('<p class="alert alert-danger col-12"">Format mot de passe invalide</p>');
                }
                if (data.passwordConfirm){
                    $('#passwordConfirmError').html('<p class="alert alert-danger col-12">Les mots de passe doivent être identiques</p>');
                }
                if (data.nickname){
                    $('#nicknameError').html('<p class="alert alert-danger col-12">Pseudo invalide</p>');
                }
                if (data.emailExists){
                    $('#emailError').html('<p class="alert alert-danger col-12"">Adresse mail déjà utilisé</p>');
                }
                if (data.nicknameExists){
                    $('#nicknameError').html('<p class="alert alert-danger col-12">Pseudo déjà utilisé</p>');
                }
                if(data.recaptcha){
                    $('#recaptchaError').text('Recaptcha invalid');
                    $('#recaptchaError').addClass('alert alert-danger');
                }
            },
            error:function(){
                $('#divFailed').html('<p class="alert alert-danger col-6 offset-3">Erreur lors du traitement des données</p>');
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