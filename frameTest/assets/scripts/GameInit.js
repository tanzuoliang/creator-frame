
/**
*   author:ysjwdaypm
*  
**/

const {ccclass,property} = cc._decorator;
require("./core/index");

class MyMediator extends mh.BaseMediator{
    constructor(node){
        super(null,node);
        this.subscribe([
            "showTest"
        ]);
    }

    onMessage(message){
        switch(message){
            case "showTest":
                console.log("A showTest " + Date.now());
            break;
        }
    }
}
class GameInit{
    constructor(){
        this.__hasInited__ = false;
        cc.game.on("preloadComplete",this.init,this);
    }

    init(){
        if(this.__hasInited__) return;
        this.__hasInited__ = true;

        // console.log("----asdasdasdasdas------");

        cc.game.off("preloadComplete",this.init,this);
        mh.viewImp.registerView("SecPanel","SecPanel","A");
        mh.viewImp.registerView("panel",mh.res.getItem("panel",cc.Prefab),"B");

        //这里注册显示对象,能注册的都注册进来
    }
}

module.exports = new GameInit;