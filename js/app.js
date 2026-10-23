document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#item-form");
  const portfolioSelect = document.querySelector("#portfolio-select");
  const itemsContainer = document.querySelector("#items-container");

  // โหลดข้อมูล
  renderItems();

  // ระบบสับ profile
  portfolioSelect.addEventListener("change", renderItems);

  // บันทึกข้อมูล
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // รับค่า
    const idInput = document.querySelector("#item-id").value.trim();
    const title = document.querySelector("#item-title").value.trim();
    const type = document.querySelector("#item-type").value.trim();
    const date = document.querySelector("#item-date").value;
    const role = document.querySelector("#item-role").value.trim();
    const description = document.querySelector("#item-description").value.trim();
    const skillsRaw = document.querySelector("#item-skills").value.trim();
    
    const whatIDid = document.querySelector("#item-what-did").value.trim();
    const whatILearned = document.querySelector("#item-what-learned").value.trim();
    const challenge = document.querySelector("#item-challenge").value.trim();
    const nextStep = document.querySelector("#item-next-step").value.trim();
    const evidenceUrl = document.querySelector("#item-evidence").value.trim();

    // ตรวจความถูกต้องของข้อมูล
    if (!title || !type || !date || !role || !description || !skillsRaw || !evidenceUrl) {
      alert("กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน");
      return;
    }

    // setรูปแบบ URL
    try {
      new URL(evidenceUrl);
    } catch (_) {
      alert("กรุณากรอก Evidence URL ให้ถูกต้อง (เช่น https://example.com)");
      return;
    }

    // Format Data Structure ตาม portfolio-example.json
    const newItem = {
      id: idInput || "item_" + Date.now(), // ใช้ ID ที่กรอก หรือ อัตโนมัติ
      title: title,
      type: type,
      date: date,
      role: role,
      description: description,
      skills: skillsRaw.split(",").map(skill => skill.trim()).filter(skill => skill.length > 0),
      reflection: {
        whatIDid: whatIDid,
        whatILearned: whatILearned,
        challenge: challenge,
        nextStep: nextStep
      },
      evidence: [evidenceUrl]
    };

    // Save to localStorage แยกตาม ID
    const selectedPortfolio = portfolioSelect.value;
    const allPortfolios = JSON.parse(localStorage.getItem("portfoliosData")) || {};

    if (!allPortfolios[selectedPortfolio]) {
      allPortfolios[selectedPortfolio] = [];
    }

    allPortfolios[selectedPortfolio].push(newItem);
    localStorage.setItem("portfoliosData", JSON.stringify(allPortfolios));

    // Reset Form
    form.reset();
    alert("บันทึก Portfolio Item สำเร็จ!");
    renderItems();
  });

  // ดึงข้อมูลมาแสดงผล
  function renderItems() {
    const selectedPortfolio = portfolioSelect.value;
    const allPortfolios = JSON.parse(localStorage.getItem("portfoliosData")) || {};
    const items = allPortfolios[selectedPortfolio] || [];

    itemsContainer.innerHTML = "";

    if (items.length === 0) {
      itemsContainer.innerHTML = "<p>ยังไม่มีรายการ Portfolio Item</p>";
      return;
    }

    // แสดงผลแต่ละ Item
    items.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.style.border = "1px solid #ccc";
      itemDiv.style.padding = "10px";
      itemDiv.style.marginBottom = "10px";

      itemDiv.innerHTML = `
        <h3>[${item.id}] ${escapeHTML(item.title)} (${escapeHTML(item.type)})</h3>
        <p><strong>Date:</strong> ${escapeHTML(item.date)} | <strong>Role:</strong> ${escapeHTML(item.role)}</p>
        <p><strong>Description:</strong> ${escapeHTML(item.description)}</p>
        <p><strong>Skills:</strong> ${item.skills.map(s => escapeHTML(s)).join(", ")}</p>
        
        <details>
          <summary><strong>Reflection</strong></summary>
          <ul>
            <li><strong>What I did:</strong> ${escapeHTML(item.reflection.whatIDid)}</li>
            <li><strong>What I learned:</strong> ${escapeHTML(item.reflection.whatILearned)}</li>
            <li><strong>Challenge:</strong> ${escapeHTML(item.reflection.challenge)}</li>
            <li><strong>Next step:</strong> ${escapeHTML(item.reflection.nextStep)}</li>
          </ul>
        </details>

        <p><strong>Evidence:</strong> 
          <a href="${escapeHTML(item.evidence[0])}" target="_blank" rel="noopener noreferrer">
            ${escapeHTML(item.evidence[0])}
          </a>
        </p>
      `;

      itemsContainer.appendChild(itemDiv);
    });
  }

  // ฟังก์ชันป้องกัน XSS Attack เมื่อนำข้อมูลไปแสดงบน HTML **อันนี้ถามAIมา ไม่ปิดบัง อิอิ**
  function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
});