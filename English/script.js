// 📅 Live date and time updater (formatted for English and LTR layout)
function updateDateTime() {
  const now = new Date();

  const formatted = now.toLocaleString('en-GB', {
    timeZone: 'Asia/Kabul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const target = document.getElementById("date-time-td");
  target.textContent = formatted;

  // Make sure layout works properly in LTR
  target.style.direction = 'ltr';
  target.style.textAlign = 'center';
}


// Run updateDateTime() every second
setInterval(updateDateTime, 1000);
updateDateTime(); // Also run once on page load

// 🔢 Function to generate previous/current reading input fields for each unit
function generateFields() {
  const unitCount = parseInt(document.getElementById('unitCount').value);
  const container = document.getElementById('unitInputs');
  container.innerHTML = ''; // Clear previous content

  if (!unitCount || unitCount <= 0) return; // Stop for invalid input

  // Create input fields for each unit
  for (let i = 1; i <= unitCount; i++) {
    const div = document.createElement('div');
    div.className = 'unit-fields';
    div.innerHTML = `
      <label><b>Unit ${i}</b></label>
      <table>
        <tr>
          <td>Previous Reading:</td>
          <td>Current Reading:</td>
        </tr>
        <tr>
          <td><input type="number" id="prev-${i}" placeholder="e.g., 100"></td>
          <td><input type="number" id="curr-${i}" placeholder="e.g., 250"></td>
        </tr>
      </table>
    `;
    container.appendChild(div); // Add to the page
  }
}

// 🧮 Calculate the bill for each unit based on usage
function computeBills() {
  const totalBill = parseFloat(document.getElementById('billAmount').value);
  const unitCount = parseInt(document.getElementById('unitCount').value);

  // ✅ Validate bill amount
  if (isNaN(totalBill) || totalBill <= 0) {
    alert("Please enter a valid total bill amount!");
    return;
  }

  if (!unitCount || unitCount <= 0) {
    alert("Please enter a valid number of units!");
    return;
  }

  let totalUsage = 0;
  let usages = [];

  // 🔍 Loop through each unit and validate individually
  for (let i = 1; i <= unitCount; i++) {
    const prevEl = document.getElementById(`prev-${i}`);
    const currEl = document.getElementById(`curr-${i}`);

    const prev = parseFloat(prevEl.value);
    const curr = parseFloat(currEl.value);

    if (prevEl.value.trim() === '' || currEl.value.trim() === '') {
      alert(`Please enter both previous and current readings for unit ${i}.`);
      return;
    }

    if (isNaN(prev) || isNaN(curr)) {
      alert(`Invalid number input for unit ${i}. Please enter numeric values.`);
      return;
    }

    if (curr < prev) {
      alert(`Current reading must be greater than or equal to previous for unit ${i}.`);
      return;
    }

    const usage = curr - prev;
    usages.push(usage);
    totalUsage += usage;
  }

  // 🚫 Total usage check
  if (totalUsage === 0) {
    alert("Total usage is 0. Cannot compute bill!");
    return;
  }

  const pricePerWatt = totalBill / totalUsage;

  // 💡 Build result
  let resultHTML = `<h3>💡 Bill Breakdown</h3><ul>`;
  usages.forEach((usage, idx) => {
    const unitBill = Math.ceil(usage * pricePerWatt);
    resultHTML += `<li><strong>Unit ${idx + 1}:</strong> ${unitBill} AFN</li>`;
  });
  resultHTML += `</ul>
    <strong>Overall Electricity Usage:</strong> ${totalUsage.toFixed(2)} Watts<br/>
    <strong>Per-watt price:</strong> ${pricePerWatt.toFixed(2)} AFN`;

  const resultBox = document.getElementById('result');
  resultBox.innerHTML = resultHTML;
  resultBox.style.display = 'block';

  document.getElementById('statusBadge').style.display = 'block';
  document.getElementById('downloadArea').style.display = 'block';
}



// 🔄 Clear all inputs and hide results
function resetAll() {
  document.getElementById('billAmount').value = '';
  document.getElementById('unitCount').value = '';
  document.getElementById('unitInputs').innerHTML = '';
  document.getElementById('result').style.display = 'none';
  document.getElementById('statusBadge').style.display = 'none';
  document.getElementById('downloadArea').style.display = 'none';
}

// 📄 Generate and download a PDF report of the current screen
function downloadFullPDF() {
  const element = document.querySelector('.container'); // Capture entire form area
  const filename = "Electricity_Bill_Report_2025_04_20_19_59.pdf"; // Use fixed or dynamic name

  const opt = {
    margin: 0.5,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, scrollY: 0 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save(); // Save PDF
}
