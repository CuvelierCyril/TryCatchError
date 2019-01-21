$(document).ready(function(){
    $('#login-form').submit(function(e){
        $('#emailError').html('');
        $('#passwordError').html('');
        $('#divFailed').html('');
        var form = $(this);
        e.preventDefault();
        $.ajax({ //envoie du formulaire en ajax et gestion des erreurs
            url: form.attr('action'),
            method: form.attr('method'),
            dataType: 'json',
            timeout: 4000,
            data: form.serialize(),
            success:function(data){
                if (data.success){
                    form.remove();
                    $('.toremove').remove();
                    $('#formSuccess').html(`<p class="alert alert-success col-6 offset-3">Connexion réussie, bienvenue !</p>`);
                    $(`<li id="profilBtn" class="nav-item btn-effect text-center">
                    <a class="nav-link text-light" href="`+ addBtn[0] +`"><i class="far fa-user-circle"></i> Mon compte</a>
                    </li>`).insertAfter($('#subjectsBtn'));
                    $(`<li id="createBtn" class="nav-item btn-effect text-center">
                        <a class="nav-link text-light" href="`+ addBtn[1] +`"><i class="fas fa-pen-fancy"></i> Créer un sujet</a>
                    </li>`).insertAfter($('#profilBtn'));
                    if (data.status > 0){
                        $('body').append(`<div class="modal fade" id="modalWarning" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                          <div class="modal-content">
                            <div class="modal-header modal-title-color">
                              <h5 class="modal-title" id="exampleModalLabel">Avertissement : </h5>
                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                              </button>
                            </div>
                            <div class="modal-body">
                            `+ data.warning +`
                            </div>
                            <div class="modal-footer">
                              <button type="button" class="btn btn-color" data-dismiss="modal">Fermer</button>
                            </div>
                          </div>
                        </div>
                      </div>`)
                        $('#modalWarning').modal();
                    }
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
                    $('#emailError').html('<p class="alert alert-danger">Format adresse mail invalide</p>');
                }
                if (data.password){
                    $('#passwordError').html('<p class="alert alert-danger">Format mot de passe invalide</p>');
                }
                if (data.emailDoesntExist){
                    $('#emailError').html('<p class="alert alert-danger">Adresse mail inexistante</p>');
                }
                if(data.notActive){
                    $('#divFailed').html('<p class="alert alert-danger">Votre compte n\'est pas actif. <br><button id="renvoi-mail" class="btn btn-danger">Renvoyer un mail</button></p>');
                    $('#renvoi-mail').click(function(e){
                        e.preventDefault();
                        $.ajax({ //envoie du formulaire en ajax et gestion des erreurs
                            url: rout_mail,
                            method: "POST",
                            dataType: 'json',
                            timeout: 4000,
                            data: {
                                email: $('#register-form-email').val(),
                            },
                            success:function(data){
                                console.log(data);
                                if (data.success){
                                    $('#divFailed').html('<p class="success alert-success">Un mail vous a été envoyé</p>');
                                }
                                if (data.noEmail){
                                    $('#divFailed').html('<p class="alert alert-danger">L\'email est inexistant</p>');
                                }
                            },
                            error:function(){
                                $('#divFailed').html('<p class="alert alert-danger">Erreur lors du traitement des données</p>');
                            },
                            beforeSend:function(){
                                setOverlay();
                            },
                            complete:function(){
                                removeOverlay();
                            }
                        });
                    });
                }
                if (data.passwordInvalid){
                    $('#emailError').html('<p class="alert alert-danger">Adresse et/ou mot de passe incorrect</p>');
                }
            },
            error:function(){
                $('#divFailed').html('<p class="alert alert-danger">Erreur lors du traitement des données</p>');
            },
            beforeSend:function(){
                setOverlay();
            },
            complete:function(){
                removeOverlay();
            }
        });
    });

    $('#reset_password').click(function(e){
        e.preventDefault();
        $('#modalResetPassword').modal();
        $('#btnResetPassword').click(function(e){
            var form = $('#formResetPassword');
            e.preventDefault();
            $.ajax({
                url: form.attr('action'),
                method: form.attr('method'),
                dataType: 'json',
                timeout: 4000,
                data: form.serialize(),
                success:function(data){
                    console.log(data);
                    if(data.noUser){
                        $('.NoAcccount').html("<p class='alert alert-danger'>Aucun compte n'a été trouvé avec cet e-mail </p>");
                    }
                    if(data.success){
                        form.hide();
                        $('.ResetMdp').html("<p class='alert alert-success'>Un email vous a été envoyé</p>");
                        $('#btnResetPassword').hide();                    }
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
});