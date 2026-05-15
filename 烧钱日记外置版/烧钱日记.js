let items = [];
let goals = [];
let monthlySalary = 12000;
let balance = { val: 45000, date: new Date().toISOString() };
let currentPhotoBase64 = ''; // 图片存储

// 图片预览
function previewPhoto() {
    //传入元素ID
    const file = document.getElementById('photo').files[0];
    if (!file) return;
    //建立文件袋
    const reader = new FileReader();
    //读取文件数据并放入preview
    reader.onload = function(e) {
        currentPhotoBase64 = e.target.result;
        document.getElementById('preview').innerHTML = `<img src="${currentPhotoBase64}" alt="显示失败">`;
    };
    reader.readAsDataURL(file);
}
//将数据存入本地
function saveData() {
    localStorage.setItem('dailyItems', JSON.stringify(items));
    localStorage.setItem('dailyGoals', JSON.stringify(goals));
    localStorage.setItem('monthlySalary', monthlySalary);
    localStorage.setItem('balance', JSON.stringify(balance));
}
//解析本地
function loadData() {
    if (localStorage.getItem('dailyItems')) items = JSON.parse(localStorage.getItem('dailyItems'));
    if (localStorage.getItem('dailyGoals')) goals = JSON.parse(localStorage.getItem('dailyGoals'));
    if (localStorage.getItem('monthlySalary')) monthlySalary = parseFloat(localStorage.getItem('monthlySalary'));
    if (localStorage.getItem('balance')) balance = JSON.parse(localStorage.getItem('balance'));
    //解析本地数据后设置全局数据
    renderAll();
}
//导航栏
function switchTab(n) {
    //关闭全部页面
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    //显示选中的页面
    document.getElementById(`tab-${n}`).style.display = 'block';
    //变色选中页面
    document.querySelectorAll('.nav-btn').forEach((btn, i) => btn.classList.toggle('active', i === n));
}
//显示现在的时间
function change_time() {
    //获取当前时间
    const now = new Date();
    //传入当前时间
    const time=document.getElementById("time");
    //时间转为cn常用格式（str）
    time.innerText = now.toLocaleDateString('zh-CN');
}
//往前加一天
function addDay() {
    //获取当前时间
    const now_time_str = document.getElementById("time").innerText;
    //转化为时间制
    const now_time=new Date(now_time_str);
    //原本时间的日期加一天
    now_time.setDate(now_time.getDate() + 1);
    //将时间替代为加后的时间顺便转换
    document.getElementById("time").innerText = now_time.toLocaleDateString('zh-CN');
    //再次读取全部
    renderAll();
}
//往后剪一天
function reduceDay(){
    //获取当前时间
    const now_time_str = document.getElementById("time").innerText;
    //转化为时间制
    const now_time=new Date(now_time_str);
    //原本时间的日期剪一天
    now_time.setDate(now_time.getDate() - 1);
    //将时间替代为加后的时间顺便转换
    document.getElementById("time").innerText = now_time.toLocaleDateString('zh-CN');
    //再次读取全部
    renderAll();
}
//计算日均
function calculateDailyCost(item) {
    // 获取时间
    const now_time = document.getElementById("time").innerText;
    const now = new Date(now_time);
    const purchaseDate = new Date(item.date);

    // 已使用天数（+1修正，第一天就开始递减）
    let daysPassed = Math.floor((now - purchaseDate) / 86400000) + 1;
    daysPassed = Math.max(daysPassed, 1);

    // 折旧周期设定（你的原有规则不变）
    let cycle = 90;
    if (item.mode === 2) cycle = 30;          // 买断30天
    else if (item.kind === "数码产品") cycle = 180; // 数码180天

    const totalPrice = item.price;
    const baseAvg = totalPrice / cycle; // 基础日均

    // 线性递减参数（可根据喜好调整）
    const firstDayCost = baseAvg * 1.9;  // 第一天最高成本
    const absoluteMin = baseAvg * 0.05;  // 绝对底线，永远不会低于这个值
    const stage1Decrease = (firstDayCost - baseAvg) / (cycle - 1); // 阶段1每天减少的金额

    let dailyCost;

    if (daysPassed <= cycle) {
        // 阶段1：快速递减（0~周期天）
        dailyCost = firstDayCost - (daysPassed - 1) * stage1Decrease;
    } else if (daysPassed <= 2 * cycle) {
        // 阶段2：中速递减（周期~2×周期天）
        const stage2Start = baseAvg;
        const daysInStage2 = daysPassed - cycle;
        dailyCost = stage2Start - daysInStage2 * (stage1Decrease / 2);
    } else if (daysPassed <= 4 * cycle) {
        // 阶段3：慢速递减（2×周期~4×周期天）
        const stage3Start = baseAvg - cycle * (stage1Decrease / 2);
        const daysInStage3 = daysPassed - 2 * cycle;
        dailyCost = stage3Start - daysInStage3 * (stage1Decrease / 4);
    } else {
        // 阶段4：极慢速递减（4×周期天以后）
        const stage4Start = baseAvg - cycle * (stage1Decrease / 2) - 2 * cycle * (stage1Decrease / 4);
        const daysInStage4 = daysPassed - 4 * cycle;
        dailyCost = stage4Start - daysInStage4 * (stage1Decrease / 10);
    }

    // 强制锁住绝对底线，永远不为0
    return Math.max(dailyCost, absoluteMin);
}

