document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#item-form");
    const portfolioSelect = document.querySelector("#portfolio-select");
    const itemsContainer = document.querySelector("#items-container");
    const newPortfolioInput = document.querySelector("#new-portfolio-name");
    const addPortfolioBtn = document.querySelector("#add-portfolio-btn");
    const deletePortfolioBtn = document.querySelector("#delete-portfolio-btn");

// โหลดรายชื่อมาใส่ใน <select>
loadPortfolioOptions();
renderItems();

// ปุ่มเพิ่ม Portfolio
addPortfolioBtn.addEventListener("click", () => {
    const name = newPortfolioInput.value.trim();
    if (!name) {
        alert("กรุณากรอกชื่อ Profile");
    return;
    }

    const portfolioId = "portfolio_" + Date.now();
    let allPortfolios = JSON.parse(localStorage.getItem("portfoliosData")) || {};

    allPortfolios[portfolioId] = { name: name, items: [] };
    localStorage.setItem("portfoliosData", JSON.stringify(allPortfolios));

    newPortfolioInput.value = "";
    loadPortfolioOptions();
    portfolioSelect.value = portfolioId;
    renderItems();
});

// ปุ่มลบ Portfolio ปัจจุบัน
deletePortfolioBtn.addEventListener("click", () => {
    const selectedPortfolio = portfolioSelect.value;
    const allPortfolios = JSON.parse(localStorage.getItem("portfoliosData")) || {};
    const portfolioName = allPortfolios[selectedPortfolio]?.name || selectedPortfolio;

    // เช็ก Portfolio เพื่อป้องกันไม่ให้ลบหมด
    if (Object.keys(allPortfolios).length <= 1) {
        alert("ไม่สามารถลบได้ ต้องมีอย่างน้อย 1 Portfolio ในระบบ");
    return;
    }

    if (confirm(`ต้องการลบ "${portfolioName}" พร้อมข้อมูลด้านในทั้งหมดใช่หรือไม่?`)) {
        delete allPortfolios[selectedPortfolio];
        localStorage.setItem("portfoliosData", JSON.stringify(allPortfolios));

        loadPortfolioOptions();
        renderItems();
    }
});

// เลือก Portfolio เข้า <select>
function loadPortfolioOptions() {
    let allPortfolios = JSON.parse(localStorage.getItem("portfoliosData")) || {};

    // 1. ตั้งค่าเริ่มต้นถ้ายังไม่มีข้อมูลใน localStorage
    if (Object.keys(allPortfolios).length === 0) {
        allPortfolios = {
            "Profile_1": { name: "Profile 1", items: [] },
            "Profile_2": { name: "Profile 2", items: [] }
        };
        localStorage.setItem("portfoliosData", JSON.stringify(allPortfolios));
    }

    // จำค่าที่เลือกไว้ปัจจุบัน
    const currentSelected = portfolioSelect.value;

    // ล้าง HTML เก่า
    portfolioSelect.innerHTML = "";

    // สร้าง <option> ใหม่
    Object.keys(allPortfolios).forEach(id => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = allPortfolios[id].name || id;
        portfolioSelect.appendChild(option);
    });

    // ป้องกัน value เป็นค่าว่าง
    if (currentSelected && allPortfolios[currentSelected]) {
        portfolioSelect.value = currentSelected;
    } else {
        portfolioSelect.selectedIndex = 0;
    }
}

// สลับการแสดงผลเมื่อเปลี่ยนตัวเลือก Portfolio
portfolioSelect.addEventListener("change", renderItems);

