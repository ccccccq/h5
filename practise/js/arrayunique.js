Array.prototype.unique=function(){
    var arr=[],
        obj={},
        len=this.length;
    for(var i=0;i<len;i++){
        if(!obj[this[i]]){
            obj[this[i]]="123";
            arr.push(this[i]);
        }
    }
    return obj;
}