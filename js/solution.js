/* ===================================================================
   FixBuddy - AI Repair Solution Logic (Module 6)
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  FixBuddyStore.init();

  // Retrieve current active repair
  const urlParams = new URLSearchParams(window.location.search);
  let repairId = urlParams.get('id') || FixBuddyStore.getActiveRepairId();

  let repair = FixBuddyStore.getRepairById(repairId);

  // If no repair found, grab the most recent one
  if (!repair) {
    const all = FixBuddyStore.getRepairs();
    if (all.length > 0) {
      repair = all[0];
      repairId = repair.id;
    }
  }

  if (!repair) {
    window.location.href = 'repair.html';
    return;
  }

  FixBuddyStore.setActiveRepairId(repair.id);
  renderSolution(repair);

  // Mark as Resolved button
  const resolveBtn = document.getElementById('markResolvedBtn');
  if (resolveBtn) {
    if (repair.status === 'Resolved') {
      resolveBtn.textContent = '✓ Marked as Resolved';
      resolveBtn.classList.remove('btn-outline');
      resolveBtn.classList.add('btn-primary');
    }

    resolveBtn.addEventListener('click', () => {
      repair.status = repair.status === 'Resolved' ? 'In Progress' : 'Resolved';
      FixBuddyStore.saveRepair(repair);
      showToast(repair.status === 'Resolved' ? 'Marked repair as resolved! Great job!' : 'Status updated to In Progress', 'success');
      setTimeout(() => location.reload(), 500);
    });
  }

  // Print Guide button
  const printBtn = document.getElementById('printGuideBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Ask Follow-up Questions in Chat button
  const chatBtn = document.getElementById('askChatBtn');
  if (chatBtn) {
    chatBtn.addEventListener('click', () => {
      window.location.href = `chat.html?id=${repair.id}`;
    });
  }
});

function renderSolution(repair) {
  // Device & Meta Info
  const deviceBadge = document.getElementById('solDeviceBadge');
  const mainTitle = document.getElementById('solIdentifiedProblem');
  const statusBadge = document.getElementById('solStatusBadge');
  const userProblemDesc = document.getElementById('solUserDesc');
  const submissionDate = document.getElementById('solDate');
  const difficultyEl = document.getElementById('solDifficulty');
  const estimatedTimeEl = document.getElementById('solEstimatedTime');
  const deviceNameEl = document.getElementById('solDeviceName');
  const safetyTextEl = document.getElementById('solSafetyText');
  const alternativesEl = document.getElementById('solAlternatives');

  if (deviceBadge) deviceBadge.textContent = `${repair.category} • ${repair.deviceName || 'Standard'}`;
  if (mainTitle) mainTitle.textContent = repair.identifiedProblem;
  if (userProblemDesc) userProblemDesc.textContent = `"${repair.problemDescription}"`;
  if (deviceNameEl) deviceNameEl.textContent = repair.deviceName || repair.category;
  if (submissionDate) {
    submissionDate.textContent = new Date(repair.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  if (statusBadge) {
    statusBadge.textContent = repair.status;
    statusBadge.className = `badge ${repair.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`;
  }

  if (difficultyEl) {
    difficultyEl.textContent = repair.difficulty;
    const diffColor = repair.difficulty === 'Easy' ? 'var(--success)' : repair.difficulty === 'Moderate' ? 'var(--primary)' : 'var(--danger)';
    difficultyEl.style.color = diffColor;
  }

  if (estimatedTimeEl) estimatedTimeEl.textContent = repair.estimatedTime;
  if (safetyTextEl) safetyTextEl.textContent = repair.safetyPrecautions;
  if (alternativesEl) alternativesEl.textContent = repair.alternatives;

  // Possible Causes List
  const causesList = document.getElementById('solCausesList');
  if (causesList && repair.possibleCauses) {
    causesList.innerHTML = repair.possibleCauses.map(cause => `
      <div class="cause-item">
        <div class="cause-bullet"></div>
        <span>${escapeHtml(cause)}</span>
      </div>
    `).join('');
  }

  // Recommended Tools
  const toolsTags = document.getElementById('solToolsTags');
  if (toolsTags && repair.tools) {
    toolsTags.innerHTML = repair.tools.map(tool => `
      <span class="tool-tag">🔧 ${escapeHtml(tool)}</span>
    `).join('');
  }

  // Uploaded Image Card
  const imgCard = document.getElementById('solImageCard');
  const imgView = document.getElementById('solImageView');
  if (imgCard && imgView) {
    if (repair.imageUrl) {
      imgView.src = repair.imageUrl;
      imgCard.style.display = 'block';
    } else {
      imgCard.style.display = 'none';
    }
  }

  // Step-by-Step Instructions with Interactive Checkboxes
  const stepsList = document.getElementById('solStepsList');
  if (stepsList && repair.steps) {
    stepsList.innerHTML = repair.steps.map((step, idx) => `
      <div class="step-card" id="stepCard_${idx}">
        <input type="checkbox" class="step-checkbox" id="chkStep_${idx}" onchange="toggleStepCheck(${idx})">
        <div class="step-content">
          <div class="step-title">Step ${idx + 1}: ${escapeHtml(step.title)}</div>
          <div class="step-desc">${escapeHtml(step.desc)}</div>
          ${step.tip ? `<div class="step-tip">💡 Pro Tip: ${escapeHtml(step.tip)}</div>` : ''}
        </div>
      </div>
    `).join('');
  }
}

function toggleStepCheck(index) {
  const card = document.getElementById(`stepCard_${index}`);
  const chk = document.getElementById(`chkStep_${index}`);
  if (card && chk) {
    if (chk.checked) {
      card.classList.add('checked');
      showToast(`Step ${index + 1} completed!`, 'success', 1800);
    } else {
      card.classList.remove('checked');
    }
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
