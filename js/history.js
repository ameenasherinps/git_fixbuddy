/* ===================================================================
   FixBuddy - Repair History Logic (Module 8)
   =================================================================== */

let repairToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
  FixBuddyStore.init();

  renderHistory();

  // Search Input Filter
  const searchInput = document.getElementById('historySearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderHistory();
    });
  }

  // Category & Status Select Filters
  const categoryFilter = document.getElementById('historyCategoryFilter');
  const statusFilter = document.getElementById('historyStatusFilter');

  if (categoryFilter) categoryFilter.addEventListener('change', renderHistory);
  if (statusFilter) statusFilter.addEventListener('change', renderHistory);

  // Delete Confirmation Modal
  const deleteModal = document.getElementById('deleteConfirmModal');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  if (cancelDeleteBtn && deleteModal) {
    cancelDeleteBtn.addEventListener('click', () => {
      deleteModal.classList.remove('active');
      repairToDeleteId = null;
    });
  }

  if (confirmDeleteBtn && deleteModal) {
    confirmDeleteBtn.addEventListener('click', () => {
      if (repairToDeleteId) {
        FixBuddyStore.deleteRepair(repairToDeleteId);
        showToast('Repair ticket removed from history.', 'info');
        deleteModal.classList.remove('active');
        repairToDeleteId = null;
        renderHistory();
      }
    });
  }
});

function renderHistory() {
  const allRepairs = FixBuddyStore.getRepairs();
  const searchInput = document.getElementById('historySearchInput');
  const categoryFilter = document.getElementById('historyCategoryFilter');
  const statusFilter = document.getElementById('historyStatusFilter');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedCat = categoryFilter ? categoryFilter.value : 'all';
  const selectedStatus = statusFilter ? statusFilter.value : 'all';

  // Filter
  const filtered = allRepairs.filter(r => {
    const matchesQuery = !query || 
      (r.deviceName && r.deviceName.toLowerCase().includes(query)) ||
      (r.problemDescription && r.problemDescription.toLowerCase().includes(query)) ||
      (r.identifiedProblem && r.identifiedProblem.toLowerCase().includes(query));

    const matchesCat = selectedCat === 'all' || r.category === selectedCat;
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;

    return matchesQuery && matchesCat && matchesStatus;
  });

  const tableBody = document.getElementById('historyTableBody');
  const emptyState = document.getElementById('historyEmptyState');
  const totalCountEl = document.getElementById('historyTotalCount');

  if (totalCountEl) totalCountEl.textContent = `${filtered.length} ticket${filtered.length === 1 ? '' : 's'}`;

  if (!tableBody) return;

  if (filtered.length === 0) {
    tableBody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tableBody.innerHTML = filtered.map(repair => {
    const dateFormatted = new Date(repair.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const statusBadgeClass = repair.status === 'Resolved' ? 'badge-success' : 'badge-warning';
    const catIcon = getCategoryEmoji(repair.category);

    return `
      <tr>
        <td>
          <div class="device-cell">
            <div class="device-thumb">
              ${repair.imageUrl ? `<img src="${repair.imageUrl}" alt="Device">` : catIcon}
            </div>
            <div class="device-meta">
              <span class="device-name">${escapeHtml(repair.deviceName || repair.category)}</span>
              <span class="device-category">${escapeHtml(repair.category)}</span>
            </div>
          </div>
        </td>
        <td style="max-width: 250px;">
          <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 2px;">${escapeHtml(repair.identifiedProblem)}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(repair.problemDescription)}</div>
        </td>
        <td>
          <span class="badge ${statusBadgeClass}">${repair.status}</span>
        </td>
        <td>${dateFormatted}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-primary btn-sm" onclick="viewRepairSolution('${repair.id}')">View Guide</button>
            <button class="btn btn-outline btn-sm" onclick="openRepairChat('${repair.id}')" title="Follow-up Chat">💬 Chat</button>
            <button class="btn btn-ghost btn-sm text-danger" onclick="promptDeleteRepair('${repair.id}')" title="Delete Ticket">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function promptDeleteRepair(id) {
  window.repairToDeleteId = id;
  const modal = document.getElementById('deleteConfirmModal');
  if (modal) modal.classList.add('active');
}

function viewRepairSolution(id) {
  FixBuddyStore.setActiveRepairId(id);
  window.location.href = `solution.html?id=${id}`;
}

function openRepairChat(id) {
  FixBuddyStore.setActiveRepairId(id);
  window.location.href = `chat.html?id=${id}`;
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

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
