$(document).ready(function(){
    $('#register-form').submit(function(e){
        $('#emailError').html('');
        $('#passwordError').html('');
        $('#divFailed').html('');
        $('#passwordConfirmError').html('');
        $('#nicknameError').html('');
        var form = $(this);
        e.preventDefault();
        $.ajax({
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
                    $('#emailError').html('<span style="color:red;">Format adresse mail invalide</span>');
                }
                if (data.password){
                    $('#passwordError').html('<span style="color:red;">Format mot de passe invalide</span>');
                }
                if (data.passwordConfirm){
                    $('#passwordConfirmError').html('<span style="color:red;">Les mots de passe doivent être identiques</span>');
                }
                if (data.nickname){
                    $('#nicknameError').html('<span style="color:red;">Pseudo invalide</span>');
                }
                if (data.emailExists){
                    $('#emailError').html('<span style="color:red;">Adresse mail déjà utilisé</span>');
                }
                if (data.nicknameExists){
                    $('#nicknameError').html('<span style="color:red;">Pseudo déjà utilisé</span>');
                }
                if(data.recaptcha){
                    $('#recaptchaError').html('<span style="color:red;">Recaptcha invalid</span>');
                }
            },
            error:function(){
                $('#divFailed').html('<span style="color:red;">Erreur lors du traitement des données</span>');
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