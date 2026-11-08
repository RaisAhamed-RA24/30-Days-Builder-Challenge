
import { useEffect, useState } from "react";
import "./App.css";

const platforms = [
  {
    category: "Social Media",
    options: ["Instagram", "Facebook", "X", "LinkedIn", "Threads", "Pinterest", "Snapchat"],
  },
  {
    category: "Video & Streaming",
    options: ["YouTube", "TikTok", "Twitch", "Vimeo"],
  },
  {
    category: "Messaging",
    options: ["WhatsApp", "Telegram", "Discord", "Messenger"],
  },
  {
    category: "Creative & Portfolio",
    options: ["Behance", "Dribbble", "GitHub", "GitLab", "Portfolio"],
  },
  {
    category: "Music & Other",
    options: ["Spotify", "SoundCloud", "Medium", "Website", "Email", "Other"],
  },
];

const defaultProfile = {
  name: "",
  username: "",
  bio: "",
  image: "",
};

function App() {
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("devlink-profile")) || defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  const [links, setLinks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("devlink-links")) || [];
    } catch {
      return [];
    }
  });

  const [theme, setTheme] = useState(
    () => localStorage.getItem("mylink-theme") || "violet"
  );

  const [mode, setMode] = useState(
    () => localStorage.getItem("mylink-mode") || "light"
  );

  const [platform, setPlatform] = useState("Instagram");
  const [url, setUrl] = useState("");
  const [customPlatform, setCustomPlatform] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem("devlink-profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("devlink-links", JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem("mylink-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("mylink-mode", mode);
  }, [mode]);

  const updateProfile = (field, value) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      updateProfile("image", reader.result);
      setError("");
    };

    reader.readAsDataURL(file);
  };

  const addLink = (event) => {
    event.preventDefault();
    setError("");

    const selectedPlatform =
      platform === "Other" ? customPlatform.trim() : platform;

    if (!selectedPlatform) {
      setError("Please enter a platform name.");
      return;
    }

    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }

    let finalUrl = url.trim();

    if (selectedPlatform.toLowerCase() === "email") {
      const email = finalUrl.replace(/^mailto:/i, "");

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      finalUrl = `mailto:${email}`;
    } else {
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }

      try {
        const parsedUrl = new URL(finalUrl);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        setError("Please enter a valid URL.");
        return;
      }
    }

    setLinks((previous) => [
      ...previous,
      {
        id: Date.now(),
        platform: selectedPlatform,
        url: finalUrl,
      },
    ]);

    setUrl("");
    setCustomPlatform("");
    setPlatform("Instagram");
  };

  const deleteLink = (id) => {
    setLinks((previous) => previous.filter((link) => link.id !== id));
  };

  const profileUrl = `${window.location.origin}${window.location.pathname}#${profile.username || "yourusername"}`;

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy the link. Please copy it manually.");
    }
  };

  const getPlatformInitial = (name) => {
    if (name.toLowerCase() === "email") return "@";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`app theme-${theme} ${mode}-mode`}>
      <header className="header">
        <a className="brand" href="#">
          <span className="brand-icon">M</span>
          <span>MyLink</span>
        </a>

        <button
          className="mode-toggle"
          onClick={() => setMode(mode === "light" ? "dark" : "light")}
          aria-label="Toggle colour mode"
        >
          {mode === "light" ? "🌙" : "☀️"}
        </button>
      </header>

      <main className="main-container">
        <section className="intro">
          <span className="eyebrow">YOUR DIGITAL IDENTITY</span>
          <h1>Everything you are, in one link.</h1>
          <p>
            Create your personal page and bring all your important links
            together in one place.
          </p>
        </section>

        <div className="workspace">
          <section className="panel editor-panel">
            <div className="panel-heading">
              <div>
                <h2>Build your profile</h2>
                <p>Customize your personal page.</p>
              </div>
            </div>

            <div className="form-section">
              <h3>Profile details</h3>

              <label className="field-label">Profile picture</label>
              <div className="image-upload">
                <div className="upload-preview">
                  {profile.image ? (
                    <img src={profile.image} alt="Profile" />
                  ) : (
                    <span>{profile.name ? profile.name[0].toUpperCase() : "?"}</span>
                  )}
                </div>

                <div className="upload-actions">
  <div className="image-buttons">
    <label className="upload-button">
      Upload image
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
      />
    </label>

    {profile.image && (
      <button
        type="button"
        className="remove-image-button"
        onClick={() => updateProfile("image", "")}
      >
        Remove photo
      </button>
    )}
  </div>

  <small>PNG or JPG. Maximum 2 MB.</small>
