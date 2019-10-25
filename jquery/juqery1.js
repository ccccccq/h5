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
function animateTry(){

}





















