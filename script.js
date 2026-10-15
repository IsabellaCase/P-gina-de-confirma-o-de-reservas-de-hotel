const sidebar = document.querySelector("#sidebar");
const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");
const menuBackdrop = document.querySelector(".menu-backdrop");
const mobileMenu = window.matchMedia("(max-width: 600px)");

function setMenuOpen(isOpen, returnFocus = false) {
  sidebar.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuBackdrop.hidden = !isOpen;
  sidebar.inert = mobileMenu.matches && !isOpen;
  document.body.classList.toggle("menu-open", isOpen);

  if (returnFocus && mobileMenu.matches) {
    menuToggle.focus();
  }
}

setMenuOpen(false);
menuToggle.addEventListener("click", () => {
  setMenuOpen(true);
  menuClose.focus();
});
menuClose.addEventListener("click", () => setMenuOpen(false, true));
menuBackdrop.addEventListener("click", () => setMenuOpen(false, true));

sidebar.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (mobileMenu.matches) setMenuOpen(false, true);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false, true);
  }

  if (event.key === "Tab" && menuToggle.getAttribute("aria-expanded") === "true") {
    const focusableItems = [...sidebar.querySelectorAll("a, button")].filter((item) => !item.disabled);
    const firstItem = focusableItems[0];
    const lastItem = focusableItems.at(-1);

    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem.focus();
    }
  }
});

mobileMenu.addEventListener("change", () => {
  setMenuOpen(false);
});

function copyWithLegacyApi(value) {
  const temporaryInput = document.createElement("textarea");
  temporaryInput.value = value;
  temporaryInput.setAttribute("readonly", "");
  temporaryInput.style.position = "fixed";
  temporaryInput.style.opacity = "0";
  document.body.append(temporaryInput);
  temporaryInput.select();
  const copied = document.execCommand("copy");
  temporaryInput.remove();
  return copied;
}

document.querySelector("[data-copy-password]").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  const password = document.querySelector(".wifi-password").textContent.trim();
  const status = document.querySelector(".copy-status");

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(password);
    } else if (!copyWithLegacyApi(password)) {
      throw new Error("Clipboard copy was rejected by the browser.");
    }

    status.textContent = "Password copied.";
  } catch {
    status.textContent = "Unable to copy. Please select and copy the password.";
  }
});

function escapeCalendarText(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatCalendarDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

document.querySelector(".calendar-button").addEventListener("click", () => {
  const [checkIn, checkOut] = [...document.querySelectorAll(".stay-dates time")];
  const exclusiveCheckout = new Date(`${checkOut.dateTime}T00:00:00Z`);
  exclusiveCheckout.setUTCDate(exclusiveCheckout.getUTCDate() + 1);
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const checkInLabel = checkIn.nextElementSibling.textContent.replace(" · ", " at ");
  const checkOutLabel = checkOut.nextElementSibling.textContent.replace(" · ", " at ");
  const calendarEvent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Maison Soleil//Booking confirmation//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:MS-2026-0421-AH@maisons-soleil.example`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${formatCalendarDate(new Date(`${checkIn.dateTime}T00:00:00Z`))}`,
    `DTEND;VALUE=DATE:${formatCalendarDate(exclusiveCheckout)}`,
    `SUMMARY:${escapeCalendarText("Stay at Maison Soleil · La Garrigue")}`,
    `LOCATION:${escapeCalendarText("12 Rue des Oliviers, Cassis, France")}`,
    `DESCRIPTION:${escapeCalendarText(`Check-in ${checkInLabel}. Check-out ${checkOutLabel}. Booking MS-2026-0421-AH.`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  const calendarFile = new Blob([calendarEvent], { type: "text/calendar;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(calendarFile);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = "maison-soleil-MS-2026-0421-AH.ics";
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  document.querySelector(".calendar-status").textContent = "Calendar file downloaded.";
});

document.querySelector(".print-button").addEventListener("click", () => {
  window.print();
});
