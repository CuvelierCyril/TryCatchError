$(document).ready(function(){
    var reason = '';
    var button,
        newStatus;

    $('.validateChange').click(function(){

        button = $(this),
        newStatus = button.siblings('select').val();
        if (newStatus.substr(-1) != 0){
            $('#triggerAdminModal').click();
        } else {
            $.ajax({
                url: changeStatus,
                method: "POST",
                dataType: "json",
                timeout: 4000,
                data: {
                    datastr: newStatus,
                    message: reason,
                },
                success:function(data){
                    if (data.success){
                        button.siblings('span').html('<i style="color:green;" class="fas fa-check pl-3"> A été changer avec succès</i>');
                        reason = '';
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
        }
    });

    $('#confirmAdminForm').click(function(e){
        e.preventDefault();
        reason = $('#messageToUser').val();

        if(reason.length > 3){
            $('#triggerAdminModal').click();
            $('#view').html('');
            $.ajax({
                url: changeStatus,
                method: "POST",
                dataType: "json",
                timeout: 4000,
                data: {
                    datastr: newStatus,
                    message: reason,
                    duration: $('input[name="contact"]:checked').val()
                },
                success:function(data){
                    if (data.success){
                        button.siblings('span').html('<i style="color:green;" class="fas fa-check pl-3"> A été changer avec succès</i>');
                        reason = '';
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
            $('#view').html('<p style="color: red;">Veuillez rentrer une raison</p>');
        }
    });
});


