$(document).ready(function(){
    $('#delete-subject').click(function(){
        $.ajax({
            url: apiDeleteSubject,
            method: "POST",
            dataType: 'json',
            timeout: 4000,
            data: {
                subjectId: subjectId
            },
            success:function(data){
                console.log(data);
                
                window.location.assign("../");
            },
            error:function(){
                console.log('error');
            }
        });
    });
    $('.delete-answer').click(function(){
        $.ajax({
            url: apiDeleteAnswer,
            method: "POST",
            dataType: 'json',
            timeout: 4000,
            data: {
                answerId: $(this).attr('id')
            },
            success:function(data){
                console.log(data);
                
                location.reload(true);
            },
            error:function(){
                console.log('error');
            }
        });
    });
    $('.validate-answer').click(function(){
        var id = $(this).attr('id');
        $.ajax({
            url: apiVerifiedAnswer,
            method: "POST",
            dataType: 'json',
            timeout: 4000,
            data: {
                answerId: id,
                subjectId: subjectId
            },
            success:function(data){
                console.log(data);
                if (data.success){
                    $('.answer'+id).addClass('bg-success');
                    location.reload(true);
                }
            },
            error:function(){
                console.log('error');
            }
        });
    });
});