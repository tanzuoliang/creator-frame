
/**
*   author:ysjwdaypm
*  
**/

const {ccclass,property} = cc._decorator;

@ccclass
class NewClass extends require("./../../scripts/core/bundle/BaseListItem"){

    @property(cc.Label)
    nameTf = null;

    constructor(){
        super();
    }

    //onLoad(){}
    
    start(){
        this.registerTouch(this.node);
    }

    onselected(){
        console.log("-----select");
    }

    onunselected(){
        console.log("-----onunselected");
    }

    setData(data){
        super.setData(data);
        this.nameTf.string = "" + data;
    }

    //update(dt){}

    //onDestroy(){}
}

module.exports = NewClass;