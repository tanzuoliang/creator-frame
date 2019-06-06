
/**
*   author:ysjwdaypm
*  
**/

const {ccclass,property} = cc._decorator;

@ccclass
class A extends mh.BaseComponent{

    // @property(cc.Node)
    // node = null;

    constructor(){
        super();
        this.viewFlag = 2 << 1;
        
    }

    onLoad(){
        console.log("----------- A onLoad--");
    }
    
    start(){
        console.log("----------- A onstart--");
    }

    //update(dt){}

    //onDestroy(){}
}

module.exports = A;