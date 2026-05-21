document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.header .navbar');
  const searchForm = document.querySelector('.search-form');
  const menuBtn = document.querySelector('#menu-btn');
  const navCloseBtn = document.querySelector('#nav-close');
  const searchBtn = document.querySelector('#search-btn');
  const closeSearchBtn = document.querySelector('#close-search');
  const header = document.querySelector('.header');
  const whatsappButton = document.querySelector('#whatsappButton');

  // ---------- WhatsApp handler ----------
  if (whatsappButton) {
    whatsappButton.addEventListener('click', () => {
      const name = document.querySelector('input[name="name"]').value;
      const email = document.querySelector('input[name="email"]').value;
      const phone = document.querySelector('input[name="phone"]').value;
      const subject = document.querySelector('input[name="subject"]').value;
      const message = document.querySelector('textarea[name="message"]').value;
      const phoneNumber = "919407846955";
      const text = `Hello! 👋 I'm ${name}.
Email: ${email}
Phone: ${phone}
Subject: ${subject}
Message: ${message}`;
      const encodedText = encodeURIComponent(text);
      const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedText}`;
      window.open(whatsappURL, '_blank');
    });
  }

  // ---------- Search form handler ----------
  const searchFormElement = document.getElementById("searchForm");
  const searchLoader = document.getElementById("searchLoader");
  const searchResults = document.getElementById("searchResults");

  if (searchFormElement) {
    searchFormElement.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (searchLoader) searchLoader.style.display = "block";
      if (searchResults) searchResults.innerHTML = "";

      const name = document.getElementById("name")?.value.trim() || "";
      const location = document.getElementById("location")?.value.trim() || "";
      const type = document.getElementById("type")?.value.trim() || "";
      const budget = document.getElementById("budget")?.value.trim() || "";

      const params = new URLSearchParams();
      if (name) params.append("name", name);
      if (location) params.append("location", location);
      if (type) params.append("type", type);
      if (budget) params.append("budget", budget);

      try {
        const res = await fetch(`https://tour-project-backend-gkru.onrender.com/search?${params.toString()}`);
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          searchResults.innerHTML = "<p>No results found.</p>";
        } else {
          searchResults.innerHTML = data.map(d => `
            <div class="result-card">
              <h3>${escapeHtml(d.name)}</h3>
              <p>${escapeHtml(d.location)} — ${escapeHtml(d.type)} — Budget: ${escapeHtml(d.budget)}</p>
              <button onclick="bookDestination('${escapeHtml(d.name)}')">Book Now</button>
            </div>
          `).join("");
        }
      } catch (err) {
        console.error(err);
        searchResults.innerHTML = "<p>Error fetching results. Is the backend running?</p>";
      } finally {
        if (searchLoader) searchLoader.style.display = "none";
      }
    });
  }

  // ---------- Load destinations ----------
  async function loadDestinations() {
    try {
      const res = await fetch("https://tour-project-backend-gkru.onrender.com/destinations");
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();

      const destinationContainer = document.getElementById("destinationContainer");
      if (destinationContainer) {
        destinationContainer.innerHTML = data.map(d => `
          <div class="destination-card">
            <h3>${escapeHtml(d.name)}</h3>
            <p>${escapeHtml(d.location)} — ${escapeHtml(d.type)} — Budget: ${escapeHtml(d.budget)}</p>
            <button onclick="bookDestination('${escapeHtml(d.name)}')">Book Now</button>
          </div>
        `).join("");
      }
    } catch (err) {
      console.error(err);
    }
  }
  loadDestinations();

  // ---------- Booking form handler ----------
  // ---------- Booking form handler ----------
const bookingFormElement = document.getElementById("bookingForm");
const bookingMessage = document.getElementById("bookingMessage");

if (bookingFormElement) {
  bookingFormElement.addEventListener("submit", async (e) => {
    e.preventDefault();

    const bookingData = {
      destination: document.getElementById("destination").value,
      user: document.getElementById("user").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value
    };

    try {
      const res = await fetch("https://tour-project-backend-gkru.onrender.com/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      const data = await res.json();

      if (res.ok) {
        bookingMessage.style.color = "green";
        bookingMessage.innerText = data.message; // "Booking successful!"
      } else {
        bookingMessage.style.color = "red";
        bookingMessage.innerText = `${data.message} – ${data.error || "Unknown error"}`;
      }
    } catch (err) {
      console.error(err);
      bookingMessage.style.color = "red";
      bookingMessage.innerText = "Booking failed! Network or server error.";
    }
  });
}

  // ---------- Book Now buttons ----------
  window.bookDestination = async function(name) {
    const user = document.getElementById("user")?.value || "Anonymous";
    const email = document.getElementById("email")?.value || "noemail@example.com";
    const phone = document.getElementById("phone")?.value || "";

    const bookingData = { destination: name, user, email, phone };

    try {
      const res = await fetch("https://tour-project-backend-gkru.onrender.com/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      const data = await res.json();
      bookingMessage.innerText = data.message;
    } catch (err) {
      console.error(err);
      bookingMessage.innerText = "Error booking destination.";
    }
  };

  // ---------- Escape HTML ----------
  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ---------- Navbar & scroll ----------
  if (menuBtn && navbar) {
    menuBtn.addEventListener('click', () => { navbar.classList.add('active'); });
  }
  if (navCloseBtn && navbar) {
    navCloseBtn.addEventListener('click', () => { navbar.classList.remove('active'); });
  }
  if (searchBtn && searchForm) {
    searchBtn.addEventListener('click', () => { searchForm.classList.add('active'); });
  }
  if (closeSearchBtn && searchForm) {
    closeSearchBtn.addEventListener('click', () => { searchForm.classList.remove('active'); });
  }

  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (navbar) navbar.classList.remove('active');
      if (window.scrollY > 0) {
        if (header) header.classList.add('active');
      } else {
        if (header) header.classList.remove('active');
      }
    }, 50);
  });

  if (window.scrollY > 0) {
    if (header) header.classList.add('active');
  } else {
    if (header) header.classList.remove('active');
  }
});
