// 📅 نمایش تاریخ و زمان به‌صورت زنده (مناسب برای زبان دری و راست‌چین)
function updateDateTime() {
  const now = new Date();

  const formatted = now.toLocaleString('fa-AF', {
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

  // اعمال جهت و مرکزچین بودن در حالت RTL
  target.style.direction = 'rtl';
  target.style.textAlign = 'center';
}


setInterval(updateDateTime, 1000);
updateDateTime();

// 🔢 ایجاد ورودی‌های لازم برای هر واحد بر اساس تعداد وارد شده
function generateFields() {
  const unitCount = parseInt(document.getElementById('unitCount').value);
  const container = document.getElementById('unitInputs');
  container.innerHTML = '';

  if (!unitCount || unitCount <= 0) return;

  for (let i = 1; i <= unitCount; i++) {
    const div = document.createElement('div');
    div.className = 'unit-fields';
    div.innerHTML = `
      <label><b>واحد شماره ${i}</b></label>
      <table>
        <tr>
          <td>مقدار قبلی میتر:</td>
          <td>مقدار فعلی میتر:</td>
        </tr>
        <tr>
          <td><input type="number" id="prev-${i}" placeholder="مثلاً ۱۰۰"></td>
          <td><input type="number" id="curr-${i}" placeholder="مثلاً ۲۵۰"></td>
        </tr>
      </table>
    `;
    container.appendChild(div);
  }
}

// 🧮 محاسبه‌ی مصرف برق و سهم پرداختی هر واحد به‌صورت دقیق و منطقی
function computeBills() {
  const totalBill = parseFloat(document.getElementById('billAmount').value);
  const unitCount = parseInt(document.getElementById('unitCount').value);

  // ✅ بررسی صحت مقدار بل
  if (isNaN(totalBill) || totalBill <= 0) {
    alert("لطفاً مقدار معتبر بل را وارد نمایید.");
    return;
  }

  // ✅ بررسی صحت تعداد واحدها
  if (!unitCount || unitCount <= 0) {
    alert("لطفاً تعداد معتبر واحدها را وارد نمایید.");
    return;
  }

  let totalUsage = 0;
  let usages = [];

  // 🔍 بررسی و ثبت مصرف برای هر واحد
  for (let i = 1; i <= unitCount; i++) {
    const prevEl = document.getElementById(`prev-${i}`);
    const currEl = document.getElementById(`curr-${i}`);
    const prev = parseFloat(prevEl.value);
    const curr = parseFloat(currEl.value);

    // اگر فیلدها خالی باشند
    if (prevEl.value.trim() === '' || currEl.value.trim() === '') {
      alert(`لطفاً ارقام قبلی و فعلی را برای واحد شماره ${i} وارد نمایید.`);
      return;
    }

    // اگر مقدار عددی نباشد
    if (isNaN(prev) || isNaN(curr)) {
      alert(`لطفاً فقط ارقام عددی را برای واحد شماره ${i} وارد کنید.`);
      return;
    }

    // اگر رقم فعلی کمتر از قبلی باشد
    if (curr < prev) {
      alert(`رقم فعلی نمی‌تواند از رقم قبلی کمتر باشد (واحد شماره ${i}).`);
      return;
    }

    const usage = curr - prev;
    usages.push(usage);
    totalUsage += usage;
  }

  // بررسی مجموع مصرف
  if (totalUsage === 0) {
    alert("هیچ مصرفی ثبت نشده است. محاسبه امکان‌پذیر نیست.");
    return;
  }

  // 💰 محاسبه‌ی قیمت هر وات
  const pricePerWatt = totalBill / totalUsage;

  // 📊 ساخت نتایج نهایی برای نمایش
  let resultHTML = `<h3>💡 جزئیات بل</h3><ul>`;
  usages.forEach((usage, idx) => {
    const unitBill = Math.ceil(usage * pricePerWatt);
    resultHTML += `<li><strong>واحد شماره ${idx + 1}:</strong> ${unitBill} افغانی</li>`;
  });
  resultHTML += `</ul>
    <strong>مصرف کل برق:</strong> ${totalUsage.toFixed(2)} وات<br/>
    <strong>قیمت هر وات:</strong> ${pricePerWatt.toFixed(2)} افغانی`;

  // نمایش نتایج در صفحه
  const resultBox = document.getElementById('result');
  resultBox.innerHTML = resultHTML;
  resultBox.style.display = 'block';

  // فعال‌سازی بخش موفقیت و دکمه‌ی دانلود
  document.getElementById('statusBadge').style.display = 'block';
  document.getElementById('downloadArea').style.display = 'block';
}


// 🔄 پاک‌سازی فرم و مخفی‌سازی نتایج
function resetAll() {
  document.getElementById('billAmount').value = '';
  document.getElementById('unitCount').value = '';
  document.getElementById('unitInputs').innerHTML = '';
  document.getElementById('result').style.display = 'none';
  document.getElementById('statusBadge').style.display = 'none';
  document.getElementById('downloadArea').style.display = 'none';
}

// 📄 تولید فایل PDF از صفحه با درج تاریخ و ساعت در نام فایل و پشتیبانی کامل از RTL
function downloadFullPDF() {
  const element = document.querySelector('.container'); // انتخاب محتوای کامل برای چاپ

  // گرفتن زمان فعلی برای ساخت نام فایل
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');

  const timestamp = `${year}_${month}_${day}__${hour}_${minute}`;
  const filename = `گزارش_مصرف_برق_${timestamp}.pdf`;

  const opt = {
    margin: 0.5,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      scrollY: 0,
      useCORS: true,           // برای لود فونت‌ها و منابع خارجی
      letterRendering: true    // برای جلوگیری از تداخل حروف RTL/LTR
    },
    jsPDF: {
      unit: 'in',
      format: 'a4',
      orientation: 'portrait'
    }
  };

  html2pdf().set(opt).from(element).save(); // اجرای چاپ
}
