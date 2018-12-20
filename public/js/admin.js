$(document).ready(function(){
    $('.inputState').change(function(){
        var button = $(this);
        console.log($(this).val());
        $.ajax({
            url: changeStatus,
            method: "POST",
            dataType: "json",
            timeout: 4000,
            data: {
                datastr: $(this).val()
            },
            success:function(data){
                if (data.success){
                    button.parent().children('span').html('<i style="color:green;" class="fas fa-check pl-3"></i>');
                } else {
                    button.parent().children('span').html('<i style="color:red;" class="fas fa-times pl-3"></i>');
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
    });
});