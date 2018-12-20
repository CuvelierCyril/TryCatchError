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
                    $(`<li id="profilBtn" class="nav-item btn-effect text-center">
                    <a class="nav-link text-light" href="` + addBtn[1] + `"><i class="fas fa-user"></i> Déconnexion</a></li>`).insertAfter($('#indexBtn'));
                    $(`<li class="nav-item btn-effect text-center">
                    <a class="nav-link text-light" href="`+ addBtn[0] +`"><i class="far fa-user-circle"></i> Mon compte</a>
                </li>`).insertBefore($('#profilBtn'));
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