</div>
              </div>

              <label className="field-label" htmlFor="name">
                Display name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={profile.name}
                onChange={(e) => updateProfile("name", e.target.value)}
              />

              <label className="field-label" htmlFor="username">
                Username
              </label>
              <div className="username-input">
                <span>@</span>
                <input
                  id="username"
                  type="text"
                  placeholder="yourusername"
                  value={profile.username}
                  onChange={(e) =>
                    updateProfile(
                      "username",
                      e.target.value.replace(/[^a-zA-Z0-9_.-]/g, "")
                    )
                  }
                />
              </div>

              <label className="field-label" htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                rows="3"
                maxLength="160"
                placeholder="Tell people a little about yourself..."
                value={profile.bio}
                onChange={(e) => updateProfile("bio", e.target.value)}
              />
              <small className="character-count">
                {profile.bio.length}/160 characters
              </small>
            </div>

            <div className="form-section">
              <h3>Add your links</h3>

              <form onSubmit={addLink}>
                <label className="field-label" htmlFor="platform">
                  Platform
                </label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  {platforms.map((group) => (
                    <optgroup label={group.category} key={group.category}>
                      {group.options.map((item) => (
                        <option value={item} key={item}>
                          {item}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                {platform === "Other" && (
                  <>
                    <label className="field-label" htmlFor="custom-platform">
                      Custom platform name
                    </label>
                    <input
                      id="custom-platform"
                      type="text"
                      placeholder="Enter platform name"
                      value={customPlatform}
                      onChange={(e) => setCustomPlatform(e.target.value)}
                    />
                  </>
                )}

                <label className="field-label" htmlFor="url">
                  {platform === "Email" ? "Email address" : "URL"}
                </label>
                <input
                  id="url"
                  type={platform === "Email" ? "email" : "text"}
                  placeholder={
                    platform === "Email"
                      ? "you@example.com"
                      : "https://example.com/yourprofile"
                  }
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />

                {error && <p className="error-message">{error}</p>}

                <button className="primary-button" type="submit">
                  + Add link
                </button>
              </form>

              <div className="saved-links">
                <div className="saved-links-heading">
                  <h3>Your links</h3>
                  <span>{links.length} added</span>
                </div>

                {links.length === 0 ? (
                  <div className="empty-links">
                    <span>🔗</span>
                    <p>No links added yet.</p>
                    <small>Add your first link above.</small>
                  </div>
                ) : (
                  links.map((link) => (
                    <div className="saved-link" key={link.id}>
                      <div className="saved-link-icon">
                        {getPlatformInitial(link.platform)}
                      </div>
                      <div className="saved-link-info">
                        <strong>{link.platform}</strong>
                        <span>{link.url}</span>
                      </div>
                      <button
                        className="delete-button"
                        onClick={() => deleteLink(link.id)}
                        aria-label={`Delete ${link.platform} link`}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>Choose your theme</h3>
              <div className="theme-options">
                {["violet", "ocean", "sunset"].map((item) => (
                  <button
                    key={item}
                    className={`theme-option ${item} ${theme === item ? "selected" : ""}`}
                    onClick={() => setTheme(item)}
                    aria-label={`${item} theme`}
                    title={item}
                  >
                    {theme === item && "✓"}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="preview-column">
            <div className="preview-heading">
              <div>
                <h2>Live preview</h2>
                <p>This is how your page will look.</p>
              </div>
              <span className="live-indicator">● LIVE</span>
            </div>

            <div className={`profile-preview preview-${theme}`}>
              <div className="profile-content">
                <div className="profile-avatar">
                  {profile.image ? (
                    <img src={profile.image} alt={profile.name || "Profile"} />
                  ) : (
                    <span>
                      {profile.name ? profile.name[0].toUpperCase() : "?"}
                    </span>
                  )}
                </div>

                <h2>{profile.name || "Your Name"}</h2>
                <p className="preview-username">
                  @{profile.username || "yourusername"}
                </p>
                <p className="preview-bio">
                  {profile.bio || "Your bio will appear here."}
                </p>

                <div className="preview-links">
                  {links.length === 0 ? (
                    <div className="preview-empty">
                      Your links will appear here.
                    </div>
                  ) : (
                    links.map((link) => (
                      <a
                        href={link.url}
                        key={link.id}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="preview-link"
                      >
                        <span className="preview-link-icon">
                          {getPlatformInitial(link.platform)}
                        </span>
                        <span>{link.platform}</span>
                        <span className="link-arrow">↗</span>
                      </a>
                    ))
                  )}
                </div>

                <div className="preview-footer">
                  <span>Made with</span>
                  <strong>MyLink</strong>
                </div>
              </div>
            </div>

            <div className="share-section">
              <div>
                <h3>Your profile link</h3>
                <p>Copy your current preview URL.</p>
              </div>
              <div className="share-link">
                <span>{profileUrl}</span>
                <button onClick={copyProfileLink}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <small>
                This is a local preview link. Public profile sharing requires
                deployment and profile routing.
              </small>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} MyLink. All rights reserved.</p>

        <div className="footer-company">
          <span>A product of</span>
          <a
            href="https://ra24digiworks.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="RA24 DigiWorks"
          >
            <img
              src="/ra24-logo.png"
              alt="RA24 DigiWorks"
              className="ra24-footer-logo"
            />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
