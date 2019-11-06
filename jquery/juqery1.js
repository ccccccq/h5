var a= {};

$(document).ready(function(){
    //$(function(){}) 是 $(document).ready(function())的简写
    // 在DOM（document object model）加载完毕之后执行,即页面所有的html标签（包括图片等）都加载完了
   function htmlAndCss(){
        $(".box").html();//html里面不带任何内容，表示获取标签里面的元素。
        $(".test_button").html("<input type='text'>");
        $(".box").css("background-color","blue");
        console.log($(".box").css("background-color"));
        $(".box").css({"width":"100px","height":"200px"});
    };
   //css样式
    function hello(){
        $(".box").html();//html里面不带任何内容，表示获取标签里面的元素。
        $(".test_button").html("<input type='text'>");
        $(".box").css("background-color","blue");
        console.log($(".box").css("background-color"));
        $(".box").css({"width":"100px","height":"200px"});
    };
    a.b=htmlAndCss;
    a.c=hello;
});
//选择不包含指定类的那个标签
function showNotInclude(){
   $("li").not(".a").css("background-color","red");
};

//eq() 查找指定索引的标签
 function eqWhich(){
   $("li").eq(1).css("background-color","red");
   $("li:eq(3)").css("background-color","green");
   $("li:eq(-2)").css("background-color","yellow");
 };
 //选取有固定属性的某一个元素
function fixAttribute(){
  $("[placeholder]").css("background-color","blue");
};
//第一个元素 以及每个 ul 元素的第一个 li
function firstAndEvery() {
    $("ul li:first").css("background-color","black");
    $("ul li:first-child").css("width","100px");
}

//选取所有某个 属性值等于 “xxx” 的a元素  (不等于)
function chooseAllOrNot(){
    $("li[class='a']").css("background-color","purple");
    $("li[class!='a']").css("background-color","pink");
}
//选取所有 type=“button” 的 input元素 和 button元素
function chooseAllType() {
    $(":button").css("background-color","blue");
}
//选取奇数/偶数位置的某个元素
function chooseOddOrEven(){
    $("li:even").css("background-color","green");
    $("li:odd").css("background-color","yellow");
}
//选取前一个/前面所有/后面一个/后面所有的元素
function prevAndNext(){
    $("ul:eq(1) .b").prev().css("background-color","green");
    $("ul:first .c").prevAll().css("background-color","yellow");
    $("ul:eq(1) .b").nextAll().css("background-color","purple");
    $("ul:first .c").next().css("background-color","red");
}
//a has(b) 修改查找到的父级元素a  find(b) 按照dom树一级一级向下找的子、孙b
//children 只返回一层，直接子元素
function hasAndFind(){
    $("ul").find("li:eq(0)").css("background-color","green");
    $("ul").children("li:eq(2)").css("background-color","blue");
    $(".box").has(".a").css("background-color","yellow");
}
//siblings()选择器    排他，除了选中的不做改变,其他都改了
function selectSiblings() {
      $("ul li").css("background-color","yellow");
      $("ul .b").siblings().css("background-color","green");
      $("li").siblings(".c").css("background-color","blue");
}
//父级选择器
function selectParent(){
    var flag = 0;
    $(".test_button").click(function(){
      if(flag == 0) {
          $(".b").parent().hide();
          flag = 1;
      }
      else{
          $(".b").parent().show();
          flag = 0;
      }
    })
}
//获取元素下标
function getElementIndex(){
    $("ul").on("click","li",function(){
        var index=$(this).index()+1;
        console.log(index);
    })
}
//添加删除切换类  addClass 添加 removeClass 删除 toggleClass 切换
function changeClass(){
    var flag = 1;
    $(".test_button").click(function (){
        if(flag){
            $("ul").addClass("Spec");
            $("ul").find("li").css("color","green");
            flag = 0;}
        else{
            $("ul").removeClass("Spec");
            $("ul").find("li").css("color","black");
            flag = 1;
        }
        });
    $(".test_button").hover(function(){
       $("ul").toggleClass("Spec red");
    });
}
//animate动画  自定义动画函数
// 四个参数：1.css样式，不支持颜色的设置，如果要用，需要下载其他插件。
// 2.变形的时间，以毫秒为单位。slow,normal,fast.
// 3.easing ：linear/swing 两种。前者匀速，后者前面慢后面快。
// 4.callback
function animateTry(){
    $("ul:first li:eq(0)").css("background-image","url(\"1.jpg\")").animate({"width":"100px"},5000,"linear",function(){
        console.log("1");
    });
    $("ul:eq(1) li:eq(3)").css("background-image","url(\"1.jpg\")").animate({"width":"100px"},5000,"swing");
}
 //淡入淡出 fadeIn() fadeOut()