// บันทึก Item ใหม่
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedPortfolio = portfolioSelect.value;
    
    // เช็กป้องกันถ้าไม่ได้เลือก Profile
    if (!selectedPortfolio) {
        alert("กรุณาเลือก Profile ก่อนบันทึก");
        return;
    }

    const newItem = {
        id: document.querySelector("#item-id").value.trim() || "item_" + Date.now(),
        title: document.querySelector("#item-title").value.trim(),
        type: document.querySelector("#item-type").value.trim(),
        date: document.querySelector("#item-date").value,
        role: document.querySelector("#item-role").value.trim(),
        description: document.querySelector("#item-description").value.trim(),
        skills: document.querySelector("#item-skills").value.split(",").map(s => s.trim()).filter(Boolean),
        reflection: {
            whatIDid: document.querySelector("#item-what-did").value.trim(),
            whatILearned: document.querySelector("#item-what-learned").value.trim(),
            challenge: document.querySelector("#item-challenge").value.trim(),
            nextStep: document.querySelector("#item-next-step").value.trim()
        },
        evidence: [document.querySelector("#item-evidence").value.trim()]
    };

    let allPortfolios = JSON.parse(localStorage.getItem("portfoliosData")) || {};
    
    if (!allPortfolios[selectedPortfolio]) {
        allPortfolios[selectedPortfolio] = { 
            name: portfolioSelect.options[portfolioSelect.selectedIndex]?.text || selectedPortfolio, 
            items: [] 
        };
    }

    allPortfolios[selectedPortfolio].items.push(newItem);
    localStorage.setItem("portfoliosData", JSON.stringify(allPortfolios));

    form.reset();
    alert("Saved!");
    renderItems();
});

// แสดงผลรายการพร้อมปุ่มลบ
function renderItems() {
    const selectedPortfolio = portfolioSelect.value;
    const allPortfolios = JSON.parse(localStorage.getItem("portfoliosData")) || {};
    const items = allPortfolios[selectedPortfolio]?.items || [];

    itemsContainer.innerHTML = items.length === 0 ? "<p>ยังไม่มีรายการ Portfolio Item</p>" : "";

    items.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.style.border = "1px solid #ccc";
        itemDiv.style.padding = "10px";
        itemDiv.style.marginBottom = "10px";
        itemDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3>[${escapeHTML(item.id)}] ${escapeHTML(item.title)} (${escapeHTML(item.type)})</h3>
            <button type="button" class="delete-item-btn" data-index="${index}" style="color: red;">ลบรายการนี้</button>
            </div>
            <p><strong>Date:</strong> ${escapeHTML(item.date)} | <strong>Role:</strong> ${escapeHTML(item.role)}</p>
            <p><strong>Description:</strong> ${escapeHTML(item.description)}</p>
            <p><strong>Skills:</strong> ${item.skills.map(escapeHTML).join(", ")}</p>
            <details>
            <summary><strong>Reflection</strong></summary>
            <ul>
            <li><strong>Did:</strong> ${escapeHTML(item.reflection.whatIDid)}</li>
            <li><strong>Learned:</strong> ${escapeHTML(item.reflection.whatILearned)}</li>
            <li><strong>Challenge:</strong> ${escapeHTML(item.reflection.challenge)}</li>
            <li><strong>Next:</strong> ${escapeHTML(item.reflection.nextStep)}</li>
            </ul>
            </details>
            <p><strong>Evidence:</strong> <a href="${escapeHTML(item.evidence[0])}" target="_blank">${escapeHTML(item.evidence[0])}</a></p>
        `;
        itemsContainer.appendChild(itemDiv);
    });

    // สั่งให้ปุ่มลบ Item แต่ละรายการ
    document.querySelectorAll(".delete-item-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const itemIndex = e.target.getAttribute("data-index");
            deleteItem(itemIndex);
        });
    });
}

// ฟังก์ชันลบเฉพาะ Item
function deleteItem(index) {
    const selectedPortfolio = portfolioSelect.value;
    let allPortfolios = JSON.parse(localStorage.getItem("portfoliosData")) || {};

        if (allPortfolios[selectedPortfolio] && confirm("คุณจะลบรายการผลงานนี้ใช่หรือไม่?")) {
            allPortfolios[selectedPortfolio].items.splice(index, 1);
            localStorage.setItem("portfoliosData", JSON.stringify(allPortfolios));
            renderItems();
        }
    }

    // กันการโจมตี XSS Attack (ถาม AI เรื่องความปลอดภัยมา)
    function escapeHTML(str) {
        return str ? str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)) : "";
    }
});