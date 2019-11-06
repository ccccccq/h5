// 获取需要的dom对象
function $(selector) {
    return document.querySelector(selector);
}
var container = $(".container");
var video = $(".container video"); // video元素
var divModal = $(".container .modal"); // 朦层
var divToolBar = $(".container .tool-bar"); //工具栏整体
var iconPlay = $(".container .iconbofang"); //工具栏的播放按钮
var spanCur = $("#spancur"); //当前时间的span
var spanTotal = $("#spantotal"); //总时间的span
var progressBg = $(".progress-bar .bg"); //进度条背景
var progressSlider = $(".progress-bar .slider"); //进度条滑块
var progressBar = $(".progress-bar"); //整个进度条
var sliderVolume = $("#volume"); //得到音量控制块
var lis = document.querySelectorAll(".iconicon_set_up li[data-value]"); //选中所有倍速播放的li
var full = $(".iconquanping"); //全屏图标

var total; //视频总时长
//注册事件区域

//朦层的事件 和 播放图标的点击事件
divModal.onclick = iconPlay.onclick = function () {
    if (video.paused) {
        video.play();
        divModal.classList.remove("pause");
        iconPlay.classList.remove("iconbofang");
        iconPlay.classList.add("iconzanting");
    }
    else {
        video.pause();
        divModal.classList.add("pause");
        iconPlay.classList.add("iconbofang");
        iconPlay.classList.remove("iconzanting");
    }
}

//工具条整体事件，阻止事件冒泡
divToolBar.onclick = function (e) {
    e.stopPropagation(); //阻止事件冒泡
}

//视频事件
video.ondurationchange = function () {
    total = video.duration;
    setTime();
};

//播放进度改变
video.ontimeupdate = function () {
    setTime();
    setProgress();
};

//整个进度条的点击事件
progressBar.onmousedown = function (e) {
    setCurrentTime(e);
    //注意，是给整个区域注册鼠标移动事件，因为进度条太窄了
    divModal.onmousemove = function (e) {
        setCurrentTime(e);
    }

    divModal.onmouseup = divModal.onmouseleave = function (e) {
        divModal.onmousemove = undefined;
    }
}

//音量改变事件
setVolume();
sliderVolume.onchange = function () {
    setVolume();
}

//倍速播放的点击事件
for (var i = 0; i < lis.length; i++) {
    lis[i].onclick = function () {
        setRate(this.dataset.value);
    }
}

//全屏
full.onclick = function () {
    if (document.fullscreen) {
        //退出全屏
        document.exitFullscreen();
    }
    else {
        //进入全屏
        container.requestFullscreen();
    }
}

//全屏状态变化事件
container.onfullscreenchange = function () {
    if (document.fullscreen) {
        hideBar();
    }
    else{
        if(timer){
            clearTimeout(timer);
        }
        divToolBar.style.display = "";
        divModal.style.cursor = "";
    }
}

container.onmousemove = function () {
    if (document.fullscreen) {
        hideBar();
    }
}

//工具函数区域

var timer; //计时器
/**
 * 一段时间之后，隐藏工具条
 */
function hideBar() {
    divToolBar.style.display = "block";
    divModal.style.cursor = "pointer";
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(function () {
        divToolBar.style.display = "none";
        divModal.style.cursor = "none";
    }, 2000);
}

/**
 * 根据秒数，得到一个友好格式的时间字符串
 * @param {*} seconds 
 */
function getTime(seconds) {
    seconds = parseInt(seconds);
    var m = Math.floor(seconds / 60); //分钟部分
    if (m < 10) {
        m = "0" + m;
    }
    var s = seconds - m * 60; //秒的部分
    if (s < 10) {
        s = "0" + s;
    }
    return m + ":" + s;
}

/**
 * 设置时间
 */
function setTime() {
    var cur = getTime(video.currentTime);
    var t = getTime(total);
    spanCur.innerHTML = cur;
    spanTotal.innerHTML = t;
}

/**
 * 根据视频当前的播放时间，设置进度条位置
 */
function setProgress() {
    var percent = video.currentTime / total * 100;
    progressBg.style.width = percent + "%";
    progressSlider.style.left = percent + "%";
}


// e.pageX //鼠标点击位置距离页面左边的距离
var rect = divModal.getBoundingClientRect(); //得到一个元素的矩形区域
/**
 * 设置视频播放进度
 */
function setCurrentTime(e) {
    var offsetX = e.pageX - rect.left;
    //设置当前视频的时间 = 偏移的x / 总宽度 * 总时长
    video.currentTime = offsetX / divModal.clientWidth * total;
}

/**
 * 将滑动块的值设置为音量
 */
function setVolume() {
    video.volume = sliderVolume.value / 100;
}

/**
 * 根据你设置的值，重新设置倍速播放
 * @param {*} val 
 */
function setRate(val) {
    video.playbackRate = val;
    for (var i = 0; i < lis.length; i++) {
        var li = lis[i]
        if (li.dataset.value === val) {
            li.classList.add("active")
        }
        else {
            li.classList.remove("active");
        }
    }
}