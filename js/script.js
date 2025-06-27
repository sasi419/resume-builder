$(document).ready(function () {
  let useProgressBar = false; // skill display toggle

  // Initialize datepicker
  $("#dob").datepicker({ dateFormat: "dd-mm-yy", changeYear: true, yearRange: "1950:2025" });

  // Toggle skill type: meter/progress
  $('#toggleSkillType').on('change', function () {
    useProgressBar = this.checked;
    updateSkillsPreview();
  });

  // Bio character counter and preview
  $('#bio').on('input', function () {
    const remaining = 200 - $(this).val().length;
    $('#bioCount').text(`${remaining} characters remaining`);
    $('#previewBio').text($(this).val());
  });

  // Live preview: personal info
  $('#fullName').on('input', function () {
    $('#previewName').text($(this).val() || 'Your Name');
  });
  $('#email').on('input', function () {
    $('#previewEmail').text("Email: " + $(this).val());
  });
  $('#phone').on('input', function () {
    $('#previewPhone').text("Phone: " + $(this).val());
  });
  $('#dob').on('input', function () {
    $('#previewDOB').text("DOB: " + $(this).val());
  });

  // Profile image upload
  $('#profileImageInput').on('change', function (e) {
    const reader = new FileReader();
    reader.onload = function (e) {
      $('#previewImg').attr('src', e.target.result);
      localStorage.setItem('profileImage', e.target.result);
    };
    reader.readAsDataURL(e.target.files[0]);
  });

  // Clear form sections
  $('#educationSection, #experienceSection, #skillsSection').empty();

  // === Education ===
  $('#addEducation').click(function () {
    const newEntry = $(`
      <div class="education-entry mb-2">
        <input type="text" class="form-control mb-1" placeholder="Institution Name" />
        <input type="text" class="form-control mb-1" placeholder="Branch / Major" />
        <input type="text" class="form-control mb-1 year-input" placeholder="From Year" />
        <input type="text" class="form-control mb-1 year-input" placeholder="Passout Year" />
        <button class="btn btn-danger btn-sm remove-edu mt-1"><i class="fas fa-trash"></i> Remove</button>
      </div>`);
    $('#educationSection').append(newEntry);
    updateEducationPreview();
  });

  function updateEducationPreview() {
    let html = '';
    $('#educationSection .education-entry').each(function () {
      const [inst, branch, from, to] = $(this).find('input').map(function () {
        return $(this).val();
      }).get();
      html += `<p><strong>${inst}</strong> - ${branch} (${from} to ${to})</p>`;
    });
    $('#previewEducation').html(html);
  }

  // === Experience ===
  $('#addExperience').click(function () {
    const newEntry = $(`
      <div class="experience-entry mb-2">
        <input type="text" class="form-control mb-1" placeholder="Company Name" />
        <input type="text" class="form-control mb-1 year-input" placeholder="From" />
        <input type="text" class="form-control mb-1 year-input" placeholder="To" />
        <textarea class="form-control mb-1" placeholder="Work/Project Description"></textarea>
        <button class="btn btn-danger btn-sm remove-exp mt-1"><i class="fas fa-trash"></i> Remove</button>
      </div>`);
    $('#experienceSection').append(newEntry);
    updateExperiencePreview();
  });

  function updateExperiencePreview() {
    let html = '';
    $('#experienceSection .experience-entry').each(function () {
      const [company, from, to] = $(this).find('input').map(function () {
        return $(this).val();
      }).get();
      const desc = $(this).find('textarea').val();
      html += `<p><strong>${company}</strong> (${from} to ${to})<br>${desc}</p>`;
    });
    $('#previewExperience').html(html);
  }

  // === Skills ===
  $('#addSkill').click(function () {
    const newSkill = $(`
      <div class="skill-entry mb-2">
        <input type="text" class="form-control mb-1" placeholder="Skill Name (e.g. HTML)" />
        <input type="range" class="custom-range" min="0" max="100" />
        <button class="btn btn-danger btn-sm mt-1 remove-skill"><i class="fas fa-trash"></i> Remove</button>
      </div>`);
    $('#skillsSection').append(newSkill);
    updateSkillsPreview();
  });
  
  function updateSkillsPreview() {
    let html = '';
    $('#skillsSection .skill-entry').each(function () {
      const skill = $(this).find('input[type="text"]').val();
      const level = $(this).find('input[type="range"]').val();
      if (skill) {
        if (useProgressBar) {
          html += `
            <p><strong>${skill}</strong></p>
            <div class="progress mb-2" style="height: 16px;">
              <div class="progress-bar bg-info" role="progressbar" style="width: ${level}%;" aria-valuenow="${level}" aria-valuemin="0" aria-valuemax="100">${level}%</div>
            </div>`;
        } else {
          html += `<p><strong>${skill}</strong><br><meter value="${level}" max="100" style="width: 100%">${level}</meter></p>`;
        }
      }
    });
    $('#previewSkills').html(html);
  }

  // Bind all live updates
  $(document).on('input', '#educationSection input', updateEducationPreview);
  $(document).on('input', '#experienceSection input, #experienceSection textarea', updateExperiencePreview);
  $(document).on('input', '#skillsSection input', updateSkillsPreview);

  // === Validation + Save ===
  $('#saveBtn').click(function () {
    let messages = [];
    const name = $('#fullName').val().trim();
    const email = $('#email').val().trim();
    const phone = $('#phone').val().trim();
    const bio = $('#bio').val().trim();
    const yearPattern = /^\d{4}$/;
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const phonePattern = /^\d{10}$/;

    if (!name) messages.push("Full name is required.");
    if (!emailPattern.test(email)) messages.push("Enter a valid email address.");
    if (!phonePattern.test(phone)) messages.push("Phone number must be 10 digits.");
    if (!bio) messages.push("Bio cannot be empty.");

    $('#educationSection .education-entry').each(function () {
      const from = $(this).find('input[placeholder="From Year"]').val().trim();
      const to = $(this).find('input[placeholder="Passout Year"]').val().trim();
      if ((from && !yearPattern.test(from)) || (to && !yearPattern.test(to))) {
        messages.push("Education years must be 4-digit numbers.");
      }
    });

    $('#experienceSection .experience-entry').each(function () {
      const from = $(this).find('input[placeholder="From"]').val().trim();
      const to = $(this).find('input[placeholder="To"]').val().trim();
      if ((from && !yearPattern.test(from)) || (to && !yearPattern.test(to))) {
        messages.push("Experience years must be 4-digit numbers.");
      }
    });

    if (messages.length > 0) {
      alert("Please fix the following:\n\n" + messages.join('\n'));
    } else {
      alert("Form saved successfully!");
      // save logic could go here
    }
  });

  // Print / PDF / Reset
  $('#printBtn').click(() => {
  const originalContent = document.body.innerHTML;
  const previewContent = document.getElementById('previewColumn').innerHTML;

  document.body.innerHTML = `<div class="container">${previewContent}</div>`;
  window.print();
  document.body.innerHTML = originalContent;
  location.reload(); // Reload to restore functionality
});

  // Theme switch (optional)
  window.switchTheme = function (themeName) {
    localStorage.setItem('selectedTemplate', themeName);
    location.reload();
  };

  // Load localStorage data (if any)
  function loadData() {
    const data = JSON.parse(localStorage.getItem('resumeData'));
    if (!data) return;

    $('#fullName').val(data.fullName).trigger('input');
    $('#email').val(data.email).trigger('input');
    $('#phone').val(data.phone).trigger('input');
    $('#dob').val(data.dob).trigger('input');
    $('#bio').val(data.bio).trigger('input');

    data.education.forEach(edu => {
      const entry = $(`
        <div class="education-entry mb-2">
          <input type="text" class="form-control mb-1" placeholder="Institution Name" value="${edu.institution}" />
          <input type="text" class="form-control mb-1" placeholder="Branch / Major" value="${edu.branch}" />
          <input type="text" class="form-control mb-1 year-input" placeholder="From Year" value="${edu.from}" />
          <input type="text" class="form-control mb-1 year-input" placeholder="Passout Year" value="${edu.to}" />
          <button class="btn btn-danger btn-sm remove-edu mt-1"><i class="fas fa-trash"></i> Remove</button>
        </div>`);
      $('#educationSection').append(entry);
    });

    data.experience.forEach(exp => {
      const entry = $(`
        <div class="experience-entry mb-2">
          <input type="text" class="form-control mb-1" placeholder="Company Name" value="${exp.company}" />
          <input type="text" class="form-control mb-1 year-input" placeholder="From" value="${exp.from}" />
          <input type="text" class="form-control mb-1 year-input" placeholder="To" value="${exp.to}" />
          <textarea class="form-control mb-1">${exp.desc}</textarea>
          <button class="btn btn-danger btn-sm remove-exp mt-1"><i class="fas fa-trash"></i> Remove</button>
        </div>`);
      $('#experienceSection').append(entry);
    });

    data.skills.forEach(skill => {
      const entry = $(`
        <div class="skill-entry mb-2">
          <input type="text" class="form-control mb-1" value="${skill.name}" />
          <input type="range" class="custom-range" min="0" max="100" value="${skill.level}" />
          <button class="btn btn-danger btn-sm mt-1 remove-skill"><i class="fas fa-trash"></i> Remove</button>
        </div>`);
      $('#skillsSection').append(entry);
    });

    updateEducationPreview();
    updateExperiencePreview();
    updateSkillsPreview();

    const img = localStorage.getItem('profileImage');
    if (img) $('#previewImg').attr('src', img);
  }
  $(function () {
  const $img = $('#previewImg');
  const $info = $img.prevAll('p, h2').get().reverse();
  const $container = $('<div class="top-section"></div>');
  const $text = $('<div class="text-details"></div>').append($info);
  $container.append($text).append($img.addClass('profile-pic'));
  $('#resumePreview').prepend($container);
});


  loadData();
});
