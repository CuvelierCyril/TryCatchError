$(document).ready(function(){
    $('form').submit(function(e){
        e.preventDefault();
        var form = $(this);
        $.ajax({
            url: form.attr('action'),
            method: form.attr('method'),
            dataType: 'json',
            timeout: 4000,
            data: form.serialize()+"&id="+id,
            success:function(data){
                console.log(data);
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