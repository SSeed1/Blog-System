$('#register-button').click(
    function(event){
        event.preventDefault();

        Boolean (error) == false;

        if($('#name').val()===''){
            $('#name').addClass('is-invalid');
            error = true;
        } else {
            $('#name').removeClass('is-invalid');
        }

        if($('#email').val()===''){
            $('#email').addClass('is-invalid');
            error = true;
        } else {
            $('#email').removeClass('is-invalid');
        }

        if($('#password').val()===''){
            $('#password').addClass('is-invalid');
            error = true;
        } else {
            $('#password').removeClass('is-invalid');
        }

        if(($('#password-repeat').val() === '') || ($('#password-repeat').val() !== $('#password').val())){
            $('#password-repeat').addClass('is-invalid');
            error = true;
        } else {
            $('#password-repeat').removeClass('is-invalid');
        }

        if(!error){
            $('#register-form').submit();
        }
    }
)