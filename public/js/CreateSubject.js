$(document).ready(function(){
    var value = [];
    $('button').click(function(e){  
        var lang = $(this).attr('value');
        e.preventDefault();
        if($.inArray(lang, value) != -1){
            value = jQuery.grep(value, function(n){
                return n !== lang;
            }); 
        } else {
            value.push(lang);
        }
    });
    $('#createArticle-form').submit(function(e){
        e.preventDefault();
        console.log(value);
        $.ajax({
            url: $(this).attr('action'),
            method: $(this).attr('method'),
            dataType: 'json',
            timeout: 4000,
            data:{
                title: $('#title').val(),
                content: $('#content').val(),
                categories: value
            },
            success:function(data){
                console.log(data);
            }
        });
    });
});

