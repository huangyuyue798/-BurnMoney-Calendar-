# BurnMoney-Calendar-
2026/5/6
中文：
「烧钱日历」帮你实时记录资产变化，自动计算日均花费，并以直观日历和图表形式呈现。输入你的收入、支出和资产，它会告诉你：按照当前速度，你的钱还能烧多久。适合所有想管住消费、拒绝月光、为未来存下第一桶金的年轻人。
English:
BurnMoney Calendar tracks your assets in real-time, automatically calculates your daily burn rate, and displays it through clear calendars and charts. Just input your income, expenses, and assets — it will tell you exactly how long your money can last at the current pace.

前言：
这个程序是作者在大学无聊的时候写的，至于什么时候写完，
我想大概是6月中旬左右会写完这个程序
应该会写出来一个大粪，作者尽量尽最大努力一个月左右写出来。

软件本身不是提倡贷款提前消费（消费主义），可是纵观欧美国家贷款等超前消费在年轻人中早已司空见惯
所以我想用这个软件告诉当下年轻人，特别是大学生适度超前享受可以但是不能过度
「没有必要去追求每年都换手机换电脑，有一部顶配的手机，电脑非刚需用个五，六年足够了」
以后这个软件会有很多个版本，我会用一生的时间去尽力维护这个软件。
打包成MacBook，Window，iPhone，Android等版本
直到最终好用，能让人们能够每天打开来看一下的版本

技术栈
"""
其实作者写这个文档的时候只会c,c++,python,javascript，其他会的都是grok给编的，
大一上的学的时候感觉有点像无头苍蝇，起因是作者喜欢用花呗超前消费，
现在大一下故想出这个项目以战养战
"""

小程序框架,微信原生小程序,原生性能更好
前端语言,JavaScript,只会这个
UI 组件库,WeUI
图表,echarts-for-weixin,支持日历折线图、饼图
数据存储,微信云数据库（JSON）,支持权限控制
后端逻辑,云函数（Python）
身份验证,云开发登录（openid）
状态管理,原生全局数据
