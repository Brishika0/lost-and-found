import { useState } from "react";
import "./Signup.css";

function Signup() {
  const [selectedCollege, setSelectedCollege] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("student");

  // List of ING colleges with their email domains and logo URLs
  const colleges = [
    {
      name: "Herald College Kathmandu",
      domain: "heraldcollege.edu.np",
      logo: "🎓",
      shortName: "Herald",
    },
    {
      name: "Islington College",
      domain: "islington.edu.np",
      logo: "🏛️",
      shortName: "Islington",
    },
    {
      name: "Itahari International College",
      domain: "iic.edu.np",
      logo: "🌐",
      shortName: "IIC",
    },
    {
      name: "Apex College",
      domain: "apex.edu.np",
      logo: "⛰️",
      shortName: "Apex",
    },
    {
      name: "Kavya School",
      domain: "kavya.edu.np",
      logo: "📚",
      shortName: "Kavya",
    },
    {
      name: "Biratnagar International College",
      domain: "bic.edu.np",
      logo: "🎯",
      shortName: "BIC",
    },
  ];

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);

    // Validate email domain
    if (emailValue && selectedCollege) {
      const college = colleges.find((c) => c.name === selectedCollege);
      if (college) {
        const emailDomain = emailValue.split("@")[1];
        if (emailDomain && !emailDomain.endsWith(".edu.np")) {
          setEmailError("Please use a valid college email address (.edu.np)");
        } else if (emailDomain && emailDomain !== college.domain) {
          setEmailError(
            `Please use your ${college.shortName} email (@${college.domain})`
          );
        } else {
          setEmailError("");
        }
      }
    }
  };

  const handleCollegeSelect = (college) => {
    setSelectedCollege(college.name);
    setShowCollegeDropdown(false);
    // Re-validate email when college changes
    if (email) {
      const emailDomain = email.split("@")[1];
      if (emailDomain && emailDomain !== college.domain) {
        setEmailError(
          `Please use your ${college.shortName} email (@${college.domain})`
        );
      } else if (emailDomain && emailDomain.endsWith(".edu.np")) {
        setEmailError("");
      }
    }
  };

  const checkAdminExists = (role, college) => {
    // Get existing admins from localStorage
    const existingAdmins = JSON.parse(localStorage.getItem("admins") || "{}");

    if (role === "superadmin") {
      // Check if super admin already exists
      if (existingAdmins.superadmin) {
        return { exists: true, message: "Super Admin already exists. Only one Super Admin is allowed." };
      }
    } else if (role === "admin") {
      // Check if admin exists for this college
      if (existingAdmins[college]) {
        return { exists: true, message: `Admin for ${college} already exists. Only one Admin per college is allowed.` };
      }
    }

    return { exists: false };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Final validation
    if (!email.endsWith(".edu.np")) {
      setEmailError("Please use a valid college email address (.edu.np)");
      return;
    }

    if (emailError) {
      return;
    }

    // Check if admin/superadmin already exists
    const adminCheck = checkAdminExists(selectedRole, selectedCollege);
    if (adminCheck.exists) {
      alert(adminCheck.message);
      return;
    }

    // Store admin info if role is admin or superadmin
    if (selectedRole === "admin" || selectedRole === "superadmin") {
      const existingAdmins = JSON.parse(localStorage.getItem("admins") || "{}");
      if (selectedRole === "superadmin") {
        existingAdmins.superadmin = email;
      } else {
        existingAdmins[selectedCollege] = email;
      }
      localStorage.setItem("admins", JSON.stringify(existingAdmins));
    }

    // Store user data in localStorage
    const userData = {
      email,
      college: selectedCollege,
      collegeData: colleges.find((c) => c.name === selectedCollege),
      role: selectedRole
    };
    localStorage.setItem("userData", JSON.stringify(userData));

    console.log("Form submitted!", { selectedCollege, email, role: selectedRole });
    alert("Account created successfully! You can now login.");
  };

  const selectedCollegeData = colleges.find((c) => c.name === selectedCollege);

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        {/* Left Side - Image */}
        <div className="signup-image-section">
          <div className="image-content">
            <h1>Lost & Found System</h1>
            <p>Reuniting people with their belongings</p>
            <div className="ing-badge">ING Colleges Network</div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="signup-form-section">
          <div className="signup-header">
            <h2>Create Your Account</h2>
            <p>Join the Smart Lost & Found System today.</p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="college">Select Your College</label>
              <div className="college-selector">
                <div
                  className="college-selected"
                  onClick={() => setShowCollegeDropdown(!showCollegeDropdown)}
                >
                  {selectedCollegeData ? (
                    <>
                      <span className="college-logo">
                        {selectedCollegeData.logo}
                      </span>
                      <span className="college-name">
                        {selectedCollegeData.name}
                      </span>
                    </>
                  ) : (
                    <span className="placeholder">Choose your college...</span>
                  )}
                  <span className="dropdown-arrow">▼</span>
                </div>

                {showCollegeDropdown && (
                  <div className="college-dropdown">
                    {colleges.map((college) => (
                      <div
                        key={college.name}
                        className="college-option"
                        onClick={() => handleCollegeSelect(college)}
                      >
                        <span className="college-logo">{college.logo}</span>
                        <div className="college-info">
                          <span className="college-name">{college.name}</span>
                          <span className="college-domain">
                            @{college.domain}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">College Email</label>
              <input
                type="email"
                id="email"
                placeholder="your.email@college.edu.np"
                value={email}
                onChange={handleEmailChange}
                required
                className={emailError ? "error" : ""}
              />
              {emailError && (
                <span className="error-message">{emailError}</span>
              )}
              <span className="helper-text">
                Use your official college email address
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="role-label">Select Your Role</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={selectedRole === "student"}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  />
                  <span>Student</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={selectedRole === "admin"}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  />
                  <span>Admin</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="role"
                    value="superadmin"
                    checked={selectedRole === "superadmin"}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  />
                  <span>Super Admin</span>
                </label>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              Create Account
            </button>
          </form>

          <p className="signup-footer">
            Already have an account? <a href="#login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
