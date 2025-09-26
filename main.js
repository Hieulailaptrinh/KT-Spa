// ---------- Small interactive behaviors ----------
document.addEventListener("DOMContentLoaded", () => {
  // Show popup after delay
  setTimeout(() => {
    const p = document.getElementById("couponPopup");
    if (p) p.style.display = "block";
  }, 2500);

  document.getElementById("closePopup").addEventListener("click", () => {
    document.getElementById("couponPopup").style.display = "none";
  });

  // Booking form
  const bookingForm = document.getElementById("bookingForm");
  bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const service = document.getElementById("service").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;

    if (!service || !date || !time || !name || !phone) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    // Show confirmation on page
    const result = document.getElementById("bookingResult");
    result.style.display = "block";
    result.innerText = `Đã tạo lịch: ${service} — ${date} ${time}. Chúng tôi sẽ liên hệ lại sớm.`;

    // Create downloadable .ics event for calendar
    const ics = createICS({
      title: service + " - SereneSpa",
      startDate: date,
      startTime: time,
      durationMinutes: 60,
      description: "Đặt lịch tại SereneSpa. Khách: " + name + ", SĐT:" + phone,
    });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "serenespa-event.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    // Prefill a mailto confirmation (fallback)
    if (email) {
      const subject = encodeURIComponent("Xác nhận đặt lịch SereneSpa");
      const body = encodeURIComponent(
        `Xin chào ${name},\n\nCảm ơn bạn đã đặt lịch: ${service} vào ${date} ${time}.\nChúng tôi sẽ gọi xác nhận trong vòng 24 giờ.\n\nSereneSpa\n`
      );
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    }
  });

  // Add to Google Calendar button
  document.getElementById("addToCalendar").addEventListener("click", () => {
    const service = document.getElementById("service").value || "SereneSpa";
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    if (!date || !time) {
      alert("Vui lòng chọn ngày và giờ trước.");
      return;
    }
    const start = new Date(date + "T" + time);
    const end = new Date(start.getTime() + 60 * 60000);
    const format = (d) => d.toISOString().replace(/-|:|\.\d{3}/g, "");
    const url = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(
      service
    )}&dates=${format(start)}/${format(end)}&details=${encodeURIComponent(
      "Đặt lịch tại SereneSpa"
    )}`;
    window.open(url, "_blank");
  });

  // Contact form simple handler (could be AJAX)
  document
    .getElementById("contactForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Cảm ơn đã liên hệ. Chúng tôi sẽ phản hồi sớm.");
      this.reset();
    });
});

// Utility to create a minimal ICS file
function createICS({
  title,
  startDate,
  startTime,
  durationMinutes = 60,
  description = "",
}) {
  // Expect startDate: YYYY-MM-DD, startTime: HH:MM
  const pad = (n) => n.toString().padStart(2, "0");
  const d = startDate.split("-");
  const t = startTime.split(":");
  const dt = `${d[0]}${d[1]}${d[2]}T${pad(t[0])}${pad(t[1])}00`;
  const start = dt;
  // Simple end calculation
  const startObj = new Date(startDate + "T" + startTime);
  const endObj = new Date(startObj.getTime() + durationMinutes * 60000);
  const y = endObj.getFullYear();
  const m = pad(endObj.getMonth() + 1);
  const day = pad(endObj.getDate());
  const hh = pad(endObj.getHours());
  const mm = pad(endObj.getMinutes());
  const end = `${y}${m}${day}T${hh}${mm}00`;

  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SereneSpa//EN\nBEGIN:VEVENT\nUID:${Date.now()}@serenespa\nDTSTAMP:${new Date()
    .toISOString()
    .replace(
      /-|:|\.\d{3}/g,
      ""
    )}Z\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:${title}\nDESCRIPTION:${description}\nEND:VEVENT\nEND:VCALENDAR`;
}
