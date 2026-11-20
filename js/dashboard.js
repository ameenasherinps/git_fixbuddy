/* ===================================================================
   FixBuddy - Dashboard Logic (Module 4)
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  FixBuddyStore.init();

  // Enforce auth or use guest demo user
  let currentUser = FixBuddyStore.getCurrentUser();
  if (!currentUser) {
    // If not logged in, auto-login with demo user so dashboard is immediately visible & fully functional
    const demoUser = FixBuddyStore.findUserByEmail('demo@fixbuddy.com');
    if (demoUser) {
      FixBuddyStore.setCurrentUser(demoUser);
      currentUser = FixBuddyStore.getCurrentUser();
    }
  }

  // Populate User Information in Sidebar and Header
  const userNameEl = document.getElementById('dashUserName');
  const userEmailEl = document.getElementById('dashUserEmail');
  const userAvatarEl = document.getElementById('dashUserAvatar');
  const welcomeNameEl = document.getElementById('welcomeUserName');

  if (currentUser) {
    const firstName = currentUser.name.split(' ')[0];
    if (userNameEl) userNameEl.textContent = currentUser.name;
    if (userEmailEl) userEmailEl.textContent = currentUser.email;
    if (welcomeNameEl) welcomeNameEl.textContent = firstName;
    if (userAvatarEl) {
      const initials = currentUser.avatarText || currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      userAvatarEl.textContent = initials;
    }
  }

  // Render Metrics & Recent Activity
  renderDashboardData();

  // Sidebar Logout
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener('click', () => {
      FixBuddyStore.logout();
    });
  }
});

function renderDashboardData() {
  const repairs = FixBuddyStore.getRepairs();

  const totalRepairsEl = document.getElementById('metricTotalRepairs');
  const inProgressEl = document.getElementById('metricInProgress');
  const resolvedEl = document.getElementById('metricResolved');
  const estimatedSavingsEl = document.getElementById('metricSavings');

  const total = repairs.length;
  const inProgress = repairs.filter(r => r.status === 'In Progress').length;
  const resolved = repairs.filter(r => r.status === 'Resolved').length;
  const savings = resolved * 125 + inProgress * 45; // Simulated savings calculator

  if (totalRepairsEl) totalRepairsEl.textContent = total;
  if (inProgressEl) inProgressEl.textContent = inProgress;
  if (resolvedEl) resolvedEl.textContent = resolved;
  if (estimatedSavingsEl) estimatedSavingsEl.textContent = `$${savings}`;

  // Render Recent Activity List
  const recentTableBody = document.getElementById('recentRepairsBody');
  const emptyStateEl = document.getElementById('dashEmptyState');

  if (recentTableBody) {
    if (repairs.length === 0) {
      recentTableBody.innerHTML = '';
      if (emptyStateEl) emptyStateEl.style.display = 'flex';
      return;
    }

    if (emptyStateEl) emptyStateEl.style.display = 'none';

    // Show top 5 recent repairs
    const recent = repairs.slice(0, 5);
    recentTableBody.innerHTML = recent.map(repair => {
      const dateFormatted = new Date(repair.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const statusBadgeClass = repair.status === 'Resolved' ? 'badge-success' : 'badge-warning';
      const categoryIcon = getCategoryEmoji(repair.category);

      return `
        <tr>
          <td>
            <div class="device-cell">
              <div class="device-thumb">
                ${repair.imageUrl ? `<img src="${repair.imageUrl}" alt="Device">` : categoryIcon}
              </div>
              <div class="device-meta">
                <span class="device-name">${escapeHtml(repair.deviceName || repair.category)}</span>
                <span class="device-category">${escapeHtml(repair.category)}</span>
              </div>
            </div>
          </td>
          <td style="max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${escapeHtml(repair.problemDescription)}
          </td>
          <td>${dateFormatted}</td>
          <td><span class="badge ${statusBadgeClass}">${repair.status}</span></td>
          <td>
            <div class="table-actions">
              <button class="btn btn-outline btn-sm" onclick="viewRepairSolution('${repair.id}')">View Guide</button>
              <button class="btn btn-ghost btn-sm" onclick="openRepairChat('${repair.id}')" title="Ask Questions">💬</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }
}

function getCategoryEmoji(cat) {
  switch (cat) {
    case 'Mobile Phone': return '📱';
    case 'Laptop': return '💻';
    case 'Television': return '📺';
    case 'Refrigerator': return '🧊';
    case 'Washing Machine': return '🧺';
    default: return '⚡';
  }
}

function viewRepairSolution(id) {
  FixBuddyStore.setActiveRepairId(id);
  window.location.href = `solution.html?id=${id}`;
}

function openRepairChat(id) {
  FixBuddyStore.setActiveRepairId(id);
  window.location.href = `chat.html?id=${id}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