//添加资产
function addItem() {
    //提取物品名称
    const name = document.getElementById('name').value.trim() || '未命名物品';
    //提取物品价格
    const dateInput = document.getElementById('date').value;
    const date = dateInput ?new Date(dateInput) : new Date();
    const price = parseFloat(document.getElementById('price').value);
    //提取物品种类
    const kind = document.getElementById('kind').value;
    //提取计算模式
    const mode = parseInt(document.getElementById('mode').value);
    //如果价格为空阻塞
    if (!price || price <= 0) return alert('请输入有效价格');
    //哈希表放放入items数组
    items.push({
        name: name,
        price: price,
        kind: kind,
        mode: mode,
        date: date,
        photo: currentPhotoBase64 || ''
    });
    //减去存款
    balance.val = Math.max(0, balance.val - price);
    //当前相片放空防止再次显示
    currentPhotoBase64 = '';
    //数据转为json文件存储在本地
    saveData();
    //再次读取本地数据重新计算全局
    renderAll();
    //全部置为空
    document.getElementById('name').value = '';
    document.getElementById('price').value = '';
    document.getElementById('photo').value = '';
    document.getElementById('preview').innerHTML = '';
}
//删除资产
function removeItem(index) {
    //存款重新加回
    balance.val += items[index].price;
    //同时更新存款改变的时间
    balance.date = new Date().toISOString();
    //删除index当前物品下标，删除1个
    items.splice(index, 1);
    //存入本地
    saveData();
    //读取重新显示
    renderAll();
}
//显示资产
function renderItems() {
    //取ID放入容器
    const container = document.getElementById('items-list');
    //将原有数据置空
    container.innerHTML = '';
    //将全部日均置0
    let totalDaily = 0;
    let all_item_money = 0;
    //取到当前items的所有数据
    items.forEach((item, i) => {
        //计算每件物品的日均价格
        const daily = calculateDailyCost(item);
        //全部日均价格
        totalDaily += daily;
        //取到当前标签
        const div = document.createElement('div');
        //设置为物品标签
        div.className = 'item';
        //全部总价
        all_item_money += item.price;
        //照片先设置为空（str）
        let imgHtml = '';
        //传入照片
        if (item.photo) {
            imgHtml = `<img src="${item.photo}" class="item-img" alt="照片未正常显示">`;
        }
        //div标签放入元素
        div.innerHTML = `
    ${imgHtml ? `<img src="${item.photo}" style="width:100%;height:100px;object-fit:cover;border-radius:6px;margin-bottom:8px;display:block;" alt="">` : ''}
    <div style="font-size:14px;color:#333;line-height:1.4;">${item.name}</div>
    <div style="font-size:12px;color:#999;margin:4px 0;">${item.kind}</div>
    <div style="color:#e64340;font-size:15px;font-weight:bold;">¥${item.price.toLocaleString()}</div>
    <div style="font-size:12px;color:#0066ff;margin:2px 0;">日均 ¥${daily.toFixed(2)}</div>
    <div style="font-size:11px;color:#aaa;margin:4px 0;">${new Date(item.date).toLocaleDateString('zh-CN')}</div>
    <div style="display:flex;gap:10px;margin-top:6px;">
        <button onclick="removeItem(${i})" style="flex:1;background:#cc0000;color:#fff;border:none;border-radius:4px;padding:4px 0;font-size:12px;">删除</button>
        <button onclick="togglePanel(${i})" style="flex:1;background:#cc0000;color:#fff;border:none;border-radius:4px;padding:4px 0;font-size:12px;">出售</button>
    </div>
    <div 
    id="sellPanel_${i}" 
    style="overflow:hidden; height:0; transition:height 0.3s linear; margin-top:0; padding:0; background:#f5f5f5; border-radius:6px;">
  <!-- 展开内容 -->
        <div style="">
            <input type="text" id="sell_item_${i}" placeholder="580">
            <bottle onclick="satellite(${i})" style="cursor: pointer; flex:1;background:#cc0000;color:#fff;border:none;border-radius:4px;padding:4px 0;font-size:12px;">确认出售</button>
        </div>
    </div>`;
        //放入容器中
        container.appendChild(div);
    });
    //遍历后取总金额标签
    let all_money=document.getElementById('all_money');
    //放入总金额数值
    all_money.innerText=all_item_money;
    const warningSpan=document.getElementById('warning');
    // 基础样式（所有级别通用）
    const baseStyle = "display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; margin-left: 5px;";
    const dailySalary = monthlySalary / 30;
    //取日均标签放入日均金额
    document.getElementById('total-daily').textContent = `¥ ${totalDaily.toFixed(2)}`;
    if (totalDaily > dailySalary * 0.95) {
        // 严重警告（红色）
        warningSpan.style.cssText = baseStyle + "background-color: #fff1f0; color: #f5222d; border: 1px solid #ffa39e;";
        warningSpan.textContent = "严重超标";
        return 3;
    } else if (totalDaily > dailySalary * 0.7) {
        // 一般警告（橙色）
        warningSpan.style.cssText = baseStyle + "background-color: #fff7e6; color: #fa8c16; border: 1px solid #ffd591;";
        warningSpan.textContent = "接近上限";
        return 2;
    } else {
        // 正常（蓝色）
        warningSpan.style.cssText = baseStyle + "background-color: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff;";
        warningSpan.textContent = "正常";
        return 1;
    }
}
//动效
function togglePanel(idx) {
    let panel = document.getElementById('sellPanel_' + idx);

    if (panel.style.height === '0px' || panel.style.height === '') {
        // 展开：自动计算内容高度 + 线性动画
        panel.style.height = panel.scrollHeight + 'px';
        panel.style.paddingTop = 'px';
        panel.style.paddingBottom = 'px';
    } else {
        // 收起
        panel.style.height = '0px';
        panel.style.paddingTop = '0';
        panel.style.paddingBottom = '0';
    }
}

