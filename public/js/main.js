// Mobile nav toggle
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".mobile-toggle");
  const links = document.querySelector(".nav-links");
  const overlay = document.createElement("div");
  overlay.className = "mobile-nav-overlay";
  document.body.appendChild(overlay);

  function closeMenu() {
    if (links) links.classList.remove("mobile-open");
    overlay.classList.remove("visible");
    if (toggle) toggle.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      const isOpen = links.classList.toggle("mobile-open");
      toggle.classList.toggle("active", isOpen);
      overlay.classList.toggle("visible", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    overlay.addEventListener("click", closeMenu);
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  // Tap-to-expand category dropdowns (hover alone doesn't work on touch devices)
  document.querySelectorAll(".nav-item").forEach(function (item) {
    const trigger = item.querySelector(".nav-link");
    const dropdown = item.querySelector(".dropdown");
    if (!trigger || !dropdown) return;

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".nav-item.open").forEach(function (other) {
        if (other !== item) other.classList.remove("open");
      });
      item.classList.toggle("open", !isOpen);
    });
  });

  // Auto-hide flash alerts after a few seconds
  const alertBox = document.querySelector(".alert");
  if (alertBox) {
    setTimeout(function () {
      alertBox.style.transition = "opacity 0.5s ease";
      alertBox.style.opacity = "0";
    }, 3500);
  }

  // Scroll-triggered fade-up animation for product cards & category tiles
  const revealTargets = document.querySelectorAll(".product-card, .tile");
  revealTargets.forEach(function (el, i) {
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 4) * 0.08 + "s";
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: just show everything if IntersectionObserver isn't supported
    revealTargets.forEach(function (el) { el.classList.add("in-view"); });
  }

  // Subtle 3D tilt effect on product cards (desktop only, mouse-driven)
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".product-card").forEach(function (card) {
      card.style.transformStyle = "preserve-3d";
      card.style.perspective = "800px";

      card.addEventListener("mousemove", function (e) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
      });

      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  // Back-to-top button
  const backToTop = document.createElement("button");
  backToTop.className = "back-to-top";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(backToTop);

  window.addEventListener("scroll", function () {
    backToTop.classList.toggle("visible", window.scrollY > 500);
  });

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Search auto-suggest
  const searchInput = document.getElementById("searchInput");
  const suggestBox = document.getElementById("searchSuggestions");
  let searchTimer = null;

  if (searchInput && suggestBox) {
    searchInput.addEventListener("input", function () {
      const q = searchInput.value.trim();
      clearTimeout(searchTimer);

      if (q.length < 2) {
        suggestBox.classList.remove("open");
        suggestBox.innerHTML = "";
        return;
      }

      searchTimer = setTimeout(function () {
        fetch("/shop/suggest?q=" + encodeURIComponent(q))
          .then(function (res) { return res.json(); })
          .then(function (items) {
            if (items.length === 0) {
              suggestBox.innerHTML = '<div class="suggestion-empty">No products found</div>';
            } else {
              const symbols = { PKR: "Rs. ", USD: "$", GBP: "£" };
              suggestBox.innerHTML = items.map(function (p) {
                const code = (p.currency || "PKR").toUpperCase();
                const symbol = symbols[code] || symbols.PKR;
                const priceText = code === "PKR"
                  ? symbol + Math.round(p.price).toLocaleString()
                  : symbol + Number(p.price).toFixed(2);
                return (
                  '<a class="suggestion-item" href="/shop/product/' + p.id + '">' +
                    '<img src="' + p.image + '" alt="' + p.name + '" />' +
                    '<div class="suggestion-info">' +
                      '<div class="suggestion-name">' + p.name + '</div>' +
                      '<div class="suggestion-price">' + priceText + '</div>' +
                    '</div>' +
                  '</a>'
                );
              }).join("");
            }
            if (window.innerWidth <= 960) {
              const navEl = document.querySelector(".navbar");
              if (navEl) suggestBox.style.top = navEl.getBoundingClientRect().bottom + 8 + "px";
            } else {
              suggestBox.style.top = "";
            }
            suggestBox.classList.add("open");
          })
          .catch(function () { suggestBox.classList.remove("open"); });
      }, 250);
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".search-wrap")) {
        suggestBox.classList.remove("open");
      }
    });
  }

  // Product image zoom that follows the cursor (like AliExpress)
  const zoomBox = document.querySelector(".product-detail-image");
  const zoomImg = document.getElementById("mainProductImage");
  if (zoomBox && zoomImg) {
    zoomBox.addEventListener("mousemove", function (e) {
      const rect = zoomBox.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      zoomImg.style.transformOrigin = x + "% " + y + "%";
    });
    zoomBox.addEventListener("mouseleave", function () {
      zoomImg.style.transformOrigin = "center center";
    });
  }

  // Cookie consent banner
  const cookieBanner = document.getElementById("cookieBanner");
  const cookieAcceptBtn = document.getElementById("cookieAcceptBtn");
  const cookieRejectBtn = document.getElementById("cookieRejectBtn");
  const cookieReopenBtn = document.getElementById("cookieReopenBtn");

  function getCookieChoice() {
    try { return localStorage.getItem("zeenat_cookie_consent"); } catch (e) { return null; }
  }
  function setCookieChoice(value) {
    try { localStorage.setItem("zeenat_cookie_consent", value); } catch (e) {}
  }
  function updateReopenVisibility() {
    if (cookieReopenBtn) cookieReopenBtn.classList.toggle("visible", !!getCookieChoice());
  }

  if (cookieBanner && cookieAcceptBtn) {
    if (!getCookieChoice()) {
      cookieBanner.classList.add("visible");
    }
    updateReopenVisibility();

    cookieAcceptBtn.addEventListener("click", function () {
      setCookieChoice("accepted");
      cookieBanner.classList.remove("visible");
      updateReopenVisibility();
    });

    if (cookieRejectBtn) {
      cookieRejectBtn.addEventListener("click", function () {
        setCookieChoice("rejected");
        cookieBanner.classList.remove("visible");
        updateReopenVisibility();
      });
    }

    if (cookieReopenBtn) {
      cookieReopenBtn.addEventListener("click", function () {
        cookieBanner.classList.add("visible");
      });
    }
  }
});
