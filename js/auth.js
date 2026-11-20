/* ===================================================================
   FixBuddy - Authentication Logic (Signup, Login, Validation)
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  FixBuddyStore.init();

  // Redirect to dashboard if user is already logged in on login or signup pages
  const currentUser = FixBuddyStore.getCurrentUser();
  const isAuthPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('signup.html');
  
  if (currentUser && isAuthPage) {
    // If user clicked directly, redirect them to dashboard
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('force')) {
      window.location.href = 'dashboard.html';
      return;
    }
  }

  // --- SIGNUP LOGIC ---
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      let hasError = false;

      // Full Name Validation
      if (!fullName || fullName.length < 2) {
        showFieldError('fullName', 'Please enter your full name (at least 2 characters).');
        hasError = true;
      } else {
        clearFieldError('fullName');
      }

      // Email Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showFieldError('email', 'Please enter a valid email address.');
        hasError = true;
      } else {
        clearFieldError('email');
      }

      // Password Validation
      if (!password || password.length < 6) {
        showFieldError('password', 'Password must be at least 6 characters.');
        hasError = true;
      } else {
        clearFieldError('password');
      }

      // Confirm Password
      if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Passwords do not match.');
        hasError = true;
      } else {
        clearFieldError('confirmPassword');
      }

      if (hasError) return;

      // Check if user already exists
      const existingUser = FixBuddyStore.findUserByEmail(email);
      if (existingUser) {
        showFieldError('email', 'An account with this email address already exists.');
        return;
      }

      // Create new user object
      const newUser = {
        id: 'usr_' + Date.now(),
        name: fullName,
        email: email,
        password: password,
        skillLevel: 'Beginner',
        avatarText: fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        createdAt: new Date().toISOString()
      };

      FixBuddyStore.saveUser(newUser);
      FixBuddyStore.setCurrentUser(newUser);

      showToast('Account created successfully! Welcome to FixBuddy.', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    });
  }

  // --- LOGIN LOGIC ---
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    // Quick Demo Fill Button
    const demoQuickBtn = document.getElementById('demoQuickBtn');
    if (demoQuickBtn) {
      demoQuickBtn.addEventListener('click', () => {
        document.getElementById('email').value = 'demo@fixbuddy.com';
        document.getElementById('password').value = 'password123';
        showToast('Demo credentials autofilled!', 'info');
      });
    }

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('rememberMe') ? document.getElementById('rememberMe').checked : false;

      let hasError = false;

      if (!email) {
        showFieldError('email', 'Email address is required.');
        hasError = true;
      } else {
        clearFieldError('email');
      }

      if (!password) {
        showFieldError('password', 'Password is required.');
        hasError = true;
      } else {
        clearFieldError('password');
      }

      if (hasError) return;

      // Find user
      const user = FixBuddyStore.findUserByEmail(email);
      if (!user || user.password !== password) {
        const errorAlert = document.getElementById('loginErrorAlert');
        if (errorAlert) {
          errorAlert.style.display = 'flex';
          errorAlert.textContent = 'Invalid email or password. Please try again or use the Demo button.';
        }
        return;
      }

      // Successful login
      FixBuddyStore.setCurrentUser(user, rememberMe);
      showToast(`Welcome back, ${user.name}!`, 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    });
  }

  // Toggle Password Visibility
  const togglePassBtns = document.querySelectorAll('.toggle-password-btn');
  togglePassBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.textContent = '👁️‍🗨️';
        } else {
          input.type = 'password';
          btn.textContent = '👁️';
        }
      }
    });
  });

  // Forgot Password Modal
  const forgotPwLink = document.getElementById('forgotPasswordLink');
  const forgotPwModal = document.getElementById('forgotPasswordModal');
  const closeForgotModal = document.getElementById('closeForgotModal');
  const forgotPwForm = document.getElementById('forgotPasswordForm');

  if (forgotPwLink && forgotPwModal) {
    forgotPwLink.addEventListener('click', (e) => {
      e.preventDefault();
      forgotPwModal.classList.add('active');
    });

    if (closeForgotModal) {
      closeForgotModal.addEventListener('click', () => {
        forgotPwModal.classList.remove('active');
      });
    }

    if (forgotPwForm) {
      forgotPwForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const resetEmail = document.getElementById('resetEmail').value.trim();
        if (!resetEmail) return;
        showToast(`Reset instructions sent to ${resetEmail} (simulated).`, 'success');
        forgotPwModal.classList.remove('active');
      });
    }
  }
});

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add('is-invalid');
  const feedback = field.parentElement.querySelector('.invalid-feedback');
  if (feedback) {
    feedback.textContent = message;
    feedback.style.display = 'block';
  }
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove('is-invalid');
  const feedback = field.parentElement.querySelector('.invalid-feedback');
  if (feedback) {
    feedback.style.display = 'none';
  }
}
