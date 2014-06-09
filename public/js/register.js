$(function() {
  var $registerBtn = $('#register-button');
  var $info = $('#info');
  var $name = $('input[name="username"]');
  var $password = $('input[name="password"]');
  $registerBtn.on('click', function(e){
    e.preventDefault();
    var nameLength = $name.val().length;
    var pwLength = $password.val().length;
    if (nameLength >= 4 && pwLength >= 8){
      $info.removeClass();
      $info.html('please wait').addClass('alert alert-info');
      $registerBtn.attr('disabled', 'disabled');
      $.ajax({
        type: 'POST',
        url: '/register',
        data: {username: $name.val(), password: $password.val()},
        dataType: 'json',
        success: function(d){
          if (d.error){
            $info.removeClass();
            $info.html(d.error).addClass('alert alert-danger');
            $registerBtn.removeAttr('disabled');
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
          $registerBtn.removeAttr('disabled');
        }
      });
    } else {
      $info.removeClass();
      $info.html('please make sure your inputs are valid').addClass('alert alert-info');
    }
  });

  $name.on('change keyup', function(e){
    e.preventDefault();
    var length = $name.val().length;
    console.log(length);
    if (length < 4){
      console.log('invalid');
      $name.removeClass('valid').addClass('invalid');
    } else {
      console.log('valid');
      $name.removeClass('invalid').addClass('valid');
    }
  });

  $password.on('change keyup', function(e){
    e.preventDefault();
    var length = $password.val().length;
    console.log(length);
    if (length < 8){
      console.log('invalid');
      $password.removeClass('valid').addClass('invalid');
    } else {
      console.log('valid');
      $password.removeClass('invalid').addClass('valid');
    }
  });


});

