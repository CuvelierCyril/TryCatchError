$(document).ready(function(){
    $('#FormChangeNickName').submit(function(e){
        var form = $(this);
        e.preventDefault();
        $('.currentname').html("");
        $.ajax({
            url: form.attr('action'),
            method: form.attr('method'),
            dataType: "json",
            timeout: 4000,
            data: form.serialize(),
            success:function(data){
                if (data.success){
                    form.hide();
                    $('.currentname').html('<p class="success alert-success"> Nom Changer ! </p>');
                    $('#nickname').text('Nom d\'utilisateur : '+ form.serialize().substr(9));
                }
                if(data.pregmatchNickName){
                    $('.currentname').html('<p class="alert alert-danger"> Votre nom doit être entre 5, et 500 caractèress ! </p>');
                }
                if(data.sameNickName){
                    $('.currentname').html('<p class="alert alert-danger"> Votre nom ne doit pas être le même que l\'ancien </p>');
                }
                if(data.emptyNickName){
                    $('.currentname').html('<p class="alert alert-danger"> Le champ ne doit pas être vide </p>');
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