//出售
function satellite(index){
    //添加存款
    const val = parseFloat(document.getElementById('sell_item_'+index).value);
    balance.val += val;
    balance.date = new Date().toISOString();
    items.splice(index, 1); // 删除目标数组里的项
    saveData();//保存
    renderAll();//读取
}

//添加目标
function addGoal() {
    //取goal当前值
    const name = document.getElementById('goal-name').value.trim() || '未命名目标';
    //取金额
    const amount = parseFloat(document.getElementById('goal-amount').value);
    if (!amount || amount <= 0) return alert('请输入目标金额');
    //goals数组放入数据
    goals.push({ name, amount});
    //存入本地
    saveData();
    //计算目标
    calculateGoal();
    //设置为空
    document.getElementById('goal-name').value = '';
    document.getElementById('goal-amount').value = '';
    alert("添加目标成功");
}
//计算目标
function calculateGoal() {
    //计算日均薪水
    const dailyIncome = monthlySalary / 30;
    let html = '<strong>目标达成预估：</strong><br><br>';
    //取数goals组内数据
    goals.forEach((g, index) => {
        const remaining = g.amount - balance.val;
        if (remaining <= 0) {
            html += `${g.name}：已达成！<br>`;
        } else {
            const days = Math.ceil(remaining / dailyIncome);
            html += `${g.name}：约 <strong>${days}</strong> 天（${Math.ceil(days/30)} 个月）<br>`;
        }
        // 重点修复：调用 removeGoal 并传 index
        html += `<button onclick="removeGoal(${index})" style="margin-top:12px;background:#cc0000;color:white;width:auto;padding:6px 14px;border:none;border-radius:4px;">删除</button><br><br>`;
    });
    //取目标
    const resultDiv = document.getElementById('goal-result');
    //放入文字
    resultDiv.innerHTML = html;
    //设置为显示
    resultDiv.style.display = 'block';
}
//删除目标
function removeGoal(index) {
        //删除目标
        goals.splice(index, 1); // 删除目标数组里的项
        saveData();//保存
        renderAll();//读取
}
//设置月薪
function updateSalary() {
    //获取输入的数值
    const val = parseFloat(document.getElementById('set-salary').value);
    if (val > 0) {
        //更新月薪
        monthlySalary = val;
        saveData();
        renderAll();
        alert('月薪已更新');
    }
    document.getElementById('set-salary').value = '';
}
//设置存款
function updateBalance() {
    //取输入的数据
    const val = parseFloat(document.getElementById('set-balance').value);
    if (val >= 0) {
        //更新存款
        balance.val = val;
        balance.date = new Date().toISOString();
        saveData();
        renderAll();
        alert('存款已更新');
    }
    //设置为空
    document.getElementById('set-balance').value = '';
}
//显示与读取数据
function renderAll() {
    //取到当前页面时间
    const now_time = document.getElementById("time").innerText;
    //转换时间
    const now = new Date(now_time);
    //获取存款过去时间
    const purchaseDate = new Date(balance.date);
    //计算过去时间
    let daysPassed = Math.floor((now - purchaseDate) / 86400000)+1;
    //计算月薪水
    const dailyIncome = monthlySalary / 30;
    //计算金额
    const total = balance.val + daysPassed * dailyIncome;
    //取得ID并放入参数
    document.getElementById('balance-display').textContent = `¥ ${total.toLocaleString()}`;
    document.getElementById('salary-display').textContent = `¥ ${monthlySalary.toLocaleString()}`;
    document.getElementById('daily-income').textContent = dailyIncome.toFixed(0);
    //读取并显示资产
    renderItems();
    //计算目标
    calculateGoal();
    renderTrendCharts();
}

