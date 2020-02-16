// 请求地址：https://wthrcdn.etouch.cn/weather_mini

var app = new Vue({
    el:"#app",
    data:{
        weather:"晴",
        city:'',
        arr:[]
    },
    methods:{
        getMess:function(){
            var that = this;
            axios.get("http://wthrcdn.etouch.cn/weather_mini?city="+this.city).then(function(response){
                that.arr = response.data.data.forecast;
                    console.log(that.arr);
            },function(err){
               console.log(err)
            });
        },
        clickPlaceB:function(){
            var that = this;
            axios.get("http://wthrcdn.etouch.cn/weather_mini?city=北京").then(function(response){
                that.arr = response.data.data.forecast;
                console.log(that.arr);
            },function(err){
                console.log(err)
            });
        },
        clickPlaceS:function(){
            var that = this;
            axios.get("http://wthrcdn.etouch.cn/weather_mini?city=上海").then(function(response){
                that.arr = response.data.data.forecast;
                console.log(that.arr);
            },function(err){
                console.log(err)
            });
        }
    }
})
