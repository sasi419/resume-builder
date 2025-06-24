let uploadedImageData = "https://via.placeholder.com/120";

$(function () {
  // Initialize Datepicker
  $('#dob').datepicker({ dateFormat: 'dd-mm-yy' });

  // Update Resume Preview
  function updatePreview() {
    const name = $('#name').val();
    const email = $('#email').val();
    const phone = $('#phone').val();
    const dob = $('#dob').val();
    const bio = $('#bio').val();

    // Education
    let eduHTML = '<ul>';
    $('#educationSection input').each(function () {
      eduHTML += `<li>${$(this).val()}</li>`;
    });
    eduHTML += '</ul>';

    // Experience
    let expHTML = '<ul>';
    $('#experienceSection input').each(function () {
      expHTML += `<li>${$(this).val()}</li>`;
    });
    expHTML += '</ul>';

    // Skills
    let skillHTML = '';
    $('.skill-entry').each(function () {
      const skill = $(this).find('input[type=text]').val();
      const level = $(this).find('input[type=range]').val();
      skillHTML += `
        <div>${skill}
          <div class="progress mb-2">
            <div class="progress-bar" style="width:${level}%">${level}%</div>
          </div>
        </div>`;
    });

    // Final content
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

  // Input bindings
  $('#resumeForm').on('input change', 'input, textarea, select', updatePreview);
  $(document).on('input change', '#skillsSection input', updatePreview);

  // Bio character counter
  $('#bio').on('input', function () {
    $('#bioCount').text(`${$(this).val().length}/250`);
  });

  // Theme switcher
  $('#themeSwitcher').change(function () {
    $('body').removeClass().addClass($(this).val());
    updatePreview();
  });

  // Add new education
  $('#addEducation').click(function () {
    $('#educationSection').append(`
      <div class="mb-2">
        <input type="text" class="form-control mb-1" placeholder="Degree And Passout Year"/>
        <button class="btn btn-sm btn-danger remove">Remove</button>
      </div>
    `);
  });

  // Add new experience
  $('#addExperience').click(function () {
    $('#experienceSection').append(`
      <div class="mb-2">
        <input type="text" class="form-control mb-1" placeholder="Job and company name"/>
        <button class="btn btn-sm btn-danger remove">Remove</button>
      </div>
    `);
  });

  // Add new skill
  $('#addSkill').click(function () {
    $('#skillsSection').append(`
      <div class="skill-entry mb-2">
        <input type="text" class="form-control mb-1" placeholder="Technical skills"/>
        <input type="range" min="0" max="100" class="form-control-range mb-1"/>
        <button class="btn btn-sm btn-danger remove">Remove</button>
      </div>
    `);
  });

  // Remove entries
  $(document).on('click', '.remove', function () {
    $(this).parent().remove();
    updatePreview();
  });

  // Profile image upload
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

  // Form submission
  $('#resumeForm').submit(function (e) {
    e.preventDefault();

    const email = $('#email').val();
    const phone = $('#phone').val();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    let valid = true;

    $('#emailError').text(emailRegex.test(email) ? '' : 'Invalid email');
    $('#phoneError').text(phoneRegex.test(phone) ? '' : 'Invalid phone');

    if (!emailRegex.test(email) || !phoneRegex.test(phone)) return;

    const data = $('#resumeForm').serializeArray();
    localStorage.setItem('resumeData', JSON.stringify(data));
    alert('Resume saved!');
  });

  // Load saved data
  if (localStorage.getItem('resumeData')) {
    const data = JSON.parse(localStorage.getItem('resumeData'));
    data.forEach(({ name, value }) => {
      $(`[name="${name}"]`).val(value);
    });
    updatePreview();
  }

  // Print as PDF
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

  // Reset form
  $('#resetBtn').click(function () {
    localStorage.removeItem('resumeData');
    location.reload();
  });

  // Show preview modal
  $('#openPreview').click(function () {
    $('#modalPreviewContent').html($('#previewContent').html());
    $('#previewModal').modal('show');
  });
});