$(function() {
  var $loginBtn = $('#login-button');
  var $info = $('#info');
  var $name = $('input[name="username"]');
  var $password = $('input[name="password"]');
  $loginBtn.on('click', function(e){
    e.preventDefault();
    $info.removeClass();
    $info.html('please wait').addClass('alert alert-info');
    $.ajax({
      type: 'POST',
      url: '/login',
      data: {username: $name.val(), password: $password.val()},
      dataType: 'json',
      success: function(d){
        if (d.error){
          $info.removeClass();
          $info.html(d.error).addClass('alert alert-danger');
        } else {
          console.log(d);
          $info.removeClass();
          $info.html('success').addClass('alert alert-success');
          $(location).attr('href','/');
        }
      },
      error: function(e){
        $info.removeClass();
        $info.html(e.responseText).addClass('alert alert-danger');
      }
    });
  });

});

