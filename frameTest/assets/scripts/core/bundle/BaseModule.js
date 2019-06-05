
/**
*   author:ysjwdaypm
*  
**/

const {ccclass,property} = cc._decorator;


const {BaseComponent,BaseMediator} = require("./MVC");
const {moduleStack} = require("./../index");

@ccclass
class BaseModule extends BaseComponent{

    @property(cc.Button)
    backBtn = null;

    constructor(){
        super();
    }

    //onLoad(){}
    
    start(){
        this.backBtn && this.backBtn.on("click",this.onBackHandle,this);
    }

    /**
     * 退出面板
     */
    onBackHandle(){this.node.emit(this.BACK)};

    //update(dt){}

    onDestroy(){
        this.backBtn && this.backBtn.off("click",this.onBackHandle,this);
    }
}
BaseModule.prototype.BACK = "BaseModule_exit";


class BaseModuleMediator extends BaseMediator{
    constructor(model,node,backModuleName = null){
        super(model,node);
        this.subscribe([BaseModule.prototype.BACK]);
        this.backModuleName = backModuleName;
    }

    onMessage(event){
        if(event == BaseModule.prototype.BACK){
            moduleStack.bakc(this.backModuleName);
        }
    }
}

module.exports = {
    BaseModule,
    BaseModuleMediator
};