
(() => {
  const KEY = "portfolio-editable-v1";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const toolbar = $("#editor-toolbar");
  const toggle = $("#toggle-edit");
  const save = $("#save-edit");
  const exportBtn = $("#export-edit");
  const reset = $("#reset-edit");
  const status = $("#editor-status");

  let editing = false;

  // ส่วนข้อความที่คลิกแก้ไขได้
  const editableSelectors = [
    "h1", "h2", "h3", "p", "strong", "small",
    ".section-no", ".section-note", ".eyebrow",
    ".kicker", ".meta-label", ".exp-type",
    ".workshop-label", ".workshop-date",
    ".tags span", ".side-note", ".quote",
    ".statement > span", ".hero-meta strong",
    ".skill-strip > div"
  ].join(",");

  function markEditable() {
    $$(editableSelectors).forEach((el) => {
      if (!el.closest("#editor-toolbar")) {
        el.dataset.editable = "true";
      }
    });
  }

  function setEditMode(enabled) {
    editing = enabled;
    document.body.classList.toggle("edit-mode", enabled);

    $$("[data-editable]").forEach((el) => {
      el.contentEditable = String(enabled);
      el.spellcheck = enabled;
    });

    toggle.textContent = enabled
      ? "✓ เสร็จสิ้นการแก้ไข"
      : "✎ แก้ไขเว็บไซต์";

    status.textContent = enabled
      ? "คลิกข้อความเพื่อแก้ไข"
      : "โหมดดูเว็บไซต์";
  }

  // เพิ่มปุ่มลบให้แต่ละรายการ
  function addDeleteButton(card) {
    if (card.querySelector(".delete-card")) return;

    const button = document.createElement("button");
    button.className = "delete-card";
    button.type = "button";
    button.textContent = "ลบรายการ";

    button.addEventListener("click", () => {
      if (confirm("ต้องการลบรายการนี้หรือไม่?")) {
        card.remove();
      }
    });

    card.appendChild(button);
  }

  // เพิ่มผลงานใหม่
  function addExperience() {
    const container = $(".experience-list");
    if (!container) return;

    const card = document.createElement("article");
    card.className = "experience";

    card.innerHTML = `
      <div class="exp-index">ใหม่</div>
      <div class="exp-content">
        <div class="exp-type">CATEGORY · YEAR</div>
        <h3>ชื่อผลงาน</h3>
        <p>รายละเอียดผลงานของคุณ</p>
        <div class="tags">
          <span>ทักษะ 1</span>
          <span>ทักษะ 2</span>
        </div>
      </div>
      <div class="exp-arrow">↗</div>
    `;

    container.appendChild(card);
    addDeleteButton(card);
    markEditable();
    setEditMode(true);
  }

  // เพิ่ม Workshop
  function addWorkshop() {
    const container = $(".workshop-grid");
    if (!container) return;

    const card = document.createElement("article");
    card.className = "workshop-card";

    card.innerHTML = `
      <div class="workshop-symbol">✳</div>
      <span class="workshop-label">WORKSHOP · TOPIC</span>
      <h3>ชื่อ Workshop</h3>
      <p>รายละเอียดกิจกรรม</p>
      <span class="workshop-date">MONTH YEAR</span>
    `;

    container.appendChild(card);
    addDeleteButton(card);
    markEditable();
    setEditMode(true);
  }

  // ปุ่มเพิ่มรายการ
  function addButton(container, label, callback) {
    if (!container || container.querySelector(".add-card")) return;

    const button = document.createElement("button");
    button.className = "add-card";
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", callback);
    container.appendChild(button);
  }

  // เปลี่ยนลิงก์และรูปภาพ
  document.addEventListener("click", (event) => {
    if (!editing || event.target.closest("#editor-toolbar")) return;

    const link = event.target.closest("a");

    if (link) {
      event.preventDefault();

      const value = prompt(
        "ใส่ URL ใหม่ หรือ #section",
        link.getAttribute("href") || ""
      );

      if (value !== null) {
        link.setAttribute("href", value.trim() || "#");
      }

      return;
    }

    const image = event.target.closest("img");

    if (image) {
      event.preventDefault();

      const value = prompt(
        "ใส่ URL รูปภาพหรือพาธไฟล์",
        image.getAttribute("src") || ""
      );

      if (value !== null && value.trim()) {
        image.setAttribute("src", value.trim());
      }
    }
  });

  // สร้าง HTML สำหรับบันทึก โดยไม่รวมแถบแก้ไข
  function getHTML() {
    const clone = document.documentElement.cloneNode(true);

    clone.querySelector("#editor-toolbar")?.remove();

    clone.querySelectorAll(
      ".add-card, .delete-card"
    ).forEach((el) => el.remove());

    clone.querySelectorAll("[contenteditable]").forEach((el) => {
      el.removeAttribute("contenteditable");
      el.removeAttribute("spellcheck");
    });

    clone.querySelectorAll("[data-editable]").forEach((el) => {
      el.removeAttribute("data-editable");
    });

    clone.querySelector("body")?.classList.remove("edit-mode");

    return "<!doctype html>\n" + clone.outerHTML;
  }

  // เปิดและปิดโหมดแก้ไข
  toggle.addEventListener("click", () => {
    setEditMode(!editing);
  });

  // บันทึกข้อมูลในเบราว์เซอร์
  save.addEventListener("click", () => {
    try {
      localStorage.setItem(KEY, getHTML());
      status.textContent = "บันทึกแล้วในเบราว์เซอร์นี้";
    } catch (error) {
      alert("บันทึกไม่สำเร็จ");
    }
  });

  // ดาวน์โหลด HTML ที่แก้ไขแล้ว
  exportBtn.addEventListener("click", () => {
    const blob = new Blob([getHTML()], {
      type: "text/html;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "portfolio-edited.html";
    link.click();

    URL.revokeObjectURL(url);
  });

  // คืนค่าโดยโหลดหน้าเว็บใหม่
  reset.addEventListener("click", () => {
    if (confirm("โหลดหน้าเว็บใหม่หรือไม่?")) {
      location.reload();
    }
  });

  // สร้างปุ่มเพิ่ม/ลบผลงาน
  function installCardEditing() {
    $$(".experience").forEach(addDeleteButton);
    $$(".workshop-card").forEach(addDeleteButton);

    addButton(
      $(".experience-list"),
      "+ เพิ่มผลงาน / กิจกรรม",
      addExperience
    );

    addButton(
      $(".workshop-grid"),
      "+ เพิ่ม Workshop",
      addWorkshop
    );
  }

  // โหลดข้อมูลที่เคยบันทึก
  function restoreSaved() {
    const saved = localStorage.getItem(KEY);
    if (!saved) return;

    if (!confirm("ต้องการโหลดข้อมูลที่บันทึกไว้หรือไม่?")) {
      return;
    }

    const doc = new DOMParser().parseFromString(
      saved,
      "text/html"
    );

    const newMain = doc.querySelector("main");
    const oldMain = $("main");

    if (newMain && oldMain) {
      oldMain.replaceWith(newMain);
    }

    const newFooter = doc.querySelector("footer.footer");
    const oldFooter = $("footer.footer");

    if (newFooter && oldFooter) {
      oldFooter.replaceWith(newFooter);
    }

    markEditable();
    installCardEditing();
  }

  markEditable();
  installCardEditing();
  restoreSaved();
  setEditMode(false);
})();
