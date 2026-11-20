/* ===================================================================
   FixBuddy - Repair Submission & AI Diagnosis Logic (Module 5)
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  FixBuddyStore.init();

  let selectedCategory = '';
  let uploadedImageData = '';

  // 1. Category Selection
  const categoryCards = document.querySelectorAll('.category-radio-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      categoryCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        selectedCategory = radio.value;
      }
      clearFieldError('categoryError');
    });
  });

  // Pre-select category if passed in URL param (e.g. repair.html?category=Laptop)
  const urlParams = new URLSearchParams(window.location.search);
  const paramCat = urlParams.get('category');
  if (paramCat) {
    const targetCard = Array.from(categoryCards).find(c => {
      const r = c.querySelector('input[type="radio"]');
      return r && r.value.toLowerCase() === paramCat.toLowerCase();
    });
    if (targetCard) {
      targetCard.click();
    }
  }

  // 2. Sample Prompt Quick Fill Chips
  const sampleChips = document.querySelectorAll('.sample-chip');
  const problemDescInput = document.getElementById('problemDescription');
  sampleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (problemDescInput) {
        problemDescInput.value = chip.getAttribute('data-text');
        updateCharCounter();
      }
    });
  });

  // Character counter for textarea
  if (problemDescInput) {
    problemDescInput.addEventListener('input', updateCharCounter);
  }

  function updateCharCounter() {
    const charCountEl = document.getElementById('descCharCount');
    if (charCountEl && problemDescInput) {
      charCountEl.textContent = `${problemDescInput.value.length} characters`;
    }
  }

  // 3. Drag and Drop & File Upload
  const dropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('deviceImageInput');
  const previewWrapper = document.getElementById('imagePreviewWrapper');
  const previewImg = document.getElementById('previewImg');
  const previewFilename = document.getElementById('previewFilename');
  const previewFilesize = document.getElementById('previewFilesize');
  const removeImageBtn = document.getElementById('removeImageBtn');
  const replaceImageBtn = document.getElementById('replaceImageBtn');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        handleFileSelect(fileInput.files[0]);
      }
    });
  }

  function handleFileSelect(file) {
    if (!file.type.match('image.*')) {
      showToast('Please upload a valid image file (PNG, JPG, JPEG, WEBP)', 'danger');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5MB', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImageData = e.target.result;
      if (previewImg) previewImg.src = uploadedImageData;
      if (previewFilename) previewFilename.textContent = file.name;
      if (previewFilesize) previewFilesize.textContent = (file.size / 1024).toFixed(1) + ' KB';

      if (dropzone) dropzone.style.display = 'none';
      if (previewWrapper) previewWrapper.classList.add('active');
    };
    reader.readAsDataURL(file);
  }

  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', () => {
      uploadedImageData = '';
      if (fileInput) fileInput.value = '';
      if (previewWrapper) previewWrapper.classList.remove('active');
      if (dropzone) dropzone.style.display = 'block';
    });
  }

  if (replaceImageBtn) {
    replaceImageBtn.addEventListener('click', () => {
      if (fileInput) fileInput.click();
    });
  }

  // 4. Form Submission and AI Simulation
  const repairForm = document.getElementById('repairForm');
  const aiModal = document.getElementById('aiProcessingModal');

  if (repairForm) {
    repairForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const deviceName = document.getElementById('deviceName').value.trim();
      const description = problemDescInput ? problemDescInput.value.trim() : '';

      let hasError = false;

      if (!selectedCategory) {
        const catErr = document.getElementById('categoryError');
        if (catErr) {
          catErr.style.display = 'block';
          catErr.textContent = 'Please select a device category.';
        }
        hasError = true;
      }

      if (!description || description.length < 10) {
        showFieldError('problemDescription', 'Please describe the problem in at least 10 characters.');
        hasError = true;
      } else {
        clearFieldError('problemDescription');
      }

      if (hasError) {
        showToast('Please complete all required fields.', 'warning');
        return;
      }

      // Show AI Processing Overlay
      if (aiModal) {
        aiModal.classList.add('active');
        animateAiSteps(() => {
          // Generate AI Diagnosis Solution
          const aiResult = AIDiagnostics.analyze(selectedCategory, deviceName, description);

          const newRepairId = 'rep_' + Date.now();
          const currentUser = FixBuddyStore.getCurrentUser();

          const repairRecord = {
            id: newRepairId,
            userId: currentUser ? currentUser.id : 'usr_guest',
            category: selectedCategory,
            deviceName: deviceName || selectedCategory,
            problemDescription: description,
            imageUrl: uploadedImageData,
            date: new Date().toISOString(),
            status: 'In Progress',
            identifiedProblem: aiResult.identifiedProblem,
            difficulty: aiResult.difficulty,
            estimatedTime: aiResult.estimatedTime,
            possibleCauses: aiResult.possibleCauses,
            tools: aiResult.tools,
            safetyPrecautions: aiResult.safetyPrecautions,
            steps: aiResult.steps,
            alternatives: aiResult.alternatives,
            messages: [
              {
                sender: 'ai',
                text: `Hello! I have generated a customized repair procedure for your ${selectedCategory} (${deviceName || 'Device'}). Review the safety precautions and step 1. Ask me any questions as you proceed!`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };

          FixBuddyStore.saveRepair(repairRecord);
          FixBuddyStore.setActiveRepairId(newRepairId);

          // Redirect to solution page
          window.location.href = `solution.html?id=${newRepairId}`;
        });
      }
    });
  }

  function animateAiSteps(onComplete) {
    const steps = [
      document.getElementById('aiStep1'),
      document.getElementById('aiStep2'),
      document.getElementById('aiStep3')
    ];

    if (!steps[0]) {
      setTimeout(onComplete, 1200);
      return;
    }

    steps[0].classList.add('current');

    setTimeout(() => {
      steps[0].classList.remove('current');
      steps[0].classList.add('done');
      steps[0].querySelector('.step-status-icon').textContent = '✓';
      if (steps[1]) steps[1].classList.add('current');
    }, 700);

    setTimeout(() => {
      if (steps[1]) {
        steps[1].classList.remove('current');
        steps[1].classList.add('done');
        steps[1].querySelector('.step-status-icon').textContent = '✓';
      }
      if (steps[2]) steps[2].classList.add('current');
    }, 1400);

    setTimeout(() => {
      if (steps[2]) {
        steps[2].classList.remove('current');
        steps[2].classList.add('done');
        steps[2].querySelector('.step-status-icon').textContent = '✓';
      }
      setTimeout(onComplete, 400);
    }, 2000);
  }
});
