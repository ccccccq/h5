function deepClone(origin,target){
    var target=target||{};
    var toStr=Object.prototype.toString;
    var ifArr="[object Array]";
    for(var prop in origin){
        if(origin.hasOwnProperty(prop))
        {
            if(origin[prop]!=="null" && typeof(origin[prop])=="object") {
                target[prop]=toStr.call(origin[prop])==ifArr?[]:{};
                deepClone(origin[prop],target[prop]);
            }
            else target[prop]=origin[prop];
        }
    }
    return target;

}
var arr={
    name :"chen",
    sex :"female",
    love:["money","chicken"]
}
var arr1={};
deepClone(arr,arr1);



