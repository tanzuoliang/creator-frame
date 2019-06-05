
/**
*   author:ysjwdaypm
*  
**/

const {ccclass,property} = cc._decorator;

@ccclass
class NewClass extends mh.BaseScrollView{

    // @property(cc.Node)
    // node = null;

    constructor(){
        super();
    }

    //onLoad(){}
    
    start(){
        this.setData([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29],100,100,0.5,0.5);
    }

    //update(dt){}

    //onDestroy(){}
}

module.exports = NewClass;