// 一键清空本地所有数据
function clearAllLocalData(){
    if(!confirm('⚠️ 确定要清空所有数据？消费记录、存钱目标、月薪、存款全部都会删除，不可恢复！')){
        return;
    }
    // 清空 localStorage
    localStorage.removeItem('dailyItems');
    localStorage.removeItem('dailyGoals');
    localStorage.removeItem('monthlySalary');
    localStorage.removeItem('balance');

    // 清空内存变量
    items = [];
    goals = [];
    monthlySalary = 0;
    balance = { val: 0, date: new Date().toISOString() };

    // 重新渲染页面
    renderAll();
    alert('已清空所有本地数据');
}

// 资产页面 展开/收起 功能
// 滚动触发从下滑入
function checkScrollShow() {
    const els = document.querySelectorAll('.fade-up');
    els.forEach(el => {
        // 判断元素是否进入屏幕可视区域
        const rect = el.getBoundingClientRect();
        if(rect.top < window.innerHeight - 80) {
            el.classList.add('show');
        }
    });
}

// 滚动时一直检测
window.addEventListener('scroll', checkScrollShow);

window.onload = () => {
    //首先确定系统时间
    change_time();
    //读取本地数据
    loadData();
    //启用滑动动效
    checkScrollShow();
    //运行页面切换
    switchTab(0);
    //动效
    document.getElementById('add_item').addEventListener('click', function () {
        document.getElementById('expandBox').classList.toggle('show');
    });
};