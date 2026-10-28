// frontend/script.js

// Backend API Base URL
const API_BASE_URL ="https://skillbridge-student-skills-and.onrender.com"

// --- 1. Static Skills Data (Curated Learning Pathways) ---
const staticSkills = [
  {
    title: "Responsive Web Design",
    category: "Development",
    description: "Build clean, mobile-first websites using modern HTML5, CSS3, and JavaScript flexbox/grid layouts.",
    resources: "FreeCodeCamp, MDN Web Docs"
  },
  {
    title: "Social Media & Poster Design",
    category: "Design",
    description: "Design eye-catching event posters, club flyers, and Instagram carousels using Canva and Figma.",
    resources: "Figma Community, Canva Design School"
  },
  {
    title: "Video Editing & Reels",
    category: "Video Editing",
    description: "Edit concise shorts, YouTube reels, and promotional event recaps with pacing, captions, and audio sync.",
    resources: "CapCut, DaVinci Resolve Tutorials"
  },
  {
    title: "Technical Content & Copywriting",
    category: "Marketing",
    description: "Draft clear project documentation, blog summaries, and engaging LinkedIn posts for student creators.",
    resources: "Grammarly, Google Technical Writing"
  }
];

// --- 2. DOM Elements ---
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

const skillsGrid = document.getElementById("skillsGrid");
const projectsGrid = document.getElementById("projectsGrid");
const projectSearchForm = document.getElementById("projectSearchForm");
const projectSearch = document.getElementById("projectSearch");
const categoryFilter = document.getElementById("categoryFilter");
const projectMessage = document.getElementById("projectMessage");

const applicationsList = document.getElementById("applicationsList");

const profileForm = document.getElementById("profileForm");
const profileMessage = document.getElementById("profileMessage");

const showLogin = document.getElementById("showLogin");
const showRegister = document.getElementById("showRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");
const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");

// --- 3. Navigation Controls ---
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", !isExpanded);
    navLinks.style.display = isExpanded ? "none" : "flex";
    if (!isExpanded) {
      navLinks.style.flexDirection = "column";
      navLinks.style.paddingTop = "1rem";
    }
  });
}

if (loginButton) {
  loginButton.addEventListener("click", () => {
    switchAuthTab("login");
    document.getElementById("authentication").scrollIntoView({ behavior: "smooth" });
  });
}

if (registerButton) {
  registerButton.addEventListener("click", () => {
    switchAuthTab("register");
    document.getElementById("authentication").scrollIntoView({ behavior: "smooth" });
  });
}

// --- 4. Render Skills ---
function renderSkills(skills) {
  if (!skillsGrid) return;
  skillsGrid.innerHTML = "";

  skills.forEach(skill => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <div>
        <span class="item-badge">${escapeHtml(skill.category)}</span>
        <h3>${escapeHtml(skill.title)}</h3>
        <p>${escapeHtml(skill.description)}</p>
      </div>
      <small class="muted">Key resources: ${escapeHtml(skill.resources)}</small>
    `;
    skillsGrid.appendChild(card);
  });
}

// --- 5. Fetch & Render Live Projects from Backend ---
async function fetchProjects(searchTerm = "", selectedCategory = "") {
  if (!projectsGrid) return;
  projectsGrid.innerHTML = `<p class="muted">Loading projects from database...</p>`;

  try {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedCategory) params.append("category", selectedCategory);

    const response = await fetch(`${API_BASE_URL}/projects?${params.toString()}`);
    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to load projects");
    }

    renderProjects(result.data);

    if (projectMessage) {
      projectMessage.textContent = `Showing ${result.data.length} project(s)`;
      projectMessage.className = "message muted";
    }
  } catch (err) {
    console.error("Fetch projects error:", err);
    projectsGrid.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">⚠️</span>
        <h3>Unable to load projects</h3>
        <p>Make sure the backend server is running at <code>${API_BASE_URL}</code>.</p>
      </div>
    `;
  }
}

function renderProjects(projects) {
  if (!projectsGrid) return;
  projectsGrid.innerHTML = "";

  if (projects.length === 0) {
    projectsGrid.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🔍</span>
        <h3>No matching projects found</h3>
        <p>Try searching with another keyword or resetting the category filter.</p>
      </div>
    `;
    return;
  }

  projects.forEach(project => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <div>
        <span class="item-badge">${escapeHtml(project.category)}</span>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.description)}</p>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 0.75rem; font-size: 0.9rem;">
          <strong>Budget: ${escapeHtml(project.budget)}</strong>
          <span class="muted">Duration: ${escapeHtml(project.duration)}</span>
        </div>
        <button class="button button-primary full-width" onclick="openApplyModal('${project.id}', '${escapeHtml(project.title)}')">
          Apply Now
        </button>
      </div>
    `;
    projectsGrid.appendChild(card);
  });
}

// Search and filter event listeners
if (projectSearchForm) {
  projectSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTerm = projectSearch ? projectSearch.value.trim() : "";
    const selectedCategory = categoryFilter ? categoryFilter.value : "";
    fetchProjects(searchTerm, selectedCategory);
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener("change", () => {
    const searchTerm = projectSearch ? projectSearch.value.trim() : "";
    const selectedCategory = categoryFilter.value;
    fetchProjects(searchTerm, selectedCategory);
  });
}

