#主流浏览器及其内核
IE      &nbsp;   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  trident

Firefox     &nbsp; Gecko

Google   &nbsp;  webkit/blink

Safari  &nbsp;&nbsp;&nbsp;&nbsp;  webkit

Opera   &nbsp; &nbsp; presto




#基础标签
段落标签 &lt;p&gt;  成段展示  <br>
加粗  &nbsp;&nbsp; &lt;strong&gt;<br>
斜体  &nbsp;&nbsp; &lt;em&gt;<br>
加粗斜体： 嵌套  &lt;em&gt; &nbsp; &lt;strong&gt;<br>


 <del>中划线  </del>   &nbsp;&nbsp;&nbsp;  &lt;del&gt;            
地址标签     <address> 


#div & span
&lt;div&gt;块元素  另起一行  结构化、绑定化<br>
&lt;span&gt; 行内元素    只占所写内容的宽度
   
#空格
文本分隔符 很多空格只代表一个<br>
``&nbsp;   代表一个空格 ``

``&lt;     代表<``

``&gt;     代表>``
#单标签
``<meta>``
``<br>``
``<hr>``

#有序列表
<ol>
<li >这是有序列表 ol </li>
<li >这是有序列表 ol </li>
<li >这是有序列表 ol </li>
</ol>
<h4>属性种类</h4>  
5种

字母 ABCD/abcd   &lt;ol type="A"&gt; <br>
罗马数字 I/i   &lt;ol type="i"&gt;

<h4>从几开始 start </h4>
 &lt;ol type="A"start="3" &gt; 
 <p>从几开始就写几，和种类无关 </p>
 
#无序列表
&lt;ul&gt;

type="circle/discircle/square "

css中不要前面的圆圈 list-style=none;


#图片引入
&lt;img&gt;
 
 属性 ：
 
alt  图片占位符。当图片显示不出来时的替代文字
title 图片提示符。鼠标放在图片上时提示的信息

#a标签属性作用
href 放网址

1.超链接  新标签页 target =" _blank"

2.锚点 记录内容 

3.打电话,发邮件   href="tel:18768117821"

4.协议限定符

死循环  href="javascript;while(1){alert(""hh")}"on click me 

#form 
method 发送数据的方式 get/post




action 发送的地址 




&lt;input type="text/password/submit/radio/checkbox/select  name="" &gt;
默认选中 checked="checked"

1.text 文本框

2.password 密码框

3.submit 默认的字是提交，修改值：value="" 

4.radio 单选框  到一道题目中。归属到同一个name  值 value 

5.checkbox  复选框
name 数据名  后端收到 数据名=数据值 

6.select     option 

加密 md5

#meta
<meta content="clothes" name="keywords">
  <meta content="this is the clothes you will like" name="description">
  搜索关键词
  #鼠标聚焦/离开
  onfocus / onblur
  
  