"""
2026/5/6
----------------------------------------------------------------
模式一：
主要物品的函数算法：

主要通过3个月为即90天为日均费用，至于为什么是90天，因为大部分花呗免息都是90天左右
像我最近买的a380的intel显卡
580用了分期3个月大概是每天多支出6.5左右

使用时间超过3个月则顺延多30天日均就按照
580/(90+30)=4.8...以此类推
----------------------------------------------------------------
其他特殊算法：
例如手机或笔记本等大额度免息为6个月即180天为日均费用
也是和上文一样的，只不过这算法在不是在原来的基础上识别是手机还是笔记本
而是在这个对象被创建的时候就被确定
----------------------------------------------------------------
模式二：
统一算法：
这个算法适用于习惯一次性买断而存不住钱的人（月光族）
按月来累计也就是我上面写的a380算法的顺延
从每个月买入那天开始一直累计30天减少均价
----------------------------------------------------------------
----------------------------------------------------------------
工资算法：
按每个月工资均分30天，摊下来的日均可花费
未来尝试接入基金api将理财收支也添加
----------------------------------------------------------------
目标算法：
通过计算工资和总资产，算出按照当下的花费大概要多久才能买一部你设置金额的车或房子
目标算法我还没想出来怎么写，打算写个简单的预测模型或者纯粹的简单算数
date=goal/(存款-总花销+日均工资)

----------------------------------------------------------------
未来如果移动设备的ai能力大幅度提升我会尝试在设备上内置一个专为金融思考的大模型
完全在你的本地运行无需担心安全泄漏
更多会慢慢变成一个一站式理财软件
例如很多人会赚钱，但是不会尝试去理财，去配置资产

2026/5/7
昨晚上考虑了一下仅仅是通过固定的算法来计算每日固定的花销有点枯燥
我打算将算法改成 更加线性的，还是按照上面的算法来算就是580/90嘛，
580分成90份就是6.5一天然后将6.5分为90份，例如第一天就是6.5+6.5*0.01*89
这里的89天就是前面的89天每天取出1%份出来
以此类推：
第二天就是6.5+6.5*0.01*88-6.5*(2-1)*0.01

简化的数学表达式就是
原金额+原金额*0.01*(天数范围-天数)-原金额*(天数-1)*0.01
=原金额*(1+0.01*(天数范围-天数)-0.01*(天数-1))
=原金额*(1+0.01*(天数范围-2*天数+1))
"""

#所有的类都是模拟数据环境后期通过读取获得数据
#设置类的函数都是以模拟为主，设置类函数后期都会在json中
#获取数据并运算

from datetime import date
#读取从微信数据控中的json数据
import json
import math

class person:
    #后期在JavaScript中选择并存入数据库，python暂时模拟
    eat_money=0
    #所有日花费
    all_pay_money = 0
    #所有存款
    all_balance = 0
    #每个月存款（月薪）
    mouth_balance = 0
    #模式，默认为买断模式
    mode=2
    #计算总的日均花销
    all_day_money = 0

    #记录创造日期无法更改,用户传入创造日期
    def __init__(self,user_date=date(1949,10,1)):
        self.creative_date=user_date

    #记录一次所有存款
    def init_all_balance(self, all_balance_money):
        self.all_balance = all_balance_money

    #记录每月收入
    def init_mouth_balance(self, mouth_money):
        self.mouth_balance = mouth_money
        self.add_money()
        #返回月薪至数据库
        return self.mouth_balance

    #记录每日吃喝花销，并更改数据库
    def init_eat_money(self, add_money):
        self.eat_money = add_money

    #选择模式后期在JavaScript中选择并存入数据库，python暂时模拟
    def change_mode(self, mode):
        self.mode = mode
    #修改月薪为日薪，并存入数据库
    def add_money(self):
        add_money = self.mouth_balance / 30
        #修改月薪后更改为日薪并存入数据库
        return add_money

class goods(person):

    #假示在javas中的对象。
    def __init__(self, kind="", name="", money=0, today=date(1949, 10, 1)):
        super().__init__()
        self.name = name
        self.kind = kind
        self.money = money
        self.date = today
        self.all_pay_money += money
        self.day_money = 0
        #更新存款
        self.change_balance()
    #更新存款
    def change_balance(self):
        self.all_balance -= self.money
        #更新数据库存款
        return self.all_balance

    #模式一：90天算法
    def ninety_day(self):
        all_money=self.money
        now_day=date.today()
        last_day=now_day-self.date
        #判断是否超出90天
        if last_day.days<90:
            day_money = all_money*(1+0.01*(90-2*last_day.days+1))
        else:
            #计算超出90天的天数也就是超过90天就累加90
            more_day = 90+90*(math.ceil(last_day.days/90))
            day_money = all_money*(1+0.01*(more_day-2*last_day.days+1))
        return day_money

    #180天大额资产算法
    def day180s(self):
        all_money = self.money
        now_day = date.today()
        last_day = now_day - self.date
        # 判断是否超出180天
        if last_day.days < 180:
            day_money = all_money * (1 + 0.01 * (180 - 2 * last_day.days + 1))
        else:
            # 计算超出90天的天数也就是超过90天就累加90
            more_day = 180 + 180 * (math.ceil(last_day.days / 180))
            day_money = all_money * (1 + 0.01 * (more_day - 2 * last_day.days + 1))
        return day_money

    #模式二：30天算法
    def thirty_day(self):
        all_money=self.money
        now_day = date.today()
        last_day = now_day - self.date
        # 判断是否超出30天(实际和上面是一样的只是分开来了，无需判断模式减少性能开销)
        if last_day.days < 30:
            day_money = all_money * (1 + 0.01 * (30 - 2 * last_day.days + 1))
        else:
            # 计算超出30天的天数也就是超过90天就累加90
            more_day = 30 + 30 * (math.ceil(last_day.days / 30))
            day_money = all_money * (1 + 0.01 * (more_day - 2 * last_day.days + 1))
        return day_money

    #计算后覆盖云数据并重新上传，上传每件物品的日均价格和 总的花费
    def init_day_money(self):
        #模式二无需判断：
        if self.mode==2:
            self.day_money = self.thirty_day()
            self.all_pay_money += self.day_money
            return
        #判断模式一类型：
        if self.kind=="手机":
            self.day_money = self.day180s()
            self.all_pay_money += self.day_money
        else:
            self.day_money = self.ninety_day()
            self.all_pay_money += self.day_money

    # 分别计算每日累加后的钱,JavaScript最后调用
    def init_all_add_money(self):
        self.all_balance += self.add_money
        self.all_balance -= self.all_pay_money
        #最后传入数据库中并且更改all_balance(存款)
        return self.all_balance

#创造目标类，主要是大额目标
#或者月光族小额物品也可以使用这个算法（会在javas中说明用法）
class goal(person):
    def __init__(self, goal_money, goal_name):
        super().__init__()
        self.long_day = None
        self.goal_money = goal_money
        self.goal_name = goal_name
    #计算还有多少天可以买到目标物品

    #采用最简单的算法(goal-存款)/(日薪-吃)
    def loog_day(self):
        self.long_day=(self.goal_money-self.all_balance)/(self.add_money()-self.eat_money)
        return self.long_day