function fadeInAndOut(){
    $("ul li:eq(1)").attr("display","none");
    var index = $("ul li:eq(-1)").index()+1;
    var i=1;
    $(".test_button").click(function(){
        if(i<index+1){
           $("ul li:eq(-"+i+")").fadeOut();
           i++;
        }
        else if(i<index*2+1)
        {
            iN=i-1;
            $("ul li:eq("+iN+")").fadeIn();
            i++;
        }
    });
}
//淡入淡出切换 当目前显示是，点击隐藏。隐藏时，点击显示。fadeToggle()
function fadeToggle(){
    $(".test_button").click(function(){
        $("ul li:eq(1)").fadeToggle();
    });
}
//fadeTo()渐变为给定的不透明度  区间 0-1
function fadeTo(){
    $(".test_button").click(function(){
        $("ul li:eq(1)").fadeTo("slow",0.2);
    });
}
//向上、向下滑动效果 slideUp()  sliceDown()
function slideUpAndDown(){
    var flag = 1;
    $(".test_button").click(function() {
        if(flag){
        $("ul").slideUp();
        flag = 0;}
        else{
            $("ul").slideDown();
            flag =1 ;
        }
    });
}
//滑动切换效果 slideToggle()
function slideToggle(){
    $(".test_button").click(function() {
      $("ul").slideToggle();
    });
}
// 对于HTML元素本身就带有的固有属性，在处理时，使用prop方法,比如,checked。
// 对于HTML元素我们自己自定义的DOM属性，在处理时，使用attr方法。
function propAttribute(){
    $(".test_button").click(function(){
        console.log($("#check1").prop("checked"));
        $("#check2").prop("checked",false);
    });
}

//each 遍历DOM：$("XX").each()
 //       遍历数据: $.each()
function eachEvent(){
    $("li").each(function () {
      console.log($(this).attr("class"));
    });
}

//鼠标事件 :mouseover mouserout mouseup mousedown (mouseleaver mouseenter)hover click dbclick
//焦点事件 focus /blur （focus 可以通过鼠标，还有tab键选中）

//on("click","selector",function(){});  on比bind多了一个selector
//on("click",function(){}) 和 bind("click",function)(){});  一样 。
// 但是  $("ul li").on("click",function({});和 $("ul").on("click","li",function(){})不一样。后者可以动态的新增元素。

function onClick(){
    $("ul li").on("click",function(){
        console.log($(this).text());
    });
    $("ul").append("<li class='e'>5</li>");
}
function onbind(){
    $("ul li").bind("click",function() {
        console.log($(this).text());
    });
    $("ul").append("<li class='f'>6</li>");
}

//keypress()捕获浏览器键盘输入的时候
//submit 表单提交 当点击submit时触发这个事件
function submitTry(){
    $("form").submit(function(){
        var a = $(".input-text").val();
        var b = $(".input-text1").val();
     if(a == "123"){
        alert("123");
     }
    })
}
//resize 当窗体大小发生改变时，触发事件。
function resizeTry() {
    $(window).resize(function(){
      console.log($(window).width());
    })
}
//regExp 正则表达式
//普通字符匹配 /a/ 表示匹配了字符串'a' /a,b,c/ 表示匹配了字符串 'a,b,c'
function regExpTry(){
        var inputValue = $(".input-text").val();
        var TestValue = $(".input-text1").val();
        //这里还可以用这个方法
        // var reg1temp = "/"+TestValue+"/g";
        // var reg1 = eval(reg1temp);
        var reg1 =new RegExp(TestValue,"g");
        var result = reg1.test(inputValue);
        if(result){
            var index = inputValue.indexOf(TestValue);
            console.log(index);
        }
}
//停止事件冒泡
//return false
//时间委托
function eventListen()
{
    // 兼容比较好，但是只能绑定一个事件
    // dom.on("click", function () {})
    var div = document.getElementsByTagName(div)[0]
    div.addEventListener("click", function () {
        alert("123");
    })
    div.addEventListener("click", function () {
        alert("456");
        // 这个事件不会被覆盖，会轮流执行
    })
}
//未来元素 未来元素，在我的理解里就是目前没有，但发了ajax后，这个元素就有了，这就是“未来元素”。有时我们需要对未来元素进行操作，比如以下的业务场景。
//我从下拉框中，选择“省份”后，下面多出来选择“州/市”的下拉框，这个时候，我需要点击州/市这个下拉框，我希望出现“区/县”的信息。
//这个时候，我们就用到未来元素的操作了。
//$('父级标签').delegate('当前标签'，'执行的命令'，'匿名函数')
//index.html







