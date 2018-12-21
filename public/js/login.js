$(document).ready(function(){
    $('#login-form').submit(function(e){
        $('#emailError').html('');
        $('#passwordError').html('');
        $('#divFailed').html('');
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
                    $('.toremove').remove();
                    $('#formSuccess').html(`<p class="alert alert-success">Connexion réussie, bienvenue !</p>`);
                    $(`<li id="profilBtn" class="nav-item btn-effect text-center">
                    <a class="nav-link text-light" href="`+ addBtn[0] +`"><i class="far fa-user-circle"></i> Mon compte</a>
                    </li>`).insertAfter($('#subjectsBtn'));
                    $(`<li id="createBtn" class="nav-item btn-effect text-center">
                        <a class="nav-link text-light" href="`+ addBtn[1] +`"><i class="fas fa-pen-fancy"></i> Créer un sujet</a>
                    </li>`).insertAfter($('#profilBtn'));
                    if (data.rank == 2){
                        $(`<li id="adminBtn" class="nav-item btn-effect text-center">
                        <a class="nav-link text-light" href="`+ addBtn[3] +`"><i class="fas fa-tools"></i> Administration
                        </li>`).insertAfter($('#createBtn'));
                        $(`<li class="nav-item btn-effect text-center">
                        <a class="nav-link text-light" href="`+ addBtn[2] +`"><i class="fas fa-user"></i> Déconnexion</a>
                        </li>`).insertAfter($('#adminBtn'));
                    } else {
                        $(`<li class="nav-item btn-effect text-center">
                        <a class="nav-link text-light" href="`+ addBtn[2] +`"><i class="fas fa-user"></i> Déconnexion</a>
                        </li>`).insertAfter($('#createBtn'));
                    }
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
                if(data.notActive){
                    $('#divFailed').html('<span style="color:red;">Votre compte n\'est pas actif. <br><button class="btn btn-danger">Renvoyer un mail</button></span>');
                }
                if (data.passwordInvalid){
                    $('#divFailed').html('<span style="color:red;">Adresse et/ou mot de passe incorrect</span>');
                }
            },
            error:function(){
                $('#divFailed').html('<span style="color:red;">Erreur lors du traitement des donées</span>');
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