/* ===================================================================
   FixBuddy - Profile and Settings Logic (Module 9)
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  FixBuddyStore.init();

  let currentUser = FixBuddyStore.getCurrentUser();
  if (!currentUser) {
    const demoUser = FixBuddyStore.findUserByEmail('demo@fixbuddy.com');
    if (demoUser) {
      FixBuddyStore.setCurrentUser(demoUser);
      currentUser = FixBuddyStore.getCurrentUser();
    }
  }

  // Populate Profile Information
  const nameEl = document.getElementById('profileCardName');
  const emailEl = document.getElementById('profileCardEmail');
  const avatarEl = document.getElementById('profileBigAvatar');
  const skillBadgeEl = document.getElementById('profileSkillBadge');
  const memberSinceEl = document.getElementById('profileMemberSince');
  const repairsCountEl = document.getElementById('profileRepairsCount');
  const savingsCountEl = document.getElementById('profileSavingsCount');

  const inputName = document.getElementById('profileFullName');
  const inputEmail = document.getElementById('profileEmail');
  const selectSkill = document.getElementById('profileSkillLevel');

  const allRepairs = FixBuddyStore.getRepairs();
  const resolved = allRepairs.filter(r => r.status === 'Resolved').length;
  const inProgress = allRepairs.filter(r => r.status === 'In Progress').length;
  const savings = resolved * 125 + inProgress * 45;

  if (currentUser) {
    const initials = currentUser.avatarText || currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    if (nameEl) nameEl.textContent = currentUser.name;
    if (emailEl) emailEl.textContent = currentUser.email;
    if (avatarEl) avatarEl.textContent = initials;
    if (skillBadgeEl) skillBadgeEl.textContent = currentUser.skillLevel || 'DIY Enthusiast';
    if (memberSinceEl) memberSinceEl.textContent = currentUser.joinedDate || 'November 2026';
    if (repairsCountEl) repairsCountEl.textContent = allRepairs.length;
    if (savingsCountEl) savingsCountEl.textContent = `$${savings}`;

    if (inputName) inputName.value = currentUser.name;
    if (inputEmail) inputEmail.value = currentUser.email;
    if (selectSkill && currentUser.skillLevel) selectSkill.value = currentUser.skillLevel;
  }

  // Handle Edit Profile Form
  const editProfileForm = document.getElementById('editProfileForm');
  if (editProfileForm) {
    editProfileForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const newName = inputName.value.trim();
      const newEmail = inputEmail.value.trim();
      const newSkill = selectSkill.value;

      if (!newName || newName.length < 2) {
        showToast('Please enter a valid full name.', 'warning');
        return;
      }

      if (!newEmail || !newEmail.includes('@')) {
        showToast('Please enter a valid email address.', 'warning');
        return;
      }

      currentUser.name = newName;
      currentUser.email = newEmail;
      currentUser.skillLevel = newSkill;
      currentUser.avatarText = newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

      FixBuddyStore.saveUser(currentUser);
      FixBuddyStore.setCurrentUser(currentUser);

      showToast('Profile information updated successfully!', 'success');
      setTimeout(() => location.reload(), 600);
    });
  }

  // Handle Change Password Form
  const changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const curPass = document.getElementById('currentPassword').value;
      const newPass = document.getElementById('newPassword').value;
      const confPass = document.getElementById('confirmNewPassword').value;

      const fullUser = FixBuddyStore.findUserByEmail(currentUser.email);

      if (fullUser && fullUser.password && fullUser.password !== curPass) {
        showToast('Current password does not match.', 'danger');
        return;
      }

      if (newPass.length < 6) {
        showToast('New password must be at least 6 characters.', 'warning');
        return;
      }

      if (newPass !== confPass) {
        showToast('New password confirmation does not match.', 'warning');
        return;
      }

      fullUser.password = newPass;
      FixBuddyStore.saveUser(fullUser);
      showToast('Password updated successfully!', 'success');

      changePasswordForm.reset();
    });
  }

  // Logout Button
  const profileLogoutBtn = document.getElementById('profileLogoutBtn');
  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener('click', () => {
      FixBuddyStore.logout();
    });
  }

  // Reset Demo Data
  const resetDemoBtn = document.getElementById('resetDemoDataBtn');
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener('click', () => {
      FixBuddyStore.seedInitialRepairs();
      showToast('Demo repair tickets restored to initial state!', 'info');
      setTimeout(() => location.reload(), 600);
    });
  }

  // Clear All Data
  const clearAllDataBtn = document.getElementById('clearAllDataBtn');
  if (clearAllDataBtn) {
    clearAllDataBtn.addEventListener('click', () => {
      if (confirm('Clear all locally saved repairs and users? You will be redirected to the landing page.')) {
        localStorage.clear();
        window.location.href = 'index.html';
      }
    });
  }
});
