
/**
*   author:ysjwdaypm
*  
**/

const {ccclass,property} = cc._decorator;

@ccclass
class B extends mh.BaseComponent{

    constructor(){
        super();
        this.viewFlag = 1 << 1;
        console.log("----------- B --");
    }

    //onLoad(){}
    
    start(){
        
    }

    //update(dt){}

    //onDestroy(){}
}

module.exports = B;