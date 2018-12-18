$(document).ready(function(){
    $('#login-form').submit(function(e){
        var form = $(this);
        e.preventDefault();
        $.ajax({
            url: form.attr('action'),
            method: form.attr('method'),
            dataType: 'json',
            timeout: 4000,
            data: form.serialize(),
            success:function(data){
                if (data.success){
                    form.remove();
                    $('.toremove').remove();
                    $('#formSuccess').html(`<p style="color : green;">Connexion réussie, bienvenue !</p>`);
                    $(`<li class="nav-item" id="btn0"><a class="nav-link" href="` + addBtn[0] + `">Profile</a></li>`).insertAfter('#ancre-login');
                    $(`<li class="nav-item"><a class="nav-link" href="` + addBtn[1] + `">Déconnexion</a></li>`).insertAfter('#btn0');
                }
                if (data.email){
                    $('#emailError').html('<span style="color:red;">Format adresse mail invalide</span>');
                }
                if (data.password){
                    $('#passwordError').html('<span style="color:red;">Format mot de passe invalide</span>');
                }
                if (data.emailDoesntExist){
                    $('#emailError').html('<span style="color:red;">Adresse mail inexistante</span>');
                }
                if (data.passwordInvalid){
                    $('#divFailed').html('<span style="color:red;">Adresse et/ou mot de passe incorrect</span>');
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