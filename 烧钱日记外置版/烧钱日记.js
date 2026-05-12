let items = [];
let goals = [];
let monthlySalary = 12000;
let balance = 45000;
let currentPhotoBase64 = ''; // 图片存储

// 图片预览
function previewPhoto() {
    const file = document.getElementById('photo').files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        currentPhotoBase64 = e.target.result;
        document.getElementById('preview').innerHTML = `<img src="${currentPhotoBase64}">`;
    };
    reader.readAsDataURL(file);
}

function saveData() {
    localStorage.setItem('dailyItems', JSON.stringify(items));
    localStorage.setItem('dailyGoals', JSON.stringify(goals));
    localStorage.setItem('monthlySalary', monthlySalary);
    localStorage.setItem('balance', balance);
}

function loadData() {
    if (localStorage.getItem('dailyItems')) items = JSON.parse(localStorage.getItem('dailyItems'));
    if (localStorage.getItem('dailyGoals')) goals = JSON.parse(localStorage.getItem('dailyGoals'));
    if (localStorage.getItem('monthlySalary')) monthlySalary = parseFloat(localStorage.getItem('monthlySalary'));
    if (localStorage.getItem('balance')) balance = parseFloat(localStorage.getItem('balance'));
    renderAll();
}

function switchTab(n) {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.getElementById(`tab-${n}`).style.display = 'block';
    document.querySelectorAll('.nav-btn').forEach((btn, i) => btn.classList.toggle('active', i === n));
}

function calculateDailyCost(item) {
    const now = new Date();
    const purchaseDate = new Date(item.date);
    let daysPassed = Math.floor((now - purchaseDate) / (86400000));

    let period = 90;
    if (item.mode === 2) period = 30;
    else if (item.kind === "手机" || item.kind === "笔记本") period = 180;
    let all_money = item.price;
    let more_day = period;

    if (daysPassed >= period) {
        more_day = period + period * Math.ceil(daysPassed / period);
    }

    let day_money = all_money * (1 + 0.01 * (more_day - 2 * daysPassed + 1))/period;
    const minDaily = all_money / (period * 3);
    return Math.max(minDaily, day_money);
}

function addItem() {
    const name = document.getElementById('name').value.trim() || '未命名物品';
    const price = parseFloat(document.getElementById('price').value);
    const kind = document.getElementById('kind').value;
    const mode = parseInt(document.getElementById('mode').value);

    if (!price || price <= 0) return alert('请输入有效价格');

    items.push({
        name: name,
        price: price,
        kind: kind,
        mode: mode,
        date: new Date().toISOString(),
        photo: currentPhotoBase64 || ''
    });

    balance = Math.max(0, balance - price);
    currentPhotoBase64 = '';
    saveData();
    renderAll();

    document.getElementById('name').value = '';
    document.getElementById('price').value = '';
    document.getElementById('photo').value = '';
    document.getElementById('preview').innerHTML = '';
}

function removeItem(index) {
    if (confirm('确定删除此记录？')) {
        items.splice(index, 1);
        saveData();
        renderAll();
    }
}

function renderItems() {
    const container = document.getElementById('items-list');
    container.innerHTML = '';
    const money=document.getElementById('all_money');
    let totalDaily = 0;
    let all_item_money = 0;
    items.forEach((item, i) => {
        const daily = calculateDailyCost(item);
        totalDaily += daily;
        const div = document.createElement('div');
        div.className = 'item';
        all_item_money += item.price;
        let imgHtml = '';
        if (item.photo) {
            imgHtml = `<img src="${item.photo}" class="item-img" alt="照片未正常显示">`;
        }

        div.innerHTML = `
                ${imgHtml}
                <strong>${item.name}</strong>　<span style="color:#666">(${item.kind})</span><br>
                原价 ¥${item.price.toLocaleString()}　|　
                <span style="color:#0066ff;font-weight:700">日均 ¥${daily.toFixed(2)}</span><br>
                <small>购买于 ${new Date(item.date).toLocaleDateString('zh-CN')}</small>
                <button onclick="removeItem(${i})" style="margin-top:12px;background:#cc0000;width:auto;padding:6px 14px;">删除</button>
            `;
        container.appendChild(div);
    });
    let all_money=document.getElementById('all_money');
    all_money.innerText=all_item_money;
    document.getElementById('total-daily').textContent = `¥ ${totalDaily.toFixed(2)}`;
}

function addGoal() {
    const name = document.getElementById('goal-name').value.trim() || '未命名目标';
    const amount = parseFloat(document.getElementById('goal-amount').value);

    if (!amount || amount <= 0) return alert('请输入目标金额');

    goals.push({ name, amount });
    saveData();
    calculateGoal();
}

function calculateGoal() {
    const dailyIncome = monthlySalary / 30;
    const dailyEat = 80;
    const netDaily = dailyIncome - dailyEat;

    let html = '<strong>目标达成预估：</strong><br><br>';
    goals.forEach(g => {
        const remaining = g.amount - balance;
        if (remaining <= 0) {
            html += `${g.name}：已达成！<br>`;
        } else {
            const days = Math.ceil(remaining / netDaily);
            html += `${g.name}：约 <strong>${days}</strong> 天（${Math.ceil(days/30)} 个月）<br>`;
        }
    });

    const resultDiv = document.getElementById('goal-result');
    resultDiv.innerHTML = html;
    resultDiv.style.display = 'block';
}

function updateSalary() {
    const val = parseFloat(document.getElementById('set-salary').value);
    if (val > 0) {
        monthlySalary = val;
        saveData();
        renderAll();
        alert('月薪已更新');
    }
}

function updateBalance() {
    const val = parseFloat(document.getElementById('set-balance').value);
    if (val >= 0) {
        balance = val;
        saveData();
        renderAll();
        alert('存款已更新');
    }
}

function renderAll() {
    document.getElementById('balance-display').textContent = `¥ ${balance.toLocaleString()}`;
    document.getElementById('salary-display').textContent = `¥ ${monthlySalary.toLocaleString()}`;
    document.getElementById('daily-income').textContent = (monthlySalary / 30).toFixed(0);
    renderItems();
    calculateGoal();
}

window.onload = () => {
    loadData();
    switchTab(0);
};