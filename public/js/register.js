function validateForm() {
    var fullName = document.getElementById('fullName').value;
    var email = document.getElementById('email').value;
    var mobile = document.getElementById('mobile').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    var valid = true;

    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach(function (element) {
      element.innerText = '';
    });

    if (!fullName.trim()) {
      document.getElementById('fullNameError').innerText = 'Full Name is required';
      valid = false;
    }

    if (!email.trim()) {
      document.getElementById('emailError').innerText = 'Email Address is required';
      valid = false;
    } else if (!validateEmail(email)) {
      document.getElementById('emailError').innerText = 'Enter a valid email address';
      valid = false;
    }

    if (!mobile.trim()) {
      document.getElementById('mobileError').innerText = 'Mobile Number is required';
      valid = false;
    } else if (!validateMobile(mobile)) {
      document.getElementById('mobileError').innerText = 'Enter a valid mobile number';
      valid = false;
    }

    if (!password.trim()) {
      document.getElementById('passwordError').innerText = 'Password is required';
      valid = false;
    } else if (!validatePassword(password)) {
      document.getElementById('passwordError').innerText = 'Password should be at least 8 characters long and contain at least one letter, one number, and one special character';
      valid = false;
    }

    if (!confirmPassword.trim()) {
      document.getElementById('confirmPasswordError').innerText = 'Confirm Password is required';
      valid = false;
    } else if (password !== confirmPassword) {
      document.getElementById('confirmPasswordError').innerText = 'Passwords do not match';
      valid = false;
    }

    return valid;
  }

  function validateEmail(email) {
    // Regular expression for email validation
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validateMobile(mobile) {
    // Regular expression for mobile number validation
    var regex = /^\d{10}$/;
    return regex.test(mobile);
  }

  function validatePassword(password) {
    // Regular expression for password validation
    var regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
  }