// --- 6. Apply / Proposal Submission (Live Supabase Insert) ---
window.openApplyModal = async function(projectId, projectTitle) {
  const applicantName = prompt(`Apply for: "${projectTitle}"\n\nEnter your full name:`);
  if (!applicantName) return;

  const applicantEmail = prompt("Enter your college email address:");
  if (!applicantEmail) return;

  const portfolioUrl = prompt("Enter your portfolio, GitHub, or Drive link (optional):") || "";
  const pitch = prompt("Enter a brief pitch explaining your skills and why you are a fit:");
  if (!pitch) {
    alert("Application pitch cannot be empty.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        portfolio_url: portfolioUrl,
        pitch: pitch
      })
    });

    const result = await response.json();
    if (result.success) {
      alert("Proposal submitted successfully to Supabase!");
      fetchApplications();
    } else {
      alert("Submission error: " + (result.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Apply error:", err);
    alert("Failed to submit proposal. Is the backend server running?");
  }
};

// --- 7. Fetch & Render Applications Feed ---
async function fetchApplications() {
  if (!applicationsList) return;

  try {
    const response = await fetch(`${API_BASE_URL}/applications`);
    const result = await response.json();

    if (!result.success || !result.data || result.data.length === 0) {
      applicationsList.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">▤</span>
          <h3>No applications yet</h3>
          <p>Explore projects above and submit your first proposal!</p>
          <a class="button button-primary" href="#projects">Explore projects</a>
        </div>
      `;
      return;
    }

    applicationsList.innerHTML = "";
    result.data.forEach(app => {
      const card = document.createElement("div");
      card.className = "item-card";
      const projectTitle = app.projects ? app.projects.title : "Direct Project Application";
      card.innerHTML = `
        <div>
          <span class="item-badge">Proposal</span>
          <h3>${escapeHtml(projectTitle)}</h3>
          <p><strong>Applicant:</strong> ${escapeHtml(app.applicant_name)} (${escapeHtml(app.applicant_email)})</p>
          <p><strong>Pitch:</strong> ${escapeHtml(app.pitch)}</p>
        </div>
        <small class="muted">Submitted: ${new Date(app.created_at).toLocaleDateString()}</small>
      `;
      applicationsList.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching applications:", err);
  }
}

// --- 8. Profile Form Submission (Live Supabase Profiles Insert) ---
if (profileForm) {
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = document.getElementById("fullName").value.trim();
    const portfolioUrl = document.getElementById("portfolioUrl").value.trim();
    const bio = document.getElementById("profileBio").value.trim();
    const skills = document.getElementById("profileSkills").value.trim();

    if (!fullName || !skills) {
      profileMessage.textContent = "Please fill in all required fields.";
      profileMessage.className = "message error";
      return;
    }

    profileMessage.textContent = "Saving profile to database...";
    profileMessage.className = "message muted";

    try {
      const response = await fetch(`${API_BASE_URL}/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          portfolio_url: portfolioUrl,
          bio: bio,
          skills: skills
        })
      });

      const result = await response.json();
      if (result.success) {
        profileMessage.textContent = `Profile saved successfully in Supabase for ${fullName}!`;
        profileMessage.className = "message success";
      } else {
        profileMessage.textContent = "Error saving profile: " + (result.error || "Please try again");
        profileMessage.className = "message error";
      }
    } catch (err) {
      console.error("Save profile error:", err);
      profileMessage.textContent = "Connection error. Please check your backend server.";
      profileMessage.className = "message error";
    }
  });
}

// --- 9. Auth Tab Switching & Handlers ---
function switchAuthTab(target) {
  if (target === "login") {
    showLogin.classList.add("active");
    showLogin.setAttribute("aria-pressed", "true");
    showRegister.classList.remove("active");
    showRegister.setAttribute("aria-pressed", "false");
    loginForm.hidden = false;
    registerForm.hidden = true;
  } else {
    showRegister.classList.add("active");
    showRegister.setAttribute("aria-pressed", "true");
    showLogin.classList.remove("active");
    showLogin.setAttribute("aria-pressed", "false");
    registerForm.hidden = false;
    loginForm.hidden = true;
  }
  if (authMessage) authMessage.textContent = "";
}

if (showLogin && showRegister) {
  showLogin.addEventListener("click", () => switchAuthTab("login"));
  showRegister.addEventListener("click", () => switchAuthTab("register"));
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();

    authMessage.textContent = "Creating student profile...";
    authMessage.className = "message muted";

    try {
      const response = await fetch(`${API_BASE_URL}/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name,
          email: email,
          skills: "Student Member"
        })
      });

      const result = await response.json();
      if (result.success) {
        authMessage.textContent = `Account registered for ${name}! You can now apply for gigs and update your profile.`;
        authMessage.className = "message success";
        registerForm.reset();
      } else {
        authMessage.textContent = "Registration error: " + (result.error || "Please try again.");
        authMessage.className = "message error";
      }
    } catch (err) {
      authMessage.textContent = "Server connection error.";
      authMessage.className = "message error";
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    authMessage.textContent = `Logged in successfully as ${email}!`;
    authMessage.className = "message success";
    loginForm.reset();
  });
}

// Utility: HTML sanitization
function escapeHtml(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// --- 10. Initialize on Load ---
document.addEventListener("DOMContentLoaded", () => {
  renderSkills(staticSkills);
  fetchProjects();
  fetchApplications();
});
