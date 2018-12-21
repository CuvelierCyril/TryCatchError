$(document).ready(function(){

    var button,
        newStatus;

    $('#validateChange').click(function(){

        button = $(this),
        newStatus = button.siblings('select').val();
        $('#triggerAdminModal').click();
    });

    $('#confirmAdminForm').click(function(e){
        e.preventDefault();

        var reason = $('#messageToUser').val();

        if(reason.length > 10 ){
            $('#triggerAdminModal').click();
            $('#view').html('');
            $.ajax({
                url: changeStatus,
                method: "POST",
                dataType: "json",
                timeout: 4000,
                data: {
                    datastr: newStatus,
                    message: reason
                },
                success:function(data){
                    if (data.success){
                        button.siblings('span').html('<i style="color:green;" class="fas fa-check pl-3"> A été changer avec succès</i>');
                    } else {
                        button.siblings('span').html('<i style="color:red;" class="fas fa-times pl-3"></i>');
                    }
                },
                error:function(){
                    button.parent().children('span').html('<i style="color:red;" class="fas fa-times pl-3"></i>');
                },
                beforeSend:function(){
                    setOverlay();
                },
                complete:function(){
                    removeOverlay();
                }
            });
        } else {
            $('#view').html('<p style="color: red;">Veuillez rentrer une raison</p>')
        }
    });
});


