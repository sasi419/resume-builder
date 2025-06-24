let uploadedImageData = "https://via.placeholder.com/120";

$(function () {
  // Initialize datepicker
  $('#dob').datepicker({ dateFormat: 'dd-mm-yy' });

  // ===============================
  // Real-time Preview Updater
  // ===============================
  function updatePreview() {
    const name = $('#name').val();
    const email = $('#email').val();
    const phone = $('#phone').val();
    const dob = $('#dob').val();
    const bio = $('#bio').val();

    // Build Education HTML
    let eduHTML = '<ul>';
    $('#educationSection .education-entry').each(function () {
      $(this).find('input').each(function () {
        if ($(this).val().trim()) eduHTML += `<li>${$(this).val()}</li>`;
      });
    });
    eduHTML += '</ul>';

    // Build Experience HTML
    let expHTML = '<ul>';
    $('#experienceSection .experience-entry').each(function () {
      $(this).find('input, textarea').each(function () {
        if ($(this).val().trim()) expHTML += `<li>${$(this).val()}</li>`;
      });
    });
    expHTML += '</ul>';

    // Build Skills HTML
    let skillHTML = '';
    $('.skill-entry').each(function () {
      const skill = $(this).find('input[type=text]').val();
      const level = $(this).find('input[type=range]').val();
      if (skill.trim()) {
        skillHTML += `
          <div>${skill}
            <div class="progress mb-2">
              <div class="progress-bar" style="width:${level}%">${level}%</div>
            </div>
          </div>`;
      }
    });

    // Final compiled preview
    const content = `
      <div class="text-center">
        <img id="resumePhoto" src="${uploadedImageData}" class="mb-3" />
        <h3>${name}</h3>
        <p><i class="fas fa-envelope"></i> ${email} | <i class="fas fa-phone"></i> ${phone}</p>
        <p><i class="fas fa-birthday-cake"></i> ${dob}</p>
        <p>${bio}</p>
      </div>
      <h5><i class="fas fa-graduation-cap"></i> Education</h5>${eduHTML}
      <h5><i class="fas fa-briefcase"></i> Experience</h5>${expHTML}
      <h5><i class="fas fa-chart-line"></i> Skills</h5>${skillHTML}
    `;

    $('#previewContent, #modalPreviewContent').html(content);
  }

  // ===============================
  // Event Listeners
  // ===============================
  $('#resumeForm').on('input change', 'input, textarea, select', updatePreview);
  $(document).on('input change', '#skillsSection input', updatePreview);

  $('#bio').on('input', function () {
    $('#bioCount').text(`${$(this).val().length}/250`);
  });

  $('#themeSwitcher').on('change', function () {
    $('body').removeClass().addClass($(this).val());
    updatePreview();
  });

  // ===============================
  // Dynamic Section Adders
  // ===============================
  $('#addEducation').click(function () {
    $('#educationSection').append(`
      <div class="education-entry mb-3">
        <input type="text" class="form-control mb-1" placeholder="Institution Name">
        <input type="text" class="form-control mb-1" placeholder="Branch / Major">
        <input type="text" class="form-control mb-1" placeholder="From Year">
        <input type="text" class="form-control mb-1" placeholder="Year of Passout">
        <button type="button" class="btn btn-sm btn-danger remove">Remove</button>
      </div>
    `);
    updatePreview();
  });

  $('#addExperience').click(function () {
    $('#experienceSection').append(`
      <div class="experience-entry mb-3">
        <input type="text" class="form-control mb-1" placeholder="Company Name">
        <input type="text" class="form-control mb-1" placeholder="From (e.g., Jan 2020)">
        <input type="text" class="form-control mb-1" placeholder="To (e.g., Dec 2022 or Present)">
        <textarea class="form-control mb-1" placeholder="Activities & Projects"></textarea>
        <button type="button" class="btn btn-sm btn-danger remove">Remove</button>
      </div>
    `);
    updatePreview();
  });

  $('#addSkill').click(function () {
    $('#skillsSection').append(`
      <div class="skill-entry mb-2">
        <input type="text" class="form-control mb-1" placeholder="Technical skill">
        <input type="range" min="0" max="100" class="form-control-range mb-1">
        <button type="button" class="btn btn-sm btn-danger remove">Remove</button>
      </div>
    `);
    updatePreview();
  });

  $(document).on('click', '.remove', function () {
    $(this).parent().remove();
    updatePreview();
  });

  // ===============================
  // Image Upload
  // ===============================
  $('#profileImage').on('change', function () {
    const file = this.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function (e) {
        uploadedImageData = e.target.result;
        updatePreview();
      };
      reader.readAsDataURL(file);
    }
  });

  // ===============================
  // Form Submission
  // ===============================
  $('#resumeForm').submit(function (e) {
    e.preventDefault();

    // Validation
    const email = $('#email').val();
    const phone = $('#phone').val();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    $('#emailError').text(emailRegex.test(email) ? '' : 'Invalid email');
    $('#phoneError').text(phoneRegex.test(phone) ? '' : 'Invalid phone');

    if (!emailRegex.test(email) || !phoneRegex.test(phone)) return;

    // Education validation
    let eduValid = true;
    $('#educationSection .education-entry').each(function () {
      const fromYear = parseInt($(this).find('input[placeholder="From Year"]').val());
      const passoutYear = parseInt($(this).find('input[placeholder="Year of Passout"]').val());

      $(this).find('input').each(function () {
        if (!$(this).val().trim()) eduValid = false;
      });

      if (isNaN(fromYear) || isNaN(passoutYear)) eduValid = false;
    });

    // Experience validation
    let expValid = true;
    $('#experienceSection .experience-entry').each(function () {
      $(this).find('input').each(function () {
        if (!$(this).val().trim()) expValid = false;
      });
    });

    if (!eduValid) {
      alert("Please complete all Education fields and ensure years are numeric.");
      return;
    }

    if (!expValid) {
      alert("Please complete all Experience fields.");
      return;
    }

    // Save to localStorage
    const data = $('#resumeForm').serializeArray();
    localStorage.setItem('resumeData', JSON.stringify(data));
    alert('Resume saved!');
  });

  // ===============================
  // Resume Restore from Storage
  // ===============================
  if (localStorage.getItem('resumeData')) {
    const data = JSON.parse(localStorage.getItem('resumeData'));
    data.forEach(({ name, value }) => {
      $(`[name="${name}"]`).val(value);
    });
    updatePreview();
  }

  // ===============================
  // Print from Modal
  // ===============================
  $('#printModalResume').click(() => {
    const element = document.getElementById('modalPreviewContent');
    html2pdf().from(element).set({
      margin: 0.5,
      filename: 'resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).save();
  });

  // ===============================
  // Reset Form
  // ===============================
  $('#resetBtn').click(function () {
    localStorage.removeItem('resumeData');
    location.reload();
  });

  // ===============================
  // Fullscreen Preview
  // ===============================
  $('#openPreview').click(function () {
    $('#modalPreviewContent').html($('#previewContent').html());
    $('#previewModal').modal('show');
  });

  // ===============================
  // Hide Default Inputs
  // ===============================
  $('#educationSection .education-entry').remove();
  $('#experienceSection .experience-entry').remove();
});

// ===============================
// Theme Selection Startup
// ===============================
$('.btn-group .btn').click(function () {
  const selectedTheme = $(this).data('theme');
  $('body').removeClass().addClass(selectedTheme);
  $('#themeSwitcher').val(selectedTheme);
  $('#themeSelectionScreen').hide();
  $('#mainResumeBuilder').show();
  updatePreview();
});
